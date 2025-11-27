<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>シナリオ選択</title>
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/scenario.css">
    
</head>
<body>
<!-- チュートリアルオーバーレイとツールチップをページの先頭に移動 -->
<!-- チュートリアル用のオーバーレイと吹き出し -->
<div class="tutorial-overlay" id="tutorial-overlay"></div>
 
<!-- チュートリアル用の吹き出し -->
<div class="tutorial-tooltip" id="tutorial-tooltip">
    <div class="tooltip-content">
        <p id="tutorial-text"></p>
        <div class="tooltip-footer">
            <span id="tutorial-step" class="step-indicator"></span>
            <button id="skip-tutorial" class="skip-btn">スキップ</button>
        </div>
    </div>
    <div class="tooltip-arrow" id="tooltip-arrow"></div>
</div>

<div class="bg-mirai">
 
    <!-- 緑パネル -->
    <div class="green-panel">
            <!-- Added blackboard background image -->
            <img src="${pageContext.request.contextPath}/images/blackboard.png" alt="黒板" class="blackboard-img">
		
		<div class="panel-inner">
            <h1 class="scenario-select-title">シナリオ選択</h1>
 
            <!-- パネル中のイメージ３つ -->
            <div class="scene-list">
                <img id="scene-left"   src="${pageContext.request.contextPath}/images/haru.jpg" alt="春のシーン" class="scene-img">
                <img id="scene-center" src="${pageContext.request.contextPath}/images/kyo.jpg"  alt="教室のシーン" class="scene-img">
                <img id="scene-right"  src="${pageContext.request.contextPath}/images/natu.jpg" alt="夏のシーン" class="scene-img">
            </div>
 
            <!-- シナリオ説明 -->
            <div class="scenario-text-box">
                <p class="scenario-title" id="scenario-title">シナリオ1</p>
                <p class="scenario-desc"  id="scenario-desc">
                    みんなの前で自己紹介をやってみよう！
                </p>
            </div>
 
            <!-- 決定、やじるし -->
            <div class="controller-area">
                <button type="button" class="arrow-btn arrow-left" id="btn-left">
                    <img src="${pageContext.request.contextPath}/images/l.png" alt="前へ">
                </button>
                
                <!-- Updated decide button to use blackboard eraser style -->
                <form action="${pageContext.request.contextPath}/scenario" method="get">
                	<input type="hidden" name="scenarioId"  id="scenarioId" value="1">
                	<button type="submit" name="sb"  value="decide" class="decide-btn" id="decide-btn">決定</button>
                </form>
 
                <button type="button" class="arrow-btn arrow-right" id="btn-right">
                    <img src="${pageContext.request.contextPath}/images/r.png" alt="次へ">
                </button>
            </div>
 
        </div>
    </div>
 
    <!-- ヘルプボタンを追加 -->
    <button class="help-btn" id="help-btn">？</button>
 
    <!-- Changed from .btn-wood to .back-button for eraser style -->
    <a href="./scenario?sb=home" class="back-button">戻る</a>
 
</div>
 
<!-- Pass contextPath to JavaScript -->
<script>
    window.contextPath = "${pageContext.request.contextPath}";
</script>
<script src="${pageContext.request.contextPath}/js/scenario.js"></script>
</body>
</html>
