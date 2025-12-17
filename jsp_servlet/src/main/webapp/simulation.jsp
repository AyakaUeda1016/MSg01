<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
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
        <script>
            window.parent.postMessage({ page: "simulation" }, "*");
        </script>
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
                
                <!-- 3つのスキルバー（声メータ専用） -->
                <div class="skill-bars">

                    <div class="skill-item">
                        <div class="skill-label">声量</div>
                        <div class="skill-bar-container">
                            <div class="skill-bar" id="selfUnderstandingMeter" style="width: 0%"></div>
                            <div class="skill-score" id="selfUnderstandingScore">0</div>
                        </div>
                    </div>

                    <div class="skill-item">
                        <div class="skill-label">緊張度</div>
                        <div class="skill-bar-container">
                            <div class="skill-bar" id="comprehensionMeter" style="width: 0%"></div>
                            <div class="skill-score" id="comprehensionScore">0</div>
                        </div>
                    </div>


                    <div class="skill-item">
                        <div class="skill-label">思いやり</div>
                        <div class="skill-bar-container">
                            <div class="skill-bar" id="empathyMeter" style="width: 0%"></div>
                            <div class="skill-score" id="empathyScore">0</div>
                        </div>
                    </div>

                    <div class="skill-item">
                        <div class="skill-label">感情</div>
                        <div class="skill-bar-container emotion-display">
                            <span id="emotionText">---</span>
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

                <!-- キャラクター画像 -->
                <div class="character-container" id="characterContainer">
                    <img src="${pageContext.request.contextPath}/images/kaiwanavi-chara.png" alt="AIキャラ"
                        class="character-image">
                </div>

                <!-- 🟦 ユーザー発話 -->
                <div class="user-message-box" id="userMessageBox">
                    <div class="user-name">あなた</div>
                    <div class="user-content" id="transcript">...</div>
                </div>

                <!-- 🟩 AI 応答 -->
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
                    <div class="confirmation-overlay" onclick="chatInterface.confirmTranscription()"></div>
                    <div class="confirmation-box">
                        <h3>発話内容を確認してください</h3>
                        <textarea class="confirmed-text" id="confirmedText" readonly
                            style="width: 100%; height: 120px; font-size: 18px; padding: 10px;"></textarea>

                        <div class="confirmation-actions">
                            <button class="confirm-btn retry" onclick="chatInterface.retryRecording()">🎙️
                                録音し直す</button>
                            <button class="confirm-btn submit" onclick="chatInterface.confirmTranscription()">✓
                                OK!（クリックで送信）</button>
                        </div>
                        <p class="confirm-hint">画面のどこでもクリックで送信できます</p>
                    </div>
                </div>

                <!-- 結果保存フォーム -->
                <form id="resultForm" action="${pageContext.request.contextPath}/simulation" method="post"
                    style="display: none;">
                    <input type="hidden" name="action" value="save_result">
                    <input type="hidden" name="member_id" id="memberId" value="1">
                    <input type="hidden" name="scenario_id" id="scenarioId" value="1">
                    <input type="hidden" name="result_data" id="resultData">
                    <input type="hidden" name="conversation_log" id="conversationLog">
                </form>
            
        </div>
            <script>
                window.contextPath = "${pageContext.request.contextPath}";
            </script>
            <script src="${pageContext.request.contextPath}/js/simulation.js"></script>
    </body>

    </html>