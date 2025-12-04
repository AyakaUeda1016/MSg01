document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOMContentLoaded - Starting radar chart initialization");

//  /* =========================================================
//   *  フィードバック JSON（テスト用）
//   *  ※ あとでサーブレットから渡される想定
//   * ========================================================= */
//  const feedbackData = {
//    timestamp: "2025-11-19T11:22:33",
//    scores: {
//      self_understanding: {
//        score: 72,
//        comment: "自分の感情をある程度言語化できています。"
//      },
//      speaking: {
//        score: 90,
//        comment: "はっきりした話し方で会話の流れも自然です。"
//      },
//      comprehension: {
//        score: 88,
//        comment: "文脈理解が良好で、相手の意図を理解した発言が多かったです。"
//      },
//      emotion_control: {
//        score: 75,
//        comment: "落ち着いた発話が多く、会話の安定感がありました。"
//      },
//      empathy: {
//        score: 67,
//        comment: "相手に配慮した返答が見られましたが、もう少し寄り添える余地があります。"
//      }
//    },
//    total_score: 77,
//    overall_comment:
//      "全体的に落ち着いており、会話理解も高いレベルで維持できていました。。"
//  };

  /* =========================================================
   *  右側：Chart.js レーダーチャート描画
   * ========================================================= */
  const canvas = document.getElementById("radarChart");
  console.log("[v0] Canvas element:", canvas);
  console.log("[v0] window.Chart available:", !!window.Chart);

  if (canvas && window.Chart) {
    const ctx = canvas.getContext("2d");

    // ★ JSON の score からレーダー用の点数を作る（0〜10 段階）
    const scoreKeys = [
      "self_understanding",
      "speaking",
      "comprehension",
      "emotion_control",
      "empathy"
    ];

    const radarScores = scoreKeys.map((key) => {
      const raw = feedbackData.scores[key]?.score || 0; // 0〜100
      return Math.round(raw / 10); // 0〜100 → 0〜10 に変換
    });

    const radarData = {
      labels: ["自己認識", "気持ち", "思いやり", "理解力", "話す力"],
      datasets: [
        {
          label: "今回の評価",
          data: radarScores, // ← JSON 由来
          fill: true,
          backgroundColor: "rgba(255,255,255,0.18)",
          borderColor: "rgba(255,255,255,0.9)",
          borderWidth: 2,
          pointBackgroundColor: "#ffffff",
          pointBorderColor: "#ffffff",
          pointHoverBackgroundColor: "#000000",
          pointHoverBorderColor: "#ffffff"
        }
      ]
    };

    // ラベル横に表示する用（「自己認識 4」など）
    const scores = radarData.datasets[0].data;

    const radarOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
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
            font: { size: 11 }
          },
          grid: {
            color: "rgba(255,255,255,0.25)"
          },
          angleLines: {
            color: "rgba(255,255,255,0.35)"
          },
          pointLabels: {
            color: "#ffffff",
            font: { size: 26 }, 
            callback: function (label, index) {
              const value = scores[index] ?? "";
              return `${label} ${value}`; // 例：「自己認識 4」
            }
          }
        }
      }
    };

    const chart = new Chart(ctx, {
      type: "radar",
      data: radarData,
      options: radarOptions
    });
    console.log("[v0] Radar chart created successfully:", chart);
  } else {
    console.warn(
      "[v0] Chart.js または #radarChart が存在しないため、レーダーチャートを描画できません。"
    );
  }

  /* =========================================================
   *  左側：成長記録フィードバックのスライドイン演出
   * ========================================================= */
  const leftSection = document.querySelector(".left-section");
  if (!leftSection) return;

  const sectionTitle = leftSection.querySelector(".title"); // 例：「シナリオ 雑談」
  const sectionSubtitle = leftSection.querySelector(".subtitle"); // 例：「総評~~」
  const feedbackTitle = leftSection.querySelector(".feedback-title"); // 例：「KAIWA NAVIからのフィードバック」
  const feedbackItems = leftSection.querySelectorAll(".feedback-item"); // 各項目（アイコン＋テキスト）

  try {
    // 総評：『総評』＋ overall_comment にする
    if (sectionSubtitle && feedbackData.overall_comment) {
      sectionSubtitle.textContent = "総評　" + feedbackData.overall_comment;
    }

    // 左側フィードバック5件
    const keys = [
      "self_understanding",
      "speaking",
      "comprehension",
      "emotion_control",
      "empathy"
    ];
    const commentEls = leftSection.querySelectorAll(".feedback-item p");

    keys.forEach((key, index) => {
      const item = feedbackData.scores[key];
      const p = commentEls[index];
      if (item && p) {
        p.textContent = item.comment;
      }
    });
  } catch (e) {
    console.error("[v0] フィードバック JSON 反映中にエラー:", e);
  }
  
  // ★ total_score を extra-area に追加
const extraArea = document.querySelector(".extra-area");
if (extraArea && feedbackData.total_score != null) {
  const totalScoreNormalized = feedbackData.total_score / 100;
  const totalscore = 50 * totalScoreNormalized;
  let rank = "";
  if (totalscore >= 40) {
    rank = "S";
  } else if (totalscore >= 30) {
    rank = "A";
  } else if (totalscore >= 10) {
    rank = "B";
  } else {
    rank = "C";
  }

  extraArea.innerHTML = `
    <p class="total-score-text">
      ランク：${rank}
    </p>
  `;
}


  /* ---------------------------------------------------------
   *  ここから先は見た目のアニメーション
   * --------------------------------------------------------- */
  const blockTargets = [];
  if (sectionTitle) blockTargets.push(sectionTitle);
  if (sectionSubtitle) blockTargets.push(sectionSubtitle);
  if (feedbackTitle) blockTargets.push(feedbackTitle);
  feedbackItems.forEach((item) => blockTargets.push(item));

  const baseDelay = 200;

  blockTargets.forEach((el, index) => {
    el.style.opacity = "0";
    el.style.transform = "translateX(-24px)";
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease";

    setTimeout(() => {
      el.style.opacity = "1";
      el.style.transform = "translateX(0)";
    }, baseDelay * index);
  });

  const textOffset = 120;
  feedbackItems.forEach((item) => {
    const p = item.querySelector("p");
    if (!p) return;

    const blockIndex = blockTargets.indexOf(item);
    if (blockIndex === -1) return;

    p.style.opacity = "0";
    p.style.transform = "translateX(-8px)";
    p.style.transition = "opacity 0.4s ease, transform 0.4s ease";

    setTimeout(() => {
      p.style.opacity = "1";
      p.style.transform = "translateX(0)";
    }, baseDelay * blockIndex + textOffset);
  });
});
