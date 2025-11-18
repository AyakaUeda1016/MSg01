<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>棒グラフ画面</title>
  <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="css/record_list.css">
</head>
<body>
  <!-- メイン画面コンテナを追加してスライドアニメーションに対応 -->
  <div class="screen-wrapper">
    <!-- 背景画像 -->
    <div class="background"></div>

    <!-- 黒板の外の左矢印ボタンを追加 -->
    <button class="nav-arrow-btn nav-left-arrow" id="navLeftArrow">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <polygon points="60,20 30,50 60,80" fill="#f97316"/>
      </svg>
    </button>

    <!-- 黒板コンテナ -->
    <div class="blackboard-container">
      <!-- 黒板画像 -->
      <div class="blackboard">
        <!-- タイトル -->
        <h1 class="title">棒グラフ画面</h1>

        <!-- 凡例 -->
        <div class="legend">
          <div class="legend-item">
            <span class="legend-color" style="background-color: #a855f7;"></span>
            <span class="legend-text">自己認識</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #ec4899;"></span>
            <span class="legend-text">気持ちの<br>コントロール</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #3b82f6;"></span>
            <span class="legend-text">思いやり</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #10b981;"></span>
            <span class="legend-text">理解力</span>
          </div>
          <div class="legend-item">
            <span class="legend-color" style="background-color: #f97316;"></span>
            <span class="legend-text">話す力</span>
          </div>
        </div>

        <!-- グラフエリアと矢印を黒板内部に配置 -->
        <div class="graph-area-wrapper">
          <!-- 黒板内の左矢印 -->
          <button class="arrow-btn left-arrow" id="leftArrow">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <polygon points="40,10 20,30 40,50" fill="#f97316"/>
            </svg>
          </button>

          <!-- グラフエリア -->
          <div class="graph-area">
            <!-- グラフコンテンツ -->
            <div class="graph-content" id="graphContent">
              <!-- グラフはJavaScriptで生成 -->
            </div>
          </div>

          <!-- 黒板内の右矢印 -->
          <button class="arrow-btn right-arrow" id="rightArrow">
            <svg width="60" height="60" viewBox="0 0 60 60">
              <polygon points="20,10 40,30 20,50" fill="#f97316"/>
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- 戻るボタン -->
    <a href="growth_record.jsp"><button class="btn btn-wood" id="backBtn">戻る</a>
  </div>

  <script src="js/record_list.js"></script>
</body>
</html>
