const leftUl = document.getElementById("left-area");
const rightUl = document.getElementById("right-area");

// 書く演出：左列→右列
function showNames() {
    Array.from(leftUl.children).forEach((li, i) => {
    li.style.animation = "";
    setTimeout(() => {
        li.classList.remove("erase-left", "erase-right");
        li.classList.add("write");
        }, i * 200);
    });

  const leftTotalTime = (leftUl.children.length - 1) * 200 + 1400;
    Array.from(rightUl.children).forEach((li, i) => {
    li.style.animation = "";
    setTimeout(() => {
        li.classList.remove("erase-left", "erase-right");
        li.classList.add("write");
        }, leftTotalTime + i * 200);
    });
}

// 消す演出：クラス名に応じて左右に消す
function eraseNames() {
    const items = [...leftUl.children, ...rightUl.children];
    items.forEach((li, i) => {
    li.style.animation = "";
    setTimeout(() => {
        li.classList.remove("write", "erase-left", "erase-right");
        if (li.classList.contains("lefErase")) li.classList.add("erase-left");
        else if (li.classList.contains("rightErase")) li.classList.add("erase-right");
        }, i * 150);
    });
}

// 初回表示
showNames();

// 10秒ごとに消す→次回表示
setInterval(() => {
    eraseNames();
      setTimeout(showNames, 1400 + (leftUl.children.length - 1) * 200 + (rightUl.children.length - 1) * 200);
}, 10000);
 