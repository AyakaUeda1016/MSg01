<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<title>KaiwaNavi</title>
<style>
  body, html {
    margin: 0;
    padding: 0;
    height: 100%;
    overflow: hidden;
  }
  #mainFrame {
    width: 100%;
    height: 100%;
    border: none;
  }
</style>
</head>
<body>
<!-- iframe … -->
<iframe id="mainFrame" src="home?sb=home"></iframe>
<script>
  const contextPath = "<%= request.getContextPath() %>";
</script>
<script src="<%= request.getContextPath() %>/js/bgm.js"></script>
</body>
</html>