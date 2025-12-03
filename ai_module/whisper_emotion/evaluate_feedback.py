前ver
# -*- coding: utf-8 -*-
"""
evaluate_feedback.py（数値 + 講評）

評価内容：
【1】gpt-4o-mini → 5項目スコア（0〜100）
【2】gpt-4o-mini → 各スコアごとの講評コメント
【3】Python側で平均値 → total_score に設定
【4】全体の総評（overall_comment）も自動生成
"""

import json
from pathlib import Path
from openai import OpenAI

# ---------------------------------------------------------
# APIキー設定（環境変数推奨）
# ---------------------------------------------------------
client = OpenAI(api_key="")  # ★ここを必ず変更！


# ---------------------------------------------------------
# JSON読み込み
# ---------------------------------------------------------
def load_session(json_path: Path) -> dict:
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------
# 会話要約作成
# ---------------------------------------------------------
def build_conversation_summary(data: dict) -> str:
    lines = []
    for i, conv in enumerate(data.get("conversations", []), start=1):
        lines.append(f"[T{i}]")
        lines.append(f"ユーザー: {conv.get('transcript', '')}")
        lines.append(f"AI: {conv.get('reply', '')}")
        lines.append(f"適切性: {conv.get('appropriateness', '')}")
        lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------
# AI 評価プロンプト作成
# ---------------------------------------------------------
def build_score_prompt(data: dict) -> str:
    conv = build_conversation_summary(data)
    emo = data.get("emotion_history", [])
    feats = [c.get("audio_features", {}) for c in data.get("conversations", [])]

    prompt = f"""
あなたは「コミュニケーション能力の専門評価者」です。

以下の5つの観点について、
スコア（0〜100）と短い講評文（comment）を書き、
最後に overall_comment を1〜3文で書きなさい。

⚠ JSONだけ返す
⚠ 説明文禁止、構造変更禁止

{{
  "scores": {{
    "self_understanding": {{ "score": 0, "comment": "" }},
    "speaking": {{ "score": 0, "comment": "" }},
    "comprehension": {{ "score": 0, "comment": "" }},
    "emotion_control": {{ "score": 0, "comment": "" }},
    "empathy": {{ "score": 0, "comment": "" }}
  }},
  "overall_comment": ""
}}

# 会話ログ
{conv}

# emotion_history
{emo}

# audio_features
{feats}
"""
    return prompt


# ---------------------------------------------------------
# ChatCompletions 呼び出し
# ---------------------------------------------------------
def call_chat_model(prompt: str, session_name: str):
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "必ず JSON だけ返してください。"},
            {"role": "user", "content": prompt},
        ],
        max_tokens=1200,
        temperature=0.0,
    )
    return resp.choices[0].message.content or ""


# ---------------------------------------------------------
# JSON抽出（強化版）
# ---------------------------------------------------------
def extract_json_obj(text: str):
    candidates = []
    stack = []

    for i, ch in enumerate(text):
        if ch == "{":
            stack.append(i)
        elif ch == "}":
            if stack:
                start = stack.pop()
                end = i + 1
                candidates.append((start, end))

    candidates.sort(key=lambda x: x[1] - x[0], reverse=True)

    for start, end in candidates[:20]:
        try:
            return json.loads(text[start:end])
        except:
            continue

    raise ValueError("JSON抽出に失敗")


# ---------------------------------------------------------
# メイン処理
# ---------------------------------------------------------
def evaluate_conversation(json_path: Path):
    json_path = Path(json_path)
    data = load_session(json_path)

    from datetime import datetime
    timestamp = datetime.now().isoformat(timespec="seconds")

    prompt = build_score_prompt(data)
    raw = call_chat_model(prompt, timestamp)
    result = extract_json_obj(raw)

    # ★平均値計算
    scores = result["scores"]
    avg = sum(v["score"] for v in scores.values()) / len(scores)
    total_score = round(avg)

    # ★timestamp最上位 & total_score追加
    final_json = {
        "timestamp": timestamp,
        "scores": scores,
        "total_score": total_score,
        "overall_comment": result["overall_comment"]
    }

    # ★保存ファイル名の : → - に変換
    safe_name = timestamp.replace(":", "-").replace("T", "_")
    out_path = Path("logs") / f"result_score_feedback_{safe_name}.json"

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(final_json, f, ensure_ascii=False, indent=2)

    print(f"[SAVE] → {out_path}")
    return out_path


# ---------------------------------------------------------
# テスト実行
# ---------------------------------------------------------
if __name__ == "__main__":
    test_file = Path("C:/Users/81909/Desktop/RP_voice_ai/logs/session_full.json")
    evaluate_conversation(test_file)
