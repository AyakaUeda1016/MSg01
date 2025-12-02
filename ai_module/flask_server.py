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
import time  # ★ 処理時間計測用
import tempfile
import subprocess
from datetime import datetime
from pathlib import Path

import numpy as np
import opensmile
import soundfile as sf
import pymysql
import requests  # ← VoiceVox連携用
from flask import Flask, request, Response
from flask_cors import CORS
from openai import OpenAI
from faster_whisper import WhisperModel

from whisper_emotion.opensmile_test3 import (
    transcribe_whisper_file,
    analyze_with_opensmile_file,
)
from whisper_emotion.evaluate_feedback import evaluate_conversation



# ============================================================
# ⏱ 簡易タイムロガー
# ============================================================

def log_time(start, label: str):
    """処理開始時刻(start)からの経過秒数をログ出力"""
    sec = time.time() - start
    print(f"[TIME] {label}: {sec:.3f} 秒")


# ==== Flask初期化 ====
app = Flask(__name__)
CORS(app)

# ==== OpenAI設定 ====
client = OpenAI(
    api_key=""  # ★実運用時は自分のキーを設定してください
)

# ==== VoiceVox設定（ローカルEngine前提） ====
VOICEVOX_URL = "http://127.0.0.1:50021"
SPEAKER_ID = 14  # 好きな話者IDに変更OK（ずんだもん等）


def generate_voicevox_audio(text: str, speaker_id: int = SPEAKER_ID) -> str | None:
    """
    VoiceVoxでテキストから音声(WAV)を生成し、一時ファイルパスを返す
    失敗時は None を返す
    """
    try:
        start = time.time()
        # audio_query で話速やピッチなどの情報を生成
        query_res = requests.post(
            f"{VOICEVOX_URL}/audio_query",
            params={"text": text, "speaker": speaker_id},
            timeout=30,
        )
        query_res.raise_for_status()
        audio_query = query_res.json()
        log_time(start, "VoiceVox audio_query")

        # synthesis で実際の音声バイナリを生成
        synth_start = time.time()
        synth_res = requests.post(
            f"{VOICEVOX_URL}/synthesis",
            params={"speaker": speaker_id},
            json=audio_query,
            timeout=30,
        )
        synth_res.raise_for_status()
        log_time(synth_start, "VoiceVox synthesis")

        # 一時ファイルに書き出し
        tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".wav")
        tmp.write(synth_res.content)
        tmp.close()

        log_time(start, "VoiceVoxトータル生成")
        return tmp.name

    except Exception as e:
        print(f"[VOICEVOX ERROR] {e}")
        return None


# =====================================================================
# 🟦 DB 読み込み関連
# =====================================================================

CHARACTER_ROLE = None
CURRENT_SCENARIO_ID = None
MAX_TURNS = None
MAX_INAPPROPRIATE = 5
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
    start = time.time()
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
    global CURRENT_SCENARIO_ID
    CURRENT_SCENARIO_ID = row["id"]


    global CHARACTER_ROLE, MAX_TURNS, SCENARIO, REPLY_STYLE
    CHARACTER_ROLE = row["character_role"]
    MAX_TURNS = int(row["max_turns"])
    REPLY_STYLE = row["reply_style"]
    SCENARIO = {
        "scene": row["scene"],
        "start_message": row["start_message"],
    }

    print(f"[CONFIG] 使用シナリオID: {row['id']}, title: {row['title']}")
    log_time(start, "DBシナリオ読み込み(load_current_scenario_from_db)")


# =====================================================================
# 🔥 Whisper / openSMILE の遅延初期化（キャッシュ）
# =====================================================================

WHISPER = None
SMILE = None


def init_models():
    """Whisper / openSMILE を遅延初期化（キャッシュ）"""
    global WHISPER, SMILE

    if WHISPER is None:
        start = time.time()
        print("[INIT] WhisperModel 読み込み中...")
        WHISPER = WhisperModel("small", device="cpu", compute_type="int8")
        log_time(start, "WhisperModel 初期化")

    if SMILE is None:
        start = time.time()
        print("[INIT] openSMILE 初期化中...")
        SMILE = opensmile.Smile(
            feature_set=opensmile.FeatureSet.eGeMAPSv02,
            feature_level=opensmile.FeatureLevel.LowLevelDescriptors,
        )
        log_time(start, "openSMILE 初期化")


# =====================================================================
# 🧠 GPT 判定・応答生成関連
# =====================================================================

def check_appropriateness(message, context, scene, start_message) -> int:
    """
    発言がシナリオと関連しているかどうかを判定する。
    1 = 関連する発言
    0 = 無関係な発言
    """

    prompt = f"""
あなたは会話の適切性を判定するチェッカーです。

以下の基準で必ず「1」または「0」のどちらかだけを返してください。

- 1 = シーン設定や会話の流れと意味的に関連している発言
- 0 = シーン設定や会話の流れと意味的に関連していない発言（無関係・脱線・文脈無視）

【出力ルール】
- 数字のみを返してください（1 または 0 の1文字だけ）。
- 理由や説明、他の文字は一切書かないでください。

【シーン】
{scene}

【導入メッセージ】
{start_message}

【これまでの会話履歴】
{context}

【今回の発言】
{message}
"""

    start = time.time()
    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"role": "user", "content": prompt}],
        max_tokens=5,
    )
    log_time(start, "GPT適切性判定(check_appropriateness)")

    content = res.choices[0].message.content.strip()
    # 想定外の返答が来た場合は「関連する発言」とみなして 1
    return 1 if content == "1" else 0


def generate_reply(message, context):
    """
    キャラクターになりきった応答生成（systemロールに人格設定を固定）
    """

    system_prompt = f"""
あなたは会話トレーニング用のAIキャラクターです。
以下のキャラクター設定を必ず守って返答してください。

【キャラクター設定】
- 役割: {CHARACTER_ROLE}
- 会話スタイル: {REPLY_STYLE}

【ルール】
- 常にキャラクターになりきって返答する
- 口調・雰囲気・距離感を維持する
- 会話履歴を踏まえて自然に返す
"""

    user_prompt = f"""
これまでの会話履歴:
{context}

ユーザーの発言:
{message}

会話履歴を元に自然に返答をしてください。
"""

    start = time.time()
    res = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        max_tokens=150,
    )
    log_time(start, "GPT応答生成(generate_reply)")

    return res.choices[0].message.content.strip()


# =====================================================================
# 🔄 会話状態管理
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
    start = time.time()
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

    print(f"[SESSION] 新規セッション開始: {file}")
    log_time(start, "init_new_session")


# モジュール読み込み時に1回だけ初期化
init_new_session()


# =====================================================================
# 🎧 WebM → WAV 変換
# =====================================================================

def convert_webm_to_wav(input_path: str) -> str:
    """
    ffmpeg を使って WebM → モノラル16kHz WAV へ変換
    """
    start = time.time()
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
    log_time(start, "WebM→WAV変換(ffmpeg)")
    return output_path


# =====================================================================
# 📝 文字起こしだけ返す API
# =====================================================================

@app.route("/api/transcribe_preview", methods=["POST"])
def transcribe_preview():
    total_start = time.time()
    try:
        init_models()

        step = time.time()
        if "file" not in request.files:
            return Response(
                json.dumps({"error": "音声がありません"}, ensure_ascii=False),
                status=400,
                content_type="application/json",
            )
        log_time(step, "transcribe_preview: 音声チェック")

        # WebM -> 一時保存
        step = time.time()
        audio_file = request.files["file"]
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            audio_file.save(tmp.name)
            webm_path = tmp.name
        log_time(step, "transcribe_preview: WebM一時保存")

        # WebM → WAV
        wav_path = convert_webm_to_wav(webm_path)
        os.remove(webm_path)

        # Whisper 文字起こし
        step = time.time()
        transcript, meta = transcribe_whisper_file(wav_path, model=WHISPER)
        log_time(step, "transcribe_preview: Whisper文字起こし")
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

        log_time(total_start, "🔚 /api/transcribe_preview 全体処理時間")

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


# =====================================================================
# 🎯 会話API：/api/conversation
# =====================================================================

@app.route("/api/conversation", methods=["POST"])
def conversation_api():
    total_start = time.time()
    try:
        init_models()

        # 1. 音声ファイルの存在チェック
        step = time.time()
        if "file" not in request.files:
            return Response(
                json.dumps({"error": "音声がありません"}, ensure_ascii=False),
                status=400,
                content_type="application/json",
            )
        log_time(step, "conversation: 音声チェック")

        # 2. 音声 → WebM 一時保存
        step = time.time()
        audio_file = request.files["file"]
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as tmp:
            audio_file.save(tmp.name)
            webm_path = tmp.name
        log_time(step, "conversation: WebM一時保存")

        # 3. WebM → WAV
        wav_path = convert_webm_to_wav(webm_path)
        os.remove(webm_path)

        # 4. Whisper 文字起こし
        step = time.time()
        transcript, meta = transcribe_whisper_file(wav_path, model=WHISPER)
        log_time(step, "conversation: Whisper文字起こし")

        # 無音対策
        if not transcript or not transcript.strip():
            os.remove(wav_path)
            return Response(
                json.dumps({"error": "無音でした"}, ensure_ascii=False),
                status=400,
                content_type="application/json",
            )

        # 5. openSMILE（25 LLD + 7 指標 + pause/voicing）
        step = time.time()
        feat_dict, indices = analyze_with_opensmile_file(wav_path, smile=SMILE)
        log_time(step, "conversation: openSMILE特徴量抽出")
        os.remove(wav_path)

        # 6. GPT：会話の適切性判定（1=関連する, 0=無関係）
        step = time.time()
        context = "\n".join(conversation_state["history"][-30:])
        judgment = check_appropriateness(
            transcript,
            context,
            SCENARIO["scene"],
            SCENARIO["start_message"],
        )
        # （check_appropriateness 内で時間ログ済）

        # 7. GPT：応答生成 or 無関係メッセージ処理
        step = time.time()
        if judgment == 0:  # 無関係な発言
            conversation_state["inappropriate"] += 1
            reply = "⚠️ 無関係な発言です。もう一度お願いします。"

            if conversation_state["inappropriate"] >= MAX_INAPPROPRIATE:
                conversation_state["active"] = False
                reply += " 🚫 無関係な発言が多すぎたため終了します。"
        else:
            # 関連する発言（1）の場合のみ会話として進める
            reply = generate_reply(transcript, context)  # 内部で時間ログ済み

            conversation_state["history"].append(f"あなた: {transcript}")
            conversation_state["history"].append(f"AI: {reply}")
            conversation_state["turn"] += 1

            if conversation_state["turn"] >= MAX_TURNS:
                conversation_state["active"] = False
                reply += " 🎯 最大ターンに達したため終了します。"

        log_time(step, "conversation: 応答生成・状態更新")

        # 8. VoiceVox 音声生成
        step = time.time()
        voice_file_path = generate_voicevox_audio(reply)
        log_time(step, "conversation: VoiceVox音声生成")
        voice_audio_url = (
            f"/api/voice_audio?path={voice_file_path}" if voice_file_path else None
        )

        # ラベルも一応付けておくとフロント側で扱いやすい
        appropriateness_label = "関連する発言" if judgment == 1 else "無関係な発言"

        # 9. 返却JSON 構築
        step = time.time()
        result = {
            "transcript": transcript,
            "reply": reply,
            "emotion": indices,
            "audio_features": feat_dict,
            "appropriateness": judgment,           # 1 or 0
            "appropriateness_label": appropriateness_label,  # 文字ラベル
            "turn": conversation_state["turn"],
            "inappropriate_count": conversation_state["inappropriate"],
            "active": conversation_state["active"],
            "timestamp": datetime.now().isoformat(),
            "voice_audio_url": voice_audio_url,
        }
        log_time(step, "conversation: JSON構築")

        # 10. セッションに追加（メモリ上）
        step = time.time()
        session = conversation_state["session_data"]
        session["conversations"].append(result)
        session["emotion_history"].append(
            {
                "turn": conversation_state["turn"],
                **indices,
                "timestamp": datetime.now().isoformat(),
            }
        )
        log_time(step, "conversation: セッションデータ追加")

        # 11. 各ターンの簡易 turn_xx.json 保存（関連する発言のみ）
        if judgment == 1:
            step = time.time()
            session_dir = Path("logs") / conversation_state["session_file"].stem
            session_dir.mkdir(exist_ok=True)

            turn_no = conversation_state["turn"]
            turn_path = session_dir / f"turn_{turn_no:02d}.json"

            turn_data = {
                "turn": turn_no,
                "timestamp": result["timestamp"],
                "arousal": indices["arousal"],
                "valence": indices["valence"],
                "dominance": indices["dominance"],
                "pitch_variability": indices["pitch_variability"],
                "loudness_variability": indices["loudness_variability"],
                "voice_stability": indices["voice_stability"],
                "warmth": indices["warmth"],
                "pause_ratio": indices["pause_ratio"],
                "voicing_ratio": indices["voicing_ratio"],
            }

            with open(turn_path, "w", encoding="utf-8") as f:
                json.dump(turn_data, f, ensure_ascii=False, indent=2)

            print(f"[SAVE TURN] {turn_path}")
            log_time(step, "conversation: turn_xx.json 保存")

            result["turn_json_url"] = f"/logs/{session_dir.name}/turn_{turn_no:02d}.json"

                # 12. 会話終了時：session_full.json + 評価
        if not conversation_state["active"]:
            step = time.time()
            session["end_time"] = datetime.now().isoformat()

            session_dir = Path("logs") / conversation_state["session_file"].stem
            session_dir.mkdir(exist_ok=True)

            summary_path = session_dir / "session_full.json"
            with open(summary_path, "w", encoding="utf-8") as f:
                json.dump(session, f, ensure_ascii=False, indent=2)

            print(f"[SAVED] session_full.json → {summary_path}")
            log_time(step, "conversation: session_full.json 保存")

            # === conversation_log.json 追加 ===
            text_only = {"turns": []}
            hist = conversation_state["history"]

            turn_index = 1
            for i in range(0, len(hist), 2):
                user_msg = hist[i].replace("あなた: ", "") if i < len(hist) else ""
                ai_msg = hist[i + 1].replace("AI: ", "") if i + 1 < len(hist) else ""

                text_only["turns"].append({
                    "turn": turn_index,
                    "user": user_msg,
                    "ai": ai_msg
                })
                turn_index += 1

            conversation_log_path = session_dir / "conversation_log.json"
            with open(conversation_log_path, "w", encoding="utf-8") as f:
                json.dump(text_only, f, ensure_ascii=False, indent=2)

            print(f"[SAVED] conversation_log.json → {conversation_log_path}")

            # 評価スクリプト実行
            eval_start = time.time()
            try:
                eval_file = evaluate_conversation(summary_path)
                print(f"[EVAL DONE] {eval_file}")
            except Exception as eval_err:
                print("[EVAL ERROR]", eval_err)
            log_time(eval_start, "evaluate_conversation 実行")

            # === DB保存: feedbackテーブルにINSERT ===
            try:
                # 1. 評価JSON（result_score_feedback_xxx.json）読み込み
                result_data_json = "{}"
                try:
                    with open(eval_file, "r", encoding="utf-8") as ef:
                        result_data_json = ef.read()
                except Exception as read_err:
                    print("[EVAL READ ERROR]", read_err)

                # 2. conversation_log を JSON テキスト化
                conversation_log_json = json.dumps(text_only, ensure_ascii=False)

                # 3. DBへINSERT
                conn = get_db_connection()
                with conn:
                    with conn.cursor() as cur:
                        sql = """
                            INSERT INTO feedback (
                                member_id,
                                scenario_id,
                                finish_date,
                                result_data,
                                conversation_log
                            )
                            VALUES (%s, %s, %s, %s, %s)
                        """
                        cur.execute(
                            sql,
                            (
                                1,                               # member_id 固定
                                CURRENT_SCENARIO_ID,            # 使用シナリオID
                                datetime.now(),                 # finish_date
                                result_data_json,               # 評価json
                                conversation_log_json           # 会話ログjson
                            )
                        )
                    conn.commit()

                print("[DB] feedback テーブルへ保存完了")

            except Exception as db_err:
                print("[DB ERROR]", db_err)

        # 全体時間
        log_time(total_start, "🔚 /api/conversation 全体処理時間")

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
# 📘 /api/current_scenario
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


# =====================================================================
# 📘 /api/set_scenario
# =====================================================================

@app.route("/api/set_scenario", methods=["POST"])
def set_scenario():
    start = time.time()
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

    log_time(start, "/api/set_scenario 全体処理時間")

    return Response(
        json.dumps({"message": "シナリオを切り替えました"}, ensure_ascii=False),
        status=200,
        content_type="application/json",
    )


# =====================================================================
# 🧹 /api/reset
# =====================================================================

@app.route("/api/reset", methods=["POST"])
def reset_conversation():
    start = time.time()
    conversation_state["history"] = []
    conversation_state["turn"] = 0
    conversation_state["inappropriate"] = 0
    conversation_state["active"] = True

    init_new_session()
    log_time(start, "/api/reset 全体処理時間")

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
    total_start = time.time()
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

    log_time(total_start, "/api/voice_audio 全体処理時間")
    return Response(generate(), mimetype="audio/wav")


# =====================================================================
# 🚀 サーバ起動
# =====================================================================

if __name__ == "__main__":
    init_models()
    print("✅ Flask統合サーバ起動 → http://127.0.0.1:5000/api/conversation")
    print("🔊 VoiceVox URL:", VOICEVOX_URL)
    app.run(host="0.0.0.0", port=5000)
