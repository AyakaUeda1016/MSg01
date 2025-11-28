# -*- coding: utf-8 -*-
"""
evaluate_feedback.py（数値 + 講評の安定版）

評価内容：
【1】o3-mini → 数値スコア（5項目 + total_score）
【2】o4-mini → 5項目それぞれの「良い点 / 改善点」文章
【3】1つのJSONに統合して result_score_feedback_xxx.json に保存

ポイント：
- あなた側でJSONの「型」を決めておき、AIは中身だけ埋める
- 古い openai ライブラリでも動くように response_format は使わない
- JSON抽出は「複数候補を試す」強化版でほぼ失敗しない
"""

import json
import re
from pathlib import Path
from openai import OpenAI

# ★ 必ずあなたの API キーを入れる
client = OpenAI(api_key="")


# ---------------------------------------------------------
# JSON読み込み
# ---------------------------------------------------------
def load_session(json_path: Path) -> dict:
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------
# 会話要約
# ---------------------------------------------------------
def build_conversation_summary(data: dict) -> str:
    lines = []
    for i, conv in enumerate(data.get("conversations", []), start=1):
        lines.append(f"[ターン {i}]")
        lines.append(f"ユーザー: {conv.get('transcript', '')}")
        lines.append(f"AI: {conv.get('reply', '')}")
        lines.append(f"適切性: {conv.get('appropriateness', '')}")
        lines.append("")
    return "\n".join(lines)


# ---------------------------------------------------------
# 強化版 JSON 抽出（大きめの {} を片っ端から試す）
# ---------------------------------------------------------
def extract_json_obj(text: str):
    """
    モデルの出力から、正しいJSONオブジェクトを復元する。
    - テキスト中のすべての {...} 範囲を列挙
    - 長い順に json.loads を試す
    - 最初に成功したものを返す
    """
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

    # 長い順に試す
    candidates.sort(key=lambda x: x[1] - x[0], reverse=True)

    for start, end in candidates:
        snippet = text[start:end]
        try:
            return json.loads(snippet)
        except Exception:
            continue

    return None


# ---------------------------------------------------------
# o3 数値評価プロンプト（テンプレ埋め方式）
# ---------------------------------------------------------
def build_score_prompt(data: dict) -> str:
    conv = build_conversation_summary(data)
    emo = data.get("emotion_history", [])
    feats = [c.get("audio_features", {}) for c in data.get("conversations", [])]

    return f"""
あなたは「コミュニケーション能力の専門評価者」です。

以下の会話ログ・emotion・音声特徴を分析し、
5項目それぞれのスコア（0〜100）と total_score（0〜100）を決めてください。

⚠ 必ず「JSONだけ」を出力してください。
⚠ 説明文・日本語の文章・コメントは禁止です。
⚠ キー名や構造は一切変更せず、0 の部分だけを書き換えてください。

# 会話ログ
{conv}

# emotion_history
{emo}

# audio_features
{feats}

# JSONテンプレート（この形のまま、数値だけ埋めて返す）
{{
  "scores": {{
    "self_understanding": {{ "score": 0 }},
    "speaking": {{ "score": 0 }},
    "comprehension": {{ "score": 0 }},
    "emotion_control": {{ "score": 0 }},
    "empathy": {{ "score": 0 }}
  }},
  "total_score": 0
}}
"""


# ---------------------------------------------------------
# o3 / o3-mini 呼び出し（数値評価）
# ---------------------------------------------------------
def call_o3(prompt: str, session_name: str) -> dict:
    debug_path = Path("logs") / f"debug_o3_{session_name}.txt"
    debug_path.parent.mkdir(exist_ok=True)

    response = client.responses.create(
        model="o3-mini",  # 安定のため o3-mini 推奨
        input=prompt,
        max_output_tokens=600,
    )

    # 旧SDK仕様を考慮して素直に text を取り出す
    try:
        raw = response.output[0].content[0].text
        # text は TextDelta-ish オブジェクトの場合がある
        raw = getattr(raw, "value", str(raw))
    except Exception:
        raw = getattr(response, "output_text", "")

    with open(debug_path, "w", encoding="utf-8") as f:
        f.write(raw)

    json_obj = extract_json_obj(raw)
    if not json_obj:
        raise ValueError("JSON抽出に失敗（o3-mini）")

    return json_obj


# ---------------------------------------------------------
# o4-mini 講評プロンプト（テンプレ埋め方式）
# ---------------------------------------------------------
def build_feedback_prompt(scores: dict, data: dict) -> str:
    conv = data.get("conversations", [])
    emo = data.get("emotion_history", [])
    feats = [c.get("audio_features", {}) for c in conv]

    return f"""
あなたは「コミュニケーション能力の専門評価者」です。

以下の数値スコアと会話データをもとに、
5項目それぞれについて

- 良い点（good）
- 改善点（improve）

を日本語で簡潔に書いてください。

⚠ 必ず「JSONだけ」を出力してください。
⚠ 説明文・コメントは禁止です。
⚠ キー名や構造は一切変更せず、空文字 "" の部分だけを書き換えてください。

# 数値スコア
{scores}

# 会話ログ
{conv}

# emotion_history
{emo}

# audio_features
{feats}

# JSONテンプレート（この形のまま、文章だけ埋めて返す）
{{
  "feedback": {{
    "self_understanding": {{ "good": "", "improve": "" }},
    "speaking": {{ "good": "", "improve": "" }},
    "comprehension": {{ "good": "", "improve": "" }},
    "emotion_control": {{ "good": "", "improve": "" }},
    "empathy": {{ "good": "", "improve": "" }}
  }}
}}
"""


# ---------------------------------------------------------
# o4-mini 呼び出し（講評）
# ---------------------------------------------------------
def call_o4mini(prompt: str, session_name: str) -> dict:
    debug_path = Path("logs") / f"debug_o4mini_{session_name}.txt"
    debug_path.parent.mkdir(exist_ok=True)

    response = client.responses.create(
        model="o4-mini",
        input=prompt,
        max_output_tokens=800,
    )

    try:
        raw = response.output[0].content[0].text
        raw = getattr(raw, "value", str(raw))
    except Exception:
        raw = getattr(response, "output_text", "")

    with open(debug_path, "w", encoding="utf-8") as f:
        f.write(raw)

    json_obj = extract_json_obj(raw)
    if not json_obj:
        raise ValueError("JSON抽出に失敗（o4-mini）")

    return json_obj


# ---------------------------------------------------------
# 全体処理（数値→講評→統合）
# ---------------------------------------------------------
def evaluate_conversation(json_path: Path):

    json_path = Path(json_path)
    data = load_session(json_path)
    session_name = json_path.stem.replace("session_", "")

    # === 1. 数値評価（o3-mini） ===
    score_prompt = build_score_prompt(data)
    score_json = call_o3(score_prompt, session_name)

    # === 2. 講評生成（o4-mini） ===
    feedback_prompt = build_feedback_prompt(score_json, data)
    feedback_json = call_o4mini(feedback_prompt, session_name)

    # === 3. 統合JSON ===
    final_json = {
        "scores": score_json["scores"],
        "feedback": feedback_json["feedback"],
        "total_score": score_json.get("total_score", 0),
    }

    out_path = Path("logs") / f"result_score_feedback_{session_name}.json"
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(final_json, f, ensure_ascii=False, indent=2)

    print(f"[SAVE] 最終評価JSON → {out_path}")

    return out_path
