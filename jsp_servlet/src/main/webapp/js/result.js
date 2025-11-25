document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOMContentLoaded - Starting radar chart initialization")

  /* =========================================================
   *  右側：Chart.js レーダーチャート描画
   * ========================================================= */
  const canvas = document.getElementById("radarChart")
  console.log("[v0] Canvas element:", canvas)
  console.log("[v0] window.Chart available:", !!window.Chart)

  if (canvas && window.Chart) {
    const ctx = canvas.getContext("2d")

    // ★ 将来的に JSP 変数へ差し替え可能
    //   例) data: [<%= selfAwareness %>, ...]
    const radarData = {
      labels: ["自己認識", "気持ち", "思いやり", "理解力", "話す力"],
      datasets: [
        {
          label: "今回の評価",
          data: [5, 4, 5, 4, 4], // ← 評価スコアをここで変更
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

    const radarOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false },
      },
      scales: {
        r: {
          min: 0,
          max: 5,
          ticks: {
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
            color: "#ffffff",
            font: { size: 12 },
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
   *  - シナリオタイトル
   *  - 「KAIWA NAVIからのフィードバック」
   *  - 各.feedback-item（アイコン＋長文コメント）
   *  上記を順番に左側から滑り込むように表示
   * ========================================================= */
  const leftSection = document.querySelector(".left-section")
  if (!leftSection) return

  const sectionTitle = leftSection.querySelector(".title") // 例：「シナリオ 雑談」
  const sectionSubtitle = leftSection.querySelector(".subtitle") // 例：「総評~~」
  const feedbackTitle = leftSection.querySelector(".feedback-title") // 例：「KAIWA NAVIからのフィードバック」
  const feedbackItems = leftSection.querySelectorAll(".feedback-item") // 各項目（アイコン＋テキスト）

  // 表示順：シナリオタイトル → サブタイトル → フィードバック見出し → 各項目
  const blockTargets = []
  if (sectionTitle) blockTargets.push(sectionTitle)
  if (sectionSubtitle) blockTargets.push(sectionSubtitle)
  if (feedbackTitle) blockTargets.push(feedbackTitle)
  feedbackItems.forEach((item) => blockTargets.push(item))

  const baseDelay = 200 // 各ブロックの表示間隔（ミリ秒）

  // ブロック全体（アイコン＋テキスト）をスライドイン
  blockTargets.forEach((el, index) => {
    el.style.opacity = "0"
    el.style.transform = "translateX(-24px)"
    el.style.transition = "opacity 0.6s ease, transform 0.6s ease"

    setTimeout(() => {
      el.style.opacity = "1"
      el.style.transform = "translateX(0)"
    }, baseDelay * index)
  })

  // 各.feedback-item 内の <p> テキストに別のディレイで軽いフェード演出を付与
  const textOffset = 120 // ブロック本体より少し遅れて開始
  feedbackItems.forEach((item) => {
    const p = item.querySelector("p")
    if (!p) return

    // 空間上の再生順序に合わせるため、blockTargets 内の index を参照
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
      baseDelay * blockIndex + textOffset
    )
  })
});
