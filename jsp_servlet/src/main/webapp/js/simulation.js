//------------------------------------------------------
// WebM録音 → Flask API → Whisper/GPT/VoiceVox の処理
//------------------------------------------------------

let mediaRecorder = null;
let audioChunks = [];
let MAX_TURNS = 10;

let lastAudioBlob = null;          // プレビュー後に本番送信するため保存
let pendingResult = null;          // プレビュー結果保存

// DOM 要素
const turnElement = document.getElementById("turn");
const maxTurnsElement = document.getElementById("max_turns");

const transcriptElement = document.getElementById("transcript");  // 使うが表示しない
const userMessageBox = document.getElementById("userMessageBox"); // 完全非表示

const replyElement = document.getElementById("reply");

const totalScoreElement = document.getElementById("totalScore");
const rankBadgeElement = document.getElementById("rankBadge");

const selfUnderstandingBar = document.getElementById("selfUnderstandingBar");
const selfUnderstandingScore = document.getElementById("selfUnderstandingScore");
const speakingBar = document.getElementById("speakingBar");
const speakingScore = document.getElementById("speakingScore");
const comprehensionBar = document.getElementById("comprehensionBar");
const comprehensionScore = document.getElementById("comprehensionScore");
const emotionControlBar = document.getElementById("emotionControlBar");
const emotionControlScore = document.getElementById("emotionControlScore");
const empathyBar = document.getElementById("empathyBar");
const empathyScore = document.getElementById("empathyScore");

const transcriptionConfirmation = document.getElementById("transcriptionConfirmation");
const confirmedText = document.getElementById("confirmedText");

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
// 録音停止 → WhisperプレビューAPI
//======================================================
async function stopRecording() {
  if (!mediaRecorder) return;

  console.log("[REC] 録音停止");
  mediaRecorder.stop();

  mediaRecorder.onstop = async () => {
    lastAudioBlob = new Blob(audioChunks, { type: "audio/webm" });

    const preview = await sendPreviewToFlask(lastAudioBlob);
    console.log("[PREVIEW RESPONSE]", preview);

    if (preview && preview.transcript) {
      showTranscriptionConfirmation(preview);
    }
  };
}

//======================================================
// WhisperプレビューAPI
//======================================================
async function sendPreviewToFlask(blob) {
  const formData = new FormData();
  formData.append("file", blob, "audio.webm");

  const res = await fetch("http://127.0.0.1:5000/api/transcribe_preview", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    console.error("[PREVIEW ERROR]", await res.text());
    return null;
  }
  return await res.json();
}

//======================================================
// 本番 conversation API
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
// スコアランク
//======================================================
function getRankFromScore(score) {
  if (score >= 40) return { rank: "S", color: "#ffd700" };
  if (score >= 30) return { rank: "A", color: "#c0c0c0" };
  if (score >= 20) return { rank: "B", color: "#cd7f32" };
  return { rank: "C", color: "#8b8b8b" };
}

//======================================================
// スコア計算
//======================================================
function calculateSkillScores(features) {
  const selfUnderstanding = (features.arousal >= 0.7) ? 10 : 5;
  const speaking = (features.pitch_variability >= 0.7) ? 10 : 5;
  const comprehension = (features.valence >= 0.6) ? 10 : 5;
  const emotionControl = (features.voice_stability >= 0.6) ? 10 : 5;
  const empathy = (features.warmth >= 0.5) ? 10 : 5;

  return {
    self_understanding: selfUnderstanding,
    speaking: speaking,
    comprehension: comprehension,
    emotion_control: emotionControl,
    empathy: empathy,
    total_score: selfUnderstanding + speaking + comprehension + emotionControl + empathy
  };
}

//======================================================
// スコア反映
//======================================================
function updateScoreMeter(scores) {
  if (!scores) return;

  const toPercent = (v) => (v / 10) * 100; // 10が最大スコアと仮定

  selfUnderstandingBar.style.width = toPercent(scores.self_understanding) + "%";
  speakingBar.style.width = toPercent(scores.speaking) + "%";
  comprehensionBar.style.width = toPercent(scores.comprehension) + "%";
  emotionControlBar.style.width = toPercent(scores.emotion_control) + "%";
  empathyBar.style.width = toPercent(scores.empathy) + "%";

  selfUnderstandingScore.textContent = Math.round(scores.self_understanding);
  speakingScore.textContent = Math.round(scores.speaking);
  comprehensionScore.textContent = Math.round(scores.comprehension);
  emotionControlScore.textContent = Math.round(scores.emotion_control);
  empathyScore.textContent = Math.round(scores.empathy);

  totalScoreElement.textContent = Math.round(scores.total_score);

  const rankInfo = getRankFromScore(scores.total_score);
  rankBadgeElement.textContent = rankInfo.rank;
  rankBadgeElement.style.background = rankInfo.color;
}

//======================================================
// 画面更新（ユーザー発話は非表示）
//======================================================
async function updateDisplayFromFlask(result) {
  if (!result) return;

  // 自分の発話は UI に一切表示しない
  transcriptElement.textContent = "";
  userMessageBox.style.display = "none";

  // AI の返答だけ表示
  replyElement.textContent = result.reply;

  // ターン
  turnElement.textContent = result.turn;

  // スコア計算（音声特徴量からスコアを計算）
  const scores = calculateSkillScores(result.emotion);

  // スコアの反映
  updateScoreMeter(scores);

  // VoiceVox 再生
  if (result.voice_audio_url) {
    const audioUrl = "http://127.0.0.1:5000" + result.voice_audio_url;
    new Audio(audioUrl).play();
  }
}

//======================================================
// プレビュー画面表示
//======================================================
function showTranscriptionConfirmation(preview) {
  pendingResult = preview;
  confirmedText.textContent = preview.transcript;
  transcriptionConfirmation.style.display = "flex";
}

//======================================================
// OK → 本番送信
//======================================================
async function confirmTranscription() {
  transcriptionConfirmation.style.display = "none";

  if (!lastAudioBlob) return;

  const result = await sendAudioToFlask(lastAudioBlob);
  updateDisplayFromFlask(result);

  pendingResult = null;
}

//======================================================
// NG → 再録音
//======================================================
function retryRecording() {
  transcriptionConfirmation.style.display = "none";
  pendingResult = null;
  lastAudioBlob = null;

  startRecording();
}

//======================================================
// シナリオ情報取得
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
  confirmTranscription,
  retryRecording,
};
