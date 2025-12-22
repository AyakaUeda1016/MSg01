// ================================
// 棒グラフ画面(Chart.js 版)
// ================================

// グローバル変数
let graphPages = []
let currentPage = 0

// Chart.js のインスタンス(※これがないとエラーになる)
let evaluationChart = null

let currentChartType = "bar"

let selectedLineCategory = "自己認識"

// Declare the playChalkAnimation variable
const playChalkAnimation = null

const rankImages = {}
const rankImageUrls = {
  C: "/images/c.png",
  B: "/images/b.png",
  A: "/images/a.png",
  S: "/images/s.png",
}

let greatImage = null

// 画像をプリロードする関数
function preloadRankImages() {
  return Promise.all(
    Object.keys(rankImageUrls).map((rank) => {
      return new Promise((resolve, reject) => {
        const img = new Image()
        img.onload = () => {
          rankImages[rank] = img
          resolve()
        }
        img.onerror = reject
        img.src = rankImageUrls[rank]
      })
    }),
  )
}

function preloadGreatImage() {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      greatImage = img
      console.log("[v0] Great image loaded successfully")
      resolve()
    }
    img.onerror = (error) => {
      console.error("[v0] Failed to load great image:", error)
      reject(error)
    }
    img.src = "/images/great.png"
  })
}

/**
 * データベースから評価データを取得
 */
async function fetchEvaluationData() {
  console.log("[v0] Using test data directly (not fetching from DB)")
  return TEST_DATA
}

const TEST_DATA = [
  {
    timestamp: new Date(2024, 11, 1).getTime(),
    self_understanding: {
      score: 4,
      feedback: "まだ緊張が見られますが、少しずつ自分の言葉で話せるようになってきています。",
    },
    emotion_control: {
      score: 3,
      feedback: "焦りが表情に出ていますが、落ち着こうとする努力が感じられます。",
    },
    empathy: {
      score: 2,
      feedback: "相手を見ながら話せています。この姿勢を続けましょう。",
    },
    comprehension: {
      score: 5,
      feedback: "質問の意図を理解しようとしている様子が伺えます。",
    },
    speaking: {
      score: 8,
      feedback: "声のトーンに感情が表れています。とても良い表現です。",
    },
  },
  {
    timestamp: new Date(2024, 11, 3).getTime(),
    self_understanding: {
      score: 4,
      feedback: "自分の気持ちを少しずつ言葉にできるようになってきました。",
    },
    emotion_control: {
      score: 3,
      feedback: "まだ興奮しやすい場面がありますが、前回より改善されています。",
    },
    empathy: {
      score: 3,
      feedback: "相手の反応を見て話し方を調整できています。素晴らしいです。",
    },
    comprehension: {
      score: 6,
      feedback: "相手の話をしっかり聞いて、内容を理解できています。",
    },
    speaking: {
      score: 9,
      feedback: "自信を持って話せるようになってきました。この調子です。",
    },
  },
  {
    timestamp: new Date(2024, 11, 5).getTime(),
    self_understanding: {
      score: 5,
      feedback: "自分の感情を認識して、それを表現しようとしています。",
    },
    emotion_control: {
      score: 6,
      feedback: "落ち着いて話せる時間が増えてきました。良い傾向です。",
    },
    empathy: {
      score: 3,
      feedback: "相手の気持ちを考える余裕はまだ少ないですが、意識はできています。",
    },
    comprehension: {
      score: 7,
      feedback: "複雑な質問にも戸惑わず答えられるようになってきました。",
    },
    speaking: {
      score: 9,
      feedback: "言いたいことを明確に伝えられています。表現力が向上しています。",
    },
  },
  {
    timestamp: new Date(2024, 11, 7).getTime(),
    self_understanding: {
      score: 6,
      feedback: "自分らしさが出てきました。不安が減ってきている証拠です。",
    },
    emotion_control: {
      score: 8,
      feedback: "イライラする場面でも冷静に対応できています。素晴らしい成長です。",
    },
    empathy: {
      score: 5,
      feedback: "相手に寄り添った言葉選びができています。思いやりが感じられます。",
    },
    comprehension: {
      score: 7,
      feedback: "話の要点を素早く掴めるようになってきました。",
    },
    speaking: {
      score: 9,
      feedback: "説得力のある話し方ができています。聞き手を引き込む力があります。",
    },
  },
  {
    timestamp: new Date(2024, 11, 9).getTime(),
    self_understanding: {
      score: 6,
      feedback: "緊張せず、ありのままの自分で話せています。",
    },
    emotion_control: {
      score: 7,
      feedback: "感情の波をコントロールできるようになってきました。",
    },
    empathy: {
      score: 6,
      feedback: "相手が安心できる雰囲気を作れています。優しさが伝わります。",
    },
    comprehension: {
      score: 9,
      feedback: "相手の意図を深く理解して、適切に応答できています。",
    },
    speaking: {
      score: 10,
      feedback: "完璧な表現力です。自信に満ちた話し方ができています。",
    },
  },
  {
    timestamp: new Date(2024, 11, 11).getTime(),
    self_understanding: {
      score: 7,
      feedback: "自己理解が深まり、自分の強みを活かせています。",
    },
    emotion_control: {
      score: 8,
      feedback: "どんな状況でも冷静さを保てる力が身についています。",
    },
    empathy: {
      score: 8,
      feedback: "相手の立場に立って考えられています。共感力が高いです。",
    },
    comprehension: {
      score: 10,
      feedback: "完璧な理解力です。相手の言葉の裏にある意図まで読み取れています。",
    },
    speaking: {
      score: 10,
      feedback: "非常に分かりやすく、魅力的な話し方です。理想的です。",
    },
  },
  {
    timestamp: new Date(2024, 11, 13).getTime(),
    self_understanding: {
      score: 10,
      feedback: "完璧な自己認識です。自分を信じて堂々と表現できています。",
    },
    emotion_control: {
      score: 10,
      feedback: "感情をマスターしています。理想的なコントロールです。",
    },
    empathy: {
      score: 10,
      feedback: "最高レベルの思いやりです。相手を深く理解し、尊重できています。",
    },
    comprehension: {
      score: 10,
      feedback: "瞬時に相手の話を理解し、的確に反応できています。完璧です。",
    },
    speaking: {
      score: 9,
      feedback: "人を惹きつける話し方ができています。プロフェッショナルです。",
    },
  },
  {
    timestamp: new Date(2024, 11, 15).getTime(),
    self_understanding: {
      score: 8,
      feedback: "安定した自己表現ができています。自信が定着しています。",
    },
    emotion_control: {
      score: 9,
      feedback: "感情をポジティブにコントロールできています。",
    },
    empathy: {
      score: 10,
      feedback: "相手への配慮が自然にできています。素晴らしい共感力です。",
    },
    comprehension: {
      score: 7,
      feedback: "基本的な理解はできていますが、複雑な内容ではもう少し集中が必要です。",
    },
    speaking: {
      score: 6,
      feedback: "少し言葉に詰まる場面がありましたが、全体的には良い話し方です。",
    },
  },
  {
    timestamp: new Date(2024, 11, 17).getTime(),
    self_understanding: {
      score: 8,
      feedback: "自分の考えをしっかり持って話せています。",
    },
    emotion_control: {
      score: 9,
      feedback: "落ち着いた態度で臨めています。精神的な安定が見られます。",
    },
    empathy: {
      score: 10,
      feedback: "相手の気持ちを大切にする姿勢が一貫しています。",
    },
    comprehension: {
      score: 7,
      feedback: "理解しようとする努力は見られますが、時々確認が必要です。",
    },
    speaking: {
      score: 5,
      feedback: "表現に迷いが見られます。もう少しゆっくり話すと良いでしょう。",
    },
  },
  {
    timestamp: new Date(2024, 11, 20).getTime(),
    self_understanding: {
      score: 9,
      feedback: "自分の価値観を明確に持ち、それを表現できています。",
    },
    emotion_control: {
      score: 10,
      feedback: "完璧な感情管理です。どんな場面でも動じない強さがあります。",
    },
    empathy: {
      score: 8,
      feedback: "相手を思いやる気持ちが行動に表れています。",
    },
    comprehension: {
      score: 7,
      feedback: "話の流れを追えていますが、細部の確認をするとより良いです。",
    },
    speaking: {
      score: 6,
      feedback: "伝えたい気持ちは感じられますが、もう少し整理して話すと伝わりやすいです。",
    },
  },
]

/**
 * 日付を "M/D" 形式にフォーマット
 */
function formatDate(timestamp) {
  const date = new Date(timestamp)
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${month}/${day}`
}

/**
 * 評価データをページごとにグループ化(7件ずつ)
 */
function groupDataIntoPages(evaluations) {
  const pages = []
  const itemsPerPage = 7

  for (let i = 0; i < evaluations.length; i += itemsPerPage) {
    const pageData = evaluations.slice(i, i + itemsPerPage)

    const dates = []
    const selfUnderstandingValues = []
    const emotionControlValues = []
    const empathyValues = []
    const comprehensionValues = []
    const speakingValues = []
    const selfUnderstandingFeedback = []
    const emotionControlFeedback = []
    const empathyFeedback = []
    const comprehensionFeedback = []
    const speakingFeedback = []

    pageData.forEach((evaluation) => {
      dates.push(formatDate(evaluation.timestamp))
      selfUnderstandingValues.push(evaluation.self_understanding.score)
      emotionControlValues.push(evaluation.emotion_control.score)
      empathyValues.push(evaluation.empathy.score)
      comprehensionValues.push(evaluation.comprehension.score)
      speakingValues.push(evaluation.speaking.score)

      selfUnderstandingFeedback.push(evaluation.self_understanding.feedback)
      emotionControlFeedback.push(evaluation.emotion_control.feedback)
      empathyFeedback.push(evaluation.empathy.feedback)
      comprehensionFeedback.push(evaluation.comprehension.feedback)
      speakingFeedback.push(evaluation.speaking.feedback)
    })

    pages.push({
      dates: dates,
      data: [
        {
          category: "自己認識",
          color: "#a855f7",
          values: selfUnderstandingValues,
          feedbacks: selfUnderstandingFeedback,
        },
        {
          category: "気持ちのコントロール",
          color: "#ec4899",
          values: emotionControlValues,
          feedbacks: emotionControlFeedback,
        },
        { category: "思いやり", color: "#3b82f6", values: empathyValues, feedbacks: empathyFeedback },
        { category: "理解力", color: "#10b981", values: comprehensionValues, feedbacks: comprehensionFeedback },
        { category: "話す力", color: "#f97316", values: speakingValues, feedbacks: speakingFeedback },
      ],
    })
  }

  return pages
}

/**
 * グラフを描画(Chart.js版)
 */
function renderGraph() {
  const graphContent = document.getElementById("graphContent")
  const leftArrow = document.getElementById("leftArrow")
  const rightArrow = document.getElementById("rightArrow")

  // データがない場合
  if (graphPages.length === 0) {
    graphContent.innerHTML = '<div style="color: white; font-size: 18px;">データがありません</div>'
    leftArrow.classList.add("hidden")
    rightArrow.classList.add("hidden")
    return
  }

  // graphContent 内に canvas を 1 つ用意する
  let canvas = document.getElementById("evaluationChart")
  if (!canvas) {
    // 「読み込み中...」などを消す
    graphContent.innerHTML = ""
    canvas = document.createElement("canvas")
    canvas.id = "evaluationChart"
    graphContent.appendChild(canvas)
  }

  const page = graphPages[currentPage]

  // page.dates / page.data を Chart.js 用に変換
  const labels = page.dates

  const isLineChart = currentChartType === "line"

  const datasets = page.data.map((categoryData) => {
    const isSelected = isLineChart ? categoryData.category === selectedLineCategory : true

    // ★ 折れ線グラフ用の設定
    if (isLineChart) {
      return {
        type: "line",
        label: categoryData.category,
        data: categoryData.values,
        feedbacks: categoryData.feedbacks,
        backgroundColor: categoryData.color + "33",
        tension: 0.3,
        fill: false,
        borderWidth: 5,
        pointRadius: 5,
        pointHoverRadius: 7,
        hidden: !isSelected,
        borderColor: categoryData.color,
        pointBackgroundColor: categoryData.color,
        pointBorderColor: categoryData.color,
      }
    }

    return {
      type: "bar",
      label: categoryData.category,
      data: categoryData.values,
      feedbacks: categoryData.feedbacks,
      backgroundColor: categoryData.color,
      stack: "total",
      barPercentage: 0.7,
      categoryPercentage: 0.8,
      maxBarThickness: 32,
      hidden: false,
    }
  })

  const ctx = canvas.getContext("2d")

  // すでにグラフがあるなら destroy して作り直し
  if (evaluationChart) {
    evaluationChart.destroy()
  }

  const dailyMaxMin = []
  for (let i = 0; i < labels.length; i++) {
    const scores = []
    datasets.forEach((ds) => {
      if (!ds.hidden && ds.data[i] !== undefined) {
        scores.push(ds.data[i])
      }
    })
    dailyMaxMin.push({
      max: Math.max(...scores),
      min: Math.min(...scores),
    })
  }

  console.log("[v0] Daily max/min scores:", dailyMaxMin)

  const dailyTotals = []
  for (let i = 0; i < labels.length; i++) {
    let total = 0
    datasets.forEach((ds) => {
      if (!ds.hidden && ds.data[i] !== undefined) {
        total += ds.data[i]
      }
    })
    dailyTotals.push(total)
  }
  console.log("[v0] Daily totals:", dailyTotals)

  const rankZonePlugin = {
    id: "rankZoneBackground",
    beforeDraw: (chart) => {
      // 棒グラフのみ適用
      if (currentChartType !== "bar") return

      const { ctx, chartArea, scales } = chart
      if (!chartArea) return

      const yScale = scales.y
      const { left, right } = chartArea

      const zones = [
        { min: 0, max: 20, color: "rgba(113, 63, 18, 0.2)", label: "C", textColor: "#60a5fa" }, // C：青
        { min: 20, max: 30, color: "rgba(161, 98, 7, 0.3)", label: "B", textColor: "#22c55e" }, // B：緑
        { min: 30, max: 40, color: "rgba(234, 179, 8, 0.4)", label: "A", textColor: "#f97316" }, // A：オレンジ
        { min: 40, max: 50, color: "rgba(255, 215, 0, 0.5)", label: "S", textColor: "#FFD700" }, // S：赤
      ]

      // 各ゾーンを描画
      zones.forEach((zone) => {
        const yTop = yScale.getPixelForValue(zone.max)
        const yBottom = yScale.getPixelForValue(zone.min)
        const height = yBottom - yTop

        // ゾーンの背景色
        ctx.fillStyle = zone.color
        ctx.fillRect(left, yTop, right - left, height)

        // ゾーンの境界線
        ctx.strokeStyle = "rgba(255, 255, 255, 0.3)"
        ctx.lineWidth = 2
        ctx.beginPath()
        ctx.moveTo(left, yTop)
        ctx.lineTo(right, yTop)
        ctx.stroke()

        ctx.save()
        ctx.fillStyle = zone.textColor
        ctx.font = "bold 28px Arial"
        ctx.textAlign = "right"
        ctx.textBaseline = "middle"
        const labelY = (yTop + yBottom) / 2
        ctx.fillText(zone.label, left - 15, labelY)
        ctx.restore()
      })
    },
  }

  const greatImagePlugin = {
    id: "greatImageDisplay",
    afterDraw: (chart) => {
      // 棒グラフのみ適用
      if (currentChartType !== "bar") return
      // great画像が読み込まれていない場合はスキップ
      if (!greatImage) return

      const { ctx, chartArea, scales } = chart
      if (!chartArea) return

      const xScale = scales.x
      const yScale = scales.y

      // 各日付の合計点数をチェック
      labels.forEach((label, index) => {
        const total = dailyTotals[index]

        // 40点を超えた場合のみ表示
        if (total > 40) {
          const x = xScale.getPixelForTick(index)
          const yTop = chartArea.top

          // 画像サイズを小さく設定（元の30%程度）
          const imgWidth = 80
          const imgHeight = (greatImage.height / greatImage.width) * imgWidth

          // グラフの上部に配置（グラフの位置は変えない）
          const imgX = x - imgWidth / 2
          const imgY = yTop - imgHeight - 5 // グラフの上部から少し上に配置

          ctx.drawImage(greatImage, imgX, imgY, imgWidth, imgHeight)

          console.log(`[v0] Drew great image for ${label} (total: ${total}) at position (${imgX}, ${imgY})`)
        }
      })
    },
  }

  evaluationChart = new window.Chart(ctx, {
    type: currentChartType,
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      clip: false,

      layout: {
        padding: {
          top: isLineChart ? 80 : 40,
          left: isLineChart ? 20 : 60,
          right: isLineChart ? 20 : 20,
        },
      },
      plugins: {
        legend: {
          display: false,
          position: "bottom",
          labels: {
            color: "#ffffff",
            font: {
              size: 12,
            },
          },
        },
        tooltip: {
          backgroundColor: (context) => {
            if (currentChartType !== "bar") {
              return "rgba(40, 40, 40, 0.95)"
            }

            const dataIndex = context.tooltip.dataPoints[0].dataIndex
            const datasetIndex = context.tooltip.dataPoints[0].datasetIndex
            const currentScore = datasets[datasetIndex].data[dataIndex]

            const maxScore = dailyMaxMin[dataIndex].max
            const minScore = dailyMaxMin[dataIndex].min

            console.log(
              "[v0] Tooltip for day:",
              dataIndex,
              "dataset:",
              datasetIndex,
              "score:",
              currentScore,
              "max:",
              maxScore,
              "min:",
              minScore,
            )

            if (currentScore === maxScore) {
              console.log("[v0] Setting RED for max score")
              return "rgba(239, 68, 68, 0.95)" // 赤色(最高点数)
            } else if (currentScore === minScore) {
              console.log("[v0] Setting BLUE for min score")
              return "rgba(59, 130, 246, 0.95)" // 青色(最低点数)
            } else {
              return "rgba(40, 40, 40, 0.95)" // デフォルト
            }
          },
          titleColor: "#ffffff",
          bodyColor: "#ffffff",
          borderColor: "rgba(255, 255, 255, 0.2)",
          borderWidth: 1,
          padding: 16,
          displayColors: false,
          titleFont: {
            size: 0,
          },
          bodyFont: {
            size: 20,
            weight: "normal",
          },
          callbacks: {
            title: () => {
              return ""
            },
            label: (context) => {
              const dataIndex = context.dataIndex
              const dataset = context.dataset
              const feedback = dataset.feedbacks ? dataset.feedbacks[dataIndex] : ""
              return feedback
            },
            afterLabel: () => {
              return ""
            },
          },
        },
      },

      scales: {
        x: {
          stacked: !isLineChart,
          title: {
            display: true,
            text: "一日の最高点数",
            color: "#ffffff",
            font: {
              size: 18,
              weight: "bold",
            },
            padding: {
              top: 15,
            },
          },
          ticks: {
            color: "#ffffff",
            font: {
              size: 20,
            },
          },
          grid: {
            display: false,
          },
        },
        y: {
          stacked: !isLineChart,
          min: 0,
          max: isLineChart ? 10 : 50,
          ticks: {
            display: isLineChart ? true : false,
            stepSize: isLineChart ? 1 : 10,
            color: "#ffffff",
            font: {
              size: 20,
            },
            callback: (value) => {
              if (isLineChart && value > 10.5) {
                return ""
              }
              // 棒グラフの場合は20, 30, 40, 50のみ表示
              if (!isLineChart) {
                if ([20, 30, 40, 50].includes(value)) {
                  return value
                }
                return null
              }
              return value
            },
          },
          grid: {
            color: (context) => {
              if (isLineChart) {
                // 折れ線グラフは0-10の全ての横線を表示
                return "rgba(255,255,255,0.8)"
              }
              // 棒グラフは20, 30, 40, 50の位置にのみグリッド線を表示
              if ([20, 30, 40, 50].includes(context.tick.value)) {
                return "rgba(255,255,255,0.8)"
              }
              return "transparent"
            },
            lineWidth: 1.5,
            display: true,
          },
        },
      },
    },
    plugins: [rankZonePlugin, greatImagePlugin],
  })

  setupCustomLegendControls()

  // 矢印ボタンの表示制御
  if (currentPage === 0) {
    leftArrow.classList.add("hidden")
  } else {
    leftArrow.classList.remove("hidden")
  }

  if (currentPage === graphPages.length - 1) {
    rightArrow.classList.add("hidden")
  } else {
    rightArrow.classList.remove("hidden")
  }
}

function setupCustomLegendControls() {
  const legendItems = document.querySelectorAll(".legend-item")
  if (!evaluationChart) return

  legendItems.forEach((item) => {
    const category = item.dataset.category
    if (!category) return

    const isSelected = currentChartType === "line" ? category === selectedLineCategory : true

    if (currentChartType === "line") {
      // 折れ線グラフモード:選択されていない凡例を薄く表示し、クリック可能
      item.classList.toggle("is-dimmed", !isSelected)
      item.style.cursor = "pointer"

      item.onclick = () => {
        selectedLineCategory = category
        renderGraph()
      }
    } else {
      // 棒グラフモード:全て通常表示でクリック不可
      item.classList.remove("is-dimmed")
      item.style.cursor = "default"
      item.onclick = null
    }
  })
}

/**
 * 初期化処理
 */
async function initialize() {
  try {
    await preloadGreatImage()
  } catch (error) {
    console.error("[v0] Failed to preload great image, continuing anyway:", error)
  }

  const evaluations = await fetchEvaluationData()

  // データをページごとにグループ化
  graphPages = groupDataIntoPages(evaluations)

  // 初期ページを描画
  currentPage = 0
  renderGraph()
}

// 左矢印クリック
document.getElementById("leftArrow").addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--
    renderGraph()
  }
})

// 右矢印クリック
document.getElementById("rightArrow").addEventListener("click", () => {
  if (currentPage < graphPages.length - 1) {
    currentPage++
    renderGraph()
  }
})

// 棒グラフボタン
document.getElementById("btnBar").addEventListener("click", () => {
  console.log("[v0] Bar button clicked, currentChartType:", currentChartType)
  if (currentChartType === "bar") return

  currentChartType = "bar"
  document.getElementById("pageTitle").textContent = "自己紹介の成長記録"
  console.log("[v0] Switched to bar chart")
  renderGraph()
})

// 折れ線ボタン
document.getElementById("btnLine").addEventListener("click", () => {
  console.log("[v0] Line button clicked, currentChartType:", currentChartType)
  if (currentChartType === "line") return

  currentChartType = "line"
  document.getElementById("pageTitle").textContent = "折れ線グラフ画面"
  console.log("[v0] Switched to line chart")
  renderGraph()
})

// ページスライドで黒板のみ動かす
document.getElementById("navLeftArrow").onclick = () => {
  const board = document.querySelector(".blackboard-container")
  board.classList.add("slide-out-right")
  setTimeout(() => {
    window.location.href = "growth_record"
  }, 500)
}

// ページ読み込み時に初期化
window.addEventListener("DOMContentLoaded", initialize)
