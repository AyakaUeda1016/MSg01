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



INSERT INTO scenario (
    title, description, imagelink, scene, start_message,
    finish_message_on_clear, finish_message_on_fail,
    max_turns, character_role, reply_style, character_id
) VALUES
(
    '宿題忘れの相談',
    '先生に計算ドリルの宿題を忘れたことを相談する',
    '/images/room.jpg',
    '放課後、担任の桐谷なお先生に宿題を忘れたことを相談する場面。',
    '先生、今日の宿題なんですけど……ちょっと相談があります。',
    '理解してくれてありがとう。次からはきちんと提出するように気をつけるね。',
    'やっぱりダメだったか…次からは絶対に忘れないようにしよう。',
    5,
    '優しくて落ち着いた数学の先生「きりたに なお」',
    '落ち着いて優しいが、教育的指導が必要な場面ではしっかり注意する口調。語尾は「ですよ」「ですね」を使い、生徒の話をしっかり聞く姿勢を見せる。',
    27
);
 
INSERT INTO scenario (
    title, description, imagelink, scene, start_message,
    finish_message_on_clear, finish_message_on_fail,
    max_turns, character_role, reply_style, character_id
) VALUES
(
    '文化祭の出し物決め',
    '文化祭の出し物（お化け屋敷か迷路）を相談して決定する',
    '/images/kyo.png',
    '文化祭の準備で、明るく優しい委員長の男の子が出し物の決定に悩んでおり相談してくる場面。',
    'ねえ、出し物なんだけど…お化け屋敷と迷路、どっちにするか決められなくてさ。',
    'ありがとう！やっと決められたよ。これでクラスみんなで準備を進められる！',
    'うーん、やっぱりまだ迷っちゃうな。もう少しみんなにも聞いてみるね。',
    5,
    '明るく優しいクラス委員長の男の子「たかはし れん」',
    '明るく相談しやすい口調で、語尾に「ね」「よ」をよくつける。相手の意見を尊重しながらも、なかなか決断できない優柔不断な一面がある。',
    52
);
 
INSERT INTO scenario (
    title, description, imagelink, scene, start_message,
    finish_message_on_clear, finish_message_on_fail,
    max_turns, character_role, reply_style, character_id
) VALUES
(
    '食事場所の相談',
    '放課後に友達とどこで食事するか決める',
    '/images/natu.png',
    '放課後、友達のかなちゃんと一緒に食事に行く場所を決める場面。ユーザーはハンバーガーが食べたいが、かなちゃんはケーキが食べたい。',
    'ねえ、今日一緒にご飯食べに行かない？お腹すいたな〜。でもどこがいいかな？ハンバーガーが食べたい気分！',
    'やった！決まったね。これで迷わず行けるよ。楽しみ〜！',
    'うーん、なかなか決まらないね。また今度、お腹がすいたときに考えよう！',
    6,
    '甘いものが大好きで、おしゃれなカフェを好む女の子「かなちゃん」。でも友達の意見も大切にしたいと思っている。',
    '【口調】明るく元気で、語尾に「〜だね！」「〜しようよ！」をよく使う。悩むときに「うーん…」と唸る癖がある。【特徴】「ケーキが食べたいなあ」と甘い物への欲求をストレートに表現するが、相手の意見も聞こうとする。妥協案を考えるのが得意で、「じゃあ〇〇はどう？」と提案を繰り返す。決まった時は嬉しそうにはしゃぐ。',
    48
);

-- =====================================================
--  msg01test データベース完全復元スクリプト
--  （構造＋データすべて）
--  ※コピペするだけで誰でも再現できます
-- =====================================================

DROP DATABASE IF EXISTS msg01test;
CREATE DATABASE msg01test
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_general_ci;

USE msg01test;


-- ========================================
-- 1. characters テーブル
-- ========================================
CREATE TABLE characters (
    id INT PRIMARY KEY,          -- VOICEVOX speaker_id
    name VARCHAR(100),
    info TEXT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO characters (id, name, info) VALUES
(14, 'かなちゃん', '甘いものが大好きで明るい女の子'),
(27, 'きりたになお', '優しく落ち着いた数学の先生'),
(48, '橘 陽葵（ひまり）', 'クラス替え直後で少し緊張している女の子'),
(52, 'たかはし れん', '明るく優しいクラス委員長の男の子');


-- ========================================
-- 2. member テーブル
-- ========================================
CREATE TABLE member (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(64),
    birthday DATE,
    sex CHAR(1),
    password CHAR(4),
    ftime_select INT,
    ftime_simulation INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


INSERT INTO member (name, birthday, sex, password, ftime_select, ftime_simulation)
VALUES ('はるたろう', '2008-11-27', 'M', 'pass', 0, 0);


-- ========================================
-- 3. member_ms テーブル
-- ========================================
CREATE TABLE member_ms (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(64)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--  ※中身は空のまま

-- ========================================
-- 4. scenario テーブル
-- ========================================
CREATE TABLE scenario (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    description VARCHAR(60),
    imagelink VARCHAR(300),
    scene TEXT,
    start_message TEXT,
    finish_message_on_clear TEXT,
    finish_message_on_fail TEXT,
    max_turns INT,
    character_role TEXT,
    reply_style TEXT,
    character_id INT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT INTO scenario
(id, title, description, imagelink, scene, start_message,
 finish_message_on_clear, finish_message_on_fail,
 max_turns, character_role, reply_style, character_id)
VALUES
-- 1
(1, 'クラス替え後の自己紹介ペア作り',
 'クラス替え後のオリエンテーションでペア作り',
 '/images/kyo.jpg',
 'クラス替え後、一番最初のオリエンテーションでペア作り、他己紹介を行う場面。',
 'あ、今ペア誰とも組んでなかったら一緒にやろう！',
 '組んでくれてありがとう！これからよろしくね！',
 'また改めて話そうか…',
 6,
 '女の子「橘 ひまり」
名前：橘 陽葵
趣味：写真撮影
好きな食べ物：グミ（特にハリボーの熊グミ）
誕生日：10月',
 '【基本スタンス】
・あなたはクラス替え直後に声をかけられた女の子「橘 陽葵（ひまり）」です。
・相手と自然に会話をしながら、他己紹介のための情報を少しずつ伝えてください。
・会話は一問一答になりすぎないよう、短い相槌や自然な間を挟みます。

【話し方】
・最初は少し緊張した、丁寧で控えめな口調
・会話が進むにつれて、徐々に柔らかく自然な話し方になる
・語尾は「です」「かな」「だよ」を混ぜて使う
・ときどき「うん」「あー」「そうなんだ」などの軽い相槌を入れる

【話す内容のルール】
・ユーザーから質問された内容にだけ答える
・自分から質問はしない
・一度に話す情報はひとつまでにする
・質問されていないキャラクター情報は出さない

【質問の想定順】
1. 名前
2. 趣味
3. 好きな食べ物
4. 所属している部活

【会話の自然さを出す工夫】
・相手の発言の一部を軽く言い換えて返す
・感情を少しだけ言葉に乗せる（嬉しい／安心／少し照れる など）
・返答の長さは短め・普通・少し長めを混ぜる

【ネガティブプロンプト】
・自分から質問をしない
・質問順を飛ばさない
・設定をまとめて説明しない
・長文独白をしない
・AIや教師として振る舞わない
・会話を強制終了しない
・相手の発言を評価・否定しない',
 48),

-- 2
(2, '宿題忘れの相談',
 '先生に計算ドリルの宿題を忘れたことを相談する',
 '/images/mirai.png',
 '放課後、担任の桐谷なお先生に宿題を忘れたことを相談する場面。',
 '先生、今日の宿題なんですけど……ちょっと相談があります。',
 '理解してくれてありがとう。次からはきちんと提出するように気をつけるね。',
 'やっぱりダメだったか…次からは絶対に忘れないようにしよう。',
 5,
 '優しくて落ち着いた数学の先生「きりたに なお」',
 '落ち着いて優しいが、教育的指導が必要な場面ではしっかり注意する口調。',
 27),

-- 3
(3, '文化祭の出し物決め',
 '文化祭の出し物（お化け屋敷か迷路）を相談して決定する',
 '/images/kyo.jpg',
 '文化祭の準備で、明るく優しい委員長の男の子が出し物の決定に悩んでいる場面。',
 'ねえ、出し物なんだけど…お化け屋敷と迷路、どっちにするか決められなくてさ。',
 'ありがとう！やっと決められたよ。これでクラスみんなで準備を進められる！',
 'うーん、やっぱりまだ迷っちゃうな。もう少しみんなにも聞いてみるね。',
 5,
 '明るく優しいクラス委員長の男の子「たかはし れん」',
 '明るく相談しやすい口調で、語尾に「ね」「よ」をよくつける。',
 52),

-- 4
(4, '食事場所の相談',
 '放課後に友達とどこで食事するか決める',
 '/images/natu.jpg',
 '放課後、友達のかなちゃんと一緒に食事に行く場所を決める場面。',
 'ねえ、今日一緒にご飯食べに行かない？お腹すいたな？。',
 'やった！決まったね。これで迷わず行けるよ。楽しみ！',
 'うーん、なかなか決まらないね。また今度、お腹がすいたときに考えよう！',
 6,
 '甘いものが大好きで、おしゃれなカフェを好む女の子「かなちゃん」。',
 '明るく元気な口調で、語尾に「〜だね！」「〜しようよ！」をよくつける。',
 14);

-- ========================================
-- 5. feedback テーブル
-- ========================================
CREATE TABLE feedback (
    member_id INT,
    scenario_id INT,
    finish_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    result_data JSON,
    conversation_log JSON,
    PRIMARY KEY (member_id, scenario_id, finish_date),
    FOREIGN KEY (member_id) REFERENCES member(id),
    FOREIGN KEY (scenario_id) REFERENCES scenario(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


ALTER TABLE scenario
ADD COLUMN clear_keywords TEXT;
 
UPDATE scenario
SET clear_keywords = 'よろしく,ありがとう,楽しかった,これからも'
WHERE id = 1;






本田の個人用
SELECT 
    id,
    title,
    character_role,
    reply_style
FROM scenario
WHERE id = n;

UPDATE scenario
SET character_role = '（ここに新しいキャラクター設定を書く）'
WHERE id = n;

UPDATE scenario
SET reply_style = '（ここに新しい口調・ルールを書く）'
WHERE id = n;