<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>KaiwaNavi Login</title>
  <!-- /css 는 webapp 바로 아래라서 이렇게 -->
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/login.css" />
</head>
<body>
  <main class="wrap">
    <!-- /images 도 webapp 바로 아래 -->
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
    </form>
  </main>

  <div class="fixed-buttons">
    <button type="submit" form="loginForm" class="btn btn-ok">OK</button>
    <a class="btn btn-register" href="${pageContext.request.contextPath}/register">新規登録</a>
  </div>
</body>
</html>
