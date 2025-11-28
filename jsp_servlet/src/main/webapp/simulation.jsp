<%@ page language="java" contentType="text/html; charset=UTF-8"
    pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="ja">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>会話ナビ - AIチャットインターフェース</title>

    <!-- フォント -->
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">

    <!-- CSS -->
    <link rel="stylesheet" href="css/simulation.css">
</head>
<body>

    <!-- 背景 -->
    <div class="background-container">
        <img src="images/room.png" alt="背景" class="background-image">
    </div>

    <div class="main-content">

        <!-- 🧭 ラリーカウンター -->
        <div class="rally-counter">
            <div class="compass-container">
                <div class="compass-icon"></div>

                <div class="rally-numbers">
                    <span id="turn">0</span>
                    <span class="rally-separator">　</span>
                    <span id="max_turns"></span>
                </div>
            </div>
        </div>

        <!-- 追加: スコアメーター -->
        <div class="score-meter-container">
            <!-- 総合スコア＆ランク予測 -->
            <div class="total-score-display">
                <div class="rank-badge" id="rankBadge">-</div>
                <div class="total-score-value">
                    <span id="totalScore">0</span>
                    <span class="score-unit">pts</span>
                </div>
                <div class="rank-label">予測ランク</div>
            </div>

            <!-- 5つのスキルバー -->
            <div class="skill-bars">
                <div class="skill-item">
                    <div class="skill-label">自己理解</div>
                    <div class="skill-bar-container">
                        <div class="skill-bar" id="selfUnderstandingBar" style="width: 0%"></div>
                        <div class="skill-score" id="selfUnderstandingScore">0</div>
                    </div>
                </div>

                <div class="skill-item">
                    <div class="skill-label">話す力</div>
                    <div class="skill-bar-container">
                        <div class="skill-bar" id="speakingBar" style="width: 0%"></div>
                        <div class="skill-score" id="speakingScore">0</div>
                    </div>
                </div>

                <div class="skill-item">
                    <div class="skill-label">理解力</div>
                    <div class="skill-bar-container">
                        <div class="skill-bar" id="comprehensionBar" style="width: 0%"></div>
                        <div class="skill-score" id="comprehensionScore">0</div>
                    </div>
                </div>

                <div class="skill-item">
                    <div class="skill-label">感情制御</div>
                    <div class="skill-bar-container">
                        <div class="skill-bar" id="emotionControlBar" style="width: 0%"></div>
                        <div class="skill-score" id="emotionControlScore">0</div>
                    </div>
                </div>

                <div class="skill-item">
                    <div class="skill-label">思いやり</div>
                    <div class="skill-bar-container">
                        <div class="skill-bar" id="empathyBar" style="width: 0%"></div>
                        <div class="skill-score" id="empathyScore">0</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- メニューボタン（触ってません） -->
        <a href="${pageContext.request.contextPath}/simulation">
            <button id="menuButton" class="menu-button">
                <span class="menu-icon">|||</span>
            </button>
        </a>

        <!-- キャラクター画像 --(触ってません)-->
        <div class="character-container">
            <img src="images/kaiwanavi-chara.png" alt="AIキャラ" class="character-image">
        </div>

        <!-- 🟦 ユーザー発話（transcript） -->
        <div class="user-message-box" id="userMessageBox">
            <div class="user-name">あなた</div>
            <div class="user-content" id="transcript">...</div>
        </div>

        <!-- 🟩 AI 応答（reply） -->
        <div class="message-box">
            <div class="speaker-name" id="speakerName">AI</div>
            <div class="message-content" id="reply">
                会話を開始してください...
            </div>
        </div>

        <!-- 🎙 録音ボタン -->
        <div class="recording-controls">
            <button class="record-btn start" onclick="chatInterface.startRecording()">🎙️ 録音開始</button>
            <button class="record-btn stop" onclick="chatInterface.stopRecording()">■ 停止</button>
        </div>

        <!-- 追加: 音声認識結果の確認画面 -->
        <div class="transcription-confirmation" id="transcriptionConfirmation" style="display: none;">
            <div class="confirmation-overlay" onclick="chatInterface.confirmTranscription()"></div>
            <div class="confirmation-box">
                <h3>発話内容を確認してください</h3>
                <div class="confirmed-text" id="confirmedText"></div>
                <div class="confirmation-actions">
                    <button class="confirm-btn retry" onclick="chatInterface.retryRecording()">🎙️ 録音し直す</button>
                    <button class="confirm-btn submit" onclick="chatInterface.confirmTranscription()">✓ OK!（クリックで送信）</button>
                </div>
                <p class="confirm-hint">画面のどこでもクリックで送信できます</p>
            </div>
        </div>

    </div>

    <script src="js/simulation.js"></script>
</body>
</html>
