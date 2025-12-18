# -*- coding: utf-8 -*-
from flask import Flask, render_template_string, request, redirect
import pymysql

app = Flask(__name__)

# ==================================================
# DB 接続
# ==================================================
def get_db():
    return pymysql.connect(
        host="localhost",
        user="root",
        password="",
        db="msg01test",
        charset="utf8mb4",
        cursorclass=pymysql.cursors.DictCursor
    )

# ==================================================
# シナリオ一覧
# ==================================================
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
      <li><a href="/scenario/edit/{{ row.id }}">{{ row.id }} : {{ row.title }}</a></li>
    {% endfor %}
    </ul>
    """
    return render_template_string(html, rows=rows)

# ==================================================
# シナリオ編集（GET:編集 / POST:比較）
# ==================================================
@app.route("/scenario/edit/<int:scenario_id>", methods=["GET", "POST"])
def scenario_edit(scenario_id):

    conn = get_db()

    # ----------------------------------------------
    # POST：変更内容の比較
    # ----------------------------------------------
    if request.method == "POST":

        fields = [
            "title",
            "description",
            "imagelink",
            "scene",
            "start_message",
            "finish_message_on_clear",
            "finish_message_on_fail",
            "max_turns",
            "character_role",
            "reply_style",
            "character_id",
            "clear_keywords"
        ]

        new_data = {f: request.form.get(f) for f in fields}

        with conn.cursor() as cur:
            cur.execute("SELECT * FROM scenario WHERE id=%s", (scenario_id,))
            old = cur.fetchone()

        html = """
        <h2>変更内容の確認（ID {{ old.id }}）</h2>

        {% for f in fields %}
          <h3>{{ f }}</h3>
          <b>【変更前】</b>
          <pre>{{ old[f] }}</pre>
          <b>【変更後】</b>
          <pre>{{ new_data[f] }}</pre>
        {% endfor %}

        <form method="POST" action="/scenario/update/{{ old.id }}">
          {% for f in fields %}
            <input type="hidden" name="{{ f }}" value="{{ new_data[f] }}">
          {% endfor %}
          <button type="submit">この内容で更新する</button>
        </form>

        <p><a href="/scenario/edit/{{ old.id }}">戻る</a></p>
        """

        return render_template_string(
            html,
            old=old,
            new_data=new_data,
            fields=fields
        )

    # ----------------------------------------------
    # GET：編集フォーム表示
    # ----------------------------------------------
    with conn.cursor() as cur:
        cur.execute("SELECT * FROM scenario WHERE id=%s", (scenario_id,))
        sc = cur.fetchone()

    html = """
    <h2>シナリオ編集（ID {{ sc.id }}）</h2>

    <form method="POST">

      <h3>基本情報</h3>
      <p>title<br>
      <input type="text" name="title" size="80" value="{{ sc.title }}"></p>

      <p>description<br>
      <input type="text" name="description" size="80" value="{{ sc.description }}"></p>

      <p>imagelink<br>
      <input type="text" name="imagelink" size="80" value="{{ sc.imagelink }}"></p>

      <h3>シナリオ本文</h3>
      <p>scene<br>
      <textarea name="scene" rows="5" cols="80">{{ sc.scene }}</textarea></p>

      <p>start_message<br>
      <textarea name="start_message" rows="3" cols="80">{{ sc.start_message }}</textarea></p>

      <p>finish_message_on_clear<br>
      <textarea name="finish_message_on_clear" rows="3" cols="80">{{ sc.finish_message_on_clear }}</textarea></p>

      <p>finish_message_on_fail<br>
      <textarea name="finish_message_on_fail" rows="3" cols="80">{{ sc.finish_message_on_fail }}</textarea></p>

      <h3>会話設定</h3>
      <p>max_turns<br>
      <input type="number" name="max_turns" value="{{ sc.max_turns }}"></p>

      <p>character_role<br>
      <textarea name="character_role" rows="6" cols="80">{{ sc.character_role }}</textarea></p>

      <p>reply_style<br>
      <textarea name="reply_style" rows="6" cols="80">{{ sc.reply_style }}</textarea></p>

      <p>character_id<br>
      <input type="number" name="character_id" value="{{ sc.character_id }}"></p>

      <p>clear_keywords（クリア判定キーワード）<br>
      <textarea name="clear_keywords" rows="4" cols="80">{{ sc.clear_keywords }}</textarea></p>

      <br>
      <button type="submit">変更を比較する</button>
    </form>

    <p><a href="/scenario">一覧に戻る</a></p>
    """

    return render_template_string(html, sc=sc)

# ==================================================
# 更新確定
# ==================================================
@app.route("/scenario/update/<int:scenario_id>", methods=["POST"])
def scenario_update(scenario_id):

    fields = [
        "title",
        "description",
        "imagelink",
        "scene",
        "start_message",
        "finish_message_on_clear",
        "finish_message_on_fail",
        "max_turns",
        "character_role",
        "reply_style",
        "character_id",
        "clear_keywords"
    ]

    values = [request.form.get(f) for f in fields]

    sql = """
    UPDATE scenario SET
      title=%s,
      description=%s,
      imagelink=%s,
      scene=%s,
      start_message=%s,
      finish_message_on_clear=%s,
      finish_message_on_fail=%s,
      max_turns=%s,
      character_role=%s,
      reply_style=%s,
      character_id=%s,
      clear_keywords=%s
    WHERE id=%s
    """

    conn = get_db()
    with conn.cursor() as cur:
        cur.execute(sql, values + [scenario_id])
    conn.commit()

    return redirect("/scenario")

# ==================================================
# 起動
# ==================================================
if __name__ == "__main__":
    app.run(port=5050, debug=True)

# 起動:
# py scenario_edit_app.py
# http://localhost:5050/scenario
