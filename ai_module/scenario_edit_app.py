# -*- coding: utf-8 -*-
from flask import Flask, render_template_string, request, redirect
import pymysql

app = Flask(__name__)

# --- DB 接続設定 ---
def get_db():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="",
        db="msg01test",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

# ===================================================================
#  シナリオ一覧
# ===================================================================
@app.route("/scenario")
def scenario_list():
    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("SELECT id, title FROM scenario ORDER BY id")
        rows = cur.fetchall()

    html = """
    <h2>シナリオ一覧</h2>
    <ul>
    {% for row in rows %}
      <li><a href="/scenario/edit/{{ row.id }}">{{ row.id }}: {{ row.title }}</a></li>
    {% endfor %}
    </ul>
    """
    return render_template_string(html, rows=rows)


# ===================================================================
#  シナリオ編集（比較 → 確認 → 更新）
# ===================================================================
@app.route("/scenario/edit/<int:scenario_id>", methods=["GET", "POST"])
def scenario_edit(scenario_id):

    conn = get_db()

    # -----------------------------
    # (2) POST: 比較画面 → 更新確認
    # -----------------------------
    if request.method == "POST":
        new_character_role = request.form["character_role"]
        new_reply_style = request.form["reply_style"]

        # DBの現在値を取得して比較表示
        with conn.cursor() as cur:
            cur.execute("SELECT * FROM scenario WHERE id=%s", (scenario_id,))
            old = cur.fetchone()

        # 比較表示テンプレ
        html = """
        <h2>変更内容の確認（ID {{ old.id }}）</h2>

        <h3>character_role</h3>
        <b>【変更前】</b><pre>{{ old.character_role }}</pre>
        <b>【変更後】</b><pre>{{ new_character_role }}</pre>

        <h3>reply_style</h3>
        <b>【変更前】</b><pre>{{ old.reply_style }}</pre>
        <b>【変更後】</b><pre>{{ new_reply_style }}</pre>

        <form method="POST" action="/scenario/update/{{ old.id }}">
            <input type="hidden" name="character_role" value="{{ new_character_role }}">
            <input type="hidden" name="reply_style" value="{{ new_reply_style }}">
            <button type="submit" style="margin-top:20px;">この内容で更新する</button>
        </form>

        <p><a href="/scenario/edit/{{ old.id }}">戻る</a></p>
        """
        return render_template_string(
            html,
            old=old,
            new_character_role=new_character_role,
            new_reply_style=new_reply_style,
        )

    # -----------------------------
    # (1) GET: 編集フォーム表示
    # -----------------------------
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM scenario WHERE id=%s", (scenario_id,))
        sc = cur.fetchone()

    html = """
    <h2>シナリオ編集（ID {{ sc.id }}）</h2>

    <form method="POST">
        <h3>キャラクター設定（character_role）</h3>
        <textarea name="character_role" rows="8" cols="80">{{ sc.character_role }}</textarea>

        <h3>口調設定（reply_style）</h3>
        <textarea name="reply_style" rows="12" cols="80">{{ sc.reply_style }}</textarea>

        <br><br>
        <button type="submit">変更を比較する</button>
    </form>

    <p><a href="/scenario">一覧に戻る</a></p>
    """
    return render_template_string(html, sc=sc)


# ===================================================================
#  (3) 更新を確定して DB に反映
# ===================================================================
@app.route("/scenario/update/<int:scenario_id>", methods=["POST"])
def scenario_update(scenario_id):

    new_character_role = request.form["character_role"]
    new_reply_style = request.form["reply_style"]

    conn = get_db()
    with conn.cursor() as cur:
        cur.execute("""
            UPDATE scenario
            SET character_role=%s, reply_style=%s
            WHERE id=%s
        """, (new_character_role, new_reply_style, scenario_id))
    conn.commit()

    return redirect("/scenario")


if __name__ == "__main__":
    app.run(port=5050, debug=True)


#py scenario_edit_app.pyで起動
#http://localhost:5050/scenario これをブラウザで起動する