// グラフデータ（複数ページ分）
const graphPages = [
  {
    dates: ["9/1", "9/6", "9/7", "9/10", "9/14", "9/15", "9/15"],
    data: [
      { category: "自己認識", color: "#a855f7", values: [60, 45, 55, 50, 35, 65, 70] },
      { category: "気持ちのコントロール", color: "#ec4899", values: [70, 65, 80, 90, 75, 85, 60] },
      { category: "思いやり", color: "#3b82f6", values: [80, 75, 85, 70, 80, 70, 85] },
      { category: "理解力", color: "#10b981", values: [90, 95, 90, 95, 100, 95, 95] },
      { category: "話す力", color: "#f97316", values: [50, 40, 35, 65, 45, 60, 75] },
    ],
  },
  {
    dates: ["9/16", "9/17", "9/18", "9/19", "9/20", "9/21", "9/22"],
    data: [
      { category: "自己認識", color: "#a855f7", values: [55, 60, 65, 70, 75, 80, 85] },
      { category: "気持ちのコントロール", color: "#ec4899", values: [70, 75, 80, 85, 90, 95, 100] },
      { category: "思いやり", color: "#3b82f6", values: [65, 70, 75, 80, 85, 90, 95] },
      { category: "理解力", color: "#10b981", values: [80, 85, 90, 95, 90, 85, 80] },
      { category: "話す力", color: "#f97316", values: [50, 55, 60, 65, 70, 75, 80] },
    ],
  },
  {
    dates: ["9/23", "9/24", "9/25", "9/26", "9/27", "9/28", "9/29"],
    data: [
      { category: "自己認識", color: "#a855f7", values: [90, 85, 80, 75, 70, 65, 60] },
      { category: "気持ちのコントロール", color: "#ec4899", values: [95, 90, 85, 80, 75, 70, 65] },
      { category: "思いやり", color: "#3b82f6", values: [100, 95, 90, 85, 80, 75, 70] },
      { category: "理解力", color: "#10b981", values: [75, 70, 65, 60, 55, 50, 45] },
      { category: "話す力", color: "#f97316", values: [85, 80, 75, 70, 65, 60, 55] },
    ],
  },
]

let currentPage = 0

// グラフを描画する関数
function renderGraph() {
  const graphContent = document.getElementById("graphContent")
  const leftArrow = document.getElementById("leftArrow")
  const rightArrow = document.getElementById("rightArrow")

  // コンテンツをクリア
  graphContent.innerHTML = ""

  const page = graphPages[currentPage]

  // 各日付のグラフを生成
  page.dates.forEach((date, dateIndex) => {
    const dateGroup = document.createElement("div")
    dateGroup.className = "date-group"

    // バーコンテナ
    const barsContainer = document.createElement("div")
    barsContainer.className = "bars-container"

    // 各カテゴリのバーを生成
    page.data.forEach((categoryData) => {
      const bar = document.createElement("div")
      bar.className = "bar"
      bar.style.backgroundColor = categoryData.color
      bar.style.height = `${categoryData.values[dateIndex] * 3.2}px`
      barsContainer.appendChild(bar)
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
  }, 500);
};


// 初期描画
renderGraph()
