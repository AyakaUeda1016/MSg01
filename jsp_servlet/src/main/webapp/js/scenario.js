document.addEventListener("DOMContentLoaded", () => {
  const basePath = window.contextPath || "";
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
  const tooltipArrow = document.getElementById("tooltip-arrow");
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
      el.textContent += text.charAt(i);
      i++;
    }, speed);

    if (kind === "title") titleTimer = timer;
    else descTimer = timer;
  }

  [imgLeft, imgCenter, imgRight].forEach((img) => {
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
  }

  function switchGroup(dir) {
    if (isAnimating) return;
    isAnimating = true;

    const offset = dir === 1 ? -15 : 15;

    [imgLeft, imgCenter, imgRight].forEach((img) => {
      img.style.opacity = "0";
      img.style.transform = `translateX(${offset}px) scale(0.98)`;
    });

    setTimeout(() => {
      current = (current + dir + scenes.length) % scenes.length;
      renderImages();
      renderTexts();

      [imgLeft, imgCenter, imgRight].forEach((img) => {
        img.style.transition = "none";
        img.style.transform = `translateX(${-offset}px) scale(0.98)`;
        img.style.opacity = "0";
      });

      void imgCenter.offsetWidth;

      [imgLeft, imgCenter, imgRight].forEach((img) => {
        img.style.transition = "opacity 0.35s ease, transform 0.35s ease";
        img.style.transform = "translateX(0) scale(1)";
        img.style.opacity = "1";
      });

    }, 180);

    setTimeout(() => {
      isAnimating = false;
    }, 380);
  }

  btnLeft.addEventListener("click", () => switchGroup(-1));
  btnRight.addEventListener("click", () => switchGroup(1));

  // =============================================
  // ⭐ 決定ボタン → Flask にシナリオID送信
  // =============================================
  const decideBtn = document.getElementById("decide-btn");
  if (decideBtn) {
    decideBtn.addEventListener("click", async () => {
      const chosenId = scenes[current].id;  // ★ 選択中のシナリオID

      try {
        const res = await fetch("http://127.0.0.1:5000/api/set_scenario", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: chosenId }),
        });

        if (!res.ok) throw new Error("Flaskでエラー発生");

        // ★ 正常にセットできたら JSP の prepare.jsp へ遷移
        window.location.href = "prepare.jsp";

      } catch (err) {
        alert("シナリオ設定に失敗しました");
        console.error(err);
      }
    });
  }

  // =============================================
  // 以下チュートリアル処理（元コードそのまま）
  // =============================================

  const tutorialSteps = [
    {
      text: "この画面では、練習したいシナリオを選択できます。<br>左右の矢印ボタンでシナリオを切り替えて、気に入ったシナリオが見つかったら決定ボタンを押してください。<br><br><strong>画面をクリックして次の説明に進んでください。</strong>",
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

    document.querySelectorAll(".tutorial-highlight").forEach(el =>
      el.classList.remove("tutorial-highlight")
    );

    tutorialOverlay.style.display = "block";
    tutorialOverlay.classList.add("active");

    tutorialTooltip.style.display = "block";
    tutorialTooltip.classList.add("active");

    tutorialText.innerHTML = step.text;
    tutorialStep.textContent = `${stepIndex + 1} / ${tutorialSteps.length}`;

    tutorialTooltip.className = "tutorial-tooltip active";

    if (step.target) {
      const targetElement = document.getElementById(step.target);
      if (targetElement) {
        targetElement.classList.add("tutorial-highlight");
        positionTooltip(targetElement, step.position);
      }
    } else {
      tutorialTooltip.classList.add("center");
      tutorialTooltip.style.left = "50%";
      tutorialTooltip.style.top = "50%";
      tutorialTooltip.style.transform = "translate(-50%, -50%)";
    }
  }

  // チュートリアル補助処理は元コード通り…

  renderImages();
  renderTexts();
});
