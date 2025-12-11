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
function retryRecording() {
  console.log("[RETRY] 録音をやり直します");

  // 前回のプレビューをクリア
  confirmedText.value = "";
  document.getElementById("transcript").textContent = "...";

  // 確認画面を閉じる
  transcriptionConfirmation.style.display = "none";

  // 録音データのリセット
  audioChunks = [];
  lastAudioBlob = null;
  pendingResult = null;

  console.log("[RETRY] 状態リセット完了（再録可能）");
}


//======================================================
// VoiceVox用：現在再生中の音声を停止可能に
//======================================================
let currentAudios = [];
function stopAllAudio() {
  currentAudios.forEach(a => {
    a.pause();
    a.currentTime = 0;
  });
  currentAudios = [];
}

//------------------------------------------------------
// ★追加：BGM 定義
//------------------------------------------------------
let bgmAudio = new Audio(`${window.contextPath}/bgm/小春道.mp3`);
bgmAudio.loop = true;
bgmAudio.volume = 0.7;

//------------------------------------------------------
// グローバル状態
//------------------------------------------------------
let mediaRecorder = null;
let audioChunks = [];
let MAX_TURNS = 10;

let lastAudioBlob = null;
let pendingResult = null;
let conversationHistory = [];

// ★ 5つの「声メーター」（0〜100）
let skillScores = {
  selfUnderstanding: 0.0,  // 声量
  readingWriting: 0.0,     // 声の抑揚
  comprehension: 0.0,      // 声の安定度
  emotionJudgment: 0.0,    // 話のスムーズさ（沈黙の少なさ）
  empathy: 0.0,            // 発話率
};

// ★ 会話終了後のクリック待ち用フラグ
let isConversationFinished = false;
let finishClickHandler = null;

// ★ 追加：現在の録音ストリーム（Chrome対策）
let currentStream = null;

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
// キャラクター設定
//======================================================
const characterConfig = {
  1: {
    name: "男子生徒",
    emotions: {
      default: "boy_standard.png",
      happy: "boy_smile.png",
      sad: "boy_tired.png",
      angry: "boy_angry.png",
    },
  },
  2: {
    name: "先生",
    emotions: {
      default: "Teacher_standard.png",
      happy: "Teacher_smile.png",
      sad: "Teacher_standard.png",
      angry: "Teacher_angry.png",
    },
  },
  3: {
    name: "女子生徒",
    emotions: {
      default: "JK_standard.png",
      happy: "JK_smile3.png",
      sad: "JK_angry.png",
      angry: "JK_angry.png",
    },
  },
  4: {
    name: "カナちゃん",
    emotions: {
      default: "kana2_standard.png",
      happy: "kana2_happy.png",
      sad: "kana2_sad.png",
      angry: "kana2_angry.png",
    },
  },
};

//======================================================
// ★追加：シナリオID → キャラID の割り当て
//======================================================
const scenarioCharacterMap = {
  1: 1, // シナリオ1 → 男子生徒
  2: 2, // シナリオ2 → 先生
  3: 3, // シナリオ3 → 女子生徒
  4: 4, // シナリオ4 → カナチャン
};

//======================================================
// ★追加：BGM 音量調整
//======================================================
function lowerBgmVolume() {
  if (bgmAudio) bgmAudio.volume = 0.3;
}
function restoreBgmVolume() {
  if (bgmAudio) bgmAudio.volume = 0.7;
}

//======================================================
// ★ 4カテゴリ版：default / happy / sad / angry
//    （スコア方式 + バッファ）
//======================================================

let emotionHistory = [];

function estimateEmotionFromOpenSmile(values) {
  if (!values) return smoothEmotion("default");

  const v = values.valence ?? 0.5;
  const a = values.arousal ?? 0.5;

  // --------------------------
  // スコア初期化
  // --------------------------
  let scores = {
    happy: 0,
    sad: 0,
    angry: 0,
    default: 0
  };

  // --------------------------
  // happy（前向き or 元気系）
  // --------------------------
  if (v > 0.50) scores.happy += 2;
  if (a > 0.70 && v > 0.40) scores.happy += 1;

  // --------------------------
  // sad（ネガティブ + 低活性）
  // --------------------------
  if (v < 0.30) scores.sad += 1;
  if (a < 0.40) scores.sad += 1;

  // --------------------------
  // angry（興奮 + ネガティブ）
  // pitch_variability は使用しない
  // --------------------------
  if (a > 0.80 && v < 0.30) scores.angry += 2;
  if (a > 0.85 && v < 0.35) scores.angry += 1;

  // --------------------------
  // default（大半の会話はここ）
  // --------------------------
  if (a > 0.45 && a < 0.80 && v > 0.30 && v < 0.55) {
    scores.default += 3;
  }

  // 怒りは最低2点必要
  if (scores.angry < 2) scores.angry = 0;

  // --------------------------
  // 最もスコアが高いカテゴリを選択
  // --------------------------
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  const detected = best[1] === 0 ? "default" : best[0];

  return smoothEmotion(detected);
}

//======================================================
// ★ バッファ平滑化（過去3回の多数決）
//======================================================
function smoothEmotion(newEmotion) {
  emotionHistory.push(newEmotion);

  if (emotionHistory.length > 3) {
    emotionHistory.shift();
  }

  const counts = emotionHistory.reduce((acc, e) => {
    acc[e] = (acc[e] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
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
// 録音処理（BGMを先に下げてから録音開始）
//======================================================
async function startRecording() {
  stopAllAudio();

  try {
    console.log("録音開始ボタン反応OK");
    if (mediaRecorder && mediaRecorder.state === "recording") {
      console.log("[REC] already recording, ignore");
      return;
    }

    // 録音前にBGMをミュート
    if (bgmAudio) bgmAudio.volume = 0.3;
    await new Promise(r => setTimeout(r, 300));   // 0.3秒待つ

    // 前回のストリームを完全停止
    if (currentStream) {
      currentStream.getTracks().forEach(t => t.stop());
      currentStream = null;
    }

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    currentStream = stream;

    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => {
      audioChunks.push(e.data);
    };

    mediaRecorder.onstop = async () => {
      console.log("音声データ処理へ移行");

      // 念のためここでも停止
      stream.getTracks().forEach((t) => t.stop());
      currentStream = null;

      lastAudioBlob = new Blob(audioChunks, { type: "audio/webm" });
      console.log("[DEBUG] lastAudioBlob size:", lastAudioBlob.size);

      const preview = await sendPreviewToFlask(lastAudioBlob);
      if (preview) {
        console.log("[PREVIEW] received:", preview);
        showTranscriptionConfirmation(preview);
      } else {
        console.warn("[PREVIEW] failed to get preview");
      }

      restoreBgmVolume();   // 録音終了 → BGM を戻す
    };

    mediaRecorder.start();
    updateRecordingStatus(true);
    console.log("録音開始");

  } catch (err) {
    console.error("[REC] startRecording error:", err);
  }
}

//======================================================
// 録音停止
//======================================================
async function stopRecording() {
  console.log("録音停止");
  if (mediaRecorder && mediaRecorder.state === "recording") {
    try {
      mediaRecorder.stop();
      console.log("[REC] mediaRecorder stopped");
    } catch (err) {
      console.error("[REC] stopRecording error:", err);
    }
  } else {
    console.log("[REC] not recording, ignore stop");
  }
  updateRecordingStatus(false);
}


//======================================================
// Whisper プレビュー
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
// 本番API
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
// 0〜1 正規化
//======================================================
function to01(value, defaultVal = 0.5) {
  const num = Number(value);
  if (Number.isNaN(num)) return defaultVal;
  return Math.min(1, Math.max(0, num));
}

//======================================================
// 声特徴 5項目（0〜100）
//======================================================
function calculateVoiceFeatureScores(emotionRaw) {
  const emotion = emotionRaw || {};

  const arousal = to01(emotion.arousal, 0.5);
  const dominance = to01(emotion.dominance, 0.5);
  const loudVar = to01(emotion.loudness_variability, 0.5);
  const pitchVar = to01(emotion.pitch_variability, 0.5);
  const stability = to01(emotion.voice_stability, 0.5);
  const pauseRatio = to01(emotion.pause_ratio, 0.3);
  const voicingRatio = to01(emotion.voicing_ratio, 0.7);

  const loudnessScore = Math.round((dominance * 0.6 + loudVar * 0.4) * 100);
  const pitchScore = Math.round(pitchVar * 100);
  const stabilityScore = Math.round(stability * 100);
  const smoothnessScore = Math.round((1 - pauseRatio) * 100);
  const voicingScore = Math.round(voicingRatio * 100);

  return {
    voice_loudness: loudnessScore,
    voice_pitch: pitchScore,
    voice_stability: stabilityScore,
    voice_smoothness: smoothnessScore,
    voice_voicing: voicingScore,
  };
}

///======================================================
// 表示更新（4カテゴリ版）
//======================================================
function updateDisplayFromFlask(result) {
  if (!result) return;
  console.log("[RESULT] from Flask:", result);

  stopAllAudio();

  // AI返信を表示
  if (replyElement) {
    replyElement.textContent = result.reply || "";
  }

  // ターン数更新
  if (turnElement) {
    turnElement.textContent = result.turn;
  }

  conversationHistory.push(result);

  // 声スコア更新
  const voiceScores = calculateVoiceFeatureScores(result.emotion);
  updateSkillScoresDisplay(voiceScores);

  // 会話終了判定
  let emotionKey;
  let finishType = null;

  if (result.active === false) {
    if (result.turn >= MAX_TURNS) finishType = "clear";
    else finishType = "fail";
  }

  // CLEAR → happy
  if (finishType === "clear") {
    emotionKey = "happy";

  // FAIL → sad（worried は4カテゴリから削除）
  } else if (finishType === "fail") {
    emotionKey = "sad";

  // 通常時 → openSMILEの推定（4カテゴリ版）
  } else {
    emotionKey = estimateEmotionFromOpenSmile(result.emotion);
  }

  // キャラ画像反映
  updateCharacterImage(emotionKey);

  // 音声再生
  if (result.voice_audio_urls?.length > 0) {
    playAudioSequential(result.voice_audio_urls);
  } else if (result.voice_audio_url) {
    playAudioSequential([result.voice_audio_url]);
  }

  // セッション終了時に録音を無効化
  if ((result.turn >= MAX_TURNS || result.active === false) && !isConversationFinished) {
    console.log("[SESSION] conversation finished, disabling recording...");
    isConversationFinished = true;
    setRecordingEnabled(false);
    enableFinishOnClick();
  }
}

//======================================================
// メーター更新
//======================================================
function updateSkillScoresDisplay(voiceScores) {
  skillScores = {
    selfUnderstanding: voiceScores.voice_loudness ?? 0,
    readingWriting: voiceScores.voice_pitch ?? 0,
    comprehension: voiceScores.voice_stability ?? 0,
    emotionJudgment: voiceScores.voice_smoothness ?? 0,
    empathy: voiceScores.voice_voicing ?? 0,
  };

  selfUnderstandingMeter.style.width = `${skillScores.selfUnderstanding}%`;
  selfUnderstandingScore.textContent = Math.round(skillScores.selfUnderstanding);

  readingWritingMeter.style.width = `${skillScores.readingWriting}%`;
  readingWritingScore.textContent = Math.round(skillScores.readingWriting);

  comprehensionMeter.style.width = `${skillScores.comprehension}%`;
  comprehensionScore.textContent = Math.round(skillScores.comprehension);

  emotionJudgmentMeter.style.width = `${skillScores.emotionJudgment}%`;
  emotionJudgmentScore.textContent = Math.round(skillScores.emotionJudgment);

  empathyMeter.style.width = `${skillScores.empathy}%`;
  empathyScore.textContent = Math.round(skillScores.empathy);

  updateTotalScore();
}

//======================================================
// 総合スコア
//======================================================
function updateTotalScore() {
  const sum = Object.values(skillScores).reduce((a, b) => a + b, 0);
  const avg100 = sum / 5;
  const pts = (avg100 / 10).toFixed(1);

  totalScoreElement.textContent = pts;

  const avg10 = avg100 / 10;
  const rank =
    avg10 >= 8 ? "S" :
    avg10 >= 6 ? "A" :
    avg10 >= 4 ? "B" : "C";

  rankBadgeElement.textContent = rank;
}

//======================================================
// 音声再生（順次再生）
//======================================================
async function playAudioSequential(urls) {
  stopAllAudio();
  lowerBgmVolume();     // AI再生 → BGM を下げる

  for (const url of urls) {
    const finalUrl = url.startsWith("http") ? url : `http://127.0.0.1:5000${url}`;
    console.log("[AUDIO] play:", finalUrl);

    const audio = new Audio(finalUrl);
    currentAudios.push(audio);

    try {
      await audio.play();
    } catch (err) {
      console.warn("[AUDIO] play error:", err);
      continue;
    }

    await new Promise(resolve => {
      audio.onended = () => resolve();
    });
  }

  restoreBgmVolume();   // AI終了 → BGM を戻す
}

//======================================================
// プレビューUI
//======================================================
function showTranscriptionConfirmation(preview) {
  pendingResult = preview;
  confirmedText.value = preview.transcript || "";
  transcriptionConfirmation.style.display = "flex";
}

//======================================================
// 確認 → 会話本番
//======================================================
async function confirmTranscription() {
  transcriptionConfirmation.style.display = "none";
  console.log("[CONFIRM] Sending final audio to Flask...");

  stopAllAudio();
  showVoicevoxLoading();
  setLoadingMessage("AI応答を生成中...");

  const result = await sendAudioToFlask(lastAudioBlob, confirmedText.value);

  hideVoicevoxLoading();

  if (result) updateDisplayFromFlask(result);
  else console.error("[CONFIRM] result is null");
}

//======================================================
// 結果保存
//======================================================
function enableFinishOnClick() {
  if (finishClickHandler) return;

  finishClickHandler = function handleFinishClick() {
    document.removeEventListener("click", handleFinishClick);
    finishClickHandler = null;

    fetch("http://127.0.0.1:5000/api/reset", { method: "POST" })
      .catch(() => {})
      .finally(() => {
        saveConversationResult();
      });
  };

  document.addEventListener("click", finishClickHandler);
}

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
// 開始セリフ（音声なし）
//======================================================
async function showStartMessageAndSpeak(message) {
  if (!message) return;

  replyElement.textContent = message;
  updateCharacterImage("happy");
}

//======================================================
// 初期化
//======================================================
document.addEventListener("DOMContentLoaded", () => {
  console.log("JS初期ロード成功");

  bgmAudio.play().catch(() => {});     // 初期化時にBGM再生

  showVoicevoxLoading();
  setRecordingEnabled(true);

  isConversationFinished = false;
  finishClickHandler = null;

  if (userMessageBox) userMessageBox.style.display = "none";

  fetch("http://127.0.0.1:5000/api/current_scenario")
    .then(res => res.json())
    .then(async data => {
      console.log("Flaskからシナリオ情報取得成功", data);
      MAX_TURNS = data.max_turns || 6;

      if (maxTurnsElement) maxTurnsElement.textContent = MAX_TURNS;

      // Flaskからの scenario_id を取得（なければ1）
      currentScenarioId = data.scenario_id || 1;

      // シナリオIDに対応したキャラIDを取得
      const charId = scenarioCharacterMap[currentScenarioId] || 1;

      // キャラ反映
      currentCharacter = characterConfig[charId];
      updateCharacterImage("default");

      await showStartMessageAndSpeak(data.start_message);
    })
    .catch(err => console.error("[INIT] scenario fetch error:", err))
    .finally(() => hideVoicevoxLoading());
});

//======================================================
// グローバル公開
//======================================================
window.chatInterface = {
  startRecording,
  stopRecording,
  confirmTranscription,
  retryRecording,
};
