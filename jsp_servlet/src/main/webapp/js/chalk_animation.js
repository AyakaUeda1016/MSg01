
window.addEventListener("DOMContentLoaded", () => {
  const blackboard = document.querySelector(".blackboard");


  const eraserLayer = document.querySelector(".eraser-layer");
  const eraserImg   = document.querySelector(".eraser-img");
  const pencilLayer = document.querySelector(".pencil-layer");
  const pencilImg   = document.querySelector(".pencil-img");

  if (!blackboard || !eraserLayer || !eraserImg || !pencilLayer || !pencilImg) {
    console.warn("[chalk_animation] 必要な要素が見つかりません");
    return;
  }


  const erasableNodes = Array.from(blackboard.children).filter(
    (el) =>
      !el.classList.contains("eraser-layer") &&
      !el.classList.contains("pencil-layer")
  );

  function fadeBoardContent(targetOpacity, durationMs) {
    erasableNodes.forEach((el) => {
      el.style.transition = `opacity ${durationMs}ms ease`;
      el.style.opacity = String(targetOpacity);
    });
  }

  /**
   * 🧽✏ 橡皮 → 铅笔 整套动画
   *
   * @param {string}   titleText       要显示在黑板上的标题（例如「棒グラフ画面」）
   * @param {Function} onSwitchCharts  在「橡皮动画结束时」要执行的处理（切换图表）
   *
   * 流程：
   *   1. 旧画面整体淡出 + 橡皮对角线擦一遍
   *   2. 橡皮结束 → 调用 onSwitchCharts() + 修改标题
   *   3. 铅笔斜着写字 + 新画面整体淡入
   */
  window.playChalkAnimation = function (titleText, onSwitchCharts) {
    pencilLayer.style.display = "none";
    eraserLayer.style.display = "block";

    fadeBoardContent(0, 600);

    eraserImg.style.animation = "none";
    void eraserImg.offsetWidth; 
    eraserImg.style.animation = "eraser-diagonal 800ms ease-out forwards";

    const handleEraserEnd = () => {
      eraserImg.removeEventListener("animationend", handleEraserEnd);
      eraserLayer.style.display = "none"; 

      if (typeof onSwitchCharts === "function") {
        onSwitchCharts();
      }

      if (titleText) {
        const titleEl = document.getElementById("pageTitle");
        if (titleEl) {
          titleEl.textContent = titleText;
        }
      }

      pencilLayer.style.display = "block";
      pencilImg.style.animation = "none";
      void pencilImg.offsetWidth;
      pencilImg.style.animation = "pencil-diagonal 800ms ease-out forwards";

      fadeBoardContent(1, 800);

      const handlePencilEnd = () => {
        pencilImg.removeEventListener("animationend", handlePencilEnd);
        pencilLayer.style.display = "none"; // 铅笔退出画面
      };

      pencilImg.addEventListener("animationend", handlePencilEnd);
    };

    eraserImg.addEventListener("animationend", handleEraserEnd);
  };
});
