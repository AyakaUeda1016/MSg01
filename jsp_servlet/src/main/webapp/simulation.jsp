<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>会話ナビ - AIチャットインターフェース</title>

    <!-- フォント -->
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">

    <!-- CSS -->
    <link rel="stylesheet" href="css/simulation.css">
</head>
<body>

    <!-- 背景 -->
    <div class="background-container">
        <img src="images/room.png" alt="背景" class="background-image">
    </div>

    <div class="main-content">

        <!-- 🧭 ラリーカウンター -->
        <div class="rally-counter">
            <div class="compass-container">
                <div class="compass-icon"></div>

                <div class="rally-numbers">
                    <span id="turn">0</span>
                    <span class="rally-separator">　</span>
                    <span id="max_turns"></span>
                </div>
            </div>
        </div>

        <!-- メニューボタン（触ってません） -->
        <a href="${pageContext.request.contextPath}/simulation">
            <button id="menuButton" class="menu-button">
                <span class="menu-icon">|||</span>
            </button>
        </a>

        <!-- 次へ（触ってません） -->
        <a href="result.jsp" class="next-link">次へ</a>

        <!-- キャラクター画像 --(触ってません)-->
        <div class="character-container">
            <img src="images/kaiwanavi-chara.png" alt="AIキャラ" class="character-image">
        </div>

        <!-- 🟦 ユーザー発話（transcript） -->
        <div class="user-message-box" id="userMessageBox">
            <div class="user-name">あなた</div>
            <div class="user-content" id="transcript">...</div>
        </div>

        <!-- 🟩 AI 応答（reply） -->
        <div class="message-box">
            <div class="speaker-name" id="speakerName">AI</div>
            <div class="message-content" id="reply">
                会話を開始してください...
            </div>
        </div>

        <!-- 🎙 録音ボタン -->
        <div class="recording-controls">
            <button class="record-btn start" onclick="chatInterface.startRecording()">🎙️ 録音開始</button>
            <button class="record-btn stop" onclick="chatInterface.stopRecording()">■ 停止</button>
        </div>

    </div>

    <script src="js/simulation.js"></script>
</body>
</html>
