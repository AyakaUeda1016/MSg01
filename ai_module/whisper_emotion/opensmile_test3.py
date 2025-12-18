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
    """LLD DataFrame から感情指数＋Pause/Voicing を計算（変化が出やすい版）"""

    import numpy as np

    # ===== ユーティリティ（この関数内だけで使用） =====
    def pnorm(arr, lo=10, hi=90):
        """パーセンタイル正規化（固定化しにくい）"""
        arr = np.asarray(arr, float)
        arr = arr[np.isfinite(arr)]
        if arr.size == 0:
            return 0.5
        p_lo, p_hi = np.percentile(arr, [lo, hi])
        if p_hi == p_lo:
            return 0.5
        v = (np.median(arr) - p_lo) / (p_hi - p_lo)
        return float(np.clip(v, 0.0, 1.0))

    # ===== 生系列を直接使用（mean依存をやめる） =====
    loud_series = df["Loudness_sma3"].values
    f0_series = df["F0semitoneFrom27.5Hz_sma3nz"].values
    jitter_series = df["jitterLocal_sma3nz"].values
    shimmer_series = df["shimmerLocaldB_sma3nz"].values
    hnr_series = df["HNRdBACF_sma3nz"].values
    alpha_series = df["alphaRatio_sma3"].values
    flux_series = df["spectralFlux_sma3"].values
    mfcc2_series = df["mfcc2_sma3"].values
    mfcc3_series = df["mfcc3_sma3"].values

    # ===== ① Arousal（声量＋変化量ベース）=====
    loud_range = np.percentile(loud_series, 90) - np.percentile(loud_series, 10)
    arousal = (
        0.5 * pnorm(np.log1p(loud_series)) +
        0.3 * pnorm(flux_series) +
        0.2 * np.tanh(np.log1p(max(0.0, loud_range)))
    )

    # ===== ② Valence（非線形・中央値ベース）=====
    valence = (
        0.4 * pnorm(hnr_series) +
        0.2 * (1.0 - pnorm(np.abs(jitter_series))) +
        0.2 * (1.0 - pnorm(np.abs(shimmer_series))) +
        0.2 * pnorm(alpha_series)
    )

    # ===== ③ Dominance（声量＋F0レンジ）=====
    f0_range = np.percentile(f0_series, 90) - np.percentile(f0_series, 10)
    dominance = (
        0.5 * pnorm(np.log1p(loud_series)) +
        0.3 * np.tanh(np.log1p(max(0.0, f0_range))) +
        0.2 * pnorm(hnr_series)
    )

    # ===== Pitch / Loudness variability（平均ではなく幅）=====
    pitch_variability = float(
    np.log1p(max(0.0, f0_range)) /
    (np.log1p(max(0.0, f0_range)) + 1.0)
    )

    loudness_variability = float(np.tanh(np.log1p(max(0.0, loud_range))))

    # ===== Stability（jitter / shimmer を非線形圧縮）=====
    unstable = np.tanh(
        np.log1p(
            np.median(np.abs(jitter_series)) +
            np.median(np.abs(shimmer_series))
        )
    )
    voice_stability = float(1.0 - unstable)

    # ===== Warmth（valence＋スペクトル）=====
    brightness = (
        0.4 * pnorm(alpha_series) +
        0.3 * pnorm(mfcc2_series) +
        0.3 * pnorm(mfcc3_series)
    )
    warmth = 0.6 * valence + 0.4 * brightness

    # ===== Pause / Voicing（ここは現状維持）=====
    silent_frames = (loud_series < -50).sum()
    pause_ratio = silent_frames / len(loud_series)

    voiced_frames = (f0_series > 0).sum()
    voicing_ratio = voiced_frames / len(f0_series)

    # ============================================================
    #  ★ Tone score（優しい / 柔らかいトーン）
    # ============================================================

    # --- roughness（荒さ）---
    roughness = (
        0.45 * pnorm(np.abs(jitter_series)) +
        0.35 * pnorm(np.abs(shimmer_series)) +
        0.20 * (1.0 - pnorm(hnr_series))
    )

    # --- force（押しの強さ）---
    force = (
        0.70 * pnorm(np.log1p(loud_series)) +
        0.30 * pnorm(flux_series)
    )

    # --- sharpness（角の立ち）---
    slope_500_1500 = df["slope500-1500_sma3"].values
    sharpness = (
        0.40 * pnorm(alpha_series) +
        0.35 * pnorm(df["hammarbergIndex_sma3"].values) +
        0.25 * pnorm(np.abs(slope_500_1500))    
    )

    # --- gentle tone ---
    gentle_tone = (
        1.0
        - (0.55 * roughness + 0.30 * force + 0.15 * sharpness)
    )

    tone_score = float(np.clip(gentle_tone, 0.0, 1.0))


    # ★ round はしない（差を潰さない）
    return {
        "arousal": float(arousal),
        "valence": float(valence),
        "dominance": float(dominance),
        "pitch_variability": pitch_variability,
        "loudness_variability": loudness_variability,
        "voice_stability": voice_stability,
        "warmth": float(warmth),
        "pause_ratio": float(pause_ratio),
        "voicing_ratio": float(voicing_ratio),
        "tone_score": tone_score,
        "tone_roughness": float(roughness),
        "tone_force": float(force),
        "tone_sharpness": float(sharpness),
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
