/**
 * BGM切り替え用
 */
console.log("bgm.js loaded / contextPath =", contextPath);
let bgm = new Audio();
let bgmFadeTimer = null;
bgm.loop = true;
bgm.volume = 0.7;

function setBgm(src) {
  if (bgm.src && bgm.src.endsWith(src)) return; // 同じなら切り替えない
  bgm.pause();
  bgm = new Audio(src);
  bgm.loop = true;
  bgm.volume = 0.7;
  bgm.play();
}

window.addEventListener("message", (e) => {
  const page = e.data.page;
  if (!page) return;

  if (page === "normal") {
    setBgm(`${contextPath}/bgm/A.mp3`);
  }
  else if (page === "simulation") {
    setBgm(`${contextPath}/bgm/C.mp3`);
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
