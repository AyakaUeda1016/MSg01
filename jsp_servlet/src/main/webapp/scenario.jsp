<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <title>シナリオ選択</title>
    <link rel="stylesheet" href="css/scenario.css">
</head>
<body>
<div class="bg-mirai">

    <!-- 緑パネル -->
    <div class="green-panel">
        <div class="panel-inner">

            <h1 class="scenario-select-title">シナリオ選択</h1>

            <!-- パネル中のイメージ３つ -->
            <div class="scene-list">
                <img id="scene-left"   src="images/haru.jpg" alt="春のシーン" class="scene-img">
                <img id="scene-center" src="images/kyo.jpg"  alt="教室のシーン" class="scene-img">
                <img id="scene-right"  src="images/natu.jpg" alt="夏のシーン" class="scene-img">
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
                    <img src="images/l.png" alt="前へ">
                </button>

                <a href="prepare.jsp"><button type="button" class="decide-btn">
                    決定
                </button></a>

                <button type="button" class="arrow-btn arrow-right" id="btn-right">
                    <img src="images/r.png" alt="次へ">
                </button>
            </div>

        </div>
    </div>


    <a href="home.jsp" class="back-button">戻る</a>

</div>

<script src="js/scenario.js"></script>
</body>
</html>
