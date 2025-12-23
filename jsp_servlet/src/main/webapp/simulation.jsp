<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<!DOCTYPE html>
<html lang="ja">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>会話ナビ - AIチャットインターフェース</title>
    <link href="https://fonts.googleapis.com/css2?family=Murecho:wght@100..900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="${pageContext.request.contextPath}/css/simulation.css">
</head>

<body>
    <script>
        window.parent.postMessage({ page: "simulation" }, "*");
    </script>
    
    <div id="voicevoxOverlay" style="display: none;">
        <div class="loading-wrapper">
            <div class="loading-text" id="loadingText">読み込み中...</div>
        </div>
    </div>

    <div class="background-container">
        <img src="${pageContext.request.contextPath}/images/room.png" alt="背景" class="background-image">
    </div>

    <div class="main-content">
        <div id="rally-counter" class="rally-counter">
            <div class="compass-container">
                <div class="compass-icon"></div>
                <div class="rally-numbers">
                    <span id="turn" class="current-rally">0</span>
                    <span class="rally-separator"> </span>
                    <span id="max_turns" class="max-rally">6</span>
                </div>
            </div>
        </div>

        <div id="score-meter" class="score-meter-container">
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
                    <div class="skill-label">相手の感情</div>
                    <div class="skill-bar-container emotion-display">
                        <span id="emotionText">---</span>
                    </div>
                </div>
            </div>
        </div>

        <a href="${pageContext.request.contextPath}/simulation">
            <!--  <button id="menuButton" class="menu-button">
                <span class="menu-icon">|||</span>
            </button>-->
        </a>

        <div class="character-container" id="characterContainer">
            <img src="/placeholder.svg" alt="AIキャラ" class="character-image">
        </div>

        <div class="user-message-box" id="userMessageBox">
            <div class="user-name">あなた</div>
            <div class="user-content" id="transcript">...</div>
        </div>

        <div id="message-box" class="message-box">
            <div class="speaker-name" id="speakerName">AI</div>
            <div class="message-content" id="reply">
                会話を開始してください...
            </div>
        </div>

        <div id="recording-controls" class="recording-controls">
            <button class="record-btn start" onclick="chatInterface.startRecording()">
                <svg class="mic-icon" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 512 512" xml:space="preserve">
                    <g>
                        <path d="M388.428,223.259v36.189c-0.019,36.824-14.22,69.808-37.549,94.199
                            c-23.368,24.352-55.678,39.931-92.314,41.538c-0.318,0.02-0.606,0.1-0.913,0.129h-3.304c-0.307-0.03-0.596-0.109-0.912-0.129
                            c-36.636-1.607-68.946-17.186-92.315-41.538c-23.329-24.391-37.528-57.375-37.549-94.199v-36.189H82.927v36.189
                            c-0.019,47.422,18.486,90.647,48.842,122.311c26.574,27.775,62.386,46.808,102.633,52.444V512h43.185v-77.796
                            c40.259-5.636,76.071-24.669,102.644-52.444c30.355-31.664,48.861-74.889,48.841-122.311v-36.189H388.428z"/>
                        <path d="M259.3,363.363c-1.111,0-2.193-0.129-3.305-0.16c-1.101,0.03-2.182,0.16-3.294,0.16H259.3z"/>
                        <path d="M222.515,259.319h-68.241c0.556,56.432,45.586,102.128,101.721,103.884
                            c56.145-1.756,101.176-47.452,101.732-103.884h-68.242v-19.508h68.29v-36.636h-68.29v-19.508h68.29V147.03h-68.29v-19.508h68.29
                            V90.885h-68.29V71.376h67.953C354.046,31.396,320.585,0,279.732,0H232.27c-40.853,0-74.314,31.396-77.708,71.376h67.953v19.508
                            h-68.29v36.636h68.29v19.508h-68.29v36.636h68.29v19.508h-68.29v36.636h68.29V259.319z"/>
                    </g>
                </svg>
                録音開始
            </button>
            <button class="record-btn stop" onclick="chatInterface.stopRecording()">■ 停止</button>
        </div>
        
        <!-- 🎤 録音ガイド -->
		<div id="recordingGuide" class="recording-guide" style="display: none;">
		  録音中
		</div>

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

        <div id="tutorial-overlay" class="tutorial-overlay">
            <div id="tutorial-tooltip" class="tutorial-tooltip">
                <div class="tutorial-header">
                    <div id="tutorial-step" class="tutorial-step">1 / 6</div>
                    <button id="skip-tutorial" class="skip-tutorial-btn">スキップ</button>
                </div>
                <div id="tutorial-text" class="tutorial-text">
                    チュートリアルのテキストがここに表示されます</div>
            </div>
        </div>

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
    <script src="${pageContext.request.contextPath}/js/tutorial.js"></script>
</body>

</html>
