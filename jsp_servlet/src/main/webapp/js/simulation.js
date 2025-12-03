//------------------------------------------------------
// WebM録音 → Whisperプレビュー → 固定応答 + VoiceVox音声
//------------------------------------------------------

// 🔵 ローディング表示
function showVoicevoxLoading() {
  const overlay = document.getElementById("voicevoxOverlay");
  if (overlay) overlay.style.display = "flex";
}
function hideVoicevoxLoading() {
  const overlay = document.getElementById("voicevoxOverlay");
  if (overlay) overlay.style.display = "none";
}
function setLoadingMessage(text) {
  const elem = document.querySelector("#voicevoxOverlay .loading-text");
  if (elem) elem.textContent = text;
}

//------------------------------------------------------
// グローバル状態
//------------------------------------------------------
let mediaRecorder = null;
let audioChunks = [];
let MAX_TURNS = 6;

let lastAudioBlob = null;
let pendingResult = null;
let conversationHistory = [];

let skillScores = {
  selfUnderstanding: 0,
  readingWriting: 0,
  comprehension: 0,
  emotionJudgment: 0,
  empathy: 0,
};

// DOM
const turnElement = document.getElementById("turn");
const maxTurnsElement = document.getElementById("max_turns");
const replyElement = document.getElementById("reply");

const totalScoreElement = document.getElementById("totalScore");
const rankBadgeElement = document.getElementById("rankBadge");

const selfUnderstandingMeter = document.getElementById("selfUnderstandingMeter");
const selfUnderstandingScore = document.getElementById("selfUnderstandingScore");
const readingWritingMeter = document.getElementById("readingWritingMeter");
const readingWritingScore = document.getElementById("readingWritingScore");
const comprehensionMeter = document.getElementById("comprehensionMeter");
const comprehensionScore = document.getElementById("comprehensionScore");
const emotionJudgmentMeter = document.getElementById("emotionJudgmentMeter");
const emotionJudgmentScore = document.getElementById("emotionJudgmentScore");
const empathyMeter = document.getElementById("empathyMeter");
const empathyScore = document.getElementById("empathyScore");

const transcriptionConfirmation = document.getElementById("transcriptionConfirmation");
const confirmedText = document.getElementById("confirmedText");
const userMessageBox = document.getElementById("userMessageBox");

const characterContainer = document.getElementById("characterContainer");

const resultForm = document.getElementById("resultForm");
const resultDataInput = document.getElementById("resultData");
const conversationLogInput = document.getElementById("conversationLog");
const memberIdInput = document.getElementById("memberId");
const scenarioIdInput = document.getElementById("scenarioId");

let currentScenarioId = 1;
let currentCharacter = null;

//======================================================
// 固定応答（6ターン）
//======================================================
const fixedReplies = [
  "うん、いいよ！よろしくね。",
  "私の名前は橘 陽葵（ひまり）だよ。",
  "私の趣味は写真撮影かな。綺麗な景色を見ると落ち着くから、それをいつでも見返せるよう写真に収めていく内に趣味になったんだ。",
  "好きな食べ物はね～う～んグミかな。特にハリボーのグミが好きなんだ。",
  "私が所属してる部活は写真部だよ。写真を撮るのが好きだからね。",
  "それであってるよ！それじゃあまた休み時間とかに話そうね。またね！"
];

//======================================================
// キャラ画像設定
//======================================================
const characterConfig = {
  1: {
    emotions: {
      default: "girl_standard.png",
      happy: "girl_happy.png",
      smile: "girl_happy.png",
      neutral: "girl_standard.png",
      sad: "girl_sad.png",
      worried: "girl_sad.png",
      angry: "girl_angry.png",
    },
  },
};

//======================================================
// 表情推定（固定）
//======================================================
const fixedEmotions = [
  "neutral",
  "smile",
  "neutral",
  "neutral",
  "smile",
  "happy",
];

function updateCharacterImage(emotion) {
  if (!currentCharacter) return;

  const file = currentCharacter.emotions[emotion] || currentCharacter.emotions.default;
  const img = characterContainer.querySelector(".character-image");

  if (img) {
    img.src = `${window.contextPath}/images/${file}`;
  }
}

//======================================================
// 録音UI
//======================================================
function setRecordingEnabled(enabled) {
  const startBtn = document.querySelector(".record-btn.start");
  const stopBtn = document.querySelector(".record-btn.stop");
  if (startBtn) startBtn.disabled = !enabled;
  if (stopBtn) stopBtn.disabled = !enabled;
}
function updateRecordingStatus(isRec) {
  const startBtn = document.querySelector(".record-btn.start");
  if (startBtn) startBtn.textContent = isRec ? "🎙️録音中…" : "🎙️録音開始";
}

//======================================================
// 録音処理
//======================================================
async function startRecording() {
  const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
  audioChunks = [];
  mediaRecorder = new MediaRecorder(stream);

  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);
  mediaRecorder.onstop = async () => {
    stream.getTracks().forEach(t => t.stop());
    lastAudioBlob = new Blob(audioChunks, { type: "audio/webm" });

    const preview = await sendPreviewToFlask(lastAudioBlob);
    if (preview) showTranscriptionConfirmation(preview);
  };

  mediaRecorder.start();
  updateRecordingStatus(true);
}
function stopRecording() {
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
    updateRecordingStatus(false);
  }
}

//======================================================
// プレビュー：Whisper
//======================================================
async function sendPreviewToFlask(blob) {
  showVoicevoxLoading();
  setLoadingMessage("音声を分析中...");

  const fd = new FormData();
  fd.append("file", blob, "audio.webm");

  try {
    const res = await fetch("http://127.0.0.1:5000/api/transcribe_preview", {
      method: "POST",
      body: fd,
    });
    hideVoicevoxLoading();
    if (!res.ok) return null;
    return res.json();
  } catch {
    hideVoicevoxLoading();
    return null;
  }
}

//======================================================
// 固定応答生成
//======================================================
let localTurn = 0;

function buildLocalResult(userText) {
  localTurn = Math.min(localTurn + 1, MAX_TURNS);
  const reply = fixedReplies[localTurn - 1] || "ありがとう！";

  return {
    transcript: userText,
    reply,
    emotion: { label: fixedEmotions[localTurn - 1] || "neutral" },
    turn: localTurn,
    active: localTurn < MAX_TURNS,
    timestamp: new Date().toISOString(),
  };
}

//======================================================
// 🔊 VoiceVox 音声生成 リクエスト
//======================================================
async function requestVoicevoxForText(text) {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/tts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text }),
    });
    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}

//======================================================
// UI更新
//======================================================
function updateDisplayFromFlask(result) {
  replyElement.textContent = result.reply;
  turnElement.textContent = result.turn;

  const emotion = result.emotion?.label || "neutral";
  updateCharacterImage(emotion);

  conversationHistory.push(result);

  if (result.voice_audio_url) playAudio(result.voice_audio_url);

  if (!result.active) {
    setRecordingEnabled(false);
    setTimeout(() => {
      fetch("http://127.0.0.1:5000/api/reset", { method: "POST" });
      saveConversationResult();
    }, 1000);
  }
}

//======================================================
// 音声再生
//======================================================
function playAudio(url) {
  const finalUrl = url.startsWith("http")
    ? url
    : `http://127.0.0.1:5000${url}`;
  new Audio(finalUrl).play();
}

//======================================================
// プレビュー確認後
//======================================================
async function confirmTranscription() {
  transcriptionConfirmation.style.display = "none";

  showVoicevoxLoading();
  setLoadingMessage("返信生成中...");

  const result = buildLocalResult(confirmedText.value);

  if (result.reply) {
    const ttsRes = await requestVoicevoxForText(result.reply);
    if (ttsRes) {
      result.voice_audio_url = ttsRes.voice_audio_url;
    }
  }

  hideVoicevoxLoading();
  updateDisplayFromFlask(result);
}

//======================================================
// 結果保存
//======================================================
function saveConversationResult() {
  const resultData = {
    total_score: 10,
    skill_scores: skillScores,
    final_turn: conversationHistory.length,
    member_id: memberIdInput?.value || 1,
    scenario_id: scenarioIdInput?.value || currentScenarioId,
  };
  resultDataInput.value = JSON.stringify(resultData);
  conversationLogInput.value = JSON.stringify(conversationHistory);

  resultForm.submit();
}

//======================================================
// 初期化
//======================================================
document.addEventListener("DOMContentLoaded", () => {
  setRecordingEnabled(true);
  userMessageBox.style.display = "none";

  fetch("http://127.0.0.1:5000/api/current_scenario")
    .then(res => res.json())
    .then(data => {
      MAX_TURNS = 6;
      maxTurnsElement.textContent = MAX_TURNS;
      currentCharacter = characterConfig[1];
      updateCharacterImage("default");
    });
});

//======================================================
// 公開
//======================================================
window.chatInterface = {
  startRecording,
  stopRecording,
  confirmTranscription,
};
