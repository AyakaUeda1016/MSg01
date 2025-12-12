# -*- coding: utf-8 -*-
"""
AI会話トレーニング用 Flask 統合サーバ

【機能概要】
- WebM 音声アップロード（JSP/JS から送信）
- 音声 → WAV 変換（ffmpeg）
- Whisper による文字起こし
- openSMILE による音声特徴量抽出（25 LLD + 7 指標 + pause/voicing）
- GPT による適切性判定 + 応答生成
- VoiceVox による音声合成（長文は自動分割して複数WAV生成）
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
import re

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

# =====================================================================
# 🎯 openSMILE 指標 → 5スキル(1〜10点)に変換
# =====================================================================


def _scale_to_1_10(value, low, high, default=5.0):
    """
    value を [low, high] の範囲で正規化して 1〜10 にマッピング
    想定範囲外や None の場合は default を返す
    """
    try:
        v = float(value)
    except (TypeError, ValueError):
        return float(default)

    if low == high:
        return float(default)

    # 範囲にクリップ
    v = max(low, min(high, v))
    # [low, high] → [0,1] → [1,10]
    norm = (v - low) / (high - low)
    return 1.0 + norm * 9.0


def calc_skill_scores(indices: dict) -> dict:
    """
    openSMILE の指標(indices)から 5つのスキルスコア(1〜10点)を算出

    - 自己理解:        arousal（0〜1 想定）
    - 読写力:          pitch_variability（0〜1 想定）
    - 理解力:          valence（-1〜1 想定）
    - 感情判断:        voice_stability（0〜1 想定）
    - 思いやり:        warmth（0〜1 想定）
    """
    if indices is None:
        indices = {}

    self_understanding = _scale_to_1_10(
        indices.get("arousal"), 0.0, 1.0, default=5.0
    )
    reading_writing = _scale_to_1_10(
        indices.get("pitch_variability"), 0.0, 1.0, default=5.0
    )
    comprehension = _scale_to_1_10(
        indices.get("valence"), -1.0, 1.0, default=5.0
    )
    emotion_judgment = _scale_to_1_10(
        indices.get("voice_stability"), 0.0, 1.0, default=5.0
    )
    empathy = _scale_to_1_10(indices.get("warmth"), 0.0, 1.0, default=5.0)

    # 小数1桁に丸める（UI で 6.5 など表示しやすく）
    return {
        "self_understanding": round(self_understanding, 1),
        "reading_writing": round(reading_writing, 1),
        "comprehension": round(comprehension, 1),
        "emotion_judgment": round(emotion_judgment, 1),
        "empathy": round(empathy, 1),
    }


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
        if not text:
            return None

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


def generate_voicevox_audio_multi(text: str, speaker_id: int = SPEAKER_ID) -> list[str]:
    """
    長文を文末（。！？）＋120文字単位で分割し、複数WAVを生成してパスのリストを返す
    """
    if not text:
        return []

    # 「。」「！」「？」で一旦区切る（後ろの記号も含める）
    parts = re.split(r"(?<=[。！？])", text)
    parts = [p.strip() for p in parts if p.strip()]

    segmented: list[str] = []
    for part in parts:
        # さらに120文字ごとに強制分割（安全対策）
        while len(part) > 120:
            segmented.append(part[:120])
            part = part[120:]
        if part:
            segmented.append(part)

    files: list[str] = []
    for seg in segmented:
        path = generate_voicevox_audio(seg, speaker_id=speaker_id)
        if path:
            files.append(path)

    return files


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
                SELECT *
                FROM scenario
                WHERE id = %s
                LIMIT 1
            """
            cur.execute(sql, (scenario_id,))
            row = cur.fetchone()

    if not row:
        raise Exception(f"指定されたシナリオIDが存在しません: {scenario_id}")

    global CURRENT_SCENARIO_ID
    global CHARACTER_ROLE, MAX_TURNS, SCENARIO, REPLY_STYLE
    global CHARACTER_SPEAKER_ID

    CURRENT_SCENARIO_ID = row["id"]
    CHARACTER_ROLE = row["character_role"]
    MAX_TURNS = int(row["max_turns"])
    REPLY_STYLE = row["reply_style"]
    CHARACTER_SPEAKER_ID = int(row["character_id"])

    SCENARIO = {
        "scene": row["scene"],
        "start_message": row["start_message"],
        "finish_message_on_clear": row.get("finish_message_on_clear"),
        "finish_message_on_fail": row.get("finish_message_on_fail"),
    }

    print(f"[CONFIG] シナリオID {scenario_id} を読み込みました: {row['title']}")
    return row





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

def check_appropriateness(message, context, scene, start_message) -> bool:
    """
    発言がシナリオに関連しているかを判定する
    True  = 関連する発言
    False = 無関係な発言
    """

    prompt = f"""
あなたは会話トレーニング用の判定AIです。

【判定ルール】
- 必ず次のどちらか一言だけで答えてください
- 余計な説明は禁止

回答:
「関連する発言」 または 「無関係な発言」

【シーン】
{scene}

【導入メッセージ】
{start_message}

【これまでの会話】
{context}

【今回の発言】
{message}
"""

    try:
        res = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {
                    "role": "system",
                    "content": "あなたは判定専用AIです。必ず指定された語句のみで回答してください。"
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            max_completion_tokens=20,  # 超短くてOK
        )

        raw = (res.choices[0].message.content or "").strip()
        print("[APPROPRIATENESS RAW]", raw)

        # 判定（多少の揺れにも耐える）
        if "無関係" in raw:
            return False
        else:
            return True

    except Exception as e:
        print("[APPROPRIATENESS ERROR] 判定失敗 → 保留扱い:", e)
        return True  # ★安全側




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
        max_completion_tokens=150,
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
    "evaluated": False,
}


def init_new_session():
    """新しい会話セッションを開始"""
    start = time.time()

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

    # history には start_message は入れない（評価ロジックとの整合性のため）

    print(f"[SESSION] 新規セッション開始: {file}")
    log_time(start, "init_new_session")




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

    if CURRENT_SCENARIO_ID is None:
        return Response(
            json.dumps(
                {"error": "シナリオが選択されていません"},
                ensure_ascii=False
            ),
            status=400,
            content_type="application/json",
        )
    
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

        # 4. Whisper文字起こし or 手入力
        step = time.time()
        manual = request.form.get("manual_transcript")
        if manual and manual.strip():
            transcript = manual.strip()
            print("[MANUAL TRANSCRIPT] ユーザー編集済みテキストを使用")
            meta = {}
        else:
            transcript, meta = transcribe_whisper_file(wav_path, model=WHISPER)
            print("[WHISPER] Whisperで文字起こし")

        # 5. openSMILE（25 LLD + 7 指標 + pause/voicing）
        step = time.time()
        feat_dict, indices = analyze_with_opensmile_file(wav_path, smile=SMILE)
        log_time(step, "conversation: openSMILE特徴量抽出")
        os.remove(wav_path)

        # 5.5 openSMILE 指標から 5スキル(1〜10点)を算出
        skill_scores = calc_skill_scores(indices)

        # 6. GPT：会話の適切性判定（true = 関連する, false = 無関係）
        step = time.time()
        context = "\n".join(conversation_state["history"][-6:])
        is_related = check_appropriateness(
            transcript,
            context,
            SCENARIO["scene"],
            SCENARIO["start_message"],
        )
        # （check_appropriateness 内で時間ログ済）

        # 7. GPT：応答生成 or 無関係メッセージ処理
        step = time.time()
        if not is_related:
            # 無関係発言
            conversation_state["inappropriate"] += 1

            # 終了条件判定（無関係発言が多すぎる場合 → 失敗終了）
            if conversation_state["inappropriate"] >= MAX_INAPPROPRIATE:
                conversation_state["active"] = False
                reply = SCENARIO.get("finish_message_on_fail") or "🚫 終了します。"
            else:
                reply = "⚠️ 無関係な発言です。もう一度お願いします。"
        else:
            # 関連する発言（True）の場合のみ会話として進める
            reply = generate_reply(transcript, context)  # 内部で時間ログ済み

            conversation_state["history"].append(f"あなた: {transcript}")
            conversation_state["history"].append(f"AI: {reply}")
            conversation_state["turn"] += 1

            # ===============================
            # ★ 終了条件判定
            # ===============================
            finish_reason = None

            # 無関係発言の終了（すでに不適切カウントが閾値超えた場合）
            if conversation_state["inappropriate"] >= MAX_INAPPROPRIATE:
                conversation_state["active"] = False
                finish_reason = "fail"
                reply = SCENARIO.get("finish_message_on_fail") or "🚫 終了します。"

            # 最大ターンの終了
            elif conversation_state["turn"] >= MAX_TURNS:
                conversation_state["active"] = False
                finish_reason = "clear"
                reply = SCENARIO.get("finish_message_on_clear") or "🎯 終了します。"

        log_time(step, "conversation: 応答生成・状態更新")

        # 8. VoiceVox（複数対応：長文は分割して連続再生）
        step = time.time()
        tts_text = reply

        voice_urls: list[str] = []
        # 無関係メッセージの警告文は読み上げない
        if tts_text and "無関係な発言" not in tts_text:
            files = generate_voicevox_audio_multi(tts_text, speaker_id=CHARACTER_SPEAKER_ID)

            for f in files:
                voice_urls.append(f"/api/voice_audio?path={f}")

        log_time(step, "conversation: VoiceVox音声生成")

        # ラベルも一応付けておくとフロント側で扱いやすい
        appropriateness_label = "関連する発言" if is_related else "無関係な発言"

        # 9. 返却JSON 構築
        step = time.time()
        result = {
            "transcript": transcript,
            "reply": reply,
            "emotion": indices,
            "audio_features": feat_dict,
            "appropriateness": is_related,
            "appropriateness_label": appropriateness_label,  # 文字ラベル
            "turn": conversation_state["turn"],
            "inappropriate_count": conversation_state["inappropriate"],
            "active": conversation_state["active"],
            "timestamp": datetime.now().isoformat(),
            # ★ JS用：複数再生用URL
            "voice_audio_urls": voice_urls,
            # 旧仕様互換（最初の1個だけ欲しい場合）
            "voice_audio_url": voice_urls[0] if voice_urls else None,
            # ★ 追加: Python 側で計算した 5スキル(1〜10点)
            "skill_scores": skill_scores,
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
        if is_related:
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

            result["turn_json_url"] = (
                f"/logs/{session_dir.name}/turn_{turn_no:02d}.json"
            )

        # 12. 会話終了時：session_full.json + 評価
        if (
            not conversation_state["active"]
            and not conversation_state.get("evaluated", False)
        ):
            # ★二重実行防止フラグ
            conversation_state["evaluated"] = True

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
                ai_msg = (
                    hist[i + 1].replace("AI: ", "")
                    if i + 1 < len(hist)
                    else ""
                )

                text_only["turns"].append(
                    {"turn": turn_index, "user": user_msg, "ai": ai_msg}
                )
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
                result_data_json = "{}"
                try:
                    with open(eval_file, "r", encoding="utf-8") as ef:
                        result_data_json = ef.read()
                except Exception as read_err:
                    print("[EVAL READ ERROR]", read_err)

                conversation_log_json = json.dumps(text_only, ensure_ascii=False)

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
                                1,
                                CURRENT_SCENARIO_ID,
                                datetime.now(),
                                result_data_json,
                                conversation_log_json,
                            ),
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
        tb = traceback.format_exc()
        print("[ERROR] /api/conversation exception:", e)
        print(tb)  # ★これが超重要

        return Response(
            json.dumps(
                {"error": str(e), "traceback": traceback.format_exc()},
                ensure_ascii=False,
            ),
            status=500,
            content_type="application/json",
        )


# =====================================================================
# 📘 /api/current_scenario（未選択対応版）
# =====================================================================

@app.route("/api/current_scenario", methods=["GET"])
def get_current_scenario():
    # 🔴 まだシナリオが選択されていない場合
    if CURRENT_SCENARIO_ID is None:
        return Response(
            json.dumps(
                {
                    "status": "not_selected",
                    "character_role": None,
                    "max_turns": None,
                    "scene": None,
                    "start_message": None,
                    "reply_style": "",
                    "scenario_id": None,
                },
                ensure_ascii=False,
            ),
            status=200,
            content_type="application/json",
        )

    # 🟢 シナリオが選択済みの場合
    return Response(
        json.dumps(
            {
                "status": "ready",
                "character_role": CHARACTER_ROLE,
                "max_turns": MAX_TURNS,
                "scene": SCENARIO.get("scene"),
                "start_message": SCENARIO.get("start_message"),
                "reply_style": REPLY_STYLE,
                "scenario_id": CURRENT_SCENARIO_ID,
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

    # ★ is_active は使用せず、ただ指定 ID をロードするだけ
    try:
        load_scenario_by_id(scenario_id)
        init_new_session()
    except Exception as e:
        return Response(
            json.dumps({"error": str(e)}, ensure_ascii=False),
            status=400,
            content_type="application/json",
        )

    log_time(start, "/api/set_scenario 全体処理時間")

    return Response(
        json.dumps({"message": f"シナリオ {scenario_id} を読み込みました"}, ensure_ascii=False),
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
    conversation_state["evaluated"] = False

    # ★ シナリオが選択済みの場合のみセッション初期化
    if CURRENT_SCENARIO_ID is not None:
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
