//------------------------------------------------------
// WebM録音 → Flask API → Whisper/GPT/VoiceVox の処理
//------------------------------------------------------

let mediaRecorder = null
let audioChunks = []
let MAX_TURNS = 10 // Declare the variable n here

// DOM 要素
const turnElement = document.getElementById("turn")
const maxTurnsElement = document.getElementById("max_turns")
const transcriptElement = document.getElementById("transcript")
const replyElement = document.getElementById("reply")
const userMessageBox = document.getElementById("userMessageBox")

const totalScoreElement = document.getElementById("totalScore")
const rankBadgeElement = document.getElementById("rankBadge")
const selfUnderstandingBar = document.getElementById("selfUnderstandingBar")
const selfUnderstandingScore = document.getElementById("selfUnderstandingScore")
const speakingBar = document.getElementById("speakingBar")
const speakingScore = document.getElementById("speakingScore")
const comprehensionBar = document.getElementById("comprehensionBar")
const comprehensionScore = document.getElementById("comprehensionScore")
const emotionControlBar = document.getElementById("emotionControlBar")
const emotionControlScore = document.getElementById("emotionControlScore")
const empathyBar = document.getElementById("empathyBar")
const empathyScore = document.getElementById("empathyScore")

const transcriptionConfirmation = document.getElementById("transcriptionConfirmation")
const confirmedText = document.getElementById("confirmedText")
const pendingTranscription = null
let pendingResult = null

//======================================================
// 録音開始
//======================================================
async function startRecording() {
  console.log("[REC] 録音開始")

  const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
  audioChunks = []
  mediaRecorder = new MediaRecorder(stream, { mimeType: "audio/webm" })
  mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data)
  mediaRecorder.start()
}

//======================================================
// 録音停止 → Flaskへ送信
//======================================================
async function stopRecording() {
  if (!mediaRecorder) return

  console.log("[REC] 録音停止")
  mediaRecorder.stop()

  mediaRecorder.onstop = async () => {
    const blob = new Blob(audioChunks, { type: "audio/webm" })
    const result = await sendAudioToFlask(blob)
    console.log("[FLASK RESPONSE]", result)

    if (result && result.transcript) {
      showTranscriptionConfirmation(result)
    }
  }
}

//======================================================
// Flask へ WebM を送信
//======================================================
async function sendAudioToFlask(blob) {
  const formData = new FormData()
  formData.append("file", blob, "audio.webm")

  const response = await fetch("http://127.0.0.1:5000/api/conversation", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    console.error("[API ERROR]", await response.text())
    return null
  }

  return await response.json()
}

//======================================================
//======================================================
function getRankFromScore(score) {
  if (score >= 40) return { rank: "S", color: "#ffd700" }
  if (score >= 30) return { rank: "A", color: "#c0c0c0" }
  if (score >= 20) return { rank: "B", color: "#cd7f32" }
  return { rank: "C", color: "#8b8b8b" }
}

//======================================================
//======================================================
function updateScoreMeter(scores) {
  if (!scores) return

  // 各スコアを取得（10点満点）
  const selfUnderstanding = scores.self_understanding?.score || 0
  const speaking = scores.speaking?.score || 0
  const comprehension = scores.comprehension?.score || 0
  const emotionControl = scores.emotion_control?.score || 0
  const empathy = scores.empathy?.score || 0
  const total = scores.total_score || 0

  // バーの幅を計算（10点満点を100%として表示）
  const toPercent = (score) => (score / 10) * 100

  // 自己理解
  selfUnderstandingBar.style.width = toPercent(selfUnderstanding) + "%"
  selfUnderstandingScore.textContent = Math.round(selfUnderstanding)

  // 話す力
  speakingBar.style.width = toPercent(speaking) + "%"
  speakingScore.textContent = Math.round(speaking)

  // 理解力
  comprehensionBar.style.width = toPercent(comprehension) + "%"
  comprehensionScore.textContent = Math.round(comprehension)

  // 感情制御
  emotionControlBar.style.width = toPercent(emotionControl) + "%"
  emotionControlScore.textContent = Math.round(emotionControl)

  // 思いやり
  empathyBar.style.width = toPercent(empathy) + "%"
  empathyScore.textContent = Math.round(empathy)

  // 総合スコアとランク（50点満点）
  totalScoreElement.textContent = Math.round(total)
  const rankInfo = getRankFromScore(total)
  rankBadgeElement.textContent = rankInfo.rank
  rankBadgeElement.style.background = rankInfo.color
}

//======================================================
// UI に結果を反映
//======================================================
function updateDisplayFromFlask(result) {
  if (!result) return

  // transcript（ユーザー発話）
  transcriptElement.textContent = result.transcript
  userMessageBox.style.display = "block"

  // reply（AI応答）
  replyElement.textContent = result.reply

  // turn
  turnElement.textContent = result.turn

  if (result.scores) {
    updateScoreMeter(result.scores)
  }

  // VoiceVox音声再生
  if (result.voice_audio_url) {
    const audioUrl = "http://127.0.0.1:5000" + result.voice_audio_url
    new Audio(audioUrl).play()
  }
}

//======================================================
// 音声認識結果の確認画面を表示
//======================================================
function showTranscriptionConfirmation(result) {
  pendingResult = result
  confirmedText.textContent = result.transcript
  transcriptionConfirmation.style.display = "flex"
}

//======================================================
// 確認後に送信
//======================================================
function confirmTranscription() {
  transcriptionConfirmation.style.display = "none"
  if (pendingResult) {
    updateDisplayFromFlask(pendingResult)
    pendingResult = null
  }
}

//======================================================
// 録音をやり直す
//======================================================
function retryRecording() {
  transcriptionConfirmation.style.display = "none"
  pendingResult = null
  // 自動的に録音を再開
  startRecording()
}

//======================================================
// ページロード時：max_turns を取得
//======================================================
document.addEventListener("DOMContentLoaded", () => {
  fetch("http://127.0.0.1:5000/api/current_scenario")
    .then((res) => res.json())
    .then((data) => {
      MAX_TURNS = data.max_turns
      maxTurnsElement.textContent = MAX_TURNS
    })
})

//======================================================
window.chatInterface = {
  startRecording,
  stopRecording,
  confirmTranscription, // 追加
  retryRecording, // 追加
}
