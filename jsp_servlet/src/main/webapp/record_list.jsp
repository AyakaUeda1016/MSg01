<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%><!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>棒グラフ画面</title>
<link
	href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap"
	rel="stylesheet">
<link rel="stylesheet" href="css/record_list.css">
</head>
<body>
	<!-- メイン画面コンテナを追加してスライドアニメーションに対応 -->
	<div class="screen-wrapper">
		<!-- 背景画像 -->
		<div class="background"></div>
		<!-- 黒板コンテナ -->
		<div class="blackboard-container">
			<!-- 黒板の外の左矢印ボタンを追加 -->
			<button class="nav-arrow-btn nav-left-arrow" id="navLeftArrow">
				<svg width="100" height="100" viewBox="0 0 100 100"> <polygon
						points="60,20 30,50 60,80" fill="#f97316" /> </svg>
			</button>
			<!-- 黒板画像 -->
			<div class="blackboard">
			
			 <div class="eraser-layer">
        		<img src="images/blackboard eraser.png" class="eraser-img">
    		 </div>
    		 <div class="pencil-layer">
        		<img src="images/pen.png" class="pencil-img">
    		 </div>
    		 
				<!-- タイトル -->
				<h1 class="title"  id="pageTitle">棒グラフ画面</h1>
				<!-- 凡例 -->
				<div class="legend">
					<div class="legend-item" data-category="自己認識">
						<span class="legend-color" style="background-color: #a855f7;"></span>
						<span class="legend-text">自己認識</span>
					</div>
					<div class="legend-item" data-category="気持ちのコントロール">
						<span class="legend-color" style="background-color: #ec4899;"></span>
						<span class="legend-text">気持ちの<br>コントロール
						</span>
					</div>
					<div class="legend-item" data-category="思いやり">
						<span class="legend-color" style="background-color: #3b82f6;"></span>
						<span class="legend-text">思いやり</span>
					</div>
					<div class="legend-item" data-category="理解力">
						<span class="legend-color" style="background-color: #10b981;"></span>
						<span class="legend-text">理解力</span>
					</div>
					<div class="legend-item" data-category="話す力">
						<span class="legend-color" style="background-color: #f97316;"></span>
						<span class="legend-text">話す力</span>
					</div>
					<!-- ▼▼ グラフ切り替えボタン（2個） ▼▼ -->
				<div class="chart-mode-group">
    <button class="chart-icon-btn" id="btnBar">
  <svg width="40" height="40" viewBox="0 0 28 28"
     fill="none" stroke="white" stroke-width="3"
     stroke-linecap="round" stroke-linejoin="round"
     style="filter: drop-shadow(0 0 3px rgba(255,255,255,0.8));">
  <path d="M3 24 L25 24" />
  <path d="M7 24 L7 14" />
  <path d="M13 24 L13 10" />
  <path d="M19 24 L19 6" />
</svg>

    </button>

    <button class="chart-icon-btn" id="btnLine">
<svg width="40" height="40" viewBox="0 0 28 28"
     fill="none" stroke="white" stroke-width="3"
     stroke-linecap="round" stroke-linejoin="round"
     style="filter: drop-shadow(0 0 3px rgba(255,255,255,0.8));">
  <path d="M3 24 L25 24" />
  <path d="M5 18 L11 12 L17 15 L23 9" />
  <circle cx="5"  cy="18" r="2.2" fill="white"/>
  <circle cx="11" cy="12" r="2.2" fill="white"/>
  <circle cx="17" cy="15" r="2.2" fill="white"/>
  <circle cx="23" cy="9"  r="2.2" fill="white"/>
</svg>

    </button>
</div>

				</div>
				
				

				
				<!-- グラフエリアと矢印を黒板内部に配置 -->
				<div class="graph-area-wrapper">
					<!-- 黒板内の左矢印 -->
					<button class="arrow-btn left-arrow" id="leftArrow">
						<svg width="60" height="60" viewBox="0 0 60 60"> <polygon
								points="40,10 20,30 40,50" fill="#f97316" /> </svg>
					</button>
					<!-- グラフエリア -->
					<div class="graph-area">
						<!-- グラフコンテンツ -->
						<div class="graph-content" id="graphContent">
							<!-- グラフはJavaScriptで動的に生成されます -->
							  <div style="color: white; font-size: 18px;">読み込み中...</div>
						</div>
					</div>
					<!-- 黒板内の右矢印 -->
					<button class="arrow-btn right-arrow" id="rightArrow">
						<svg width="60" height="60" viewBox="0 0 60 60"> <polygon
								points="20,10 40,30 20,50" fill="#f97316" /> </svg>
					</button>
				</div>
			</div>
		</div>
	</div>
	 <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
	<script src="js/record_list.js"></script>
	<script src="js/chalk_animation.js"></script>
</body>
</html>