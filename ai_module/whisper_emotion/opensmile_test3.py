# -*- coding: utf-8 -*-
"""
openSMILE特徴量抽出（LLD平均＋派生指標）＋ Whisper文字起こし
25特徴量 + arousal/valence + 追加7指標：
dominance, pitch_var, loud_var, stability, warmth, pause_ratio, voicing_ratio
"""

from datetime import datetime
import numpy as np
import opensmile
import soundfile as sf
from faster_whisper import WhisperModel
import tempfile, os


# ============================================================
#  Whisper 文字起こし
# ============================================================
def transcribe_whisper_file(file_path: str, model: WhisperModel = None):
    if model is None:
        print("[opensmile] WhisperModel を新規ロード")
        model = WhisperModel("small", device="cpu", compute_type="int8")
    else:
        print("[opensmile] WhisperModel（キャッシュ）を再利用")

    print(f"[WHISPER] 推論中: {file_path}")
    segments, info = model.transcribe(
        file_path,
        language="ja",
        task="transcribe",
        vad_filter=True,
        vad_parameters=dict(min_silence_duration_ms=700),
    )

    transcript = "".join([seg.text for seg in segments]).strip()

    if not transcript:
        return None, None

    meta = {
        "language": "ja",
        "language_probability": float(info.language_probability or 1.0),
        "model": "small",
        "device": "cpu",
        "compute_type": "int8",
    }
    return transcript, meta


# ============================================================
#  25 LLD 特徴量（指定）
# ============================================================
FEATURE_KEYS = [
    "Loudness_sma3",
    "alphaRatio_sma3",
    "hammarbergIndex_sma3",
    "slope0-500_sma3",
    "slope500-1500_sma3",
    "spectralFlux_sma3",
    "mfcc1_sma3",
    "mfcc2_sma3",
    "mfcc3_sma3",
    "mfcc4_sma3",
    "F0semitoneFrom27.5Hz_sma3nz",
    "jitterLocal_sma3nz",
    "shimmerLocaldB_sma3nz",
    "HNRdBACF_sma3nz",
    "logRelF0-H1-H2_sma3nz",
    "logRelF0-H1-A3_sma3nz",
    "F1frequency_sma3nz",
    "F1bandwidth_sma3nz",
    "F1amplitudeLogRelF0_sma3nz",
    "F2frequency_sma3nz",
    "F2bandwidth_sma3nz",
    "F2amplitudeLogRelF0_sma3nz",
    "F3frequency_sma3nz",
    "F3bandwidth_sma3nz",
    "F3amplitudeLogRelF0_sma3nz",
]


# ============================================================
#  新規追加：LLD → 感情指数＋Pause/Voicing 計算
# ============================================================
def compute_voice_indices(df):
    """LLD DataFrame から感情指数＋Pause/Voicing を計算"""

    import numpy as np

    mean = df.mean(axis=0)
    std = df.std(axis=0)

    def m(key):
        return float(mean.get(key)) if key in mean.index else None

    def s(key):
        return float(std.get(key)) if key in std.index else None

    def z(x, lo, hi):
        if x is None or np.isnan(x):
            return 0.5
        return max(0.0, min(1.0, (x - lo) / (hi - lo)))

    # ====== 基本 LLD ======
    loud = m("Loudness_sma3")
    loud_std = s("Loudness_sma3")

    f0 = m("F0semitoneFrom27.5Hz_sma3nz")
    f0_std = s("F0semitoneFrom27.5Hz_sma3nz")

    flux = m("spectralFlux_sma3")
    jitter = m("jitterLocal_sma3nz")
    shimmer = m("shimmerLocaldB_sma3nz")
    hnr = m("HNRdBACF_sma3nz")
    alpha = m("alphaRatio_sma3")

    mfcc2 = m("mfcc2_sma3")
    mfcc3 = m("mfcc3_sma3")

    # ============================================================
    # ① Arousal
    # ============================================================
    arousal = (
        0.4 * z(loud, -40, 0) +
        0.3 * z(f0, 15, 35) +
        0.3 * z(flux, 0.0, 0.05)
    )

    # ============================================================
    # ② Valence
    # ============================================================
    valence = (
        0.4 * z(hnr, 0, 30) +
        0.2 * (1 - z(jitter, 0.0, 0.04)) +
        0.2 * (1 - z(shimmer, 0.0, 2.0)) +
        0.2 * z(alpha, -10, 20)
    )

    # ============================================================
    # ③ Dominance
    # ============================================================
    dominance = (
        0.5 * z(loud, -40, 0) +
        0.3 * z(f0, 15, 35) +
        0.2 * z(hnr, 0, 30)
    )

    # Pitch variability
    pitch_var = z(f0_std, 0.0, 4.0)

    # Loudness variability
    loud_var = z(loud_std, 0.0, 6.0)

    # Stability（声の安定性）
    stability = (
        0.4 * (1 - z(jitter, 0.0, 0.04)) +
        0.3 * (1 - z(shimmer, 0.0, 2.0)) +
        0.3 * z(hnr, 0, 30)
    )

    # Warmth（優しさ・柔らかさ）
    brightness = (
        0.4 * z(alpha, -10, 20) +
        0.3 * z(mfcc2, -15, 15) +
        0.3 * z(mfcc3, -15, 15)
    )
    warmth = 0.6 * valence + 0.4 * brightness

    # ============================================================
    # ④ Pause（無音率）
    # ============================================================
    loud_series = df["Loudness_sma3"]
    silent_frames = (loud_series < -50).sum()
    pause_ratio = silent_frames / len(loud_series)

    # ============================================================
    # ⑤ Voicing（有声率）
    # ============================================================
    f0_series = df["F0semitoneFrom27.5Hz_sma3nz"]
    voiced_frames = (f0_series > 0).sum()
    voicing_ratio = voiced_frames / len(f0_series)

    return {
        "arousal": round(arousal, 3),
        "valence": round(valence, 3),
        "dominance": round(dominance, 3),
        "pitch_variability": round(pitch_var, 3),
        "loudness_variability": round(loud_var, 3),
        "voice_stability": round(stability, 3),
        "warmth": round(warmth, 3),
        "pause_ratio": round(float(pause_ratio), 3),
        "voicing_ratio": round(float(voicing_ratio), 3),
    }


# ============================================================
#  openSMILE 解析（LLD → 平均値＋派生指標）
# ============================================================
def analyze_with_opensmile_file(file_path: str, smile=None):
    if smile is None:
        print("[opensmile] openSMILE を新規ロード (LLD)")
        smile = opensmile.Smile(
            feature_set=opensmile.FeatureSet.eGeMAPSv02,
            feature_level=opensmile.FeatureLevel.LowLevelDescriptors,
        )
    else:
        print("[opensmile] openSMILE（キャッシュ）を再利用")

    df = smile.process_file(file_path)

    mean_values = df.mean(axis=0)
    feat_dict = {k: float(mean_values[k]) for k in FEATURE_KEYS if k in mean_values.index}

    indices = compute_voice_indices(df)

    return feat_dict, indices


def analyze_with_opensmile_buffer(audio: np.ndarray, samplerate: int = 16000, smile=None):
    if smile is None:
        print("[opensmile] openSMILE を新規ロード (LLD)")
        smile = opensmile.Smile(
            feature_set=opensmile.FeatureSet.eGeMAPSv02,
            feature_level=opensmile.FeatureLevel.LowLevelDescriptors,
        )
    else:
        print("[opensmile] openSMILE（キャッシュ）を再利用")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        sf.write(tmp.name, audio, samplerate, format="WAV", subtype="PCM_16")
        tmp_path = tmp.name

    try:
        df = smile.process_file(tmp_path)
        mean_values = df.mean(axis=0)
        feat_dict = {k: float(mean_values[k]) for k in FEATURE_KEYS if k in mean_values.index}
        indices = compute_voice_indices(df)
    finally:
        os.remove(tmp_path)

    return feat_dict, indices


# ============================================================
#  テスト実行（単体）
# ============================================================
if __name__ == "__main__":
    path = input("音声ファイルを入力してください: ").strip()
    if not os.path.exists(path):
        print("❌ ファイルがありません")
    else:
        print(f"[TEST] {path} を解析中...")
        transcript, _ = transcribe_whisper_file(path)
        feat, idx = analyze_with_opensmile_file(path)

        print("---- 結果 ----")
        print("文字起こし:", transcript)
        print("特徴量:", feat)
        print("感情・派生指数:", idx)
