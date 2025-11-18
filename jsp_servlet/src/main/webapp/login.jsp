<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>KaiwaNavi Login</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/login.css" />
</head>
<body>
  <main class="wrap">
    <img src="${pageContext.request.contextPath}/images/kaiwanavi2.png"
         alt="KaiwaNavi ロゴ" class="logo" />

    <form id="loginForm" action="${pageContext.request.contextPath}/login" method="post" class="form">
      <label class="field">
        <span class="label">id:</span>
        <input type="text" name="id" required />
      </label>

      <label class="field">
        <span class="label">password:</span>
        <input type="password" name="password" required />
      </label>
      
      <div class="fixed-buttons">
      <a href="register.jsp" class="btn">新規登録</a>
      <button class="btn btn-register">ログイン</button>
      </div>
      
    </form>
  </main>
  	
</body>
</html>
