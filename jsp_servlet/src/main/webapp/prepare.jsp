<%@ page language="java" contentType="text/html; charset=UTF-8"
	pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>音声・マイク設定</title>
<link
	href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap"
	rel="stylesheet">
<link rel="stylesheet" href="css/common.css">
<link rel="stylesheet" href="css/prepare.css">
</head>
<body>
	<script>
		window.parent.postMessage({
			page : "normal"
		}, "*");
	</script>
	<section class="blackboard">
		<div class="board-container">
			<!-- 音声音量設定 -->
			<div class="control-row">
				<div class="icon-container">
					<svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
						viewBox="0 0 512 512"
						style="width: 64px; height: 64px; opacity: 1;"
						xml:space="preserve">
<style type="text/css">
.st0 {
	fill: #4B4B4B;
}
</style>
<g>
	<path class="st0"
							d="M0,225.197v61.608c0,16.152,13.094,29.248,29.246,29.248h49.549V195.949H29.246
		C13.094,195.949,0,209.045,0,225.197z"
							style="fill: rgb(255, 255, 255);"></path>
	<polygon class="st0"
							points="110.314,316.053 244.031,392.663 244.031,119.337 110.314,195.949 	"
							style="fill: rgb(255, 255, 255);"></polygon>
	<path class="st0"
							d="M444.527,96l-20.449,20.084c36.508,35.856,59.117,85.287,59.117,139.881
		c0,54.595-22.609,104.098-59.117,139.952l0.07,0.072L444.527,416C486.219,374.984,512,318.41,512,255.965
		C512,193.592,486.219,137.018,444.527,96z"
							style="fill: rgb(255, 255, 255);"></path>
	<path class="st0"
							d="M393.547,146.068l-20.379,20.015c23.474,22.983,38.02,54.806,38.02,89.882
		c0,35.148-14.545,66.971-38.092,89.954l20.377,20.014c28.732-28.146,46.518-67.04,46.518-109.968
		C439.99,213.039,422.205,174.215,393.547,146.068z"
							style="fill: rgb(255, 255, 255);"></path>
	<path class="st0"
							d="M322.258,216.08c10.441,10.184,16.922,24.257,16.922,39.885c0,15.629-6.48,29.774-16.994,39.955l20.379,20.014
		c15.697-15.274,25.418-36.561,25.418-59.97c0-23.408-9.721-44.553-25.346-59.898L322.258,216.08z"
							style="fill: rgb(255, 255, 255);"></path>
</g>
</svg>
				</div>
				<div class="number-buttons" id="soundButtons">
					<button class="number-btn" data-value="1">1</button>
					<button class="number-btn" data-value="2">2</button>
					<button class="number-btn" data-value="3">3</button>
					<button class="number-btn" data-value="4">4</button>
					<button class="number-btn" data-value="5">5</button>
					<button class="number-btn" data-value="6">6</button>
					<button class="number-btn" data-value="7">7</button>
					<button class="number-btn" data-value="8">8</button>
					<button class="number-btn" data-value="9">9</button>
					<button class="number-btn" data-value="10">10</button>
				</div>
			</div>

			<!-- マイク音量設定 -->
			<div class="control-row">
				<div class="icon-container">
					<svg version="1.1" id="_x32_" xmlns="http://www.w3.org/2000/svg"
						xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
						viewBox="0 0 512 512"
						style="width: 64px; height: 64px; opacity: 1;"
						xml:space="preserve">
<style type="text/css">
.st0 {
	fill: #4B4B4B;
}
</style>
<g>
	<path class="st0"
							d="M388.428,223.259v36.189c-0.019,36.824-14.22,69.808-37.549,94.199
		c-23.368,24.352-55.678,39.931-92.314,41.538c-0.318,0.02-0.606,0.1-0.913,0.129h-3.304c-0.307-0.03-0.596-0.109-0.912-0.129
		c-36.636-1.607-68.946-17.186-92.315-41.538c-23.329-24.391-37.528-57.375-37.549-94.199v-36.189H82.927v36.189
		c-0.019,47.422,18.486,90.647,48.842,122.311c26.574,27.775,62.386,46.808,102.633,52.444V512h43.185v-77.796
		c40.259-5.636,76.071-24.669,102.644-52.444c30.355-31.664,48.861-74.889,48.841-122.311v-36.189H388.428z"
							style="fill: rgb(255, 255, 255);"></path>
	<path class="st0"
							d="M259.3,363.363c-1.111,0-2.193-0.129-3.305-0.16c-1.101,0.03-2.182,0.16-3.294,0.16H259.3z"
							style="fill: rgb(255, 255, 255);"></path>
	<path class="st0"
							d="M222.515,259.319h-68.241c0.556,56.432,45.586,102.128,101.721,103.884
		c56.145-1.756,101.176-47.452,101.732-103.884h-68.242v-19.508h68.29v-36.636h-68.29v-19.508h68.29V147.03h-68.29v-19.508h68.29
		V90.885h-68.29V71.376h67.953C354.046,31.396,320.585,0,279.732,0H232.27c-40.853,0-74.314,31.396-77.708,71.376h67.953v19.508
		h-68.29v36.636h68.29v19.508h-68.29v36.636h68.29v19.508h-68.29v36.636h68.29V259.319z"
							style="fill: rgb(255, 255, 255);"></path>
</g>
</svg>
				</div>
				<div class="number-buttons" id="micButtons">
					<button class="number-btn" data-value="1">1</button>
					<button class="number-btn" data-value="2">2</button>
					<button class="number-btn" data-value="3">3</button>
					<button class="number-btn" data-value="4">4</button>
					<button class="number-btn" data-value="5">5</button>
					<button class="number-btn" data-value="6">6</button>
					<button class="number-btn" data-value="7">7</button>
					<button class="number-btn" data-value="8">8</button>
					<button class="number-btn" data-value="9">9</button>
					<button class="number-btn" data-value="10">10</button>
				</div>
			</div>

			<div class="btn-container">
				<button class="btn btn-wood" id="micTestBtn">マイクテスト</button>

				<a href="prepare?sb=start"><button class="btn btn-wood"
						id="readyBtn">準備完了</button></a>
			</div>
		</div>

	</section>

	<a href="prepare?sb=back"><button class="back btn-wood"
			id="backBtn">戻る</button></a>

	<script src="js/prepare.js"></script>
</body>
</html>
