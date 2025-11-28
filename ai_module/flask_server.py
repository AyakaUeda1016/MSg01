# -*- coding: utf-8 -*-
"""
AI会話トレーニング用 Flask 統合サーバ

【機能概要】
- WebM 音声アップロード（JSP/JS から送信）
- 音声 → WAV 変換（ffmpeg）
- Whisper による文字起こし
- openSMILE による音声特徴量抽出（25 LLD + 7 指標 + pause/voicing）
- GPT による適切性判定 + 応答生成
- VoiceVox による音声合成
- 各ターンログ / セッションログの自動生成
- DB からシナリオ設定を読み込み（キャラ役割 / 最大ターンなど）

【用途】
JSP フロントエンドと連携し、音声会話 UI のバックエンドとして動作させる。
"""

import os
import gc
import json
import tempfile
import subprocess
from datetime import datetime
from pathlib import Path

import numpy as np
import opensmile
import soundfile as sf
import pymysql
import requests  # ←★ VoiceVox連携用に追加
from flask import Flask, request, Response
from flask_cors import CORS
from openai import OpenAI
from faster_whisper import WhisperModel

from whisper_emotion.opensmile_test3 import (
    transcribe_whisper_file,
    analyze_with_opensmile_file,
)
from whisper_emotion.evaluate_feedback import evaluate_conversation


# ==== Flask初期化 ====
app = Flask(__name__)
CORS(app)

# ==== OpenAI設定 ====
client = OpenAI(api_key="")  # ← 自分のAPIキーを入れてください

# ==== VoiceVox設定（ローカルEngine前提） ====
VOICEVOX_URL = "http://127.0.0.1:50021"
SPEAKER_ID = 14  # 好きな話者IDに変更OK（ずんだもん等）


def generate_voicevox_audio(text: str, speaker_id: int = SPEAKER_ID) -> str | None:
    """
    VoiceVoxでテキストから音声(WAV)を生成し、一時ファイルパスを返す
    失敗時は None を返す
    """
    try:
        # audio_query で話速やピッチなどの情報を生成
        query_res = requests.post(
            f"{VOICEVOX_URL}/audio_query",
            params={"text": text, "speaker": speaker_id},
            timeout=30,
        )
        query_res.raise_for_status()
        audio_query = query_res.json()

        # synthesis で実際の音声バイナリを生成
        synth_res = requests.post(
            f"{VOICEVOX_URL}/synthesis",
            params={"speaker": speaker_id},
            json=audio_query,
            timeout=30,
        )
        synth_res.raise_for_status()

        # 一時ファイルに書き出し
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        tmp.write(synth_res.content)
        tmp.close()

        return tmp.name

    except Exception as e:
        print(f"[VOICEVOX ERROR] {e}")
        return None


# =====================================================================
# 🟦 DB 読み込み関連
# シナリオ（キャラクター設定・最大ターン・開始文）を DB から取得する
# フロントは /api/current_scenario を使用して画面に反映
# =====================================================================

CHARACTER_ROLE = None
MAX_TURNS = None
MAX_INAPPROPRIATE = 2
SCENARIO = {}
REPLY_STYLE = ""


def get_db_connection():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="",
        database="msg01test",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor,
    )


def load_scenario_by_id(scenario_id: int):
    conn = get_db_connection()
    with conn:
        with conn.cursor() as cur:
            sql = """
                SELECT
                    character_role,
                    max_turns,
                    scene,
                    start_message,
                    reply_style
                FROM scenario
                WHERE id = %s
            """
            cur.execute(sql, (scenario_id,))
            row = cur.fetchone()

    return {
        "character_role": row["character_role"],
        "max_turns": int(row["max_turns"]),
        "scene": row["scene"],
        "start_message": row["start_message"],
        "reply_style": row["reply_style"],
    }


def load_current_scenario_from_db():
    conn = get_db_connection()
    with conn:
        with conn.cursor() as cur:
            sql = """
                SELECT *
                FROM scenario
                WHERE is_active = 1
                LIMIT 1
            """
            cur.execute(sql)
            row = cur.fetchone()

    if not row:
        raise Exception("is_active=1 のシナリオが見つかりません")

    global CHARACTER_ROLE, MAX_TURNS, SCENARIO, REPLY_STYLE
    CHARACTER_ROLE = row["character_role"]
    MAX_TURNS = int(row["max_turns"])
    REPLY_STYLE = row["reply_style"]
    SCENARIO = {
        "scene": row["scene"],
        "start_message": row["start_message"],
    }

    print(f"[CONFIG] 使用シナリオID: {row['id']}, title: {row['title']}")


# =====================================================================
# 🔥 Whisper / openSMILE の遅延初期化（キャッシュ）
# 初回アクセス時のみロードし、以降高速化する
# =====================================================================

WHISPER = None
SMILE = None


def init_models():
    """Whisper / openSMILE を遅延初期化（キャッシュ）"""
    global WHISPER, SMILE

    if WHISPER is None:
        print("[INIT] WhisperModel 読み込み中...")
        #WHISPER = WhisperModel("small", device="cpu", compute_type="int8")
        WHISPER = WhisperModel("small", device="cuda", compute_type="float16")

    if SMILE is None:
        print("[INIT] openSMILE 初期化中...")
        SMILE = opensmile.Smile(
            feature_set=opensmile.FeatureSet.eGeMAPSv02,
            feature_level=opensmile.FeatureLevel.LowLevelDescriptors,
        )


# =====================================================================
# 🧠 GPT 判定・応答生成関連
# - check_appropriateness: シーンに沿った発話か判定
# - generate_reply: キャラクターになりきって自然文を生成
# =====================================================================

def check_appropriateness(message, context, scene, start_message):
    """
    発言がシナリオと関連しているかどうかを判定
    「関連する発言」 or 「無関係な発言」で返す
    """
    prompt = f"""
シーン: {scene}
導入会話: {start_message}

これまでの会話履歴:
{context}

現在の発言:
{message}

この発言はシーンや会話の流れに対して関連していますか？
必ず次のどちらか1つで答えてください。
- 関連する発言
- 無関係な発言
"""

    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
    )
    return res.choices[0].message.content.strip()


def generate_reply(message, context):
    """
    キャラクターになりきった応答生成
    """
    prompt = f"""
あなたは{CHARACTER_ROLE}です。
{REPLY_STYLE}

これまでの会話履歴:
{context}

ユーザーの発言:
{message}

上記を踏まえて、自然な日本語で1〜2文程度の返答をしてください。
"""

    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=150,
    )
    return res.choices[0].message.content.strip()


# =====================================================================
# 🔄 会話状態管理
# 各ターンの進行状況（turn, inappropriate, 履歴など）を保持する
# セッション単位でログファイルを生成
# =====================================================================

conversation_state = {
    "history": [],
    "turn": 0,
    "inappropriate": 0,
    "active": True,
    "session_data": None,
    "session_file": None,
}


def init_new_session():
    """新しい会話セッションを開始"""
    load_current_scenario_from_db()

    # ログディレクトリを確実に作成
    logs_dir = Path("logs")
    logs_dir.mkdir(exist_ok=True)

    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    file = logs_dir / f"session_{timestamp}.json"

    conversation_state["session_file"] = file
    conversation_state["session_data"] = {
        "scene": SCENARIO["scene"],
        "start_message": SCENARIO["start_message"],
        "conversations": [],
        "emotion_history": [],
        "start_time": datetime.now().isoformat(),
    }


# モジュール読み込み時に1回だけ初期化
init_new_session()


# =====================================================================
# 🎧 WebM → WAV 変換
# ブラウザ録音は webm のため、Whisper 用に 16kHz WAV に変換
# ffmpeg 必須
# =====================================================================

def convert_webm_to_wav(input_path: str) -> str:
    """
    ffmpeg を使って WebM → モノラル16kHz WAV へ変換
    """
    output_path = tempfile.NamedTemporaryFile(delete=False, suffix=".wav").name
    cmd = [
        "ffmpeg",
        "-y",
        "-i",
        input_path,
        "-ac",
        "1",
        "-ar",
        "16000",
        output_path,
    ]
    subprocess.run(cmd, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return output_path


# =====================================================================
# 🎯 会話API：/api/conversation（フロントの録音ボタンから呼び出される）
#
# 全処理フロー：
# 1. 音声ファイルの受信
# 2. WebM → WAV 変換
# 3. Whisper 文字起こし
# 4. openSMILE で音声特徴量抽出
# 5. GPT によるシーン適切性判定
# 6. GPT による応答生成
# 7. VoiceVox による音声合成（WAV）
# 8. 結果を JSON で返却
# 9. ターンログ / セッションログを保存
# =====================================================================


# ================================
# 文字起こしだけ返す API
# ================================
@app.route("/api/transcribe_preview", methods=["POST"])
def transcribe_preview():
    try:
        init_models()

        if "file" not in request.files:
            return Response(
                json.dumps({"error": "音声がありません"}, ensure_ascii=False),
                status=400,
                content_type="application/json",
            )

        # WebM -> 一時保存
        audio_file = request.files["file"]
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            audio_file.save(tmp.name)
            webm_path = tmp.name

        # WebM → WAV
        wav_path = convert_webm_to_wav(webm_path)
        os.remove(webm_path)

        # Whisper 文字起こし
        transcript, meta = transcribe_whisper_file(wav_path, model=WHISPER)
        os.remove(wav_path)

        if not transcript or not transcript.strip():
            return Response(
                json.dumps({"error": "無音でした"}, ensure_ascii=False),
                status=400,
                content_type="application/json",
            )

        result = {
            "transcript": transcript,
            "timestamp": datetime.now().isoformat(),
        }

        return Response(
            json.dumps(result, ensure_ascii=False),
            status=200,
            content_type="application/json",
        )

    except Exception as e:
        import traceback
        return Response(
            json.dumps(
                {"error": str(e), "traceback": traceback.format_exc()},
                ensure_ascii=False,
            ),
            status=500,
            content_type="application/json",
        )


# ================================
# 送られてきた録音データ（音声ファイル）が存在するかどうかをチェック
# ================================
@app.route("/api/conversation", methods=["POST"])
def conversation_api():
    try:
        init_models()

        if "file" not in request.files:
            return Response(
                json.dumps({"error": "音声がありません"}, ensure_ascii=False),
                status=400,
                content_type="application/json",
            )

        # ================================
        # 音声 → webm 一時保存
        # ================================
        audio_file = request.files["file"]
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            audio_file.save(tmp.name)
            webm_path = tmp.name

        # ================================
        # WebM → WAV
        # ================================
        wav_path = convert_webm_to_wav(webm_path)
        os.remove(webm_path)

        # ================================
        # Whisper 文字起こし
        # ================================
        transcript, meta = transcribe_whisper_file(wav_path, model=WHISPER)

        # 無音対策
        if not transcript or not transcript.strip():
            os.remove(wav_path)
            return Response(
                json.dumps({"error": "無音でした"}, ensure_ascii=False),
                status=400,
                content_type="application/json",
            )

        # ================================
        # openSMILE（25 LLD + 7指標 + pause/voicing）
        # ================================
        feat_dict, indices = analyze_with_opensmile_file(wav_path, smile=SMILE)
        os.remove(wav_path)

        # ================================
        # GPT：会話の適切性判定
        # ================================
        context = "\n".join(conversation_state["history"][-30:])
        judgment = check_appropriateness(
            transcript,
            context,
            SCENARIO["scene"],
            SCENARIO["start_message"],
        )

        # ================================
        # GPT：応答生成
        # ================================
        if judgment == "無関係な発言":
            conversation_state["inappropriate"] += 1
            reply = "⚠️ 無関係な発言です。もう一度お願いします。"

            if conversation_state["inappropriate"] >= MAX_INAPPROPRIATE:
                conversation_state["active"] = False
                reply += " 🚫 無関係な発言が多すぎたため終了します。"

        else:
            reply = generate_reply(transcript, context)

            conversation_state["history"].append(f"あなた: {transcript}")
            conversation_state["history"].append(f"AI: {reply}")
            conversation_state["turn"] += 1

            if conversation_state["turn"] >= MAX_TURNS:
                conversation_state["active"] = False
                reply += " 🎯 最大ターンに達したため終了します。"

        # =====================================================================
        # 🔊 VoiceVox 音声取得API
        # generate_voicevox_audio() で生成した一時 WAV をストリーミングで返却
        # 再生後は自動削除してストレージを節約
        # フロントの Audio() がこの API を叩く
        # =====================================================================

        voice_file_path = generate_voicevox_audio(reply)
        voice_audio_url = (
            f"/api/voice_audio?path={voice_file_path}" if voice_file_path else None
        )

        # ================================
        # 返却JSON（1回分）
        # ================================
        result = {
            "transcript": transcript,
            "reply": reply,
            "emotion": indices,
            "audio_features": feat_dict,
            "appropriateness": judgment,
            "turn": conversation_state["turn"],
            "inappropriate_count": conversation_state["inappropriate"],
            "active": conversation_state["active"],
            "timestamp": datetime.now().isoformat(),
            "voice_audio_url": voice_audio_url,  # ←★ 追加
        }

        # ================================
        # セッションに追加
        # ================================
        session = conversation_state["session_data"]
        session["conversations"].append(result)
        session["emotion_history"].append(
            {
                "turn": conversation_state["turn"],
                **indices,
                "timestamp": datetime.now().isoformat(),
            }
        )

        # =================================================================
        # 🟦 各ターンの JSON 保存 → 9 指標のみの簡易版 turn.json を出力
        # =================================================================
        if judgment == "関連する発言":
            session_dir = Path("logs") / conversation_state["session_file"].stem
            session_dir.mkdir(exist_ok=True)

            turn_no = conversation_state["turn"]
            turn_path = session_dir / f"turn_{turn_no:02d}.json"

            turn_data = {
                "turn": turn_no,
                "timestamp": result["timestamp"],
                "arousal": indices["arousal"],  # 覚醒度
                "valence": indices["valence"],  # ポジ/ネガ
                "dominance": indices["dominance"],  # 主導性
                "pitch_variability": indices["pitch_variability"],  # 声の高さの揺れ
                "loudness_variability": indices["loudness_variability"],  # 音量の揺れ
                "voice_stability": indices["voice_stability"],  # 声の安定
                "warmth": indices["warmth"],  # 優しさ・親しみ
                "pause_ratio": indices["pause_ratio"],  # 無音率
                "voicing_ratio": indices["voicing_ratio"],  # 有声率
            }

            with open(turn_path, "w", encoding="utf-8") as f:
                json.dump(turn_data, f, ensure_ascii=False, indent=2)

            print(f"[SAVE TURN] {turn_path}")

        # =================================================================
        # 🔥 会話終了 → session_full.json 保存 + 評価
        # =================================================================
        if not conversation_state["active"]:
            session["end_time"] = datetime.now().isoformat()

            session_dir = Path("logs") / conversation_state["session_file"].stem
            session_dir.mkdir(exist_ok=True)

            summary_path = session_dir / "session_full.json"
            with open(summary_path, "w", encoding="utf-8") as f:
                json.dump(session, f, ensure_ascii=False, indent=2)

            print(f"[SAVED] session_full.json → {summary_path}")

            # 評価スクリプト実行
            try:
                eval_file = evaluate_conversation(summary_path)
                print(f"[EVAL DONE] {eval_file}")
            except Exception as eval_err:
                print("[EVAL ERROR]", eval_err)

        return Response(
            json.dumps(result, ensure_ascii=False),
            status=200,
            content_type="application/json",
        )

    except Exception as e:
        import traceback

        return Response(
            json.dumps(
                {
                    "error": str(e),
                    "traceback": traceback.format_exc(),
                },
                ensure_ascii=False,
            ),
            status=500,
            content_type="application/json",
        )

# =====================================================================
# 📘 /api/set_scenario
# JSP の管理画面からシナリオを変更するための API
# is_active=1 のレコードを切り替え、Flask 内部状態も更新
# =====================================================================

@app.route("/api/current_scenario", methods=["GET"])
def get_current_scenario():
    return Response(
        json.dumps(
            {
                "character_role": CHARACTER_ROLE,
                "max_turns": MAX_TURNS,
                "scene": SCENARIO.get("scene"),
                "start_message": SCENARIO.get("start_message"),
                "reply_style": REPLY_STYLE,
            },
            ensure_ascii=False,
        ),
        status=200,
        content_type="application/json",
    )


@app.route("/api/set_scenario", methods=["POST"])
def set_scenario():
    data = request.json
    scenario_id = data.get("id")

    if not scenario_id:
        return Response(
            json.dumps({"error": "id がありません"}, ensure_ascii=False),
            status=400,
            content_type="application/json",
        )

    # 全て is_active=0 にしてから、選ばれたシナリオを1にする
    conn = get_db_connection()
    with conn:
        with conn.cursor() as cur:
            cur.execute("UPDATE scenario SET is_active = 0")
            cur.execute(
                "UPDATE scenario SET is_active = 1 WHERE id = %s", (scenario_id,)
            )
        conn.commit()

    # Flask の内部変数を更新
    load_current_scenario_from_db()
    init_new_session()

    return Response(
        json.dumps({"message": "シナリオを切り替えました"}, ensure_ascii=False),
        status=200,
        content_type="application/json",
    )


# =====================================================================
# 🧹 /api/reset
# 現在の会話のターン・履歴を全てクリアし、新規セッションとして開始
# フロントの「リセットボタン」から使用想定
# =====================================================================

@app.route("/api/reset", methods=["POST"])
def reset_conversation():
    conversation_state["history"] = []
    conversation_state["turn"] = 0
    conversation_state["inappropriate"] = 0
    conversation_state["active"] = True

    init_new_session()

    return Response(
        json.dumps({"message": "🧹 会話をリセットしました"}, ensure_ascii=False),
        status=200,
        content_type="application/json",
    )


# =====================================================================
# 🔊 VoiceVox音声配信API
# =====================================================================
@app.route("/api/voice_audio", methods=["GET"])
def get_voice_audio():
    """
    generate_voicevox_audio で生成した一時WAVをストリーミング返却
    再生後にファイルは削除
    """
    file_path = request.args.get("path")
    if not file_path or not os.path.exists(file_path):
        return Response(
            "音声ファイルが見つかりません",
            status=404,
            content_type="text/plain; charset=utf-8",
        )

    def generate():
        with open(file_path, "rb") as f:
            while True:
                chunk = f.read(8192)
                if not chunk:
                    break
                yield chunk
        # 送り終わったら削除
        try:
            os.remove(file_path)
        except Exception:
            pass

    return Response(generate(), mimetype="audio/wav")


# =====================================================================
# 🚀 サーバ起動
# Flask を 5000 番で公開し、フロント（JSP）から fetch でアクセス可能にする
# =====================================================================

if __name__ == "__main__":
    init_models()
    print("✅ Flask統合サーバ起動 → http://127.0.0.1:5000/api/conversation")
    print("🔊 VoiceVox URL:", VOICEVOX_URL)
    app.run(host="0.0.0.0", port=5000)
