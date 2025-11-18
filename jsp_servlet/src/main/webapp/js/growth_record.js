// growth_record_anim.js

window.addEventListener("DOMContentLoaded", () => {
  const container = document.querySelector(".records-container");
  const items = document.querySelectorAll(".record-item");
  if (!container || items.length === 0) return;

  const style = document.createElement("style");
  style.textContent = `
    /* 整体：从上往下、带轻微模糊 */
    .records-container {
      opacity: 0;
      transform: translateY(-32px);
      filter: blur(4px);
      transition:
        opacity 0.8s cubic-bezier(.16,.68,.32,1.02),
        transform 0.8s cubic-bezier(.16,.68,.32,1.02),
        filter 0.8s;
    }
    .records-container.__appear {
      opacity: 1;
      transform: translateY(0);
      filter: blur(0);
    }

    /* 每一条记录：初始是稍微往下、透明 */
    .record-item {
      opacity: 0;
      transform: translateY(10px);
      transition:
        opacity 0.45s ease,
        transform 0.45s ease;
    }
    .record-item.__item-in {
      opacity: 1;
      transform: translateY(0);
    }
  `;
  document.head.appendChild(style);

  requestAnimationFrame(() => {
    container.classList.add("__appear");

    items.forEach((el, index) => {
      const delay = 400 + index * 120; // ms
      setTimeout(() => {
        el.classList.add("__item-in");
      }, delay);
    });
  });
});
