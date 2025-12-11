# -*- coding: utf-8 -*-
"""
evaluate_feedback.py（数値 + 講評）

評価内容：
【1】gpt-4o-mini → 5項目スコア（0〜100）
【2】gpt-4o-mini → 各スコアごとの講評コメント（各1文）
【3】Python側で 10段階評価（100点満点を10等分）
【4】total_score は 10段階スコアの合計点（最大50）
【5】全体の総評（overall_comment）も1文で生成
"""

import json
from pathlib import Path
from openai import OpenAI

# ---------------------------------------------------------
# APIキー設定（環境変数推奨）
# ---------------------------------------------------------
client = OpenAI(api_key="")  # ★必ず設定！


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
# AI 評価プロンプト作成（1文コメント強制・具体根拠必須）
# ---------------------------------------------------------
def build_score_prompt(data: dict) -> str:
    conv = build_conversation_summary(data)
    emo = data.get("emotion_history", [])
    feats = [c.get("audio_features", {}) for c in data.get("conversations", [])]

    prompt = f"""
あなたは「コミュニケーション能力を専門的に分析する評価者」です。
テンプレ的・一般的な講評は禁止されています。

【最重要ルール】
・各 comment は必ず1文のみ
・overall_comment も必ず1文のみ
・各コメントは次のいずれかを必ず根拠として含める
  - emotion_history の変化
  - audio_features（声量・抑揚・安定性など）
・抽象表現（例：「良かった」「自然だった」「安定していた」）は禁止
・同じ言い回しを複数項目で使わない

【出力形式（厳守）】
⚠ JSONのみ
⚠ 構造変更禁止

{
  "scores": {
    "self_understanding": { "score": 0, "comment": "" },
    "speaking": { "score": 0, "comment": "" },
    "comprehension": { "score": 0, "comment": "" },
    "emotion_control": { "score": 0, "comment": "" },
    "empathy": { "score": 0, "comment": "" }
  },
  "overall_comment": ""
}

【評価観点】

■ self_understanding  
→ 自分の考えや感情を言語化できていた具体場面を1文で述べる

■ speaking  
→ audio_features を根拠に、話し方の伝わりやすさを1文で述べる

■ comprehension  
→ 相手の発言を踏まえた返答ができていた／できていなかった点を1文で述べる

■ emotion_control  
→ emotion_history の変化が会話に与えた影響を1文で述べる

■ empathy  
→ 相手への配慮が見られた、または不足していた具体例を1文で述べる

【会話ログ】
{conv}

【emotion_history】
{emo}

【audio_features】
{feats}

この情報のみを使って評価してください。
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
# 100点 → 10段階評価変換
# ---------------------------------------------------------
def score_to_10scale(score_100: int) -> int:
    if score_100 <= 10:
        return 1
    elif score_100 <= 20:
        return 2
    elif score_100 <= 30:
        return 3
    elif score_100 <= 40:
        return 4
    elif score_100 <= 50:
        return 5
    elif score_100 <= 60:
        return 6
    elif score_100 <= 70:
        return 7
    elif score_100 <= 80:
        return 8
    elif score_100 <= 90:
        return 9
    else:
        return 10


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

    scores = result["scores"]

    # ★ 10段階評価に変換 & 合計点計算
    total_score = 0
    for v in scores.values():
        original = v["score"]
        converted = score_to_10scale(original)
        v["score"] = converted
        total_score += converted

    # ★ 最終JSON
    final_json = {
        "timestamp": timestamp,
        "scores": scores,
        "total_score": total_score,
        "overall_comment": result["overall_comment"]
    }

    # ★ 保存ファイル名の : → -
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
