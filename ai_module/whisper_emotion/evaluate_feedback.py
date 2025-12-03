# -*- coding: utf-8 -*-
"""
evaluate_feedback.py（数値 + 講評 / Chat Completions 版・総評文章版）

評価内容：
【1】gpt-4o-mini → 数値スコア（5項目）
【2】gpt-4o-mini → 講評（good/improve + overall_summary）
【3】total_score は「総評（overall_summary）」の文章を入れる

"""

import json
from pathlib import Path
from openai import OpenAI

# ---------------------------------------------------------
# ★ 必ずあなたの API キーを入れる
# ---------------------------------------------------------
client = OpenAI(api_key="")  # ← ★忘れず差し替え！


# ---------------------------------------------------------
# JSON読み込み
# ---------------------------------------------------------
def load_session(json_path: Path) -> dict:
    print(f"[DEBUG] JSON読み込み: {json_path}")
    with open(json_path, "r", encoding="utf-8") as f:
        return json.load(f)


# ---------------------------------------------------------
# 会話要約
# ---------------------------------------------------------
def build_conversation_summary(data: dict) -> str:
    print("[DEBUG] 会話サマリー生成開始")
    lines = []
    for i, conv in enumerate(data.get("conversations", []), start=1):
        lines.append(f"[ターン {i}]")
        lines.append(f"ユーザー: {conv.get('transcript', '')}")
        lines.append(f"AI: {conv.get('reply', '')}")
        lines.append(f"適切性: {conv.get('appropriateness', '')}")
        lines.append("")
    summary = "\n".join(lines)
    print("[DEBUG] 会話サマリー生成完了")
    return summary


# ---------------------------------------------------------
# JSON抽出（強化版）
# ---------------------------------------------------------
def extract_json_obj(text: str):
    print("[DEBUG] JSON抽出開始")
    if not text:
        print("[DEBUG] text が空なので抽出できません")
        return None

    print("[DEBUG] 生テキスト冒頭:", text[:200].replace("\n", "\\n"))

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

    print(f"[DEBUG] JSON候補数: {len(candidates)}")

    candidates.sort(key=lambda x: x[1] - x[0], reverse=True)

    for idx, (start, end) in enumerate(candidates[:20]):
        snippet = text[start:end]
        head = snippet[:80].replace("\n", " ")
        print(f"[DEBUG] 候補 {idx} の冒頭: {head} ...")
        try:
            obj = json.loads(snippet)
            print(f"[DEBUG] 候補 {idx} で JSON パース成功")
            return obj
        except Exception as e:
            print(f"[DEBUG] 候補 {idx} で JSON パース失敗: {e}")
            continue

    print("[DEBUG] JSON抽出失敗")
    return None


# ---------------------------------------------------------
# スコア用プロンプト
# ---------------------------------------------------------
def build_score_prompt(data: dict) -> str:
    print("[DEBUG] スコアプロンプト作成開始")
    conv = build_conversation_summary(data)
    emo = data.get("emotion_history", [])
    feats = [c.get("audio_features", {}) for c in data.get("conversations", [])]

    prompt = f"""
あなたは「コミュニケーション能力の専門評価者」です。

以下の会話ログ・emotion・音声特徴を分析し、
5項目それぞれのスコア（0〜100）を決めてください。

⚠ 必ず「JSONだけ」を返す
⚠ 説明文は禁止
⚠ JSONテンプレートの形を絶対に変えない

# JSONテンプレート
{{
  "scores": {{
    "self_understanding": {{ "score": 0 }},
    "speaking": {{ "score": 0 }},
    "comprehension": {{ "score": 0 }},
    "emotion_control": {{ "score": 0 }},
    "empathy": {{ "score": 0 }}
  }}
}}

# 会話ログ
{conv}

# emotion_history
{emo}

# audio_features
{feats}
"""
    print("[DEBUG] スコアプロンプト作成完了")
    return prompt


# ---------------------------------------------------------
# フィードバック用プロンプト（総評つき）
# ---------------------------------------------------------
def build_feedback_prompt(scores: dict, data: dict) -> str:
    print("[DEBUG] フィードバックプロンプト作成開始")
    conv = data.get("conversations", [])
    emo = data.get("emotion_history", [])
    feats = [c.get("audio_features", {}) for c in conv]

    prompt = f"""
あなたは「コミュニケーション能力の専門評価者」です。

以下のスコアと会話データをもとに、
5項目それぞれについて good/improve を書き、
最後に overall_summary に総評の文章（1〜3文）を書きなさい。

⚠ 絶対に JSON の形だけを返す
⚠ 説明文禁止
⚠ "" の部分だけ埋める

# JSONテンプレート
{{
  "feedback": {{
    "self_understanding": {{ "good": "", "improve": "" }},
    "speaking": {{ "good": "", "improve": "" }},
    "comprehension": {{ "good": "", "improve": "" }},
    "emotion_control": {{ "good": "", "improve": "" }},
    "empathy": {{ "good": "", "improve": "" }},
    "overall_summary": ""
  }}
}}

# スコア
{scores}

# 会話ログ
{conv}

# emotion_history
{emo}

# audio_features
{feats}
"""
    print("[DEBUG] フィードバックプロンプト作成完了")
    return prompt


# ---------------------------------------------------------
# Chat Completions 共通呼び出し
# ---------------------------------------------------------
def call_chat_model(prompt: str, session_name: str, phase: str, max_tokens: int = 800) -> str:
    print(f"[DEBUG] {phase} ChatCompletions 呼び出し開始")

    debug_text_path = Path("logs") / f"debug_{phase}_{session_name}.txt"
    debug_text_path.parent.mkdir(exist_ok=True)

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {"role": "system", "content": "必ず JSON だけ返してください。"},
            {"role": "user", "content": prompt},
        ],
        max_tokens=max_tokens,
        temperature=0.0,
    )

    text = resp.choices[0].message.content or ""

    with open(debug_text_path, "w", encoding="utf-8") as f:
        f.write(text)

    print(f"[DEBUG] {phase} 生テキスト冒頭:", text[:200].replace("\n", "\\n"))
    return text


# ---------------------------------------------------------
# o3 相当（数値評価）
# ---------------------------------------------------------
def call_o3_like(prompt: str, session_name: str) -> dict:
    raw = call_chat_model(prompt, session_name, phase="o3_like")
    json_obj = extract_json_obj(raw)
    if not json_obj:
        raise ValueError("JSON抽出に失敗（o3_like）")
    return json_obj


# ---------------------------------------------------------
# o4 相当（講評 + 総評）
# ---------------------------------------------------------
def call_o4_like(prompt: str, session_name: str) -> dict:
    raw = call_chat_model(prompt, session_name, phase="o4_like")
    json_obj = extract_json_obj(raw)
    if not json_obj:
        raise ValueError("JSON抽出に失敗（o4_like）")
    return json_obj


# ---------------------------------------------------------
# 全体処理（数値 → 講評 → 総評 → 保存）
# ---------------------------------------------------------
def evaluate_conversation(json_path: Path):
    print("===== evaluate_conversation() 開始 =====")

    json_path = Path(json_path)
    data = load_session(json_path)

    # ★ session_full.json ではなく、保存名は日付で作成
    from datetime import datetime
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    session_name = f"{timestamp}"
    print(f"[DEBUG] session_name = {session_name}")

    # === 1. スコア ===
    print("[STEP 1] スコア用プロンプト生成")
    score_prompt = build_score_prompt(data)

    print("[STEP 2] ChatCompletions（スコア）呼び出し")
    score_json = call_o3_like(score_prompt, session_name)
    print("[DEBUG] scores JSON:", score_json)

    # === 2. 講評 ===
    print("[STEP 3] フィードバック用プロンプト生成")
    feedback_prompt = build_feedback_prompt(score_json, data)

    print("[STEP 4] ChatCompletions（フィードバック）呼び出し")
    feedback_json = call_o4_like(feedback_prompt, session_name)
    print("[DEBUG] feedback JSON:", feedback_json)

    # === 3. 統合 ===
    print("[STEP 5] 統合JSON生成")
    overall_summary = feedback_json.get("feedback", {}).get("overall_summary", "")

    final_json = {
        "scores": score_json.get("scores", {}),
        "feedback": feedback_json.get("feedback", {}),
        "total_score": overall_summary,    # 総評文章
    }

    # ★★★ 日付ごとに別名で保存 ★★★
    out_path = Path("logs") / f"result_score_feedback_{timestamp}.json"

    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(final_json, f, ensure_ascii=False, indent=2)

    print(f"[SAVE] 最終評価JSON → {out_path}")
    print("===== evaluate_conversation() 終了 =====")

    return out_path



# ---------------------------------------------------------
# テスト用（直接実行）
# ---------------------------------------------------------
if __name__ == "__main__":
    test_file = Path("C:/Users/81909/Desktop/RP_voice_ai/logs/session_full.json")
    evaluate_conversation(test_file)
