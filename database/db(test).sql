/* DB作成 */
CREATE DATABASE msg01test DEFAULT CHARACTER SET utf8;

/* 会員テーブル　*/
CREATE TABLE member(
    id INT AUTO_INCREMENT PRIMARY KEY, --ユーザーID
    name VARCHAR(64), --名前
    birthday DATE, --誕生日
    sex CHAR(1), --性別
    password CHAR(4), --パスワード
    ftime_select INT, --初めてシナリオ選択画面に行ったか
    ftime_simulation INT --初めてシミュレーション画面に行ったか
);

/* シナリオテーブル */
CREATE TABLE scenario(
    id INT  AUTO_INCREMENT PRIMARY KEY, --シナリオのID
    title VARCHAR(100) NOT NULL, --シナリオのタイトル
    description VARCHAR(60), --シナリオの説明文(secnario.js用)
    imagelink VARCHAR(300), --シナリオのイメージ画像
    /*以下会話用AIに入れる項目*/
    scene TEXT, --会話を行うシチュエーションの設定
    start_message TEXT, --AIが話す最初の言葉
    max_turns INT, --最大ターン数
    character_role  TEXT, --AIの人物像の設定
    reply_style TEXT, --AIの話し方の設定
);

/*AI用のシナリオ内容*/
/**CREATE TABLE ai_scenario(
    scenarrio_id INT
    scene VARCHAR(60),
    start_message VARCHAR(60),
    max_turns INT,
    character_role  VARCHAR(60),
    reply_style VARCHAR(60),
    FOREIGN KEY(scenario_id)
    REFERENCES scenario(id),
    PRIMARY KEY(scenario_id)
)**/


/* 成績、フィードバックテーブル */
CREATE TABLE feedback(
    member_id INT, --会員ID
    scenario_id INT, --シナリオのID
    finish_date DATETIME DEFAULT CURRENT_TIMESTAMP, --終了日※INSERTしたら勝手に入るようにしてます
    result_data JSON, --結果データ(チャート用のスコア、フィードバック文)
    conversation_log JSON, --会話ログ
    FOREIGN KEY(member_id)
    REFERENCES member(id),
    FOREIGN KEY(scenario_id)
    REFERENCES scenario(id),
    PRIMARY KEY(member_id,scenario_id,finish_date)
);

/* シナリオデータ挿入※内容は仮 */
INSERT INTO scenario(title,description,imagelink,scene,start_message,max_turns,character_role,reply_style) VALUES('シナリオ1','みんなの前で自己紹介をやってみよう！','images/haru.jpg','新学期、クラスの全員の前で自己紹介をする','それでは自己紹介してください。',1,'クラスの同級生','明るく元気な口調');
INSERT INTO scenario(title,description,imagelink,scene,start_message,max_turns,character_role,reply_style) VALUES('シナリオ2','先生に相談してみよう！','images/kyo.jpg','放課後、教室で先生に悩み相談をする。','浮かない顔をしていますね。どうしましたか?',3,'担任の先生','優しく落ち着いた口調');
INSERT INTO scenario(title,description,imagelink,scene,start_message,max_turns,character_role,reply_style) VALUES('シナリオ3','友達と放課後の予定を決めてみよう！','images/natu.jpg','放課後、友達とこの後の予定について話をする。','今日の放課後暇？どっか行こう!',5,'クラスの同級生','明るく元気な口調');
