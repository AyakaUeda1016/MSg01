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
                <div class="compass-icon"></div>
                <div class="rally-numbers">
                    <span class="current-rally" id="currentRally">0</span>
                    <span class="rally-separator">　</span>
                    <span class="max-rally" id="maxRally">10</span>
                </div>
            </div>
        </div>

        <!-- 右上: メニューボタン -->
        <a href="${pageContext.request.contextPath}/simulation"><button class="menu-button" id="menuButton">
            <span class="menu-icon">|||</span>
        </button></a>
        <a href ="result.jsp"><p>次へ</p></a>

        <!-- キャラクター画像 -->
        <div class="character-container">
            <img src="images/kaiwanavi-chara.png" alt="会話ナビキャラクター" class="character-image">
        </div>

        <!-- 右側: 緊張度ポップアップ -->
        <div class="tension-popup hidden" id="tensionPopup">
            <div class="popup-content">
                <p id="tensionMessage">緊張度が高まっています！<br>落ち着いて対応しましょう。</p>
            </div>
        </div>

        <!-- 下部: AIメッセージボックス -->
        <div class="message-box">
            <div class="speaker-name" id="speakerName">あい</div>
            <div class="message-content" id="messageContent">
                会話を開始してください...
            </div>
        </div>
    </div>

    <!-- サーブレットのURLを設定（必要に応じて変更） -->
    <script>
        // サーブレットから返されるJSONのURLを設定
        window.SERVLET_JSON_URL = '${pageContext.request.contextPath}/api/conversation';
    </script>
    <script src="js/simulation.js"></script>
</body>
</html>
