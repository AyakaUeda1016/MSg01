<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>会話ナビ - AIチャットインターフェース</title>
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/simulation.css">
</head>
<body>
    <!-- 背景コンテナ -->
    <div class="background-container">
        <img src="images/room.png" alt="背景" class="background-image">
    </div>

    <!-- メインコンテンツ -->
    <div class="main-content">
        <!-- 左上: ラリー数カウンター -->
        <div class="rally-counter">
            <div class="compass-container">
                <svg class="compass-icon" viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="50" cy="50" r="45" fill="rgba(100, 180, 255, 0.3)" stroke="rgba(100, 180, 255, 0.8)" stroke-width="2"/>
                    <circle cx="50" cy="50" r="35" fill="rgba(100, 180, 255, 0.2)" stroke="rgba(100, 180, 255, 0.6)" stroke-width="1"/>
                    <line x1="50" y1="50" x2="50" y2="15" stroke="rgba(100, 180, 255, 0.9)" stroke-width="3" stroke-linecap="round"/>
                    <circle cx="50" cy="50" r="5" fill="rgba(100, 180, 255, 0.9)"/>
                </svg>
                <div class="rally-numbers">
                    <span class="current-rally" id="currentRally">7</span>
                    <span class="rally-separator">/</span>
                    <span class="max-rally" id="maxRally">10</span>
                </div>
            </div>
        </div>

        <!-- 右上: メニューボタン -->
        <a href="./SimulationServlet"><button class="menu-button" id="menuButton">
            <span class="menu-icon">|||</span>
        </button></a>

        <!-- キャラクター画像 -->
        <div class="character-container">
            <img src="images/kaiwanavi-chara.png" alt="会話ナビキャラクター" class="character-image">
        </div>

        <!-- 右側: 緊張度ポップアップ -->
        <div class="tension-popup" id="tensionPopup">
            <div class="popup-content">
                <p>彼女の逆鱗に触れてしまったようです！<br>頑張って彼女を落ち着かせましょう。</p>
            </div>
        </div>

        <!-- 下部: AIメッセージボックス -->
        <div class="message-box">
            <div class="speaker-name" id="speakerName">あい</div>
            <div class="message-content" id="messageContent">
                「ソシャゲのガチャなんて滅びればいいのよッ！！」
            </div>
        </div>
    </div>

    <script src="js/simulation.js"></script>
</body>
</html>
