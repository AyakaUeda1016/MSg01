/* ================== LocalStorageキー定義 ================== */
const LS_KEYS = { mic: 'kaiwa.mLevel', vol: 'kaiwa.volumeLevel' };

function levelToGain(lv) {
  lv = lv | 0;
  if (lv < 1) lv = 1;
  if (lv > 10) lv = 10;
  return lv / 10;
}

/* ================== グローバル音声バス（AudioContext統合） ================== */
const AudioBus = (function () {
  let ctx, outputGain, micGainNode, analyser, destNode, micStream;
  const bc = (typeof BroadcastChannel !== 'undefined')
    ? new BroadcastChannel('kaiwa-audio-settings')
    : null;

  const mediaMap = new WeakMap();

  function attachMediaElement(el) {
    if (!ctx || !outputGain || !el) return;
    if (mediaMap.has(el)) return;
    const srcNode = ctx.createMediaElementSource(el);
    srcNode.connect(outputGain);
    mediaMap.set(el, srcNode);
  }

  function init() {
    if (ctx) return Promise.resolve();

    ctx = new (window.AudioContext || window.webkitAudioContext)();

    outputGain = ctx.createGain();
    const volLv = Number(localStorage.getItem(LS_KEYS.vol) || 5);
    outputGain.gain.value = levelToGain(volLv);
    outputGain.connect(ctx.destination);

    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false }
    }).then(function (stream) {
      micStream = stream;
      const src = ctx.createMediaStreamSource(stream);
      micGainNode = ctx.createGain();
      const micLv = Number(localStorage.getItem(LS_KEYS.mic) || 5);
      micGainNode.gain.value = levelToGain(micLv) * 2.0;

      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      destNode = ctx.createMediaStreamDestination();
      src.connect(micGainNode).connect(analyser).connect(destNode);
    }).catch(function(err) {
      console.warn('マイク初期化失敗:', err);
      return Promise.resolve();
    });
  }

  function setOutputLevel(level) {
    localStorage.setItem(LS_KEYS.vol, String(level));
    if (outputGain) outputGain.gain.value = levelToGain(level);
    if (bc) bc.postMessage({ volLevel: level });
  }

  function setInputLevel(level) {
    localStorage.setItem(LS_KEYS.mic, String(level));
    if (micGainNode) micGainNode.gain.value = levelToGain(level) * 2.0;
    if (bc) bc.postMessage({ micLevel: level });
  }

  function getRMS() {
    if (!analyser) return 0;
    const buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);
    let sum = 0;
    for (let i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return Math.sqrt(sum / buf.length);
  }

  function beep(durationMs, freq) {
    durationMs = durationMs || 200;
    freq = freq || 880;

    function doBeep() {
      if (!ctx) return Promise.resolve();
      if (ctx.state === 'suspended') return ctx.resume().catch(() => {}).then(playTone);
      return playTone();
    }

    function playTone() {
      return new Promise(function (resolve) {
        const osc = ctx.createOscillator();
        const g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        const t = ctx.currentTime;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.5, t + 0.01);
        g.gain.linearRampToValueAtTime(0.0, t + durationMs / 1000);

        osc.connect(g).connect(outputGain);
        osc.start(t);
        osc.stop(t + durationMs / 1000 + 0.05);

        osc.onended = () => resolve();
      });
    }

    if (!ctx) return init().then(doBeep);
    return doBeep();
  }

  return {
    init: init,
    setOutputLevel: setOutputLevel,
    setInputLevel: setInputLevel,
    getRMS: getRMS,
    beep: beep,
    stream: () => destNode ? destNode.stream : null,
    context: () => ctx || null,
    output: () => outputGain || null
  };
})();

/* ================== 初期化とイベント設定 ================== */
document.addEventListener('DOMContentLoaded', () => {
  AudioBus.init().then(() => {
    console.log('[v0] AudioBus初期化完了');

    const savedVolume = Number(localStorage.getItem(LS_KEYS.vol) || 5);
    const savedMic = Number(localStorage.getItem(LS_KEYS.mic) || 5);

    // 音声音量ボタンの初期化
    const soundButtons = document.getElementById("soundButtons");
    if (soundButtons) {
      // 初期値を設定
      const soundBtns = soundButtons.querySelectorAll(".number-btn");
      soundBtns.forEach((btn) => {
        if (Number.parseInt(btn.dataset.value) === savedVolume) {
          btn.classList.add("active");
        }
      });

      soundButtons.addEventListener("click", (e) => {
        if (e.target.classList.contains("number-btn")) {
          soundButtons.querySelectorAll(".number-btn").forEach((btn) => {
            btn.classList.remove("active");
          });

          e.target.classList.add("active");

          const level = Number.parseInt(e.target.dataset.value);
          AudioBus.setOutputLevel(level);
          AudioBus.beep(150, 880);
          console.log("[v0] 音声音量:", level);
        }
      });
    }

    // マイク音量ボタンの初期化
    const micButtons = document.getElementById("micButtons");
    if (micButtons) {
      // 初期値を設定
      const micBtns = micButtons.querySelectorAll(".number-btn");
      micBtns.forEach((btn) => {
        if (Number.parseInt(btn.dataset.value) === savedMic) {
          btn.classList.add("active");
        }
      });

      micButtons.addEventListener("click", (e) => {
        if (e.target.classList.contains("number-btn")) {
          micButtons.querySelectorAll(".number-btn").forEach((btn) => {
            btn.classList.remove("active");
          });

          e.target.classList.add("active");

          const level = Number.parseInt(e.target.dataset.value);
          AudioBus.setInputLevel(level);
          console.log("[v0] マイク音量:", level);
        }
      });
    }

    const micTestBtn = document.getElementById("micTestBtn");
    let recorder = null;
    let recordedChunks = [];
    let mode = 'idle';
    let recordMaxTimer = null;
    const MAX_RECORD_MS = 10000;

    function clearRecordTimer() {
      if (recordMaxTimer) {
        clearTimeout(recordMaxTimer);
        recordMaxTimer = null;
      }
    }

    function resetMicTest() {
      clearRecordTimer();
      mode = 'idle';
      recordedChunks = [];
      if (micTestBtn) micTestBtn.textContent = 'マイクテスト';
    }

    if (micTestBtn) {
      micTestBtn.addEventListener("click", () => {
        const stream = AudioBus.stream();

        if (mode === 'idle') {
          if (!stream) {
            alert('マイク入力を取得できませんでした');
            return;
          }

          try {
            recordedChunks = [];
            recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            recorder.ondataavailable = (e) => {
              if (e.data && e.data.size > 0) recordedChunks.push(e.data);
            };

            recorder.onstop = () => {
              clearRecordTimer();
              if (!recordedChunks.length) {
                resetMicTest();
                return;
              }

              const blob = new Blob(recordedChunks, { type: 'audio/webm' });
              const url = URL.createObjectURL(blob);
              
              const audio = new Audio(url);
              AudioBus.output() && audio.play().then(() => {
                mode = 'playing';
                micTestBtn.textContent = '再生中...';
                
                audio.onended = () => {
                  resetMicTest();
                  URL.revokeObjectURL(url);
                };
              }).catch(() => {
                resetMicTest();
                URL.revokeObjectURL(url);
              });
            };

            recorder.start();
            mode = 'recording';
            micTestBtn.textContent = '録音中...（クリックで停止）';

            recordMaxTimer = setTimeout(() => {
              if (mode === 'recording' && recorder) {
                try { recorder.stop(); } catch (e) { resetMicTest(); }
              }
            }, MAX_RECORD_MS);

          } catch (err) {
            console.error('[v0] MediaRecorder初期化失敗:', err);
            alert('録音を開始できませんでした');
            resetMicTest();
          }
        } else if (mode === 'recording') {
          clearRecordTimer();
          try {
            if (recorder) recorder.stop();
          } catch (err) {
            console.error('[v0] recorder.stop失敗:', err);
            resetMicTest();
          }
        } else if (mode === 'playing') {
          resetMicTest();
        }
      });
    }

    // 準備完了ボタン
    const readyBtn = document.getElementById("readyBtn");
    if (readyBtn) {
      readyBtn.addEventListener("click", () => {
        const vol = Number(localStorage.getItem(LS_KEYS.vol) || 5);
        const mic = Number(localStorage.getItem(LS_KEYS.mic) || 5);
        console.log("[v0] 準備完了 - 音声:", vol, "マイク:", mic);
        AudioBus.beep(300, 660);
      });
    }


  }).catch((err) => {
    console.error('[v0] AudioBus初期化エラー:', err);
  });
});

function getSoundVolume() {
  return Number(localStorage.getItem(LS_KEYS.vol) || 5);
}

function getMicVolume() {
  return Number(localStorage.getItem(LS_KEYS.mic) || 5);
}
