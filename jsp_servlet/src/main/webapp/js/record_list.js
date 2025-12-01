// グローバル変数
let graphPages = [];
let currentPage = 0;
 
/**
* データベースから評価データを取得
*/
async function fetchEvaluationData() {
  try {
    const response = await fetch("/api/evaluations");
 
    if (!response.ok) {
      throw new Error("データの取得に失敗しました");
    }
 
    const result = await response.json();
 
    if (!result.success) {
      throw new Error(result.error || "データの取得に失敗しました");
    }
 
    return result.data;
  } catch (error) {
    console.error("評価データの取得エラー:", error);
    console.log("[v0] Using test data instead");
    return TEST_DATA;
  }
}
 
/**
* 日付を "M/D" 形式にフォーマット
*/
function formatDate(timestamp) {
  const date = new Date(timestamp);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${month}/${day}`
};
 
/**
* 評価データをページごとにグループ化（7件ずつ）
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
 
// グローバル変数
const TEST_DATA = [
  {
    timestamp: new Date(2024, 0, 5).getTime(),
    self_understanding: { score: 6 },
    emotion_control: { score: 5 },
    empathy: { score: 7 },
    comprehension: { score: 8 },
    speaking: { score: 6 },
  },
  {
    timestamp: new Date(2024, 0, 8).getTime(),
    self_understanding: { score: 7 },
    emotion_control: { score: 6 },
    empathy: { score: 8 },
    comprehension: { score: 7 },
    speaking: { score: 7 },
  },
  {
    timestamp: new Date(2024, 0, 12).getTime(),
    self_understanding: { score: 8 },
    emotion_control: { score: 7 },
    empathy: { score: 8 },
    comprehension: { score: 9 },
    speaking: { score: 8 },
  },
  {
    timestamp: new Date(2024, 0, 15).getTime(),
    self_understanding: { score: 7 },
    emotion_control: { score: 8 },
    empathy: { score: 9 },
    comprehension: { score: 8 },
    speaking: { score: 7 },
  },
  {
    timestamp: new Date(2024, 0, 19).getTime(),
    self_understanding: { score: 9 },
    emotion_control: { score: 8 },
    empathy: { score: 9 },
    comprehension: { score: 9 },
    speaking: { score: 9 },
  },
  {
    timestamp: new Date(2024, 0, 22).getTime(),
    self_understanding: { score: 8 },
    emotion_control: { score: 9 },
    empathy: { score: 10 },
    comprehension: { score: 9 },
    speaking: { score: 8 },
  },
  {
    timestamp: new Date(2024, 0, 26).getTime(),
    self_understanding: { score: 9 },
    emotion_control: { score: 9 },
    empathy: { score: 9 },
    comprehension: { score: 10 },
    speaking: { score: 9 },
  },
  {
    timestamp: new Date(2024, 0, 29).getTime(),
    self_understanding: { score: 10 },
    emotion_control: { score: 9 },
    empathy: { score: 10 },
    comprehension: { score: 9 },
    speaking: { score: 10 },
  },
  {
    timestamp: new Date(2024, 1, 2).getTime(),
    self_understanding: { score: 9 },
    emotion_control: { score: 10 },
    empathy: { score: 9 },
    comprehension: { score: 10 },
    speaking: { score: 9 },
  },
  {
    timestamp: new Date(2024, 1, 5).getTime(),
    self_understanding: { score: 10 },
    emotion_control: { score: 10 },
    empathy: { score: 10 },
    comprehension: { score: 10 },
    speaking: { score: 10 },
  },
]
 
/** * グラフを描画 */
function renderGraph() {
  const graphContent = document.getElementById("graphContent")
  const leftArrow = document.getElementById("leftArrow")
  const rightArrow = document.getElementById("rightArrow")
 
  // コンテンツをクリア
  graphContent.innerHTML = ""
 
  // データがない場合
  if (graphPages.length === 0) {
    graphContent.innerHTML = '<div style="color: white; font-size: 18px;">データがありません</div>'
    leftArrow.classList.add("hidden")
    rightArrow.classList.add("hidden")
    return
  }
 
  const yAxisLabels = document.createElement("div")
  yAxisLabels.className = "y-axis-labels"
 
  // 50, 40, 30, 20, 10, 0の順で上から配置
  const labels = [50, 40, 30, 20, 10, 0]
  labels.forEach((value) => {
    const label = document.createElement("div")
    label.className = "y-axis-label"
    const span = document.createElement("span")
    span.textContent = value
    label.appendChild(span)
    yAxisLabels.appendChild(label)
  })
 
  graphContent.appendChild(yAxisLabels)
 
  const page = graphPages[currentPage]
 
  // 各日付のグラフを生成
  page.dates.forEach((date, dateIndex) => {
    const dateGroup = document.createElement("div")
    dateGroup.className = "date-group"
 
    // バーコンテナ（積み上げ用）
    const barsContainer = document.createElement("div")
    barsContainer.className = "bars-container"
 
    let cumulativeHeight = 0
 
    // 各カテゴリのセグメントを下から積み上げる
    page.data.forEach((categoryData) => {
      const segment = document.createElement("div")
      segment.className = "bar-segment"
      segment.style.backgroundColor = categoryData.color
      // 50点満点で350pxなので、1点あたり7px（350 / 50 = 7）
      const segmentHeight = categoryData.values[dateIndex] * 7
      segment.style.height = `${segmentHeight}px`
      segment.style.bottom = `${cumulativeHeight}px`
      segment.title = `${categoryData.category}: ${categoryData.values[dateIndex]}点`
 
      cumulativeHeight += segmentHeight
 
      barsContainer.appendChild(segment)
    })
 
    // 日付ラベル
    const dateLabel = document.createElement("div")
    dateLabel.className = "date-label"
    dateLabel.textContent = date
 
    dateGroup.appendChild(barsContainer)
    dateGroup.appendChild(dateLabel)
    graphContent.appendChild(dateGroup)
  })
 
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
 
/**
* 初期化処理
*/
async function initialize() {
  // データベースからデータを取得
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
 
// ページスライドで黒板のみ動かす
document.getElementById("navLeftArrow").onclick = () => {
  const board = document.querySelector(".blackboard-container");
  board.classList.add("slide-out-right");
  setTimeout(() => {
    window.location.href = "growth_record.jsp";
  }, 500)
}
 
// ページ読み込み時に初期化
window.addEventListener("DOMContentLoaded", initialize);
