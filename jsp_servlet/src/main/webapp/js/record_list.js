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

/**
 * データベースから評価データを取得
 */
async function fetchEvaluationData() {
  console.log("[v0] Using test data directly (not fetching from DB)")
  return TEST_DATA
}

const TEST_DATA = [
  {
    timestamp: new Date(2024, 0, 5).getTime(),
    self_understanding: { score: 2 },
    emotion_control: { score: 3 },
    empathy: { score: 4 },
    comprehension: { score: 5 },
    speaking: { score: 8 },
  },
  {
    timestamp: new Date(2024, 0, 8).getTime(),
    self_understanding: { score: 4 },
    emotion_control: { score: 3 },
    empathy: { score: 7 },
    comprehension: { score: 6 },
    speaking: { score: 9 },
  },
  {
    timestamp: new Date(2024, 0, 12).getTime(),
    self_understanding: { score: 5 },
    emotion_control: { score: 6 },
    empathy: { score: 3 },
    comprehension: { score: 7 },
    speaking: { score: 9 },
  },
  {
    timestamp: new Date(2024, 0, 15).getTime(),
    self_understanding: { score: 6 },
    emotion_control: { score: 8 },
    empathy: { score: 8 },
    comprehension: { score: 7 },
    speaking: { score: 9 },
  },
  {
    timestamp: new Date(2024, 0, 19).getTime(),
    self_understanding: { score: 6 },
    emotion_control: { score: 7 },
    empathy: { score: 8 },
    comprehension: { score: 9 },
    speaking: { score: 10 },
  },
  {
    timestamp: new Date(2024, 0, 22).getTime(),
    self_understanding: { score: 7 },
    emotion_control: { score: 8 },
    empathy: { score: 9 },
    comprehension: { score: 10 },
    speaking: { score: 10 },
  },
  {
    timestamp: new Date(2024, 0, 26).getTime(),
    self_understanding: { score: 10 },
    emotion_control: { score: 10 },
    empathy: { score: 10 },
    comprehension: { score: 10 },
    speaking: { score: 9 },
  },
  {
    timestamp: new Date(2024, 0, 29).getTime(),
    self_understanding: { score: 8 },
    emotion_control: { score: 9 },
    empathy: { score: 10 },
    comprehension: { score: 7 },
    speaking: { score: 6 },
  },
  {
    timestamp: new Date(2024, 1, 2).getTime(),
    self_understanding: { score: 8 },
    emotion_control: { score: 9 },
    empathy: { score: 10 },
    comprehension: { score: 7 },
    speaking: { score: 5 },
  },
  {
    timestamp: new Date(2024, 1, 5).getTime(),
    self_understanding: { score: 9 },
    emotion_control: { score: 10 },
    empathy: { score: 8 },
    comprehension: { score: 7 },
    speaking: { score: 6 },
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

    pageData.forEach((evaluation) => {
      dates.push(formatDate(evaluation.timestamp))
      selfUnderstandingValues.push(evaluation.self_understanding.score)
      emotionControlValues.push(evaluation.emotion_control.score)
      empathyValues.push(evaluation.empathy.score)
      comprehensionValues.push(evaluation.comprehension.score)
      speakingValues.push(evaluation.speaking.score)
    })

    pages.push({
      dates: dates,
      data: [
        { category: "自己認識", color: "#a855f7", values: selfUnderstandingValues },
        { category: "気持ちのコントロール", color: "#ec4899", values: emotionControlValues },
        { category: "思いやり", color: "#3b82f6", values: empathyValues },
        { category: "理解力", color: "#10b981", values: comprehensionValues },
        { category: "話す力", color: "#f97316", values: speakingValues },
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
        { min: 0, max: 20, color: "rgba(113, 63, 18, 0.2)", label: "C" }, // 暗い茶黄色 (C)
        { min: 20, max: 30, color: "rgba(161, 98, 7, 0.3)", label: "B" }, // 中間の黄色 (B)
        { min: 30, max: 40, color: "rgba(234, 179, 8, 0.4)", label: "A" }, // 明るい黄色 (A)
        { min: 40, max: 50, color: "rgba(255, 215, 0, 0.5)", label: "S" }, // 非常に明るい黄色/ゴールド (S)
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

        // ランクラベルを右側に表示
        ctx.save()
        ctx.fillStyle = "rgba(255, 255, 255, 0.9)"
        ctx.font = "bold 28px Arial"
        ctx.textAlign = "left"
        ctx.textBaseline = "middle"
        const labelY = (yTop + yBottom) / 2
        ctx.fillText(zone.label, right + 15, labelY)
        ctx.restore()
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
          right: isLineChart ? 20 : 60, // 右側にランクラベル用のスペースを確保
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
          // 必要ならここでツールチップの表示内容をカスタマイズ
        },
      },

      scales: {
        x: {
          stacked: !isLineChart,
          title: {
            display: true,
            text: "一日の平均値",
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
            stepSize: isLineChart ? 1 : 10,
            color: "#ffffff",
            font: {
              size: 20,
            },
            callback: (value) => {
              if (isLineChart && value > 10.5) {
                return ""
              }
              return value
            },
          },
          grid: {
            color: "rgba(255,255,255,0.8)",
            lineWidth: 1.5,
            display: true,
          },
        },
      },
    },
    plugins: [rankZonePlugin], // カスタムプラグインを登録
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
  document.getElementById("pageTitle").textContent = "棒グラフ画面"
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
