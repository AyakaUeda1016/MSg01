/* ================== 全体設定 & ツール ================== */
// LocalStorageキーの定義
var LS_KEYS = { mic: 'kaiwa.mLevel', vol: 'kaiwa.volumeLevel' };

// レベル(1~10) → ゲイン変換（※より繊細にしたい場合は対数マッピングに変更可能）
function levelToGain(lv) {
  lv = lv | 0;
  if (lv < 1) lv = 1;
  if (lv > 10) lv = 10;
  return lv / 10;
}

/* ================== グローバル音声バス（シングルトン / ES5対応） ================== */
// 画面内のすべての音声（WebAudio / TTS / <audio> 等）を統一して制御するための仕組み
var AudioBus = (function () {
  var ctx, outputGain, micGainNode, analyser, destNode;
  var bc = (typeof BroadcastChannel !== 'undefined')
    ? new BroadcastChannel('kaiwa-audio-settings')
    : null;

  // 接続済み audio/video 要素を記録し、重複接続を防止
  var mediaMap = new WeakMap();

  // <audio> / <video> をグローバル出力に接続
  function attachMediaElement(el) {
    if (!ctx || !outputGain || !el) return;
    if (mediaMap.has(el)) return; // 重複 createMediaElementSource を防止
    var srcNode = ctx.createMediaElementSource(el);
    srcNode.connect(outputGain);
    mediaMap.set(el, srcNode);
  }

  // 初期化（Promise を返すので .then() で待機できる）
  function init() {
    if (ctx) return Promise.resolve();

    ctx = new (window.AudioContext || window.webkitAudioContext)();

    // 🔊 出力メインゲイン（ページ内すべての音量フェーダー）
    outputGain = ctx.createGain();
    var volLv = Number(localStorage.getItem(LS_KEYS.vol) || 7);
    outputGain.gain.value = levelToGain(volLv);
    outputGain.connect(ctx.destination);

    // 🎤 マイク入力取得
    return navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: false }
    }).then(function (stream) {
      // 入力チェーン：mic → gain → analyser → destination
      var src = ctx.createMediaStreamSource(stream);
      micGainNode = ctx.createGain();
      var micLv = Number(localStorage.getItem(LS_KEYS.mic) || 5);
      micGainNode.gain.value = levelToGain(micLv) * 2.0; // マイクの調整幅は広め

      analyser = ctx.createAnalyser();
      analyser.fftSize = 2048;
      destNode = ctx.createMediaStreamDestination();
      src.connect(micGainNode).connect(analyser).connect(destNode);

      // テスト音声（sample.mp3 等）がある場合はグローバル音量に接続
      var testPlayer = document.getElementById('testPlayer');
      if (testPlayer) attachMediaElement(testPlayer);
    });
  }

  // 出力音量更新（全体の音量）
  function setOutputLevel(level) {
    localStorage.setItem(LS_KEYS.vol, String(level));
    if (outputGain) outputGain.gain.value = levelToGain(level);
    if (bc) bc.postMessage({ volLevel: level });
  }

  // マイク入力音量更新（録音 / ASR / モニタリングに影響）
  function setInputLevel(level) {
    localStorage.setItem(LS_KEYS.mic, String(level));
    if (micGainNode) micGainNode.gain.value = levelToGain(level) * 2.0;
    if (bc) bc.postMessage({ micLevel: level });
  }

  // VUメーター用 RMS 値取得
  function getRMS() {
    if (!analyser) return 0;
    var buf = new Float32Array(analyser.fftSize);
    analyser.getFloatTimeDomainData(buf);
    var sum = 0;
    for (var i = 0; i < buf.length; i++) sum += buf[i] * buf[i];
    return Math.sqrt(sum / buf.length); // 0〜1
  }

  // 代替用ビープ音（Promise で返す）
  function beep(durationMs, freq) {
    durationMs = durationMs || 600;
    freq = freq || 440;

    function doBeep() {
      if (ctx.state === 'suspended') return ctx.resume().catch(function () { }).then(playTone);
      return playTone();
    }

    function playTone() {
      return new Promise(function (resolve) {
        var osc = ctx.createOscillator();
        var g = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;

        var t = ctx.currentTime;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(0.85, t + 0.01);
        g.gain.linearRampToValueAtTime(0.0, t + durationMs / 1000);

        osc.connect(g).connect(outputGain);
        osc.start(t);
        osc.stop(t + durationMs / 1000 + 0.05);

        osc.onended = function () { resolve(); };
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
    attachMediaElement: attachMediaElement,
    stream: function () { return destNode ? destNode.stream : null; },
    context: function () { return ctx || null; },
    output: function () { return outputGain || null; }
  };
})();

/* ================== テスト固定サウンド：冒頭から1曲再生 ================== */
function playTestAudioFull() {
  var player = document.getElementById('testPlayer');
  if (!player) return Promise.resolve();

  return AudioBus.init().then(function () {
    var ctx = AudioBus.context();
    if (ctx && ctx.state === 'suspended') return ctx.resume().catch(function () {});
  }).then(function () {
    // グローバル出力へ接続
    AudioBus.attachMediaElement(player);
    try { player.pause(); } catch (e) {}
    try { player.currentTime = 0; } catch (e2) {}
    return player.play();
  }).catch(function () {
    // 再生失敗 → 短いビープ音で代替
    return AudioBus.beep(200, 440);
  });
}

/* ================== 数字グリッド：音量調整（ES5） ================== */
function setupSelectableGroup(gridSelector, onChange, playSound) {
  var grid = document.querySelector(gridSelector);
  if (!grid) return;
  var boxes = grid.querySelectorAll('.num-box');

  // 初期値
  var def = parseInt(grid.getAttribute('data-default'), 10);
  if (!isNaN(def) && def >= 1 && def <= boxes.length) {
    for (var i = 0; i < boxes.length; i++) boxes[i].classList.remove('active');
    var target = boxes[def - 1];
    if (target) {
      target.classList.add('active');
      if (typeof onChange === 'function') onChange(def);
    }
  }

  // クリックで選択変更
  var _loop = function (idx) {
    var box = boxes[idx];
    box.addEventListener('click', function () {
      for (var j = 0; j < boxes.length; j++) boxes[j].classList.remove('active');
      box.classList.add('active');
      var lv = parseInt(box.textContent.replace(/\s+/g, ''), 10);
      if (typeof onChange === 'function') onChange(lv);
      if (playSound) AudioBus.beep(150, 880); // 数値変更時は短いビープ音
    });
  };
  for (var i = 0; i < boxes.length; i++) _loop(i);
}

/* ================== VUメーター（任意） ================== */
function startVuLoop() {
  var canvas = document.getElementById('vu');
  var ctx2d = canvas && canvas.getContext ? canvas.getContext('2d') : null;
  var rmsEl = document.getElementById('rms');
  if (!canvas || !ctx2d) return;

  function draw(v) {
    var w = canvas.width, h = canvas.height;
    ctx2d.clearRect(0, 0, w, h);
    ctx2d.fillStyle = '#22324a';
    ctx2d.fillRect(0, 0, w, h);

    var grad = ctx2d.createLinearGradient(0, 0, w, 0);
    grad.addColorStop(0, '#34c759');
    grad.addColorStop(0.7, '#ffd60a');
    grad.addColorStop(1, '#ff3b30');
    ctx2d.fillStyle = grad;
    ctx2d.fillRect(0, 0, Math.max(0, Math.min(1, v)) * w, h);
  }

  (function loop() {
    var rms = AudioBus.getRMS();
    draw(rms * 2);
    if (rmsEl) rmsEl.textContent = rms.toFixed(3);
    window.requestAnimationFrame(loop);
  })();
}

/* ================== 初期化：数字グリッド＋音量アイコン＋マイクテスト ================== */
document.addEventListener('DOMContentLoaded', function () {
  AudioBus.init().then(function () {
    // ■ 出力音量（画面全体の音量）
    setupSelectableGroup(
      '.volume-grid',
      function (lv) { AudioBus.setOutputLevel(lv); },
      true // 数字をクリックした時にビープ音を鳴らす
    );

    // ■ マイク入力音量（録音 / ASR に影響）
    setupSelectableGroup(
      '.mic-grid',
      function (lv) { AudioBus.setInputLevel(lv); },
      false // マイク側は無音で切り替え
    );

    // ■ VUメーター（任意）
    startVuLoop();

    // ■ 音量アイコンをクリック → テスト音声を1曲再生
    var volIcon = document.querySelector('.icon-btn[aria-label="音量"]');
    if (volIcon) {
      volIcon.addEventListener('click', function () {
        playTestAudioFull();
      });
    }

    /* ============ 🎤 マイクテスト：ワンクリック録音 → 再生（自動リセット） ============ */
    var btnMicTest = document.getElementById('btnMicTest');
    var monitor = document.getElementById('monitor'); // 録音結果を流す audio タグ

    var recorder = null;
    var recordedChunks = [];
    var mode = 'idle'; // 'idle' | 'recording' | 'playing'
    var recordMaxTimer = null;
    var MAX_RECORD_MS = 10000; // ★ 最大録音時間：10秒（変更可）

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
      if (monitor) {
        try { monitor.pause(); } catch (e) {}
        try { monitor.currentTime = 0; } catch (e2) {}
      }
      if (btnMicTest) btnMicTest.textContent = 'マイクテスト';
    }

    // 再生が終わったら自動リセット
    if (monitor) {
      monitor.addEventListener('ended', function () {
        resetMicTest();
      });
    }

    if (btnMicTest) {
      btnMicTest.addEventListener('click', function () {
        // 再生中にクリック → 即停止して初期化
        if (mode === 'playing') {
          if (monitor) { try { monitor.pause(); } catch (e) {} }
          resetMicTest();
          return;
        }

        // 待機中 → 録音開始
        if (mode === 'idle') {
          var stream = AudioBus.stream();
          if (!stream) {
            alert('マイク入力を取得できませんでした。権限設定を確認してください。');
            return;
          }
          if (typeof MediaRecorder === 'undefined') {
            alert('このブラウザは録音機能をサポートしていません。');
            return;
          }

          try {
            recordedChunks = [];
            recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });

            recorder.ondataavailable = function (e) {
              if (e.data && e.data.size > 0) recordedChunks.push(e.data);
            };

            recorder.onstop = function () {
              clearRecordTimer();
              if (!recordedChunks.length || !monitor) {
                resetMicTest();
                return;
              }

              // 今回の録音を URL に変換して再生
              var blob = new Blob(recordedChunks, { type: 'audio/webm' });
              var url = URL.createObjectURL(blob);
              monitor.srcObject = null;
              monitor.src = url;

              mode = 'playing';
              btnMicTest.textContent = '録音を再生中…';
              monitor.play().catch(function () {
                resetMicTest();
              });
            };

            recorder.start();
            mode = 'recording';
            btnMicTest.textContent = '録音中…（最大10秒）クリックで停止';

            // 最長録音時間を過ぎたら自動 stop()
            recordMaxTimer = setTimeout(function () {
              if (mode === 'recording') {
                try { recorder.stop(); } catch (e3) { resetMicTest(); }
              }
            }, MAX_RECORD_MS);

          } catch (err) {
            console.error('MediaRecorder 初期化失敗: ', err);
            alert('録音テストを開始できませんでした。');
            resetMicTest();
          }

          return;
        }

        // 録音中にクリック → 手動停止して再生へ
        if (mode === 'recording') {
          clearRecordTimer();
          try {
            if (recorder) recorder.stop();
          } catch (err2) {
            console.error('recorder.stop 失敗:', err2);
            resetMicTest();
          }
        }
      });
    }

  }).catch(function (e) {
    console.error('音声初期化失敗：', e);
    alert('マイクの初期化に失敗しました。HTTPS か権限設定を確認してください。');
  });
});
