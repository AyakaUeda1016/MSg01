;(() => {
  console.log("[v0] tutorial.js 読み込み開始")

  // チュートリアル要素の取得を待つ
  window.addEventListener("DOMContentLoaded", () => {
    console.log("[v0] DOMContentLoaded - チュートリアル初期化")

    const tutorialOverlay = document.getElementById("tutorial-overlay")
    const tutorialTooltip = document.getElementById("tutorial-tooltip")
    const tutorialText = document.getElementById("tutorial-text")
    const tutorialStep = document.getElementById("tutorial-step")
    const skipButton = document.getElementById("skip-tutorial")

    // 要素の存在確認
    if (!tutorialOverlay || !tutorialTooltip || !tutorialText || !tutorialStep || !skipButton) {
      console.error("[v0] チュートリアル要素が見つかりません")
      return
    }

    console.log("[v0] チュートリアル要素が正常に取得されました")

    const tutorialSteps = [
      {
        text: "シミュレーション画面へようこそ!<br><br>これから画面の使い方を説明します。<br><br>クリックして次に進んでください。",
        target: null,
        position: "center",
      },
      {
        text: "ここにラリー数が表示されます。<br><br>現在のラリー数 / 最大ラリー数の形式で表示され、会話の進行状況を確認できます。",
        target: "#rally-counter",
        position: "bottom",
      },
      {
        text: "声のメーターです。<br><br>声量、声の抑揚、声の安定度がリアルタイムで表示されます。録音中に変化を確認できます。",
        target: "#score-meter",
        position: "right",
      },
      {
        text: "AIキャラクターです。<br><br>会話中はこのキャラクターが反応し、音声で応答します。",
        target: "#characterContainer",
        position: "bottom",
      },
      {
        text: "会話メッセージが表示されます。<br><br>AIからの応答がここに表示され、音声も再生されます。",
        target: "#message-box",
        position: "top",
      },
      {
        text: "録音ボタンです。<br><br>「録音開始」ボタンを押して話し、「停止」ボタンで録音を終了します。<br><br>それでは会話を楽しんでください!",
        target: "#recording-controls",
        position: "left",
      },
    ]

    let currentStep = 0
    let tutorialActive = false

    // チュートリアル開始
    function startTutorial() {
      console.log("[v0] チュートリアル開始")
      tutorialActive = true
      currentStep = 0
      showStep(currentStep)
    }

    function showStep(stepIndex) {
      console.log("[v0] ステップ表示:", stepIndex)

      if (stepIndex >= tutorialSteps.length) {
        endTutorial()
        return
      }

      const step = tutorialSteps[stepIndex]

      // すべてのハイライトをクリア
      document.querySelectorAll(".tutorial-highlight").forEach((el) => {
        el.classList.remove("tutorial-highlight")
      })

      // オーバーレイとツールチップを表示
      tutorialOverlay.style.display = "block"
      tutorialOverlay.classList.add("active")
      tutorialTooltip.style.display = "block"
      tutorialTooltip.classList.add("active")

      // テキストとステップ数を設定
      tutorialText.innerHTML = step.text
      tutorialStep.textContent = `${stepIndex + 1} / ${tutorialSteps.length}`

      // ツールチップのクラスとスタイルをリセット
      tutorialTooltip.className = "tutorial-tooltip active"
      tutorialTooltip.style.transform = ""

      if (step.target) {
        const targetElement = document.querySelector(step.target)
        if (targetElement) {
          targetElement.classList.add("tutorial-highlight")
          const rect = targetElement.getBoundingClientRect()
          positionTooltip(rect, step.position)
          console.log("[v0] ターゲット要素にハイライト:", step.target)
        } else {
          console.warn("[v0] ターゲット要素が見つかりません:", step.target)
        }
      } else {
        // 中央表示
        tutorialTooltip.classList.add("center")
        tutorialTooltip.style.left = "50%"
        tutorialTooltip.style.top = "50%"
        tutorialTooltip.style.transform = "translate(-50%, -50%)"
        console.log("[v0] 中央表示")
      }
    }

    function positionTooltip(rect, position) {
      // ツールチップのサイズを取得するため、一時的に表示
      tutorialTooltip.style.visibility = "hidden"
      tutorialTooltip.style.display = "block"
      const tooltipRect = tutorialTooltip.getBoundingClientRect()
      tutorialTooltip.style.visibility = "visible"

      const padding = 20
      tutorialTooltip.style.transform = "none"

      // 矢印のクラスをクリア
      tutorialTooltip.classList.remove("arrow-top", "arrow-bottom", "arrow-left", "arrow-right")

      switch (position) {
        case "top":
          tutorialTooltip.classList.add("arrow-bottom")
          tutorialTooltip.style.left = rect.left + rect.width / 2 - tooltipRect.width / 2 + "px"
          tutorialTooltip.style.top = rect.top - tooltipRect.height - padding + "px"
          break
        case "bottom":
          tutorialTooltip.classList.add("arrow-top")
          tutorialTooltip.style.left = rect.left + rect.width / 2 - tooltipRect.width / 2 + "px"
          tutorialTooltip.style.top = rect.bottom + padding + "px"
          break
        case "left":
          tutorialTooltip.classList.add("arrow-right")
          tutorialTooltip.style.left = rect.left - tooltipRect.width - padding + "px"
          tutorialTooltip.style.top = rect.top + rect.height / 2 - tooltipRect.height / 2 + "px"
          break
        case "right":
          tutorialTooltip.classList.add("arrow-left")
          tutorialTooltip.style.left = rect.right + padding + "px"
          tutorialTooltip.style.top = rect.top + rect.height / 2 - tooltipRect.height / 2 + "px"
          break
      }

      // 画面外に出ないよう調整
      const tooltipNewRect = tutorialTooltip.getBoundingClientRect()
      if (tooltipNewRect.right > window.innerWidth) {
        tutorialTooltip.style.left = window.innerWidth - tooltipRect.width - 20 + "px"
      }
      if (tooltipNewRect.left < 0) {
        tutorialTooltip.style.left = "20px"
      }
      if (tooltipNewRect.bottom > window.innerHeight) {
        tutorialTooltip.style.top = window.innerHeight - tooltipRect.height - 20 + "px"
      }
      if (tooltipNewRect.top < 0) {
        tutorialTooltip.style.top = "20px"
      }
    }

    // 次のステップへ
    function nextStep() {
      console.log("[v0] 次のステップへ")
      currentStep++
      showStep(currentStep)
    }

    // チュートリアル終了
    function endTutorial() {
      console.log("[v0] チュートリアル終了")
      tutorialActive = false
      tutorialOverlay.classList.remove("active")
      tutorialOverlay.style.display = "none"
      tutorialTooltip.classList.remove("active")
      tutorialTooltip.style.display = "none"
      document.querySelectorAll(".tutorial-highlight").forEach((el) => {
        el.classList.remove("tutorial-highlight")
      })
    }

    // イベントリスナー設定
    tutorialOverlay.addEventListener("click", (e) => {
      if (tutorialActive && e.target === tutorialOverlay) {
        console.log("[v0] オーバーレイクリック - 次のステップへ")
        nextStep()
      }
    })

    skipButton.addEventListener("click", (e) => {
      e.stopPropagation()
      console.log("[v0] スキップボタンクリック")
      endTutorial()
    })

    // ツールチップ自体をクリックしても次に進む
    tutorialTooltip.addEventListener("click", (e) => {
      if (tutorialActive && e.target !== skipButton && !skipButton.contains(e.target)) {
        console.log("[v0] ツールチップクリック - 次のステップへ")
        nextStep()
      }
    })

    // ページ読み込み時に自動的にチュートリアルを開始
    console.log("[v0] チュートリアルを自動開始")
    setTimeout(() => {
      startTutorial()
    }, 800)
  })
})()
