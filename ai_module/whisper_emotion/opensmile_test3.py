# -*- coding: utf-8 -*-
"""
openSMILE特徴量抽出 ＋ 感情スコア算出モジュール 
"""

from datetime import datetime
import numpy as np
import opensmile
import soundfile as sf
from faster_whisper import WhisperModel
import tempfile, os


# ====== Whisper文字起こし ======
def transcribe_whisper_file(file_path: str, model: WhisperModel = None):
    """音声ファイルを文字起こし。Flaskなどからmodelを渡す形式に変更"""
    if model is None:
        print("[opensmile_test3] WhisperModel を新規ロード（外部から渡されなかった）")
        model = WhisperModel("small", device="cpu", compute_type="int8")
    else:
        print("[opensmile_test3] FlaskのキャッシュWhisperモデルを再利用")

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

def analyze_with_opensmile_buffer(audio: np.ndarray, samplerate: int = 16000, smile=None):
    """openSMILEはファイル入力のみ対応。NumPy配列→一時ファイル経由で処理。"""
    if smile is None:
        print("[opensmile_test3] openSMILE を新規ロード（外部から渡されなかった）")
        smile = opensmile.Smile(
            feature_set=opensmile.FeatureSet.eGeMAPSv02,
            feature_level=opensmile.FeatureLevel.Functionals,
        )
    else:
        print("[opensmile_test3] FlaskのキャッシュopenSMILEを再利用")

    with tempfile.NamedTemporaryFile(delete=False, suffix=".wav") as tmp:
        sf.write(tmp.name, audio, samplerate, format="WAV", subtype="PCM_16")
        tmp_path = tmp.name
    try:
        features = smile.process_file(tmp_path)
        row = features.iloc[0]
        feat_dict = {k: float(row[k]) for k in FEATURE_KEYS if k in row.index}
    finally:
        os.remove(tmp_path)
    return feat_dict


def analyze_with_opensmile_file(file_path: str, smile=None):
    """音声ファイルを直接openSMILEで処理"""
    if smile is None:
        print("[opensmile_test3] openSMILE を新規ロード（外部から渡されなかった）")
        smile = opensmile.Smile(
            feature_set=opensmile.FeatureSet.eGeMAPSv02,
            feature_level=opensmile.FeatureLevel.Functionals,
        )
    else:
        print("[opensmile_test3] FlaskのキャッシュopenSMILEを再利用")

    features = smile.process_file(file_path)
    row = features.iloc[0]
    return {k: float(row[k]) for k in FEATURE_KEYS if k in row.index}


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


# ====== テスト用エントリーポイント ======
if __name__ == "__main__":
    # 任意の音声ファイルを直接指定して動作確認
    test_file = input("音声ファイルのパスを入力してください: ").strip()
    if not os.path.exists(test_file):
        print(f"❌ ファイルが存在しません: {test_file}")
    else:
        print(f"[TEST] {test_file} を解析中...")
        text, meta = transcribe_whisper_file(test_file)
        features = analyze_with_opensmile_file(test_file)
        emo = simple_emotion_scores(features)
        print("\n--- 結果 ---")
        print(f"文字起こし: {text}")
        print(f"感情スコア: {emo}")
