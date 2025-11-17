<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <title>マイク設定</title>
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/mic_settings.css">
</head>
<body>

<div class="container">
  <div class="row">
    <button class="icon-btn" aria-label="音量">🔊</button>
    <div class="number-grid volume-grid" data-default="7">
      <div class="num-box">1</div>
      <div class="num-box">2</div>
      <div class="num-box">3</div>
      <div class="num-box">4</div>
      <div class="num-box">5</div>
      <div class="num-box">6</div>
      <div class="num-box">7</div>
      <div class="num-box">8</div>
      <div class="num-box">9</div>
      <div class="num-box">10</div>
    </div>
  </div>

  <div class="row">
    <button class="icon-btn" aria-label="マイク">🎤</button>
    <div class="number-grid mic-grid" data-default="5">
      <div class="num-box">1</div>
      <div class="num-box">2</div>
      <div class="num-box">3</div>
      <div class="num-box">4</div>
      <div class="num-box">5</div>
      <div class="num-box">6</div>
      <div class="num-box">7</div>
      <div class="num-box">8</div>
      <div class="num-box">9</div>
      <div class="num-box">10</div>
    </div>
  </div>

  <div class="actions">
    <button class="btn btn-wood" id="btnMicTest">マイクテスト</button>
    <button class="btn btn-wood" id="btnBack">もどる</button>
  </div>
</div>

<script src="${pageContext.request.contextPath}/js/mic_settings.js"></script>
<script>
  document.getElementById('btnBack').addEventListener('click', function(){
    if (history.length > 1) history.back();
    else window.location.href = '${pageContext.request.contextPath}/index.jsp';
  });
</script>
</body>
</html>
