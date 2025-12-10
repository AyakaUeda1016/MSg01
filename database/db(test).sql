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
    name VARCHAR(6)
);

/* シナリオテーブル */
CREATE TABLE scenario(
    id INT  AUTO_INCREMENT PRIMARY KEY, 
    title VARCHAR(100) NOT NULL,
    description VARCHAR(60), 
    imagelink VARCHAR(300), 
    scene TEXT, 
    start_message TEXT, 
    finish_message_on_clear TEXT,
    finish_message_on_fail TEXT,
    max_turns INT, 
    character_role  TEXT, 
    reply_style TEXT,
    character_id INT,
    FOREIGN KEY(character_id)
    REFERENCES character(id)
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
INSERT INTO scenario (
    title, description, imagelink, scene, start_message,
    finish_message_on_clear, finish_message_on_fail,
    max_turns, character_role, reply_style, character_id
) VALUES
(
    '放課後の帰り道',
    '先輩と一緒に帰る会話シナリオ',
    '/images/haru.jpg',
    '部活終わりの夕暮れ、先輩と歩いて帰る場面。',
    '今日の練習どうだった？',
    '今日はよく頑張ったね。また一緒に帰ろう。',
    '今日はうまくいかなかったね。でもまた明日頑張ろう。',
    8,
    '優しい先輩として振る舞う',
    '柔らかく穏やかな口調で話す',
    14
);

/*テスト会員データ挿入*/
INSERT INTO member(name,birthday,sex,password,ftime_select,ftime_simulation) VALUES('はるたろう','2008-11-27','M',pass,0,0);

/*使用キャラデータ挿入*/
INSERT INTO character(id,name,info) VALUES(14,'たちばなひまり','キャラの特徴を入れる');
INSERT INTO character(id,name,info) VALUES(52,'たかはしれん','キャラの特徴を入れる');
INSERT INTO character(id,name,info) VALUES(27,'きりたになお','キャラの特徴を入れる');
INSERT INTO character(id,name,info) VALUES(48,'かなちゃん','キャラの特徴を入れる');
