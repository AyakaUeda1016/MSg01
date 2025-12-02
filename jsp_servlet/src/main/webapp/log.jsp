<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%
    String ctx = request.getContextPath();
    String conversationsJson = (String)request.getAttribute("CONVERSATION");
    String url = (String)request.getAttribute("RETURNURL");
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

    <main class="main-area">
        <section class="character-area">
            <img src="images/boy_smile.png" alt="キャラクター" class="character-img">
        </section>

        <!-- JavaScriptで動的に会話ログを生成 -->
        <section class="log-area" id="logArea">
            <!-- ここに会話ログが動的に挿入されます -->
        </section>

        <a href="<%=url %>" class="back-button">
            <button class="btn btn-wood">戻る</button>
        </a>
    </main>
</div>

<!-- JSONデータを動的に会話ログに変換するスクリプト -->
<script>
	<%-- null対策 --%>
	<%
    	if (conversationsJson == null || conversationsJson.isEmpty()) {
        	conversationsJson = "[]";
    	}
	%>
    window.conversationsData = <%= conversationsJson %>;
</script>
<script src="js/log.js"></script>
</body>
</html>
