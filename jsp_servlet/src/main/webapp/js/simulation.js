//------------------------------------------------------
// WebM録音 → Flask API → Whisper/GPT/VoiceVox の処理
//------------------------------------------------------

// 🔵 ローディング表示・非表示
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
let MAX_TURNS = 10;

let lastAudioBlob = null;
let pendingResult = null;
let conversationHistory = [];

// スキルスコア（0〜10）
let skillScores = {
  selfUnderstanding: 0.0,
  readingWriting: 0.0,
  comprehension: 0.0,
  emotionJudgment: 0.0,
  empathy: 0.0,
};

// DOM 要素
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
// キャラクター設定（必要ならDB化可能）
//======================================================
const characterConfig = {
  1: {
    name: "男子生徒",
    emotions: {
      default: "boy_standard.png",
      happy: "boy_smile.png",
      smile: "boy_smile.png",
      neutral: "boy_standard2.png",
      sad: "boy_tired.png",
      tired: "boy_tired.png",
      worried: "boy_concerns.png",
      angry: "boy_angry.png",
    },
  },
  2: {
    name: "先生",
    emotions: {
      default: "Teacher_standard.png",
      happy: "Teacher_smile.png",
      smile: "Teacher_smile.png",
      neutral: "Teacher_peace.png",
      sad: "Teacher_standard.png",
      worried: "Teacher_standard.png",
      angry: "Teacher_angry.png",
    },
  },
  3: {
    name: "女子生徒",
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
// 表情推定：openSMILE emotion_features ベース
//======================================================
function estimateEmotionFromOpenSmile(values) {
  if (!values) return "neutral";

  const v = values.valence ?? 0.5;
  const a = values.arousal ?? 0.5;
  const p = values.pitch_variability ?? 0.5;
  const s = values.voice_stability ?? 0.5;

  // ---- 優先順位で判定 ----
  if (v > 0.65 && a > 0.55) return "happy";
  if (v < 0.35 && a < 0.45) return "sad";
  if (p > 0.70 && a > 0.50) return "angry";
  if (s < 0.45 || (v < 0.5 && a < 0.5)) return "worried";

  return "neutral";
}

//======================================================
// キャラ画像更新
//======================================================
function updateCharacterImage(emotion) {
  if (!currentCharacter || !characterContainer) return;

  const emotionKey = emotion.toLowerCase();
  const fileName = currentCharacter.emotions[emotionKey] || currentCharacter.emotions.default;
  const img = characterContainer.querySelector(".character-image");

  if (img) {
    // JSP 側で contextPath をグローバルに埋め込んでいる前提
    img.src = `${window.contextPath}/images/${fileName}`;
  }
}

//======================================================
// 録音 UI
//======================================================
function setRecordingEnabled(enabled) {
  const startBtn = document.querySelector(".record-btn.start");
  const stopBtn = document.querySelector(".record-btn.stop");
  if (startBtn) startBtn.disabled = !enabled;
  if (stopBtn) stopBtn.disabled = !enabled;
}

function updateRecordingStatus(recording) {
  const startBtn = document.querySelector(".record-btn.start");
  if (!startBtn) return;
  startBtn.textContent = recording ? "🎙️録音中…" : "🎙️録音開始";
}

//======================================================
// 録音処理
//======================================================
async function startRecording() {
  try {
    console.log("録音開始ボタン反応OK");
    if (mediaRecorder && mediaRecorder.state === "recording") {
      console.log("[REC] already recording, ignore");
      return;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      console.log("音声データ処理へ移行");
      stream.getTracks().forEach((t) => t.stop());
      lastAudioBlob = new Blob(audioChunks, { type: "audio/webm" });

      // 🔵 プレビュー用：Whisper 文字起こし
      const preview = await sendPreviewToFlask(lastAudioBlob);
      if (preview) {
        console.log("[PREVIEW] received:", preview);
        showTranscriptionConfirmation(preview);
      } else {
        console.warn("[PREVIEW] failed to get preview");
      }
    };

    mediaRecorder.start();
    updateRecordingStatus(true);
    console.log("録音開始");
  } catch (err) {
    console.error("[REC] startRecording error:", err);
  }
}

async function stopRecording() {
  console.log("録音停止");
  if (mediaRecorder?.state === "recording") {
    mediaRecorder.stop();
    updateRecordingStatus(false);
    console.log("[REC] mediaRecorder stopped");
  }
}

//======================================================
// プレビューAPI（Whisper文字起こし）
//======================================================
async function sendPreviewToFlask(blob) {
  console.log("Flaskへプレビュー送信");
  showVoicevoxLoading();
  setLoadingMessage("音声を分析中...（文字起こし中）");

  const fd = new FormData();
  fd.append("file", blob, "audio.webm");

  try {
    const res = await fetch("http://127.0.0.1:5000/api/transcribe_preview", {
      method: "POST",
      body: fd,
    });

    hideVoicevoxLoading();

    if (!res.ok) {
      console.error("[PREVIEW] response not ok:", res.status);
      return null;
    }
    return res.json();
  } catch (err) {
    hideVoicevoxLoading();
    console.error("[PREVIEW] fetch error:", err);
    return null;
  }
}

//======================================================
// 本番API（会話処理 / GPT + openSMILE + VoiceVox）
//======================================================
async function sendAudioToFlask(blob, text) {
  console.log("[CONV] Sending audio to conversation API...");
  const fd = new FormData();
  fd.append("file", blob, "audio.webm");
  if (text) fd.append("manual_transcript", text);

  try {
    const res = await fetch("http://127.0.0.1:5000/api/conversation", {
      method: "POST",
      body: fd,
    });

    if (!res.ok) {
      console.error("[CONV] response not ok:", res.status);
      return null;
    }
    return res.json();
  } catch (err) {
    console.error("[CONV] fetch error:", err);
    return null;
  }
}

//======================================================
// 緊張度計算（0〜100）
//======================================================
function calculateTensionLevel(emotion, turn) {
  const v = emotion.valence ?? 0.5;
  const p = emotion.pitch_variability ?? 0.5;
  const s = emotion.voice_stability ?? 0.5;

  const base =
    (1 - v) * 0.4 +
    p * 0.3 +
    (1 - s) * 0.3;

  return Math.min(100, Math.floor((base + turn * 0.05) * 100));
}

//======================================================
// スキルスコア計算（Python側で無い場合の補完）
//======================================================
function normalize10(v) {
  return Math.max(0, Math.min(10, Number(v.toFixed(1))));
}

function calculateSkillScoresAdvanced(result) {
  const emotion = result.emotion || {};
  const transcript = result.transcript || "";
  const turn = result.turn || 0;
  const isRelated = result.is_related ? 1 : 0;

  const valence = emotion.valence ?? 0.5;
  const arousal = emotion.arousal ?? 0.5;
  const pitch = emotion.pitch_variability ?? 0.5;
  const stability = emotion.voice_stability ?? 0.5;

  const tension = calculateTensionLevel(emotion, turn);
  const tf = 1.0 - tension / 200;

  const empathyCount = ["ありがとう", "大丈夫", "すごい", "よかった"].filter(w =>
    transcript.includes(w)
  ).length;

  return {
    self_understanding: normalize10(valence * 5 + turn * 0.3),
    reading_writing: normalize10(transcript.length / 20 + turn * 0.4),
    comprehension: normalize10(isRelated * 8 + stability * 2),
    emotion_judgment: normalize10(arousal * 4 + pitch * 4 + (1 - tf) * 2),
    empathy: normalize10(valence * 6 + empathyCount * 2 + turn * 0.5),
  };
}

//======================================================
// UI更新（🔥ここが毎ターンの要）
//======================================================
function updateDisplayFromFlask(result) {
  if (!result) return;
  console.log("[RESULT] from Flask:", result);

  // AIの返答テキスト
  if (replyElement) {
    replyElement.textContent = result.reply || "";
  }

  // ターン表示
  if (turnElement) {
    turnElement.textContent = result.turn;
  }

  // 会話ログ蓄積
  conversationHistory.push(result);

  // スキルスコア（Python側が出していなければJS側で推定）
  let scores = result.skill_scores || calculateSkillScoresAdvanced(result);
  updateSkillScoresDisplay(scores);

  // 感情に応じた表情更新
  const emotionKey = estimateEmotionFromOpenSmile(result.emotion);
  updateCharacterImage(emotionKey);

  // VoiceVox 音声再生（ある場合）
  if (result.voice_audio_url) {
    console.log("[VOICEVOX] Playing generated audio...");
    setLoadingMessage("音声を準備中...");
    showVoicevoxLoading();
    playAudio(result.voice_audio_url);
    // 簡易的に一定時間後にローディングを消す
    setTimeout(() => {
      hideVoicevoxLoading();
    }, 1500);
  }

  // 会話終了条件
  if (result.turn >= MAX_TURNS || result.active === false) {
    console.log("[SESSION] conversation finished, disabling recording...");
    setRecordingEnabled(false);

    setTimeout(() => {
      console.log("[SESSION] resetting Flask session...");
      fetch("http://127.0.0.1:5000/api/reset", { method: "POST" });
      saveConversationResult();
    }, 1000);
  }
}

//======================================================
// メーター表示
//======================================================
function updateSkillScoresDisplay(scores) {
  skillScores = {
    selfUnderstanding: Math.round(scores.self_understanding),
    readingWriting: Math.round(scores.reading_writing),
    comprehension: Math.round(scores.comprehension),
    emotionJudgment: Math.round(scores.emotion_judgment),
    empathy: Math.round(scores.empathy),
  };

  selfUnderstandingMeter.style.width = `${skillScores.selfUnderstanding * 10}%`;
  selfUnderstandingScore.textContent = skillScores.selfUnderstanding;

  readingWritingMeter.style.width = `${skillScores.readingWriting * 10}%`;
  readingWritingScore.textContent = skillScores.readingWriting;

  comprehensionMeter.style.width = `${skillScores.comprehension * 10}%`;
  comprehensionScore.textContent = skillScores.comprehension;

  emotionJudgmentMeter.style.width = `${skillScores.emotionJudgment * 10}%`;
  emotionJudgmentScore.textContent = skillScores.emotionJudgment;

  empathyMeter.style.width = `${skillScores.empathy * 10}%`;
  empathyScore.textContent = skillScores.empathy;

  updateTotalScore();
}

//======================================================
// 総合スコア・ランク
//======================================================
function updateTotalScore() {
  const sum = Object.values(skillScores).reduce((a, b) => a + b, 0);
  const avg = sum / 5;  // 0〜10 の範囲

  const pts = avg.toFixed(1); // 10点満点方式
  totalScoreElement.textContent = pts;

  const rank =
    avg >= 8 ? "S" :
    avg >= 6 ? "A" :
    avg >= 4 ? "B" : "C";

  rankBadgeElement.textContent = rank;
}

//======================================================
// 音声再生
//======================================================
function playAudio(url) {
  const finalUrl = url.startsWith("http")
    ? url
    : `http://127.0.0.1:5000${url}`;

  console.log("[AUDIO] play:", finalUrl);
  const audio = new Audio(finalUrl);
  audio.play().catch(err => {
    console.error("[AUDIO] play error:", err);
  });
}

//======================================================
// プレビュー確認画面
//======================================================
function showTranscriptionConfirmation(preview) {
  pendingResult = preview;
  confirmedText.value = preview.transcript || "";
  transcriptionConfirmation.style.display = "flex";
}

//======================================================
// 確認 → 本番送信
//======================================================
async function confirmTranscription() {
  transcriptionConfirmation.style.display = "none";
  console.log("[CONFIRM] Sending final audio to Flask...");
  showVoicevoxLoading();
  setLoadingMessage("AI応答を生成中...");

  const result = await sendAudioToFlask(lastAudioBlob, confirmedText.value);

  hideVoicevoxLoading();

  if (result) {
    updateDisplayFromFlask(result);
  } else {
    console.error("[CONFIRM] result is null");
  }
}

//======================================================
// 結果保存（JSPへPOST）
//======================================================
async function saveConversationResult() {
  console.log("[SAVE] saving conversation result to JSP form...");
  const resultData = {
    total_score: Number(totalScoreElement.textContent),
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
  console.log("JS初期ロード成功");
  showVoicevoxLoading();
  setRecordingEnabled(true);

  // ユーザーメッセージボックスは非表示（仕様）
  if (userMessageBox) {
    userMessageBox.style.display = "none";
  }

  // シナリオ取得
  fetch("http://127.0.0.1:5000/api/current_scenario")
    .then(res => {
      if (!res.ok) {
        console.error("[INIT] scenario fetch not ok:", res.status);
      }
      return res.json();
    })
    .then(data => {
      console.log("Flaskからシナリオ情報取得成功", data);
      currentScenarioId = data.scenario_id || 1;
      MAX_TURNS = data.max_turns || 6;

      if (maxTurnsElement) {
        maxTurnsElement.textContent = MAX_TURNS;
      }

      currentCharacter = characterConfig[currentScenarioId] || characterConfig[1];
      updateCharacterImage("default");
    })
    .catch(err => {
      console.error("[INIT] scenario fetch error:", err);
    })
    .finally(() => {
      hideVoicevoxLoading();
    });
});

//======================================================
// グローバル公開
//======================================================
window.chatInterface = {
  startRecording,
  stopRecording,
  confirmTranscription,
};
