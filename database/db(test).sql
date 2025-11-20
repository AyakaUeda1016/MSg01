/* DB作成 */
CREATE DATABASE msg01test DEFAULT CHARACTER SET utf8;

/* 会員テーブル　*/
CREATE TABLE member(
    id INT AUTO_INCREMENT PRIMARY KEY,
    /*login_id CHAR(4), */
    name VARCHAR(64),
    birthday DATE,
    sex CHAR(1),
    password CHAR(4),
    ftime_select INT,
    ftime_simulation INT
);

/* シナリオテーブル */
CREATE TABLE scenario(
    ID INT  AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(30),
    explain VARCHAR(60),
    imagelink VARCHAR(60),
    scene VARCHAR(60),
    scenario_message VARCHAR(60),
    max_turns INT
);

/* 成績、フィードバックテーブル */
CREATE TABLE feedback(
    member_id INT,
    scenario_id INT,
    finish_date DATE,
    result_data JSON,
    conversation_log JSON,
    FOREIGN KEY(member_id)
    REFERENCES member(id),
    FOREIGN KEY(scenario_id)
    REFERENCES scenario(id),
    PRIMARY KEY(member_id,scenario_id,finish_date)
);

/* シナリオデータ挿入※内容は仮 */
INSERT INTO scenario(title,explain,imagelink,scene,scenario_message,max_turns) VALUES('シナリオ1','みんなの前で自己紹介をやってみよう！','images/haru.jpg','新学期、クラスの全員の前で自己紹介をする','それでは自己紹介してください。',1);
INSERT INTO scenario(title,explain,imagelink,scene,scenario_message,max_turns) VALUES('シナリオ2','先生に相談してみよう！','images/kyo.jpg','放課後、教室で先生に悩み相談をする。','浮かない顔をしていますね。どうしましたか?',3);
INSERT INTO scenario(title,explain,imagelink,scene,scenario_message,max_turns) VALUES('シナリオ3','友達と放課後の予定を決めてみよう！','images/natu.jpg','放課後、友達とこの後の予定について話をする。','今日の放課後暇？どっか行こう!',5);
