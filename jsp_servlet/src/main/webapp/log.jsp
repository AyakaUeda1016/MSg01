<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String ctx = request.getContextPath();
%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>会話ログ</title>
    <link rel="stylesheet" href="css/log.css">
</head>
<body>
<div class="page-wrapper">
    <header class="header">
        <div class="header-center">ユーザー名</div>
        <div class="header-right">18:00</div>
    </header>

    <!-- 메인 -->
    <main class="main-area">
        <!-- 캐릭터 -->
        <section class="character-area">
            <img src="images/笑う.png" alt="キャラクター" class="character-img">
        </section>

        <section class="log-area">
            <div class="log-row npc-row">
                <div class="bubble npc-bubble">
                    おはよー！今日はね、・・・・・・
                </div>
            </div>

            <div class="log-row me-row">
                <div class="bubble me-bubble">
                    そうだね・・・・・
                </div>
                <div class="me-icon">ME</div>
            </div>

            <div class="log-row npc-row">
                <div class="bubble npc-bubble">
                    ・・・・・・
                </div>
            </div>

            <div class="log-row me-row">
                <div class="bubble me-bubble">
                    ・・・・・・
                </div>
                <div class="me-icon">ME</div>
            </div>
        </section>

        <a href="result?sb=result" class="back-button">
            <button class="btn btn-wood">戻る</button>
        </a>
    </main>
</div>
</body>
</html>
