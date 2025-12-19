  //------------------------------------------------------
  // WebM録音 → Flask API → Whisper/GPT/VoiceVox の処理
  //------------------------------------------------------

  // 🔵 ローディング表示・非表示
 let isVoicevoxLoading = false;

  function showVoicevoxLoading() {
    const overlay = document.getElementById("voicevoxOverlay");
    if (!overlay || isVoicevoxLoading) return;

    isVoicevoxLoading = true;
    overlay.style.display = "flex";

    let icon = overlay.querySelector(".loading-icon");
    if (!icon) {
      icon = document.createElement("div");
      icon.className = "loading-icon";
      overlay.querySelector(".loading-wrapper").prepend(icon);
    }
  }


  function hideVoicevoxLoading() {
    const overlay = document.getElementById("voicevoxOverlay");
    if (!overlay || !isVoicevoxLoading) return;

    isVoicevoxLoading = false;

    const icon = overlay.querySelector(".loading-icon");
    if (icon) icon.remove();

    overlay.style.display = "none";
  }


  function setLoadingMessage(text) {
    const elem = document.querySelector("#voicevoxOverlay .loading-text");
    if (elem) elem.textContent = text;
  }
  function retryRecording() {
    console.log("[RETRY] 録音をやり直します");

    confirmedText.value = "";
    document.getElementById("transcript").textContent = "...";
    transcriptionConfirmation.style.display = "none";

    audioChunks = [];
    lastAudioBlob = null;
    pendingResult = null;



    console.log("[RETRY] 状態リセット完了（再録可能）");
  }


  //======================================================
  // 録音中の表示制御
  //======================================================
  function showRecordingGuide() {
    const guide = document.getElementById("recordingGuide");
    if (guide) guide.style.display = "block";
  }

  function hideRecordingGuide() {
    const guide = document.getElementById("recordingGuide");
    if (guide) guide.style.display = "none";
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
  // グローバル状態
  //------------------------------------------------------
  let mediaRecorder = null;
  let audioChunks = [];
  let MAX_TURNS = 30

  let lastAudioBlob = null;
  let pendingResult = null;
  let conversationHistory = [];

  // ★ 5つの「声メーター」（0〜100）
  let skillScores = {
    selfUnderstanding: 0,  // 声量（dominance + loudness_variability の適切さ）
    comprehension: 0,      // 声の柔らかさ（warmth）
    empathy: 0
  };

  // ===== 前回の raw emotion（差分計算用）=====
  let prevEmotionRaw = null;

  // ===== メータの現在値（エネルギー型）=====
  let meterState = {
    voice_loudness: 50, // 声量
    tension: 50         // 緊張度
  };

  let prevMeterSnapshot = {
    voice_loudness: 50,
    tension: 50
  };


  // ===== POPUP連打防止（グローバル）=====
  //let lastPopupTurn = -999;

  // ★ 会話終了後のクリック待ち用フラグ
  let isConversationFinished = false;
  let finishClickHandler = null;

  // ★ 追加：現在の録音ストリーム（Chrome対策）
  let currentStream = null;

  // DOM 要素
  const turnElement = document.getElementById("turn");
  const maxTurnsElement = document.getElementById("max_turns");
  const replyElement = document.getElementById("reply");


  const selfUnderstandingMeter = document.getElementById("selfUnderstandingMeter");
  const selfUnderstandingScore = document.getElementById("selfUnderstandingScore");
  //const readingWritingMeter = document.getElementById("readingWritingMeter");
  //const readingWritingScore = document.getElementById("readingWritingScore");
  const comprehensionMeter = document.getElementById("comprehensionMeter");
  const comprehensionScore = document.getElementById("comprehensionScore");
  //const emotionJudgmentMeter = document.getElementById("emotionJudgmentMeter");
  const emotionJudgmentScore = document.getElementById("emotionJudgmentScore");
  const empathyScore = document.getElementById("empathyScore");
  const empathyMeter = document.getElementById("empathyMeter");


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
      name: "カナちゃん",
      emotions: {
        default: "kana2_standard.png",
        happy: "kana2_happy.png",
        sad: "kana2_sad.png",
        angry: "kana2_angry.png",
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
      name: "男子生徒",
      emotions: {
        default: "boy_standard.png",
        happy: "boy_smile.png",
        sad: "boy_tired.png",
        angry: "boy_angry.png",
      },
    },
    4: {
        name: "女子生徒",
      emotions: {
        default: "JK_standard.png",
        happy: "JK_smile3.png",
        sad: "JK_angry.png",
        angry: "JK_angry.png",
      },
    },
  };

  //======================================================
  // ★追加：シナリオID → キャラID の割り当て
  //======================================================
  const scenarioCharacterMap = {
    1: 1, // シナリオ1 → カナチャン
    2: 2, // シナリオ2 → 先生
    3: 3, // シナリオ3 → 女子生徒
    4: 4, // シナリオ4 → 男子生徒
  };

  //======================================================
  // ★追加：BGM 音量調整
  //======================================================
  function lowerBgm() {
    window.parent?.lowerBgmForRecording?.();
  }

  function restoreBgm() {
    window.parent?.restoreBgmAfterRecording?.();
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

  updateEmotionDisplay("default");

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
    //lowerBgm();
    await new Promise(r => setTimeout(r, 200)); 

    try {
      console.log("録音開始ボタン反応OK");
      if (mediaRecorder && mediaRecorder.state === "recording") {
        console.log("[REC] already recording, ignore");
        return;
      }

      // 前回のストリームを完全停止
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
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

        const previewResult = await sendPreviewToFlask(lastAudioBlob);

        if (previewResult?.ok) {
          console.log("[PREVIEW] received:", previewResult.data);
          showTranscriptionConfirmation(previewResult.data);
        } else {
          console.warn("[PREVIEW ERROR]", previewResult);
          // ★ 無音（400）を明示表示
          if (previewResult?.error === "無音でした") {
            showPopup("🎤 録音に失敗しました");
          } else {
            showPopup("⚠️ 録音に失敗しました。もう一度お試しください");
          }

          retryRecording(); // 再録音できる状態へ
        }

      };

      mediaRecorder.start();
      updateRecordingStatus(true);
      showRecordingGuide();
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
    hideRecordingGuide();
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

      if (!res.ok) {
        let errorMsg = "録音に失敗しました";

        try {
          const errJson = await res.json();
          if (errJson?.error) errorMsg = errJson.error; // ← Flaskの「無音でした」
        } catch (_) {}

        return {
          ok: false,
          error: errorMsg,
          status: res.status,
        };
      }

      const json = await res.json();
      return {
        ok: true,
        data: json,
      };

      } catch (err) {
        console.error("[PREVIEW] fetch error:", err);
         return {
           ok: false,
           error: "通信エラーが発生しました",
           status: 0,
         };

      } finally {
        // ★ 無音・エラー・成功すべてで解除
        hideVoicevoxLoading();
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
  // 声特徴 3項目（0〜100）
  //======================================================
  // ★ 抑揚メータ用：直前の pitch_variability
  function calculateVoiceFeatureScores(emotionRaw) {
    const e = emotionRaw || {};

    const dominance = e.dominance ?? 0.5;
    const loudVar   = e.loudness_variability ?? 0.5;
    const pitchVar  = e.pitch_variability ?? 0.5;
    const warmth    = e.warmth ?? 0.5;

    /* ==========================
    * ① 声量（適切さ評価・山型）
    * ========================== */
    const rawLoud = dominance * 0.5 + loudVar * 0.5;
    const idealLoud = 0.55;
    const loudTol = 0.25;

    const loudnessScore =
      Math.max(0, 1 - Math.abs(rawLoud - idealLoud) / loudTol) * 100;

    /* ==========================
    * ② 緊張度（warmth）
    * ========================== */
    const warmthIdeal = 0.55;
    const warmthTol = 0.30;

    const warmthScoreRaw =
    Math.max(0, 1 - Math.abs(warmth - warmthIdeal) / warmthTol) * 100;

    // ★ 反転（0〜100 を保証）
    const warmthScore = Math.max(0, 100 - warmthScoreRaw);

    return {
      voice_loudness: Math.round(loudnessScore),
      voice_warmth: Math.round(warmthScore),
    };

  }

  function calcDelta(prev, curr) {
    if (!prev || !curr) return 0;

    const dArousal =
      Math.abs((curr.arousal ?? 0) - (prev.arousal ?? 0)) / 0.1;

    const dPitch =
      Math.abs((curr.pitch_variability ?? 0) - (prev.pitch_variability ?? 0)) / 0.08;

    const dLoud =
      Math.abs((curr.loudness_variability ?? 0) - (prev.loudness_variability ?? 0)) / 0.12;

    return dArousal + dPitch + dLoud;
  }



  function updateMetersByDelta(delta, contentState = "normal") {
  let GAIN_STEP1 = 6;
  let GAIN_STEP2 = 12;
  let DECAY = 10;

  if (contentState === "bad") {
    DECAY = 15;
  }

  let step = 0;
  if (delta >= 1.5) step = 2;
  else if (delta >= 0.8) step = 1;

  if (step === 2) {
    // 声量：従来どおり増加
    meterState.voice_loudness += GAIN_STEP2;
    // 緊張度：反転 → 減少
    meterState.tension        -= GAIN_STEP2;

  } else if (step === 1) {
    meterState.voice_loudness += GAIN_STEP1;
    meterState.tension        -= GAIN_STEP1;

  } else {
    // 変化が少ない → 声量は減衰、緊張度は上昇
    meterState.voice_loudness -= DECAY;
    meterState.tension        += DECAY;
  }

  meterState.voice_loudness = Math.max(0, Math.min(100, meterState.voice_loudness));
  meterState.tension        = Math.max(0, Math.min(100, meterState.tension));
}



  //======================================================
  // POPUP表示
  //======================================================
  function showPopup(message) {
    const popup = document.createElement("div");
    popup.className = "meter-popup";
    popup.textContent = message;

    document.body.appendChild(popup);

    setTimeout(() => popup.classList.add("show"), 50);
    setTimeout(() => {
      popup.classList.remove("show");
      setTimeout(() => popup.remove(), 300);
    }, 4000);
  }

  //======================================================
  // POPUP判定（メータが下がった時だけ出す）
  //======================================================
  function checkAndShowMeterPopup(prevState, currState, empathyScore, turn) {

    // --- 声量 ---
    if (currState.voice_loudness <= 30) {
      showPopup("もう少しはっきり話してみよう");
      return;
    }

    // --- 緊張度 ---
    if (
      prevState.tension < 70 &&
      currState.tension >= 70
    ) {
      showPopup("緊張しているかも");
      return;
    }

    // --- 思いやり ---
    if (empathyScore !== null && empathyScore <= 40) {
      showPopup("相手への配慮が伝わりにくいかも");
      return;
    }
  }





  function updateEmotionDisplay(emotion) {
    const emotionText = document.getElementById("emotionText");
    if (!emotionText) return;

    const container = emotionText.parentElement;

    container.classList.remove(
      "emotion-happy",
      "emotion-sad",
      "emotion-angry",
      "emotion-default"
    );

    switch (emotion) {
      case "happy":
        emotionText.textContent = "楽しい";
        container.classList.add("emotion-happy");
        break;
      case "sad":
        emotionText.textContent = "悲しい";
        container.classList.add("emotion-sad");
        break;
      case "angry":
        emotionText.textContent = "怒り";
        container.classList.add("emotion-angry");
        break;
      default:
        emotionText.textContent = "平常";
        container.classList.add("emotion-default");
    }
  }




  ///======================================================
  // 表示更新（4カテゴリ版）
  //======================================================
  function updateDisplayFromFlask(result) {
    if (!result) return;
    console.log("[RESULT] from Flask:", result);

    stopAllAudio();

     // ★ 無関係な発言は UI を更新しない（完全遮断）
    if (result.appropriateness === "unrelated") {
      showPopup("今はこの話題について話しています。内容を戻してみましょう。");
//      return; // ← ★ ここでこのターンの処理を全停止
    }

      // ★ 思いやりスコア（py → js）
    if (typeof result.empathy_score === "number") {
      skillScores.empathy = Math.max(1, Math.min(100, result.empathy_score));

      // 表示（数値）
      if (empathyScore) {
        empathyScore.textContent = skillScores.empathy;
      }

      if (empathyMeter) {
        empathyMeter.style.width = `${skillScores.empathy}%`;
      }
    }


    // AI返信を表示
    if (replyElement && result.appropriateness !== "unrelated") {
      replyElement.textContent = result.reply || "";
    }

    // ターン数更新
    if (turnElement) {
      turnElement.textContent = result.turn;
    }

    conversationHistory.push(result);

    // ===== ① 前回との差分Δを計算 =====
    let delta = 0;
    if (prevEmotionRaw) {
      delta = calcDelta(prevEmotionRaw, result.emotion);
    } else {
    // ★ 初回は delta 判定を完全スキップ
    console.log("[DELTA SKIP] first turn");

    // 次回のために emotion だけ保存して終了
    prevEmotionRaw = result.emotion;

    // 表示だけは更新したいので、メータ更新や POPUP を通さず return
    updateSkillScoresDisplay({
      voice_loudness: Math.round(meterState.voice_loudness),
      voice_warmth:   Math.round(meterState.tension)
    });

//    return;
  }


    // ★ AI名を表示（Flask → DB由来）
    const speakerNameElem = document.getElementById("speakerName");
    if (speakerNameElem && result.ai_name) {
      speakerNameElem.textContent = result.ai_name;
    }

    // ===== ② 内容の状態を決める（減衰用）=====
    const contentState =
        result.appropriateness === "related_bad" ? "bad" : "normal";


    // ===== (確認用）：delta のログ=====
    console.log("[DELTA CHECK]", {
      delta: delta,
      step:
        delta >= 1.5 ? 2 :
        delta >= 0.8 ? 1 : 0,
      contentState: contentState,
      prevEmotionRaw: prevEmotionRaw,
      currEmotion: result.emotion
    });

    // ===== ③ メータ更新（ハイブリッド＋減衰調整）=====
    updateMetersByDelta(delta, contentState);


    // ★ related_bad の場合は全メータに -20 補正
    if (result.appropriateness === "related_bad") {
      skillScores.empathy -= 20;
      skillScores.empathy = Math.max(1, Math.min(100, skillScores.empathy));

      console.log("[PENALTY] related_bad → empathy only -20");
    }

       // ===== ④ POPUP判定 =====
      if (result.appropriateness === "related_bad") {
        showPopup("優しい言葉を心掛けましょう");
      } else {
      checkAndShowMeterPopup(
      prevMeterSnapshot,
      meterState,
      result.empathy_score ?? null,
      result.turn
     );
    }

    // ===== ⑤ 表示更新（現在のメータ値を使う）=====
    updateSkillScoresDisplay({
      voice_loudness: Math.round(meterState.voice_loudness),
      voice_warmth:   Math.round(meterState.tension)
    });

    // ===== ⑥ 今回を次回用に保存 =====
    prevEmotionRaw = result.emotion;

    // 会話終了判定
    let emotionKey;

    // clear / fail は JS 側で最優先
    if (result.finish_type === "clear") {
      emotionKey = "happy";

    } else if (result.finish_type === "fail") {
      emotionKey = "sad";

    } else {
      // ★ Flask（Python側制御含む）で確定した emotion を使用
      emotionKey = result.emotion_label || "default";
    }

    // キャラ画像反映
    updateCharacterImage(emotionKey);
    updateEmotionDisplay(emotionKey);

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

    prevMeterSnapshot = {
    voice_loudness: meterState.voice_loudness,
    tension: meterState.tension
    };

  }

  //======================================================
  // メーター更新
  //======================================================
  function updateSkillScoresDisplay(voiceScores) {
    const s1 = voiceScores.voice_loudness ?? 0;
    const s2 = voiceScores.voice_warmth ?? 0;

    // ★ 内部スコアも必ず更新（保存・総合用）
    skillScores.selfUnderstanding = s1;
    skillScores.comprehension = s2;

    // --- 声量 ---
    selfUnderstandingMeter.style.width = `${s1}%`;
    selfUnderstandingScore.textContent = s1;

    // --- 緊張度 ---
    comprehensionMeter.style.width = `${s2}%`;
    comprehensionScore.textContent = s2;

    
  }


  //======================================================
  // 音声再生（順次再生）
  //======================================================
  async function playAudioSequential(urls) {
    stopAllAudio();
    //lowerBgm();     // AI再生 → BGM を下げる

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

    //restoreBgm();   // AI終了 → BGM を戻す
  }

  //======================================================
  // プレビューUI
  //======================================================
  function showTranscriptionConfirmation(preview) {
 hideRecordingGuide();
    hideVoicevoxLoading();
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
    console.log("[DEBUG] result keys:", Object.keys(result));

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

    prevEmotionRaw = null;
    meterState.voice_loudness = 50;
    meterState.tension = 50;

    setRecordingEnabled(true);

    isConversationFinished = false;
    finishClickHandler = null;

    if (userMessageBox) userMessageBox.style.display = "none";

    fetch("http://127.0.0.1:5000/api/current_scenario")
      .then(res => res.json())
      .then(async data => {
        console.log("Flaskからシナリオ情報取得成功", data);
        MAX_TURNS = Number(data.max_turns ?? 30);

        if (maxTurnsElement) maxTurnsElement.textContent = MAX_TURNS;

        // Flaskからの scenario_id を取得（なければ1）
        currentScenarioId = data.scenario_id || 1;

        // シナリオIDに対応したキャラIDを取得
        const charId = scenarioCharacterMap[currentScenarioId] || 1;

        // キャラ反映
        currentCharacter = characterConfig[charId];
        updateCharacterImage("default");

        if (data.character_name) {
            const speakerNameElem = document.getElementById("speakerName");
            if (speakerNameElem) {
              speakerNameElem.textContent = data.character_name;
            }
          }

        await showStartMessageAndSpeak(data.start_message);
      })
      .catch(err => console.error("[INIT] scenario fetch error:", err))
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
    retryRecording,
  };
 