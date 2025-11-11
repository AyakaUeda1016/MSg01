<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String ctx = request.getContextPath();
%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>会話ログ</title>
    <link rel="stylesheet" href="<%= ctx %>/css/conversationLog.css">
</head>
<body>
<div class="page-wrapper">
    <header class="topbar">
        <div class="topbar-left">
            会話ログ
        </div>
        <div class="topbar-right">
            <span class="level">Lv. 1</span>
            <span class="username">ユーザー名</span>
            <span class="time">18:00</span>
        </div>
    </header>

    <!-- 메인 -->
    <main class="main-area">
        <!-- 캐릭터 -->
        <section class="character-area">
            <img src="<%= ctx %>/images/笑う.png" alt="キャラクター" class="character-img">
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

        <!-- 되돌아가기 버튼 -->
        <a href="" class="back-button">
            <span class="back-text">戻る</span>
        </a>
    </main>
</div>
</body>
</html>
