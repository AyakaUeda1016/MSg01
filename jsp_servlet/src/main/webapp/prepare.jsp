<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>音声・マイク設定</title>
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/prepare.css">
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
                    <span class="control-icon">🎤</span>
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

            <div class="action-buttons">
                <button class="btn btn-orange" id="micTestBtn">マイクテスト</button>
            </div>

            <div class="action-buttons">
                <a href="scenario?sb=start"><button class="btn btn-light-orange" id="readyBtn">準備完了</button></a>
            </div>
        </div>

        <a href="scenario?sb=back"><button class="btn btn-wood" id="backBtn">戻る</button></a>
    </div>

    <script src="js/prepare.js"></script>
</body>
</html>
