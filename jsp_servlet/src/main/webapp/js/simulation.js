//------------------------------------------------------
// WebM録音 → Flask API → Whisper/GPT/VoiceVox の処理
//------------------------------------------------------

let mediaRecorder = null;
let audioChunks = [];
let MAX_TURNS = n;

// DOM 要素
const turnElement = document.getElementById("turn");
const maxTurnsElement = document.getElementById("max_turns");
const transcriptElement = document.getElementById("transcript");
const replyElement = document.getElementById("reply");
const userMessageBox = document.getElementById("userMessageBox");

//======================================================
// 録音開始
//======================================================
async function startRecording() {
  console.log("[REC] 録音開始");

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioChunks = [];
  mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
  mediaRecorder.start();
}

//======================================================
// 録音停止 → Flaskへ送信
//======================================================
async function stopRecording() {
  if (!mediaRecorder) return;

  console.log("[REC] 録音停止");
  mediaRecorder.stop();

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" });
    const result = await sendAudioToFlask(blob);
    console.log("[FLASK RESPONSE]", result);
    updateDisplayFromFlask(result);
  };
}

//======================================================
// Flask へ WebM を送信
//======================================================
async function sendAudioToFlask(blob) {
  const formData = new FormData();
  formData.append("file", blob, "audio.webm");

  const response = await fetch("http://127.0.0.1:5000/api/conversation", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    console.error("[API ERROR]", await response.text());
    return null;
  }

  return await response.json();
}

//======================================================
// UI に結果を反映
//======================================================
function updateDisplayFromFlask(result) {
  if (!result) return;

  // transcript（ユーザー発話）
  transcriptElement.textContent = result.transcript;
  userMessageBox.style.display = "block";

  // reply（AI応答）
  replyElement.textContent = result.reply;

  // turn
  turnElement.textContent = result.turn;

  // VoiceVox音声再生
  if (result.voice_audio_url) {
    const audioUrl = "http://127.0.0.1:5000" + result.voice_audio_url;
    new Audio(audioUrl).play();
  }
}

//======================================================
// ページロード時：max_turns を取得
//======================================================
document.addEventListener("DOMContentLoaded", () => {
  fetch("http://127.0.0.1:5000/api/current_scenario")
    .then((res) => res.json())
    .then((data) => {
      MAX_TURNS = data.max_turns;
      maxTurnsElement.textContent = MAX_TURNS;
    });
});

//======================================================
window.chatInterface = {
  startRecording,
  stopRecording,
};
