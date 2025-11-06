# -*- coding: utf-8 -*-
"""
音声入力 → Whisper文字起こし → openSMILE特徴量 → 感情スコア出力
(キャッシュ初期化・録音自動停止・安全なテンポラリ処理付き)
"""

from datetime import datetime
from pathlib import Path
import numpy as np
import sounddevice as sd
import opensmile
import soundfile as sf
from faster_whisper import WhisperModel
from io import BytesIO
import tempfile, os, time, json


# ====== Whisper / openSMILE 初期化 ======
print("[INIT] WhisperModel(small) を読み込み中...")
WHISPER = WhisperModel("small", device="cpu", compute_type="int8")

print("[INIT] openSMILE(eGeMAPSv02) を初期化中...")
SMILE = opensmile.Smile(
    feature_set=opensmile.FeatureSet.eGeMAPSv02,
    feature_level=opensmile.FeatureLevel.Functionals,
)


# ====== 録音（自動開始・自動停止）======
def _dbfs(x: np.ndarray) -> float:
    """float32/[-1..1] または int16 の RMS を dBFS に変換"""
    if x.dtype == np.int16:
        x = x.astype(np.float32) / 32768.0
    rms = np.sqrt(np.mean(x**2) + 1e-12)
    return 20.0 * np.log10(rms + 1e-12)


def record_until_silence(
    samplerate: int = 16000,
    frame_ms: int = 30,
    start_threshold_dbfs: float = -48.0,
    stop_silence_sec: float = 0.8,
    max_duration_sec: float = 30.0,
    warmup_sec: float = 0.3,
) -> np.ndarray:
    """入力検知で録音を開始し、無音で停止"""
    print(f"[REC] 自動録音中... start={start_threshold_dbfs}dBFS / silence={stop_silence_sec}s")
    buffers, started = [], False
    silence_run, total_time = 0.0, 0.0
    frame_samples = int(samplerate * frame_ms / 1000.0)

    def callback(indata, frames, time_info, status):
        nonlocal started, silence_run, total_time
        if status:
            print(f"[SD] {status}", flush=True)
        mono = indata[:, 0]
        level = _dbfs(mono)
        if total_time >= warmup_sec:
            if not started and level >= start_threshold_dbfs:
                started = True
            elif started:
                silence_run = silence_run + frame_ms / 1000.0 if level < start_threshold_dbfs else 0.0
        if started:
            buffers.append(mono.copy())
        total_time += frames / samplerate

    with sd.InputStream(
        samplerate=samplerate,
        channels=1,
        dtype="float32",
        blocksize=frame_samples,
        callback=callback,
    ):
        start_ts = time.time()
        while True:
            time.sleep(0.01)
            if started and silence_run >= stop_silence_sec:
                break
            if time.time() - start_ts >= max_duration_sec:
                break

    if not buffers:
        print("[WARN] 発話が検知されず。無音0.1秒を返します。")
        return np.zeros((int(samplerate * 0.1),), dtype=np.float32)
    return np.concatenate(buffers).astype(np.float32)


# ====== Whisper 文字起こし ======
def transcribe_whisper_buffer(audio: np.ndarray, samplerate: int = 16000):
    """録音データ(np.ndarray)を直接文字起こし"""
    print("[WHISPER] 推論中 (small, CPU)")
    wav_bytes = BytesIO()
    sf.write(wav_bytes, audio, samplerate, format="WAV", subtype="PCM_16")
    wav_bytes.seek(0)

    # WhisperはBytesIO対応済み
    segments, info = WHISPER.transcribe(
        wav_bytes,
        language="ja",
        task="transcribe",
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=700),
    )

    transcript = "".join([seg.text for seg in segments]).strip()
    if not transcript:
        print("⚠️ 音声が検出されませんでした。もう一度お試しください。")
        return None, None

    meta = {
        "language": "ja",
        "language_probability": float(info.language_probability or 1.0),
        "model": "small",
        "device": "cpu",
        "compute_type": "int8",
    }
    return transcript, meta


# ====== openSMILE 解析 ======
FEATURE_KEYS = [
    "F0semitoneFrom27.5Hz_sma3nz_amean",
    "F0semitoneFrom27.5Hz_sma3nz_stddevNorm",
    "equivalentSoundLevel_dBp",
    "jitterLocal_sma3nz_amean",
    "shimmerLocaldB_sma3nz_amean",
    "HNRdBACF_sma3nz_amean",
    "MeanVoicedSegmentLengthSec",
    "StddevVoicedSegmentLengthSec",
]

def analyze_with_opensmile_buffer(audio: np.ndarray, samplerate: int = 16000):
    """openSMILEはファイル入力のみ対応"""
    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        sf.write(tmp.name, audio, samplerate, format="WAV", subtype="PCM_16")
        tmp_path = tmp.name
    try:
        features = SMILE.process_file(tmp_path)
        row = features.iloc[0]
        feat_dict = {k: float(row[k]) for k in FEATURE_KEYS if k in row.index}
    finally:
        os.remove(tmp_path)
    return feat_dict


# ====== 感情スコア ======
def simple_emotion_scores(feat: dict):
    """特徴量から簡易 arousal / valence スコアを算出"""
    def z(x, lo, hi):
        return 0.5 if x is None else max(0.0, min(1.0, (x - lo) / (hi - lo)))

    arousal = 0.5 * z(feat.get("equivalentSoundLevel_dBp"), -60, -10) + \
              0.5 * z(feat.get("F0semitoneFrom27.5Hz_sma3nz_amean"), 15, 35)
    valence = 0.6 * z(feat.get("HNRdBACF_sma3nz_amean"), 0, 35) \
              + 0.2 * (1 - z(feat.get("shimmerLocaldB_sma3nz_amean"), 0, 10)) \
              + 0.2 * (1 - z(feat.get("jitterLocal_sma3nz_amean"), 0.0, 0.04))

    return {"arousal": round(arousal, 3), "valence": round(valence, 3)}


# ====== メイン統合処理 ======
def run_once():
    """録音→文字起こし→特徴量→感情スコアをまとめて返す"""
    ts = datetime.now().strftime("%Y%m%d_%H%M%S")
    audio = record_until_silence()
    transcript, whisper_meta = transcribe_whisper_buffer(audio)
    if not transcript:
        return None
    feat = analyze_with_opensmile_buffer(audio)
    emo = simple_emotion_scores(feat)

    bundle = {
        "timestamp": ts,
        "transcript": transcript,
        "whisper_meta": whisper_meta,
        "audio_features": feat,
        "emo_scores": emo,
    }

    print(f"[DONE] 文字起こし: {transcript}")
    print(f"[EMO]  {emo}")
    return bundle


# ====== CLI 実行 ======
if __name__ == "__main__":
    data = run_once()
    if data:
        print("\n--- 出力サマリ ---")
        print(json.dumps(data, ensure_ascii=False, indent=2))
