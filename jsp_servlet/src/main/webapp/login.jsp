<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<% 
	String errormsg = (String)request.getAttribute("loginError");
%>
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
         
    <%if(errormsg != null){ %>
    	<p id="errorMsg"><%=errormsg %></p>
    <%} %>

    <form id="loginForm" action="${pageContext.request.contextPath}/login" method="post" class="form">
      <label class="field">
        <span class="label">id:</span>
        <input type="text" name="id" value="1" required />
      </label>

      <label class="field">
        <span class="label">password:</span>
        <input type="password" name="password" value="pass" required />
      </label>
      
      <div class="fixed-buttons">
      <a href="register?sb=register" class="btn">新規登録</a>
      <button type="submit" name="sb" value="login" class="btn btn-register">ログイン</button>
      </div>
      
    </form>
  </main>
  	
</body>
</html>
