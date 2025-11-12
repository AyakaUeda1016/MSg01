<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>成長記録詳細</title>
    <link rel="stylesheet" href="css/growth_record_details.css">
</head>
<body>
    <div class="container">
        <div class="chalkboard">
            <h1 class="title">成長記録詳細</h1>
            
            <div class="content-wrapper">
                <div class="left-section">
                    <h2 class="section-title">シナリオ　放課後</h2>
                    
                    <div class="feedback-section">
                        <h3 class="feedback-title">KAIWA NAVIからのフィードバック</h3>
                        
                        <div class="feedback-item">
                            <div class="icon">👤</div>
                            <p>自己認識が高く、自分の強みと改善点をよく理解しています。これは会話の質を高める上で非常に重要です。</p>
                        </div>
                        
                        <div class="feedback-item">
                            <div class="icon">😰</div>
                            <p>全体的に落ち着いており、ほとんど緊張は見られませんでした。リラックスした姿勢が相手にも良い影響を与えています。</p>
                        </div>
                        
                        <div class="feedback-item">
                            <div class="icon">🧘</div>
                            <p>会話中に一貫して落ち着きを保ち、感情的になることなく論理的に話を展開できました。</p>
                        </div>
                        
                        <div class="feedback-item">
                            <div class="icon">💬</div>
                            <p>相手の話に深く耳を傾け、適切なタイミングで相槌を打つことで、相手は安心して話すことができました。素晴らしい傾聴力です。</p>
                        </div>
                        
                        <div class="feedback-item">
                            <div class="icon">🎯</div>
                            <p>明瞭な発音と分かりやすい言葉選びで、自分の意見を効果的に伝えることができました。話の構成も良く、聞き手を意きつけます。</p>
                        </div>
                    </div>
                </div>
                
                <div class="right-section">
                    <h2 class="section-title">評価レーダーチャート</h2>
                    <div class="radar-chart">
                        <svg viewBox="0 0 300 300" class="radar-svg">
                            <!-- Pentagon grid -->
                            <polygon points="150,30 255,110 225,220 75,220 45,110" class="grid-line" />
                            <polygon points="150,60 230,115 210,200 90,200 70,115" class="grid-line" />
                            <polygon points="150,90 205,120 195,180 105,180 95,120" class="grid-line" />
                            <polygon points="150,120 180,135 170,160 130,160 120,135" class="grid-line" />
                            
                            <!-- Axes -->
                            <line x1="150" y1="150" x2="150" y2="30" class="axis-line" />
                            <line x1="150" y1="150" x2="255" y2="110" class="axis-line" />
                            <line x1="150" y1="150" x2="225" y2="220" class="axis-line" />
                            <line x1="150" y1="150" x2="75" y2="220" class="axis-line" />
                            <line x1="150" y1="150" x2="45" y2="110" class="axis-line" />
                            
                            <!-- Data polygon (adjust points based on actual data) -->
                            <polygon points="150,50 240,115 215,200 85,200 60,115" class="data-polygon" />
                            
                            <!-- Labels -->
                            <text x="150" y="20" class="label">自己認識</text>
                            <text x="260" y="115" class="label">気持ち</text>
                            <text x="235" y="235" class="label">思いやり</text>
                            <text x="75" y="235" class="label">理解力</text>
                            <text x="40" y="115" class="label">話す力</text>
                            
                            <!-- Icons -->
                            <text x="150" y="40" class="icon-text">👤</text>
                            <text x="235" y="98" class="icon-text">😰</text>
                            <text x="240" y="255" class="icon-text">🧘</text>
                            <text x="70" y="255" class="icon-text">👂</text>
                            <text x="30" y="100" class="icon-text">💬</text>
                        </svg>
                    </div>
                </div>
            </div>
            
            <div class="chalk-tray"></div>
        </div>
    </div>
    <a href="growth_record.jsp">
        <button class="back-btn">
            <span>戻る</span>
        </button>
    </a>
</body>
</html>