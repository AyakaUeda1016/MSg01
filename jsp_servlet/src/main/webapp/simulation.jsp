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
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/simulation.css">
</head>
<body>

    <!-- ★ VoiceVox ローディングオーバーレイ ★ -->
    <div id="voicevoxOverlay">
        <div class="loading-wrapper">
            <div class="loading-icon"></div>
            <div class="loading-text" id="loadingText">読み込み中...</div>
        </div>
    </div>

    <!-- 背景 -->
    <div class="background-container">
        <img src="${pageContext.request.contextPath}/images/room.png" alt="背景" class="background-image">
    </div>

    <div class="main-content">

        <!-- 🧭 ラリーカウンター -->
        <div class="rally-counter">
            <div class="compass-container">
                <div class="compass-icon"></div>

                <div class="rally-numbers">
                    <span id="turn" class="current-rally">0</span>
                    <span class="rally-separator"> </span>
                    <span id="max_turns" class="max-rally">6</span>
                </div>
            </div>
        </div>

        <!-- スコアメーター（★新スキル構成に対応） -->
        <div class="score-meter-container">
            <!-- 総合スコア＆ランク -->
            <div class="total-score-display">
                <div class="rank-badge" id="rankBadge">-</div>
                <div class="total-score-value">
                    <span id="totalScore">0.0</span>
                    <span class="score-unit">pts</span>
                </div>
                <div class="rank-label">予測ランク</div>
            </div>

            <!-- 5つのスキルバー（新ラベル＆ID） -->
            <div class="skill-bars">
                <div class="skill-item">
                    <div class="skill-label">自己理解</div>
                    <div class="skill-bar-container">
                        <div class="skill-bar" id="selfUnderstandingMeter" style="width: 0%"></div>
                        <div class="skill-score" id="selfUnderstandingScore">0.0</div>
                    </div>
                </div>

                <div class="skill-item">
                    <div class="skill-label">読写力</div>
                    <div class="skill-bar-container">
                        <div class="skill-bar" id="readingWritingMeter" style="width: 0%"></div>
                        <div class="skill-score" id="readingWritingScore">0.0</div>
                    </div>
                </div>

                <div class="skill-item">
                    <div class="skill-label">理解力</div>
                    <div class="skill-bar-container">
                        <div class="skill-bar" id="comprehensionMeter" style="width: 0%"></div>
                        <div class="skill-score" id="comprehensionScore">0.0</div>
                    </div>
                </div>

                <div class="skill-item">
                    <div class="skill-label">感情判断</div>
                    <div class="skill-bar-container">
                        <div class="skill-bar" id="emotionJudgmentMeter" style="width: 0%"></div>
                        <div class="skill-score" id="emotionJudgmentScore">0.0</div>
                    </div>
                </div>

                <div class="skill-item">
                    <div class="skill-label">思いやり</div>
                    <div class="skill-bar-container">
                        <div class="skill-bar" id="empathyMeter" style="width: 0%"></div>
                        <div class="skill-score" id="empathyScore">0.0</div>
                    </div>
                </div>
            </div>
        </div>

        <!-- メニューボタン -->
        <a href="${pageContext.request.contextPath}/simulation">
            <button id="menuButton" class="menu-button">
                <span class="menu-icon">|||</span>
            </button>
        </a>

        <!-- キャラクター画像（表情差分対応用に id を付与） -->
        <div class="character-container" id="characterContainer">
            <img src="${pageContext.request.contextPath}/images/kaiwanavi-chara.png" alt="AIキャラ" class="character-image">
        </div>

        <!-- 🟦 ユーザー発話（UI上はCSSで非表示） -->
        <div class="user-message-box" id="userMessageBox">
            <div class="user-name">あなた</div>
            <div class="user-content" id="transcript">...</div>
        </div>

        <!-- 🟩 AI 応答（大本の木枠メッセージ） -->
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

        <!-- 音声認識結果の確認画面 -->
        <div class="transcription-confirmation" id="transcriptionConfirmation" style="display: none;">
            <!-- 画面どこでもクリックで送信（大本の挙動を維持） -->
            <div class="confirmation-overlay" onclick="chatInterface.confirmTranscription()"></div>
            <div class="confirmation-box">
                <h3>発話内容を確認してください</h3>
                <textarea class="confirmed-text" id="confirmedText"
                          style="width: 100%; height: 120px; font-size: 18px; padding: 10px;"></textarea>

                <div class="confirmation-actions">
                    <button class="confirm-btn retry" onclick="chatInterface.retryRecording()">🎙️ 録音し直す</button>
                    <button class="confirm-btn submit" onclick="chatInterface.confirmTranscription()">✓ OK!（クリックで送信）</button>
                </div>
                <p class="confirm-hint">画面のどこでもクリックで送信できます</p>
            </div>
        </div>

        <!-- 結果保存用の隠しフォーム（新機能） -->
        <form id="resultForm" action="${pageContext.request.contextPath}/simulation" method="post" style="display: none;">
            <input type="hidden" name="action" value="save_result">
            <input type="hidden" name="member_id" id="memberId" value="1">
            <input type="hidden" name="scenario_id" id="scenarioId" value="1">
            <input type="hidden" name="result_data" id="resultData">
            <input type="hidden" name="conversation_log" id="conversationLog">
        </form>
    </div>

    <!-- contextPath を JS に渡す -->
    <script>
        window.contextPath = "${pageContext.request.contextPath}";
        // 必要ならサーブレット側で window.scenarioId を埋める形にしてもOK
        // window.scenarioId = 1;
    </script>
    <script src="${pageContext.request.contextPath}/js/simulation.js"></script>
</body>
</html>
