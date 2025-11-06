# -*- coding: utf-8 -*-
"""
音声入力 → Whisper文字起こし → GPT応答
必要ライブラリ:
    pip install openai faster-whisper opensmile sounddevice soundfile numpy
"""

from openai import OpenAI
from datetime import datetime
from pathlib import Path
import json, os, tempfile, time, gc, random
import numpy as np
import sounddevice as sd
import soundfile as sf
import opensmile
from faster_whisper import WhisperModel


# ==== シナリオ設定 ====
SCENARIO = {
    "scene": "朝礼後の友達との会話",
    "start_message": "今日の授業めんどくさいね"
}

# ==== OpenAI設定 ====
client = OpenAI(api_key="タケチンセンのAPIキー")  # ← あなたのAPIキーを設定



# ==== Whisper / openSMILE キャッシュ ====
WHISPER = None
SMILE = None


def init_models():
    """WhisperとopenSMILEを初期化（キャッシュ式）"""
    global WHISPER, SMILE
    if WHISPER is None:
        print("[INIT] WhisperModel(small) を読み込み中...")
        WHISPER = WhisperModel("small", device="cpu", compute_type="int8")
    if SMILE is None:
        print("[INIT] openSMILE(eGeMAPSv02) を初期化中...")
        SMILE = opensmile.Smile(
            feature_set=opensmile.FeatureSet.eGeMAPSv02,
            feature_level=opensmile.FeatureLevel.Functionals,
        )


# ==== 録音関連 ====
def _dbfs(x: np.ndarray) -> float:
    """RMSからdBFSを算出"""
    if x.dtype == np.int16:
        x = x.astype(np.float32) / 32768.0
    rms = np.sqrt(np.mean(x**2) + 1e-12)
    return 20.0 * np.log10(rms + 1e-12)


def record_until_silence(
    samplerate: int = 16000,
    frame_ms: int = 30,
    start_threshold_dbfs: float = -45.0,
    stop_silence_sec: float = 0.8,
    max_duration_sec: float = 30.0,
    warmup_sec: float = 0.3,
) -> np.ndarray:
    """話し始めを検知→無音で停止"""
    print("🎤 準備中... 3秒以内に話す準備をしてください。")
    time.sleep(1)
    print("👉 準備OK！話し始めてください。")

    buffers, started = [], False
    silence_run, total_time = 0.0, 0.0
    frame_samples = int(samplerate * frame_ms / 1000.0)

    def callback(indata, frames, time_info, status):
        nonlocal started, silence_run, total_time
        mono = indata[:, 0]
        level = _dbfs(mono)
        bar = "▮" * max(0, min(30, int((level + 60) / 2)))
        print(f"\r📈 {level:6.1f} dBFS {bar:30}", end="", flush=True)

        if total_time >= warmup_sec:
            if not started and level >= start_threshold_dbfs:
                started = True
                print("\n🎙️ 録音開始！")
            elif started:
                silence_run = silence_run + frame_ms / 1000.0 if level < start_threshold_dbfs else 0.0
        if started:
            buffers.append(mono.copy())
        total_time += frames / samplerate

    with sd.InputStream(
        samplerate=samplerate, channels=1, dtype="float32",
        blocksize=frame_samples, callback=callback
    ):
        start_ts = time.time()
        while True:
            time.sleep(frame_ms / 1000.0)
            if started and silence_run >= stop_silence_sec:
                print("\n⏹️ 無音検出 → 停止")
                break
            if time.time() - start_ts >= max_duration_sec:
                print("\n⏹️ 最大録音時間に達しました")
                break

    if not buffers:
        print("[WARN] 発話が検知されませんでした。")
        return np.zeros((int(samplerate * 0.1),), dtype=np.float32)

    print(f"✅ 録音完了（{len(buffers)*frame_ms/1000:.1f}s）")
    return np.concatenate(buffers).astype(np.float32)


# ==== Whisper文字起こし ====
def transcribe_whisper(audio: np.ndarray, samplerate: int = 16000):
    global WHISPER
    if WHISPER is None:
        init_models()

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        sf.write(tmp.name, audio, samplerate, format="WAV", subtype="PCM_16")
        tmp_path = tmp.name
    try:
        segments, info = WHISPER.transcribe(
            tmp_path, language="ja", task="transcribe",
            vad_filter=True, vad_parameters=dict(min_silence_duration_ms=700)
        )
        text = "".join([seg.text for seg in segments]).strip()
    finally:
        os.remove(tmp_path)
    if not text:
        return None
    return text


# ==== GPT判定・応答 ====
CHARACTER_ROLE = "同級生の友達"

def check_appropriateness(message, context, scene, start_message):
    """発言が会話の流れに関連しているか、無関係かを判定する"""
    prompt = f"""
シーン: {scene}
導入会話: {start_message}

これまでの会話履歴:
{context}

現在の発言:
{message}

この発言はこれまでの会話の流れに関連しているか、それとも無関係な発言かを判断してください。
「関連する発言」または「無関係な発言」とだけ答えてください。
"""
    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}]
    )
    return res.choices[0].message.content.strip()


def generate_reply(message, context):
    """GPT自然応答"""
    prompt = f"""
あなたは{CHARACTER_ROLE}です。落ち着いた優しいトーンで、1〜2文以内で返答してください。
履歴:
{context}

ユーザー発言: {message}
"""
    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
    )
    return res.choices[0].message.content.strip()


# ==== メイン ====
def main():
    init_models()
    log_dir = Path("logs"); log_dir.mkdir(exist_ok=True)
    log_path = log_dir / f"conversation_gpt_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"

    history = [f"シーン: {SCENARIO['scene']}", f"導入会話: {SCENARIO['start_message']}"]
    inappropriate = 0
    turn = 0  


    print(f"🎙️ 会話開始: {SCENARIO['scene']}")
    print(f"\n🤖 AI: {SCENARIO['start_message']}")

    # 最大5ラリーはwhile turn < nで決めてください^o^
    while turn < 5:
        print(f"\n=== 🔁 Turn {turn+1} ===")
        audio = record_until_silence()
        transcript = transcribe_whisper(audio)
        if not transcript:
            continue

        print(f"\n🧍あなた: {transcript}")

        context = "\n".join(history[-30:])

      
        # 会話の流れとの関連性をチェック
        judgment = check_appropriateness(transcript, context, SCENARIO['scene'], SCENARIO['start_message'])

        if judgment == "無関係な発言":
            inappropriate += 1
            reply = "⚠️ 無関係な発言です。もう一度言い直してください。"
            print(f"🤖 AI: {reply}")
            if inappropriate >= 2: # 無関係カウントはif inappropriate >= nで決めてください^o^
                print("🚫 会話終了: 無関係発言が多すぎます。")
                break
            continue

        # 関連している場合のみ turn を進める
        reply = generate_reply(transcript, context)
        print(f"🤖 AI: {reply}")
        turn += 1

        # 履歴とログ保存
        history += [f"あなた: {transcript}", f"AI: {reply}"]
        with open(log_path, "a", encoding="utf-8") as f:
            json.dump({
                "turn": turn,
                "timestamp": datetime.now().isoformat(),
                "transcript": transcript,
                "reply": reply,
                "appropriateness": judgment,
                "scene": SCENARIO['scene'],
                "start_message": SCENARIO['start_message']
            }, f, ensure_ascii=False)
            f.write("\n")

        del audio, transcript
        gc.collect()

    print(f"\n💾 ログ保存: {log_path}")
    print("🎯 会話終了。")


