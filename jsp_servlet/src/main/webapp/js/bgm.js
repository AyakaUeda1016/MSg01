/**
 * BGM切り替え用
 */
console.log("bgm.js loaded / contextPath =", contextPath);
let bgm = new Audio();
let bgmFadeTimer = null;
bgm.loop = true;
bgm.volume = 0.7;

function setBgm(src) {
  // 同じ曲 & 再生中なら何もしない
  if (bgm.src && bgm.src.endsWith(src) && !bgm.paused) {
    return;
  }

  bgm.pause();
  bgm.src = src;          // ★ new Audio しない
  bgm.currentTime = 0;
  bgm.volume = 0.7;

  bgm.play().catch(err => {
    console.warn("BGM play blocked:", err);
  });
}

function stopBgm() {
  bgm.pause();
  bgm.currentTime = 0;
  bgm.src = ""; 
}

window.addEventListener("message", (e) => {
  const page = e.data.page;
  if (!page) return;

  if (page === "normal") {
    setBgm(`${contextPath}/bgm/A.mp3`);
  }
  else if (page === "simulation") {
	stopBgm(); // ★ シミュレーションは無音
    //setBgm(`${contextPath}/bgm/C.mp3`); 一応残しときます。
  }
  else if (page === "growth_record") {
    setBgm(`${contextPath}/bgm/B.mp3`);
  }
});

window.changeBgmVolume = function (v) {
  if (!bgm) return;
  bgm.volume = Math.max(0, Math.min(1, v));
};

function fadeBgmVolume(target, duration = 200) {
  clearInterval(bgmFadeTimer);

  const start = bgm.volume;
  const diff = target - start;
  const steps = duration / 20;
  let count = 0;

  bgmFadeTimer = setInterval(() => {
    count++;
    bgm.volume = start + diff * (count / steps);

    if (count >= steps) {
      bgm.volume = target;
      clearInterval(bgmFadeTimer);
    }
  }, 20);
}

function lowerBgmForRecording() {
  fadeBgmVolume(0.3, 200); // -20dB 相当
}

function restoreBgmAfterRecording() {
  fadeBgmVolume(0.7, 300);
}

/* iframe から呼べるように */
window.lowerBgmForRecording = lowerBgmForRecording;
window.restoreBgmAfterRecording = restoreBgmAfterRecording;

/* ===== デバッグ用：BGM音量監視 ===== */
setInterval(() => {
  if (bgm) {
    console.log("[DEBUG] BGM volume:", bgm.volume);
  }
}, 500);
