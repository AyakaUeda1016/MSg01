document.addEventListener("DOMContentLoaded", () => {
  const basePath = window.contextPath || "";
 
  // initialScenarioId を元に current を設定
  let current = scenes.findIndex(s => s.id === initialScenarioId);
  if (current === -1) current = 0;
 
  const imgLeft = document.getElementById("scene-left");
  const imgCenter = document.getElementById("scene-center");
  const imgRight = document.getElementById("scene-right");
  const titleEl = document.getElementById("scenario-title");
  const descEl = document.getElementById("scenario-desc");
  const btnLeft = document.getElementById("btn-left");
  const btnRight = document.getElementById("btn-right");
  const helpBtn = document.getElementById("help-btn");
  const tutorialOverlay = document.getElementById("tutorial-overlay");
  const tutorialTooltip = document.getElementById("tutorial-tooltip");
  const tutorialText = document.getElementById("tutorial-text");
  const tutorialStep = document.getElementById("tutorial-step");
  const skipButton = document.getElementById("skip-tutorial");
  const scenarioIdInput = document.getElementById("scenarioId");
 
  let isAnimating = false;
  let titleTimer = null;
  let descTimer = null;
  let currentStep = 0;
  let tutorialActive = false;
 
  function clearTyping() {
    if (titleTimer) clearInterval(titleTimer);
    if (descTimer) clearInterval(descTimer);
    titleTimer = null;
    descTimer = null;
  }
 
  function typeText(el, text, speed, kind) {
    if (kind === "title" && titleTimer) clearInterval(titleTimer);
    if (kind === "desc" && descTimer) clearInterval(descTimer);
 
    el.textContent = "";
    let i = 0;
    const timer = setInterval(() => {
      if (i >= text.length) {
        clearInterval(timer);
        return;
      }
      el.textContent += text.charAt(i++);
    }, speed);
 
    if (kind === "title") titleTimer = timer;
    else descTimer = timer;
  }
 
  [imgLeft, imgCenter, imgRight].forEach(img => {
    img.style.transition = "opacity 0.35s ease, transform 0.35s ease";
  });
 
  function renderImages() {
    const total = scenes.length;
    const leftIndex = (current + total - 1) % total;
    const rightIndex = (current + 1) % total;
    imgCenter.src = scenes[current].img;
    imgLeft.src = scenes[leftIndex].img;
    imgRight.src = scenes[rightIndex].img;
  }
 
  function renderTexts() {
    const scene = scenes[current];
    clearTyping();
    typeText(titleEl, scene.title, 60, "title");
    typeText(descEl, scene.desc, 35, "desc");
    if (scenarioIdInput) scenarioIdInput.value = scene.id;
    window.CURRENT_SCENARIO_ID = scene.id;
  }
 
  function switchGroup(dir) {
    if (isAnimating) return;
    isAnimating = true;
 
    const offset = dir === 1 ? -15 : 15;
    [imgLeft, imgCenter, imgRight].forEach(img => {
      img.style.opacity = "0";
      img.style.transform = `translateX(${offset}px) scale(0.98)`;
    });
 
    setTimeout(() => {
      current = (current + dir + scenes.length) % scenes.length;
      renderImages();
      renderTexts();
 
      [imgLeft, imgCenter, imgRight].forEach(img => {
        img.style.transition = "none";
        img.style.transform = `translateX(${-offset}px) scale(0.98)`;
        img.style.opacity = "0";
      });
 
      void imgCenter.offsetWidth;
 
      [imgLeft, imgCenter, imgRight].forEach(img => {
        img.style.transition = "opacity 0.35s ease, transform 0.35s ease";
        img.style.transform = "translateX(0) scale(1)";
        img.style.opacity = "1";
      });
    }, 180);
 
    setTimeout(() => {
      isAnimating = false;
    }, 380);
  }
 
  if (btnLeft) btnLeft.addEventListener("click", () => switchGroup(-1));
  if (btnRight) btnRight.addEventListener("click", () => switchGroup(1));
 
  const tutorialSteps = [
    {
      text: "この画面では、練習したいシナリオを選択できます。",
      target: null,
      position: "center",
    },
    {
      text: "前のシナリオに切り替えます。",
      target: "btn-left",
      position: "right",
    },
    {
      text: "次のシナリオに切り替えます。",
      target: "btn-right",
      position: "left",
    },
    {
      text: "中央のシナリオを選択します。",
      target: "decide-btn",
      position: "top",
    },
  ];
 
  function startTutorial() {
    tutorialActive = true;
    currentStep = 0;
    showStep(currentStep);
  }
 
  function showStep(stepIndex) {
    if (stepIndex >= tutorialSteps.length) {
      endTutorial();
      return;
    }
 
    const step = tutorialSteps[stepIndex];
    tutorialOverlay.style.display = "block";
    tutorialTooltip.style.display = "block";
    tutorialText.innerHTML = step.text;
    tutorialStep.textContent = `${stepIndex + 1} / ${tutorialSteps.length}`;
  }
 
  function endTutorial() {
    tutorialActive = false;
    tutorialOverlay.style.display = "none";
    tutorialTooltip.style.display = "none";
  }
 
  if (helpBtn) helpBtn.addEventListener("click", startTutorial);
  if (skipButton) skipButton.addEventListener("click", endTutorial);
 
  if (tutorialOverlay) {
    tutorialOverlay.addEventListener("click", e => {
      if (tutorialActive && e.target === tutorialOverlay) {
        currentStep++;
        showStep(currentStep);
      }
    });
  }
 
  // =============================================
  // ★ 決定ボタン：ここで初めて Flask に送る
  // =============================================
  const form = document.getElementById("scenarioForm");
if (form) {
  form.addEventListener("submit", async (e) => {
    e.preventDefault(); // ★一時停止
 
    const chosenId = scenes[current].id;
    scenarioIdInput.value = chosenId;
 
    sbInput.value = "decide";
 
    try {
      await fetch("http://127.0.0.1:5000/api/set_scenario", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: chosenId })
      });
 
      console.log("[Flask] シナリオ確定:", chosenId);
 
      // ★ ここで初めてサーブレット遷移
      form.submit();
 
    } catch (err) {
      console.error("[Flask] シナリオ送信失敗", err);
      alert("シナリオ設定に失敗しました");
    }
  });
}
 
 
  renderImages();
  renderTexts();
});