<%@ page contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" language="java" %>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>マイク設定</title>
  <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${pageContext.request.contextPath}/css/mic_settings.css">
</head>
<body>
<div class="container">
  <div class="background"></div>

  <div class="blackboard">
    <!-- 音声音量設定 -->
    <div class="control-row">
      <div class="icon-container">
        <span class="control-icon">🔊</span>
      </div>
      <div class="number-grid volume-grid" data-default="5">
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

    <!-- マイク音量設定 -->
    <div class="control-row">
      <div class="icon-container">
        <span class="control-icon">🎤</span>
      </div>
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

    <div class="action-buttons">
      <button class="btn btn-wood" id="btnMicTest">マイクテスト</button>
    </div>
  </div>

  <button class="back-btn" id="btnBack">戻る</button>
</div>

<script src="${pageContext.request.contextPath}/js/mic_settings.js"></script>
</body>
</html>
