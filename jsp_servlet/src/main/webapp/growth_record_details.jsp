<%@ page language="java" contentType="text/html; charset=UTF-8"
pageEncoding="UTF-8"%>

<!DOCTYPE html>

<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>成長記録詳細 - 評価レーダーチャート</title>
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="css/growth_record_details.css">
</head>

<body>
    <div class="classroom">
        <div class="chalkboard">
            <div class="chalkboard-content">
                <div class="left-section">
                 <div class="left-header">
                    <h1 class="title">シナリオ　雑談</h1>
                    <h2 class="subtitle">総評~~</h2>
                     <h3 class="feedback-title">KAIWA NAVIからのフィードバック</h3>
                  </div>
               <div class="left-scroll">
                <div class="feedback-section">
                   

                    <div class="feedback-item">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M9 18h6"></path>
                            <path d="M10 22h4"></path>
                            <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14"></path>
                        </svg>
                        <p>自己認識が高く、自分の強みと改善点をよく理解しています。これは会話の質を高める上で非常に重要です。</p>
                    </div>

                    <div class="feedback-item">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                        </svg>
                        <p>全体的に落ち着いており、ほとんど緊張は見られませんでした。リラックスした姿勢が相手にも良い影響を与えています。</p>
                    </div>

                    <div class="feedback-item">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"></circle>
                            <circle cx="12" cy="12" r="6"></circle>
                            <circle cx="12" cy="12" r="2"></circle>
                        </svg>
                        <p>会話中に一貫して落ち着きを保ち、感情的になることなく論理的に話を展開できていました。</p>
                    </div>

                    <div class="feedback-item">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                            <circle cx="9" cy="7" r="4"></circle>
                            <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                            <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
                        </svg>
                        <p>相手の話に深く耳を傾け、適切なタイミングで相槌を打つことで、相手は安心して話すことができました。素晴らしい傾聴力です。</p>
                    </div>

                    <div class="feedback-item">
                        <svg class="icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                        </svg>
                        <p>明瞭な発音と分かりやすい言葉選びで、自分の意見を効果的に伝えることができました。話の構成も良く、聞き手を惹きつけます。</p>
                    </div>
                </div>
            </div>
           </div>

            <div class="right-section">
                <h2 class="chart-title">評価レーダーチャート</h2>
                <canvas id="radarChart"></canvas>
                <div class="radar-bottom-area">
        		<a href="result?sb=log_growth" class="btn btn-log">
            	<img src="images/haritsuke.png" alt="ログボタン">
            	<span>ログ</span>
        		</a>
        		<div class="extra-area">
        		</div>
        		
            </div>
        </div>

        <div class="bottom-buttons">
            

            <a href="growth_record" class="btn btn-finish">
                <img src="images/eraser.png" alt="戻るボタン">
                <span>戻る</span>
            </a>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="js/growth_record_details.js"></script>

</body>
</html>
