/* DB作成 */
CREATE DATABASE msg01test DEFAULT CHARACTER SET utf8;

/* 会員テーブル　*/
CREATE TABLE member(
    id INT AUTO_INCREMENT PRIMARY KEY, 
    name VARCHAR(64), 
    birthday DATE, 
    sex CHAR(1), 
    password CHAR(4), 
    ftime_select INT, 
    ftime_simulation INT
);

/*会員テーブル※当日展示用*/
CREATE TABLE member_MS(
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(64)
);

/* シナリオテーブル */
CREATE TABLE scenario(
    id INT  AUTO_INCREMENT PRIMARY KEY, 
    title VARCHAR(100) NOT NULL,
    description VARCHAR(60), 
    imagelink VARCHAR(300), 
    scene TEXT, 
    start_message TEXT, 
    max_turns INT, 
    character_role  TEXT, 
    reply_style TEXT
);


CREATE TABLE character(
    id INT PRIMARY KEY, --VOICEVOXのSPEAKER_ID
    name VARCHAR(100) --キャラの名前
    info TEXT;　--キャラの設定
);


/* 成績、フィードバックテーブル */
CREATE TABLE feedback(
    member_id INT,
    scenario_id INT,
    finish_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    result_data JSON,
    conversation_log JSON,
    FOREIGN KEY(member_id)
    REFERENCES member(id),
    FOREIGN KEY(scenario_id)
    REFERENCES scenario(id),
    PRIMARY KEY(member_id,scenario_id,finish_date)
);

/* シナリオデータ挿入※内容は仮 */
INSERT INTO scenario(title,description,imagelink,scene,start_message,max_turns,character_role,reply_style) VALUES('シナリオ1','みんなの前で自己紹介をやってみよう！','/images/haru.jpg','新学期、クラスの全員の前で自己紹介をする','それでは自己紹介してください。',1,'クラスの同級生','明るく元気な口調');
INSERT INTO scenario(title,description,imagelink,scene,start_message,max_turns,character_role,reply_style) VALUES('シナリオ2','先生に相談してみよう！','/images/kyo.jpg','放課後、教室で先生に悩み相談をする。','浮かない顔をしていますね。どうしましたか?',3,'担任の先生','優しく落ち着いた口調');
INSERT INTO scenario(title,description,imagelink,scene,start_message,max_turns,character_role,reply_style) VALUES('シナリオ3','友達と放課後の予定を決めてみよう！','/images/natu.jpg','放課後、友達とこの後の予定について話をする。','今日の放課後暇？どっか行こう!',5,'クラスの同級生','明るく元気な口調');
INSERT INTO scenario(title,description,imagelink,scene,start_message,max_turns,character_role,reply_style) VALUES('シナリオ4','部活動の見学に行ってみよう!','/images/room.png','放課後、サッカー部の見学に行く','サッカー部の見学一緒に行こうよ',5,'クラスの同級生','明るく元気な口調');

/*テスト会員データ挿入*/
INSERT INTO member(name,birthday,sex,password,ftime_select,ftime_simulation) VALUES('はるたろう','2008-11-27','M',pass,0,0);