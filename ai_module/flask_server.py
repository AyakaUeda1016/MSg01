# -*- coding: utf-8 -*-
"""
Flask統合版: 受信した音声(WebM) → WAV変換 → Whisper文字起こし → openSMILE感情抽出 → GPT応答
必要ライブラリ:
    pip install flask flask-cors openai faster-whisper opensmile soundfile numpy
    ※ 変換には ffmpeg が必要（ https://www.gyan.dev/ffmpeg/builds/ からDLし、PATHに追加）
"""

import opensmile
from flask import Flask, request, Response
from flask_cors import CORS 
from openai import OpenAI
from faster_whisper import WhisperModel
from whisper_emotion.opensmile_test3 import (
    transcribe_whisper_file,
    analyze_with_opensmile_file,
    simple_emotion_scores
)
from datetime import datetime
from pathlib import Path
import tempfile, soundfile as sf
import numpy as np
import json, os, gc, subprocess


# ==== Flask初期化 ====
app = Flask(__name__)
CORS(app)

# ==== 設定 ====
client = OpenAI(api_key="タケチンセン")  # ← あなたのAPIキーを設定
CHARACTER_ROLE = "同級生の友達"
MAX_TURNS = 5
MAX_INAPPROPRIATE = 2

SCENARIO = {
    "scene": "朝礼後の友達との会話",
    "start_message": "今日の授業めんどくさいね"
}

# ==== モデルキャッシュ ====
WHISPER = None
SMILE = None


def init_models():
    """WhisperとopenSMILEを初期化（キャッシュ式）"""
    global WHISPER, SMILE
    if WHISPER is None:
        print("[INIT] WhisperModel(small) を読み込み中...")
        WHISPER = WhisperModel("small", device="cpu", compute_type="int8")
        # WHISPER = WhisperModel("small", device="cuda", compute_type="float16")  # GPU対応

    if SMILE is None:
        print("[INIT] openSMILE(eGeMAPSv02) を初期化中...")
        SMILE = opensmile.Smile(
            feature_set=opensmile.FeatureSet.eGeMAPSv02,
            feature_level=opensmile.FeatureLevel.Functionals,
        )


# ==== GPT関連 ====
def check_appropriateness(message, context, scene, start_message):
    """発言が会話の流れに関連しているかを判定"""
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


# ==== 会話状態 ====
conversation_state = {
    "history": [],
    "turn": 0,
    "inappropriate": 0,
    "active": True
}


# ==== WebM → WAV変換 ====
def convert_webm_to_wav(input_path: str) -> str:
    output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
    cmd = ["ffmpeg", "-y", "-i", input_path, "-ac", "1", "-ar", "16000", output_path]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return output_path


# ==== メインAPI ====
@app.route("/api/conversation", methods=["POST"])
def conversation_api():
    try:
        if "file" not in request.files:
            return Response(json.dumps({"error": "音声ファイル(file)が見つかりません。"}, ensure_ascii=False),
                            status=400, content_type="application/json; charset=utf-8")

        # --- 一時ファイル保存(WebM) ---
        audio_file = request.files["file"]
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            audio_file.save(tmp.name)
            webm_path = tmp.name

        # --- WebM→WAV変換 ---
        wav_path = convert_webm_to_wav(webm_path)
        os.remove(webm_path)

        # --- Whisper文字起こし ---
        transcript, meta = transcribe_whisper_file(wav_path, model=WHISPER)

        # === 🛑 無音チェック ===
        if not transcript or transcript.strip() == "":
            os.remove(wav_path)
            return Response(
                json.dumps({"error": "音声から発話が検出されませんでした。"}, ensure_ascii=False),
                status=400,
                content_type="application/json; charset=utf-8"
            )

        # --- openSMILE特徴量＋感情スコア ---
        features = analyze_with_opensmile_file(wav_path, smile=SMILE)
        emotion = simple_emotion_scores(features)
        os.remove(wav_path)

        # --- GPT応答 ---
        scene = SCENARIO["scene"]
        start_message = SCENARIO["start_message"]
        context = "\n".join(conversation_state["history"][-30:])
        judgment = check_appropriateness(transcript, context, scene, start_message)

        if judgment == "無関係な発言":
            conversation_state["inappropriate"] += 1
            reply = "⚠️ 無関係な発言です。もう一度言い直してください。"
            if conversation_state["inappropriate"] >= MAX_INAPPROPRIATE:
                conversation_state["active"] = False
                reply += " 🚫 無関係な発言が多すぎたため会話を終了します。"
        else:
            reply = generate_reply(transcript, context)
            conversation_state["turn"] += 1
            conversation_state["history"].append(f"あなた: {transcript}")
            conversation_state["history"].append(f"AI: {reply}")
            if conversation_state["turn"] >= MAX_TURNS:
                conversation_state["active"] = False
                reply += " 🎯 最大ターン数に達したため会話を終了します。"

        # --- 結果まとめ ---
        result = {
            "transcript": transcript,
            "reply": reply,
            "emotion": emotion,
            "audio_features": features,
            "appropriateness": judgment,
            "turn": conversation_state["turn"],
            "inappropriate_count": conversation_state["inappropriate"],
            "active": conversation_state["active"],
            "scene": scene,
            "timestamp": datetime.now().isoformat()
        }

        # === ログ保存 ===
        log_dir = Path("logs"); log_dir.mkdir(exist_ok=True)
        session_file = log_dir / "flask_conv_session.json"

        if session_file.exists():
            with open(session_file, "r", encoding="utf-8") as f:
                all_data = json.load(f)
        else:
            all_data = {
                "scene": scene,
                "start_message": start_message,
                "conversations": [],
                "emotion_history": []  # 感情履歴を新設
            }

        # --- 会話内容を追加 ---
        all_data["conversations"].append(result)

        # --- 感情履歴も追加 ---
        all_data["emotion_history"].append({
            "turn": conversation_state["turn"],
            "arousal": emotion["arousal"],
            "valence": emotion["valence"],
            "timestamp": datetime.now().isoformat()
        })

        if not conversation_state["active"]:
            all_data["end_time"] = datetime.now().isoformat()

        with open(session_file, "w", encoding="utf-8") as f:
            json.dump(all_data, f, ensure_ascii=False, indent=2)

        # === 応答返却 ===
        return Response(json.dumps(result, ensure_ascii=False),
                        status=200, content_type="application/json; charset=utf-8")

    except Exception as e:
        import traceback
        err_msg = traceback.format_exc()
        print("[ERROR]", err_msg)
        return Response(
            json.dumps(
                {"error": str(e), "traceback": err_msg},
                ensure_ascii=False
            ),
            status=500,
            content_type="application/json; charset=utf-8"
        )


# ==== リセット ====
@app.route("/api/reset", methods=["POST"])
def reset_conversation():
    conversation_state["history"].clear()
    conversation_state["turn"] = 0
    conversation_state["inappropriate"] = 0
    conversation_state["active"] = True
    res = {"message": "🧹 会話履歴をリセットしました。"}
    return Response(json.dumps(res, ensure_ascii=False),
                    status=200, content_type="application/json; charset=utf-8")


# ==== 起動 ====
if __name__ == "__main__":
    init_models()
    print("✅ Flask統合版サーバ起動中 → http://127.0.0.1:5000/api/conversation")
    app.run(host="0.0.0.0", port=5000)
