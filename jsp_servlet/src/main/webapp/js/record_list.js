// ================================
// 棒グラフ画面（Chart.js 版）
// ================================

// グローバル変数
let graphPages = [];
let currentPage = 0;

// Chart.js のインスタンス（※これがないとエラーになる）
let evaluationChart = null;

let currentChartType = "bar";

const datasetVisibility = {
  "自己認識": true,
  "気持ちのコントロール": true,
  "思いやり": true,
  "理解力": true,
  "話す力": true,
};
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
  return `${month}/${day}`;
}

/**
 * 評価データをページごとにグループ化（7件ずつ）
 */
function groupDataIntoPages(evaluations) {
  const pages = [];
  const itemsPerPage = 7;

  for (let i = 0; i < evaluations.length; i += itemsPerPage) {
    const pageData = evaluations.slice(i, i + itemsPerPage);

    const dates = [];
    const selfUnderstandingValues = [];
    const emotionControlValues = [];
    const empathyValues = [];
    const comprehensionValues = [];
    const speakingValues = [];

    pageData.forEach((evaluation) => {
      dates.push(formatDate(evaluation.timestamp));
      selfUnderstandingValues.push(evaluation.self_understanding.score);
      emotionControlValues.push(evaluation.emotion_control.score);
      empathyValues.push(evaluation.empathy.score);
      comprehensionValues.push(evaluation.comprehension.score);
      speakingValues.push(evaluation.speaking.score);
    });

    pages.push({
      dates: dates,
      data: [
        { category: "自己認識",            color: "#a855f7", values: selfUnderstandingValues },
        { category: "気持ちのコントロール",  color: "#ec4899", values: emotionControlValues },
        { category: "思いやり",            color: "#3b82f6", values: empathyValues },
        { category: "理解力",              color: "#10b981", values: comprehensionValues },
        { category: "話す力",              color: "#f97316", values: speakingValues },
      ],
    });
  }

  return pages;
}

// テストデータ（DB 取得に失敗したとき用）
const TEST_DATA = [
  {
    timestamp: new Date(2024, 0, 5).getTime(),
    self_understanding: { score: 2 },
    emotion_control:    { score: 3 },
    empathy:            { score: 4 },
    comprehension:      { score: 5 },
    speaking:           { score: 8 },
  },
  {
    timestamp: new Date(2024, 0, 8).getTime(),
    self_understanding: { score: 4 },
    emotion_control:    { score: 3 },
    empathy:            { score: 7 },
    comprehension:      { score: 6 },
    speaking:           { score: 9 },
  },
  {
    timestamp: new Date(2024, 0, 12).getTime(),
    self_understanding: { score: 5 },
    emotion_control:    { score: 6 },
    empathy:            { score: 3 },
    comprehension:      { score: 7 },
    speaking:           { score: 9 },
  },
  {
    timestamp: new Date(2024, 0, 15).getTime(),
    self_understanding: { score: 6 },
    emotion_control:    { score: 8 },
    empathy:            { score: 8 },
    comprehension:      { score: 7 },
    speaking:           { score: 9 },
  },
  {
    timestamp: new Date(2024, 0, 19).getTime(),
    self_understanding: { score: 6 },
    emotion_control:    { score: 7 },
    empathy:            { score: 8 },
    comprehension:      { score: 9 },
    speaking:           { score: 10 },
  },
  {
    timestamp: new Date(2024, 0, 22).getTime(),
    self_understanding: { score: 7 },
    emotion_control:    { score: 8 },
    empathy:            { score: 9 },
    comprehension:      { score: 10 },
    speaking:           { score: 10 },
  },
  {
    timestamp: new Date(2024, 0, 26).getTime(),
    self_understanding: { score: 10 },
    emotion_control:    { score: 10 },
    empathy:            { score: 10 },
    comprehension:      { score: 10 },
    speaking:           { score: 9 },
  },
  {
    timestamp: new Date(2024, 0, 29).getTime(),
    self_understanding: { score: 8 },
    emotion_control:    { score: 9 },
    empathy:            { score: 10 },
    comprehension:      { score: 7 },
    speaking:           { score: 6 },
  },
  {
    timestamp: new Date(2024, 1, 2).getTime(),
    self_understanding: { score: 8 },
    emotion_control:    { score: 9 },
    empathy:            { score: 10 },
    comprehension:      { score: 7 },
    speaking:           { score: 5 },
  },
  {
    timestamp: new Date(2024, 1, 5).getTime(),
    self_understanding: { score: 9 },
    emotion_control:    { score: 10 },
    empathy:            { score: 8 },
    comprehension:      { score: 7 },
    speaking:           { score: 6 },
  },
];


/**
 * グラフを描画（Chart.js版）
 */
function renderGraph() {
  const graphContent = document.getElementById("graphContent");
  const leftArrow = document.getElementById("leftArrow");
  const rightArrow = document.getElementById("rightArrow");

  // データがない場合
  if (graphPages.length === 0) {
    graphContent.innerHTML =
      '<div style="color: white; font-size: 18px;">データがありません</div>';
    leftArrow.classList.add("hidden");
    rightArrow.classList.add("hidden");
    return;
  }

  // graphContent 内に canvas を 1 つ用意する
  let canvas = document.getElementById("evaluationChart");
  if (!canvas) {
    // 「読み込み中...」などを消す
    graphContent.innerHTML = "";
    canvas = document.createElement("canvas");
    canvas.id = "evaluationChart";
    graphContent.appendChild(canvas);
  }

  const page = graphPages[currentPage];

  // page.dates / page.data を Chart.js 用に変換
  const labels = page.dates;

  const isLineChart = currentChartType === "line";

const datasets = page.data.map((categoryData) => {
  const visible = datasetVisibility[categoryData.category] !== false;

  // ★ 折线図用の設定
  if (isLineChart) {
    return {
      type: "line",                      // ← これがないと線が消える！
      label: categoryData.category,
      data: categoryData.values,
      borderColor: categoryData.color,
      backgroundColor: categoryData.color + "33", // 半透明の塗り
      tension: false,                      // 線を滑らかに
      fill: false,                        // 線の下を塗りつぶし
      borderWidth: 3,
      pointRadius: 4,
      pointHoverRadius: 6,
      hidden: !visible,
    };
  }

  // ★ 棒グラフ用の設定
  return {
    type: "bar",                         // ← 明示するのが安全
    label: categoryData.category,
    data: categoryData.values,
    backgroundColor: categoryData.color,
    stack: "total",
    barPercentage: 0.4,
    categoryPercentage: 0.6,
    maxBarThickness: 24,
    hidden: !visible,
  };
});



  const ctx = canvas.getContext("2d");

  // すでにグラフがあるなら destroy して作り直し
  if (evaluationChart) {
    evaluationChart.destroy();
  }

  evaluationChart = new Chart(ctx, {
    type: currentChartType,
    data: {
      labels: labels,
      datasets: datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false, // 親要素(graph-content)にフィット

 	layout: {
            padding: {
                top: 40   // ★★★ 图表顶部空出更多位置，避免碰到标题 ★★★
            }
        },
      plugins: {
        legend: {
		 display:false,
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
          stacked:!isLineChart, // X 軸を積み上げモードに
          ticks: {
            color: "#ffffff",
          },
          grid: {
            display: false,
          },
        },
        y: {
          stacked: !isLineChart, // Y 軸も積み上げ
          min: 0,
          max: isLineChart ? 10.5 : 50, // 5 項目 × 10 点満点 = 50
          ticks: {
            stepSize: isLineChart ? 1 : 10,
            color: "#ffffff",
            callback: function (value) {
     		 if (isLineChart && value === 10.5) {
        		return ""; // 不显示 10.5
      		}
      		return value;
          },
          },
          grid: {
           color: function (ctx) {
      	   const v = ctx.tick && ctx.tick.value;
      		// 折线图时，把 10.5 那条线画透明
      	   if (isLineChart && v === 10.5) {
           return "rgba(0,0,0,0)"; // 完全透明
           }
           return "rgba(255,255,255,0.2)";
           },
          },
        },
      },
    },
  });
  
  setupCustomLegendControls();

  // 矢印ボタンの表示制御
  if (currentPage === 0) {
    leftArrow.classList.add("hidden");
  } else {
    leftArrow.classList.remove("hidden");
  }

  if (currentPage === graphPages.length - 1) {
    rightArrow.classList.add("hidden");
  } else {
    rightArrow.classList.remove("hidden");
  }
}


function setupCustomLegendControls() {
  const legendItems = document.querySelectorAll(".legend-item");
  if (!evaluationChart) return;

  legendItems.forEach((item) => {
    const category = item.dataset.category;
    if (!category) return;

    // 初期状態を反映
    const visible = datasetVisibility[category] !== false;
    item.classList.toggle("is-hidden", !visible);

    // ★ 以前の addEventListener はやめて、毎回 onclick を上書き
    item.onclick = () => {
      const ds = evaluationChart.data.datasets.find(
        (d) => d.label === category
      );
      if (!ds) return;

      const nowVisible = datasetVisibility[category] !== false;
      const nextVisible = !nowVisible;

      datasetVisibility[category] = nextVisible;
      ds.hidden = !nextVisible;

      item.classList.toggle("is-hidden", !nextVisible);

      evaluationChart.update();
    };
  });
}




/**
 * 初期化処理
 */
async function initialize() {
  // データベースからデータを取得
  const evaluations = await fetchEvaluationData();

  // データをページごとにグループ化
  graphPages = groupDataIntoPages(evaluations);

  // 初期ページを描画
  currentPage = 0;
  renderGraph();
}

// 左矢印クリック
document.getElementById("leftArrow").addEventListener("click", () => {
  if (currentPage > 0) {
    currentPage--;
    renderGraph();
  }
});

// 右矢印クリック
document.getElementById("rightArrow").addEventListener("click", () => {
  if (currentPage < graphPages.length - 1) {
    currentPage++;
    renderGraph();
  }
});

// 棒グラフボタン
document.getElementById("btnBar").addEventListener("click", () => {
  if (currentChartType === "bar") return;

  if (window.playChalkAnimation) {
    playChalkAnimation("棒グラフ画面", () => {
      currentChartType = "bar";
      renderGraph();
    });
  } else {
    // 保险：动画 JS 没加载的话，退回原来的行为
    currentChartType = "bar";
    document.getElementById("pageTitle").textContent = "棒グラフ画面";
    renderGraph();
  }
});

// 折れ線ボタン
document.getElementById("btnLine").addEventListener("click", () => {
  if (currentChartType === "line") return;

  if (window.playChalkAnimation) {
    playChalkAnimation("折れ線グラフ画面", () => {
      currentChartType = "line";
      renderGraph();
    });
  } else {
    currentChartType = "line";
    document.getElementById("pageTitle").textContent = "折れ線グラフ画面";
    renderGraph();
  }
});



// ページスライドで黒板のみ動かす
document.getElementById("navLeftArrow").onclick = () => {
  const board = document.querySelector(".blackboard-container");
  board.classList.add("slide-out-right");
  setTimeout(() => {
    window.location.href = "growth_record.jsp";
  }, 500);
};

// ページ読み込み時に初期化
window.addEventListener("DOMContentLoaded", initialize);






