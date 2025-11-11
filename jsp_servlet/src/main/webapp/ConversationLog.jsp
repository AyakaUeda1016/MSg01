<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>会話ログ</title>
    <link rel="stylesheet" href="conversationLog.css">
</head>
<body>
<div class="page-wrapper">
    <!-- 상단 바 -->
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

    <!-- 메인 영역 -->
    <main class="main-area">
        <!-- 캐릭터 영역 -->
        <section class="character-area">
            <img src="dkイラスト/笑う.png" alt="キャラクター" class="character-img">
        </section>

        <!-- 대화 로그 영역 -->
        <section class="log-area">
            <!-- 1행: 상대 말풍선 -->
            <div class="log-row npc-row">
                <div class="bubble npc-bubble">
                    おはよー！今日はね、・・・・・・
                </div>
            </div>

            <!-- 2행: ME 말풍선 -->
            <div class="log-row me-row">
                <div class="bubble me-bubble">
                    そうだね・・・・・ 
                </div>
                <div class="me-icon">ME</div>
            </div>

            <!-- 3행: 상대 말풍선 -->
            <div class="log-row npc-row">
                <div class="bubble npc-bubble">
                    ・・・・・・
                </div>
            </div>

            <!-- 4행: ME 말풍선 -->
            <div class="log-row me-row">
                <div class="bubble me-bubble">
                    ・・・・・・
                </div>
                <div class="me-icon">ME</div>
            </div>
        </section>

        <!-- 되돌아가기 버튼 -->
        <a href="main.jsp" class="back-button">
            <span class="back-text">戻る</span>
        </a>
    </main>
</div>
</body>
</html>
