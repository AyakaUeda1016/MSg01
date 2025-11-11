document.addEventListener("DOMContentLoaded", function() {
    const scenes = [
        {
            img: "images/haru.jpg",
            title: "シナリオ1",
            desc: "みんなの前で自己紹介をやってみよう！"
        },
        {
            img: "images/kyo.jpg",
            title: "シナリオ2",
            desc: "先生に相談してみよう！"
        },
        {
            img: "images/natu.jpg",
            title: "シナリオ3",
            desc: "友達と放課後の予定を決めてみよう！"
        }
    ];

    const imgLeft = document.getElementById("scene-left");
    const imgCenter = document.getElementById("scene-center");
    const imgRight = document.getElementById("scene-right");

    const titleEl = document.getElementById("scenario-title");
    const descEl = document.getElementById("scenario-desc");

    const btnLeft = document.getElementById("btn-left");
    const btnRight = document.getElementById("btn-right");

    let current = 1; // 가운데: kyo

    function render() {
        const total = scenes.length;
        const leftIndex = (current + total - 1) % total;
        const rightIndex = (current + 1) % total;

        imgCenter.src = scenes[current].img;
        imgLeft.src = scenes[leftIndex].img;
        imgRight.src = scenes[rightIndex].img;

        titleEl.textContent = scenes[current].title;
        descEl.textContent = scenes[current].desc;
    }

    btnLeft.addEventListener("click", () => {
        current = (current + scenes.length - 1) % scenes.length;
        render();
    });

    btnRight.addEventListener("click", () => {
        current = (current + 1) % scenes.length;
        render();
    });

    render();
});
