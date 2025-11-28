document.addEventListener("DOMContentLoaded", () => {
  const basePath = window.contextPath || ""
  const scenes = [
    {
      id: 1,
      img: basePath + "/images/haru.png",
      title: "シナリオ1",
      desc: "みんなの前で自己紹介をやってみよう！",
    },
    {
      id: 2,
      img: basePath + "/images/kyo.png",
      title: "シナリオ2",
      desc: "先生に相談してみよう！",
    },
    {
      id: 3,
      img: basePath + "/images/natu.png",
      title: "シナリオ3",
      desc: "友達と放課後の予定を決めてみよう！",
    },
    // <CHANGE> シナリオ4を追加
    {
      id: 4,
      img: basePath + "/images/room.png",
      title: "シナリオ4",
      desc: "部活動の見学に行ってみよう！",
    },
    // <CHANGE> シナリオ5を追加
    {
      id: 5,
      img: basePath + "/images/sky.png",
      title: "シナリオ5",
      desc: "クラスメイトと冬の思い出を作ろう！",
    },
  ]

  // ... existing code ...

  const imgLeft = document.getElementById("scene-left")
  const imgCenter = document.getElementById("scene-center")
  const imgRight = document.getElementById("scene-right")
  const titleEl = document.getElementById("scenario-title")
  const descEl = document.getElementById("scenario-desc")
  const btnLeft = document.getElementById("btn-left")
  const btnRight = document.getElementById("btn-right")
  const helpBtn = document.getElementById("help-btn")
  const tutorialOverlay = document.getElementById("tutorial-overlay")
  const tutorialTooltip = document.getElementById("tutorial-tooltip")
  const tutorialText = document.getElementById("tutorial-text")
  const tutorialStep = document.getElementById("tutorial-step")
  const skipButton = document.getElementById("skip-tutorial")
  const tooltipArrow = document.getElementById("tooltip-arrow")
  const scenarioIdInput = document.getElementById("scenarioId")

  let current = 1
  let isAnimating = false
  let titleTimer = null
  let descTimer = null
  let currentStep = 0
  let tutorialActive = false

  function clearTyping() {
    if (titleTimer) {
      clearInterval(titleTimer)
      titleTimer = null
    }
    if (descTimer) {
      clearInterval(descTimer)
      descTimer = null
    }
  }

  /**
   * @param {HTMLElement} el
   * @param {string} text
   * @param {number} speed
   * @param {"title"|"desc"} kind
   */
  function typeText(el, text, speed, kind) {
    if (kind === "title" && titleTimer) {
      clearInterval(titleTimer)
      titleTimer = null
    }
    if (kind === "desc" && descTimer) {
      clearInterval(descTimer)
      descTimer = null
    }
    el.textContent = ""
    let i = 0
    const timer = setInterval(() => {
      if (i >= text.length) {
        clearInterval(timer)
        return
      }
      el.textContent += text.charAt(i)
      i++
    }, speed)
    if (kind === "title") {
      titleTimer = timer
    } else {
      descTimer = timer
    }
  }

  ;[imgLeft, imgCenter, imgRight].forEach((img) => {
    img.style.transition = "opacity 0.35s ease, transform 0.35s ease"
  })

  function renderImages() {
    const total = scenes.length
    const leftIndex = (current + total - 1) % total
    const rightIndex = (current + 1) % total
    imgCenter.src = scenes[current].img
    imgLeft.src = scenes[leftIndex].img
    imgRight.src = scenes[rightIndex].img
  }

  function renderTexts() {
    const scene = scenes[current]
    clearTyping()
    typeText(titleEl, scene.title, 60, "title")
    typeText(descEl, scene.desc, 35, "desc")
    if (scenarioIdInput) {
      scenarioIdInput.value = scene.id
    }
  }

  function switchGroup(dir) {
    if (isAnimating) return
    isAnimating = true
    const offset = dir === 1 ? -15 : 15
    ;[imgLeft, imgCenter, imgRight].forEach((img) => {
      img.style.opacity = "0"
      img.style.transform = `translateX(${offset}px) scale(0.98)`
    })
    setTimeout(() => {
      current = (current + dir + scenes.length) % scenes.length
      renderImages()
      renderTexts()
      ;[imgLeft, imgCenter, imgRight].forEach((img) => {
        img.style.transition = "none"
        img.style.transform = `translateX(${-offset}px) scale(0.98)`
        img.style.opacity = "0"
      })
      void imgCenter.offsetWidth
      ;[imgLeft, imgCenter, imgRight].forEach((img) => {
        img.style.transition = "opacity 0.35s ease, transform 0.35s ease"
        img.style.transform = "translateX(0) scale(1)"
        img.style.opacity = "1"
      })
    }, 180)
    setTimeout(() => {
      isAnimating = false
    }, 380)
  }

  btnLeft.addEventListener("click", () => {
    switchGroup(-1)
  })

  btnRight.addEventListener("click", () => {
    switchGroup(1)
  })

  const tutorialSteps = [
    {
      text: "この画面では、練習したいシナリオを選択できます。<br>左右の矢印ボタンでシナリオを切り替えて、気に入ったシナリオが見つかったら決定ボタンを押してください。<br><br><strong>画面をクリックして次の説明に進んでください。</strong>",
      target: null,
      position: "center",
    },
    {
      text: "前のシナリオに切り替えます。<br>クリックすると、左側に表示されているシナリオが中央に移動します。",
      target: "btn-left",
      position: "right",
    },
    {
      text: "次のシナリオに切り替えます。<br>クリックすると、右側に表示されているシナリオが中央に移動します。",
      target: "btn-right",
      position: "left",
    },
    {
      text: "中央に表示されているシナリオを選択して、準備画面に進みます。",
      target: "decide-btn",
      position: "top",
    },
  ]

  function startTutorial() {
    tutorialActive = true
    currentStep = 0
    showStep(currentStep)
  }

  function showStep(stepIndex) {
    if (stepIndex >= tutorialSteps.length) {
      endTutorial()
      return
    }
    const step = tutorialSteps[stepIndex]
    document.querySelectorAll(".tutorial-highlight").forEach((el) => {
      el.classList.remove("tutorial-highlight")
    })
    tutorialOverlay.style.display = "block"
    tutorialOverlay.classList.add("active")
    tutorialTooltip.style.display = "block"
    tutorialTooltip.classList.add("active")
    tutorialText.innerHTML = step.text
    tutorialStep.textContent = `${stepIndex + 1} / ${tutorialSteps.length}`
    tutorialTooltip.className = "tutorial-tooltip active"
    if (step.target) {
      const targetElement = document.getElementById(step.target)
      if (targetElement) {
        targetElement.classList.add("tutorial-highlight")
        positionTooltip(targetElement, step.position)
      } else {
        console.warn("[v0] ターゲット要素が見つかりません:", step.target)
      }
    } else {
      tutorialTooltip.classList.add("center")
      tutorialTooltip.style.left = "50%"
      tutorialTooltip.style.top = "50%"
      tutorialTooltip.style.transform = "translate(-50%, -50%)"
    }
  }

  function positionTooltip(targetElement, position) {
    const rect = targetElement.getBoundingClientRect()
    const tooltip = tutorialTooltip
    tooltip.style.visibility = "hidden"
    tooltip.style.display = "block"
    const tooltipRect = tooltip.getBoundingClientRect()
    tooltip.style.visibility = "visible"
    const padding = 20
    tooltip.style.transform = "none"
    switch (position) {
      case "top":
        tooltip.classList.add("arrow-bottom")
        tooltip.style.left = rect.left + rect.width / 2 - tooltipRect.width / 2 + "px"
        tooltip.style.top = rect.top - tooltipRect.height - padding + "px"
        break
      case "bottom":
        tooltip.classList.add("arrow-top")
        tooltip.style.left = rect.left + rect.width / 2 - tooltipRect.width / 2 + "px"
        tooltip.style.top = rect.bottom + padding + "px"
        break
      case "left":
        tooltip.classList.add("arrow-right")
        tooltip.style.left = rect.left - tooltipRect.width - padding + "px"
        tooltip.style.top = rect.top + rect.height / 2 - tooltipRect.height / 2 + "px"
        break
      case "right":
        tooltip.classList.add("arrow-left")
        tooltip.style.left = rect.right + padding + "px"
        tooltip.style.top = rect.top + rect.height / 2 - tooltipRect.height / 2 + "px"
        break
    }
    const finalLeft = Number.parseFloat(tooltip.style.left)
    const finalTop = Number.parseFloat(tooltip.style.top)
    if (finalLeft < 20) tooltip.style.left = "20px"
    if (finalLeft + tooltipRect.width > window.innerWidth - 20) {
      tooltip.style.left = window.innerWidth - tooltipRect.width - 20 + "px"
    }
    if (finalTop < 20) tooltip.style.top = "20px"
    if (finalTop + tooltipRect.height > window.innerHeight - 20) {
      tooltip.style.top = window.innerHeight - tooltipRect.height - 20 + "px"
    }
  }

  function endTutorial() {
    tutorialActive = false
    tutorialOverlay.classList.remove("active")
    tutorialOverlay.style.display = "none"
    tutorialTooltip.classList.remove("active")
    tutorialTooltip.style.display = "none"
    document.querySelectorAll(".tutorial-highlight").forEach((el) => {
      el.classList.remove("tutorial-highlight")
    })
  }

  function nextStep() {
    currentStep++
    showStep(currentStep)
  }

  if (helpBtn) {
    helpBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      startTutorial()
    })
  }

  if (skipButton) {
    skipButton.addEventListener("click", (e) => {
      e.stopPropagation()
      endTutorial()
    })
  }

  tutorialOverlay.addEventListener("click", (e) => {
    if (tutorialActive && e.target === tutorialOverlay) {
      nextStep()
    }
  })

  tutorialTooltip.addEventListener("click", (e) => {
    if (e.target !== skipButton && !skipButton.contains(e.target)) {
      nextStep()
    }
  })

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && tutorialActive) {
      endTutorial()
    }
  })

  renderImages()
  renderTexts()
})