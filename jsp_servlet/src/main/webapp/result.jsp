<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<%
String result = (String) request.getAttribute("RESULT");
%>
<!DOCTYPE html>

<html lang="ja">

<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>成長記録詳細 - 評価レーダーチャート</title>
<link
	href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap"
	rel="stylesheet">
<link rel="stylesheet" href="css/result.css">
</head>

<body>
	<div class="classroom">
		<!-- 黒板全体コンテナ -->
		<div class="chalkboard">
			<!-- 黒板の画像専用div -->
			<div class="chalkboard-image"></div>

			<div class="chalkboard-content">
				<!-- 左側テキスト領域 -->
				<div class="left-section">
					<!-- 上部なきごえ用グラフアイコン -->
					<div class="left-header">
						<h1 class="title">シナリオ 自己紹介</h1>
						<h3 class="feedback-title">KAIWA NAVIからのフィードバック</h3>
					</div>

					<div class="left-scroll">
						<div class="feedback-section">
							<div class="feedback-item">
								<img src="images/star.png" class="doodle-bullet" alt="星">
								<p data-role="feedback-comment">自己認識：<br>自分の感情をある程度言語化できています。</p>
							</div>

							<div class="feedback-item">
								<img src="images/arrow.png" class="doodle-bullet" alt="やじるし">
								<p data-role="feedback-comment">気持ちのコントロール:<br>はっきりした話し方で会話の流れも自然です。</p>
							</div>

							<div class="feedback-item">
								<img src="images/graph.png" class="doodle-bullet" alt="グラフ">
								<p data-role="feedback-comment">
									思いやり:<br>文脈理解が良好で、相手の意図を理解した発言が多かったです。</p>
							</div>

							<div class="feedback-item">
								<img src="images/star.png" class="doodle-bullet" alt="星">
								<p data-role="feedback-comment">理解力:<br>落ち着いた発話が多く、会話の安定感がありました。</p>
							</div>

							<div class="feedback-item">
								<img src="images/arrow.png" class="doodle-bullet" alt="やじるし">
								<p data-role="feedback-comment">
									話す力<br>相手に配慮した返答が見られましたが、もう少し寄り添える余地があります。</p>
							</div>
						</div>
					</div>
				</div>
				<div class="right-section">
					<div class="radar-header">
						<!--  <img src="images/button.png" alt="評価レーダーチャート" class="ki-box">-->
						 <span class="ki-title">評価レーダーチャート</span>
					</div>

					<canvas id="radarChart"></canvas>

					<img src="${pageContext.request.contextPath}/images/star.png"
						alt="星" class="doodle-star-top"> <img src="images/arrow.png"
						alt="やじるし" class="doodle-arrow"> <img src="images/graph.png"
						alt="グラフ" class="doodle-graph-right">
					
					<!-- Fixed rank.png path from absolute to relative -->
					<img src="images/rank.png" 
						alt="ランク" class="icon-rank-text">
					
					<img
						src="images/B.png" alt="Sランク" class="icon-s"> <img
						src="images/line.png" alt="下線" class="icon-underline"> <img
						src="images/star2.png" alt="星2" class="icon-star2">
					
					<!-- Fixed log.png path from absolute to relative -->
					<img src="images/log.png" 
						alt="ログ" class="icon-log-text">
					
					<a
						href="result?sb=log" class="smile-link"> <img
						src="images/smile2.png" alt="ログへ" class="icon-smile">
					</a> <img src="images/magnet.png" alt="マグネット" class="icon-magnet">

					<div class="extra-area"></div>
				</div>
			</div>

		</div>
		<!-- Added retry button next to home button -->
		<div class="bottom-buttons">
			<a href="result?sb=home">
				<button name="sb" value="home" class="btn btn-wood">ホームに戻る</button>
			</a>
			<a href="${pageContext.request.contextPath}/result?sb=retry">
				<button class="btn btn-wood btn-retry">次の人へ</button>
			</a>
		</div>
	</div>

	<div id="resultDataHolder" data-json='${RESULT_JSON}'></div>

	<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

	<script>
  const feedbackData = JSON.parse(`<%=result%>`);
	</script>
	<script src="js/result.js"></script>
</body>
</html>
