document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOMContentLoaded - Starting radar chart initialization")

  //  /* =========================================================
  //   *  フィードバック JSON(テスト用)
  //   *  ※ あとでサーブレットから渡される想定
  //   * ========================================================= */
  const feedbackData = {
    timestamp: "2025-11-19T11:22:33",
    scores: {
      self_understanding: {
        score: 7, //自己認識
        comment: "自己認識：気持ちを言葉にできています。この調子です。",
      },
      speaking: {
        score: 5, //気持ちのコントロール
        comment: "気持ちのコントロール：感情に気づけている点がとても良いです。",
      },
      comprehension: {
        score: 4, //思いやり
        comment: "思いやり：相手を意識して話そうとする姿勢が見られました。",
      },
      emotion_control: {
        score: 5, //理解力
        comment: "理解力：相手の話をしっかり受け取ろうとしています。",
      },
      empathy: {
        score: 5, //話す力
        comment: "話す力：感情がこもった表現ができています。",
      },
    },
    total_score: 25,
    overall_comment:
      "まずは「相手の立場で一言添える」ことを目標にしてみましょう。小さな意識の積み重ねが、会話全体の印象を大きく変えていきます。",
  }

  /* =========================================================
   *  右側：Chart.js レーダーチャート描画
   * ========================================================= */
  const canvas = document.getElementById("radarChart")
  console.log("[v0] Canvas element:", canvas)
  console.log("[v0] window.Chart available:", !!window.Chart)

  if (canvas && window.Chart) {
    const ctx = canvas.getContext("2d")

    const scoreKeys = ["self_understanding", "speaking", "comprehension", "emotion_control", "empathy"]

    const radarScores = scoreKeys.map((key) => {
      const raw = feedbackData.scores[key]?.score || 0
      return raw
    })

    const minScore = Math.min(...radarScores)
    const minScoreIndex = radarScores.indexOf(minScore)

    const maxScore = Math.max(...radarScores)
    const maxScoreIndex = radarScores.indexOf(maxScore)

    const radarData = {
      labels: ["自己認識", "気持ち", "思いやり", "理解力", "話す力"],
      datasets: [
        {
          label: "今回の評価",
          data: radarScores,
          fill: true,
          backgroundColor: "rgba(255,255,255,0.18)",
          borderColor: "rgba(255,255,255,0.9)",
          borderWidth: 2,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#ffffff",
          pointHoverBackgroundColor: "#000000",
          pointHoverBorderColor: "#ffffff",
        },
      ],
    }

    const scores = radarData.datasets[0].data

    const radarOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: {
            display: false,
            stepSize: 1,
            color: "#ffffff",
            showLabelBackdrop: false,
            font: { size: 11 },
          },
          grid: {
            color: "rgba(255,255,255,0.25)",
          },
          angleLines: {
            color: "rgba(255,255,255,0.35)",
          },
          pointLabels: {
            color: (context) => {
              if (context.index === minScoreIndex) return "#4299e1"
              if (context.index === maxScoreIndex) return "#ffd700"
              return "#ffffff"
            },
            font: (context) => {
              if (context.index === minScoreIndex || context.index === maxScoreIndex) {
                return { size: 30, weight: "bold" }
              }
              return { size: 24 }
            },
            callback: (label, index) => {
              const value = scores[index] ?? ""
              return `${label} ${value}`
            },
          },
        },
      },
    }

    const chart = new Chart(ctx, {
      type: "radar",
      data: radarData,
      options: radarOptions,
    })
    console.log("[v0] Radar chart created successfully:", chart)
  } else {
    console.warn("[v0] Chart.js または #radarChart が存在しないため、レーダーチャートを描画できません。")
  }

  /* =========================================================
   *  左側：成長記録フィードバックのスライドイン演出
   * ========================================================= */
  const leftSection = document.querySelector(".left-section")
  if (!leftSection) return

  const sectionTitle = leftSection.querySelector(".title")
  const feedbackTitle = leftSection.querySelector(".feedback-title")
  const feedbackItems = leftSection.querySelectorAll(".feedback-item")

  try {
    const keys = ["self_understanding", "speaking", "comprehension", "emotion_control", "empathy"]
    const commentEls = leftSection.querySelectorAll(".feedback-item p")

    let lowestScoreKey = keys[0]
    let lowestScore = feedbackData.scores[keys[0]]?.score || 10

    let highestScoreKey = keys[0]
    let highestScore = feedbackData.scores[keys[0]]?.score || 0

    keys.forEach((key) => {
      const score = feedbackData.scores[key]?.score || 0
      if (score < lowestScore) {
        lowestScore = score
        lowestScoreKey = key
      }
      if (score > highestScore) {
        highestScore = score
        highestScoreKey = key
      }
    })

    keys.forEach((key, index) => {
      const item = feedbackData.scores[key]
      const p = commentEls[index]
      if (item && p) {
        p.textContent = item.comment
        if (key === lowestScoreKey) {
          feedbackItems[index].classList.add("feedback-item-lowest")
        }
        if (key === highestScoreKey) {
          feedbackItems[index].classList.add("feedback-item-highest")
        }
      }
    })
  } catch (e) {
    console.error("[v0] フィードバック JSON 反映中にエラー:", e)
  }

  const rankimg = document.querySelector(".icon-s")
  const smile = document.querySelector(".icon-smile")
  const line = document.querySelector(".icon-underline")
  const rankimagePath = {
    S: "images/S.png",
    A: "images/A.png",
    B: "images/B.png",
    C: "images/C.png",
  }
  const smileimagePath = {
    S: "images/smile2.png",
    A: "images/smile.png",
    B: "images/expressionless.png",
    C: "images/sad.png",
  }
  const lineimagePath = {
    S: "images/line.png",
    A: "images/line2.png",
    B: "images/line2.png",
    C: "images/line2.png",
  }

  if (feedbackData.total_score != null) {
    const totalscore = feedbackData.total_score
    let rank = ""
    if (totalscore >= 40) {
      rank = "S"
    } else if (totalscore >= 30) {
      rank = "A"
    } else if (totalscore >= 20) {
      rank = "B"
    } else {
      rank = "C"
    }

    if (rankimg) {
      rankimg.src = rankimagePath[rank] || "images/C.png"
    }

    if (smile) {
      smile.src = smileimagePath[rank] || "images/sad.png"
    }

    if (line) {
      line.src = lineimagePath[rank] || "images/下線2.png"
    }
  }

  /* ---------------------------------------------------------
   *  ここから先は見た目のアニメーション
   * --------------------------------------------------------- */
  const blockTargets = []
  if (sectionTitle) blockTargets.push(sectionTitle)
  if (feedbackTitle) blockTargets.push(feedbackTitle)
  feedbackItems.forEach((item) => blockTargets.push(item))

  const baseDelay = 200

  blockTargets.forEach((el, index) => {
    el.style.opacity = "0"
    el.style.transform = "translateX(-24px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"

    setTimeout(() => {
      el.style.opacity = "1"
      el.style.transform = "translateX(0)"
    }, baseDelay * index)
  })

  const textOffset = 120
  feedbackItems.forEach((item) => {
    const p = item.querySelector("p")
    if (!p) return

    const blockIndex = blockTargets.indexOf(item)
    if (blockIndex === -1) return

    p.style.opacity = "0"
    p.style.transform = "translateX(-8px)"
    p.style.transition = "opacity 0.4s ease, transform 0.4s ease"

    setTimeout(
      () => {
        p.style.opacity = "1"
        p.style.transform = "translateX(0)"
      },
      baseDelay * blockIndex + textOffset,
    )
  })
})
