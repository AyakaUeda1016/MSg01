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

    const imgLeft   = document.getElementById("scene-left");
    const imgCenter = document.getElementById("scene-center");
    const imgRight  = document.getElementById("scene-right");

    const titleEl = document.getElementById("scenario-title");
    const descEl  = document.getElementById("scenario-desc");

    const btnLeft  = document.getElementById("btn-left");
    const btnRight = document.getElementById("btn-right");

    // 👇 JSP 内の hidden 要素を取得
    const hiddenScenarioId = document.getElementById("scenarioId");

    // current = 0 → シナリオ1
    // デフォルトがシナリオ2にしたい場合は 1 に変更
    let current = 0;
    let isAnimating = false;

    let titleTimer = null;
    let descTimer  = null;

    function clearTyping() {
        if (titleTimer) {
            clearInterval(titleTimer);
            titleTimer = null;
        }
        if (descTimer) {
            clearInterval(descTimer);
            descTimer = null;
        }
    }

    /**
     * タイピング風アニメーション処理
     * @param {HTMLElement} el  
     * @param {string} text     
     * @param {number} speed    
     * @param {"title"|"desc"} kind 
     */
    function typeText(el, text, speed, kind) {
        if (kind === "title" && titleTimer) {
            clearInterval(titleTimer);
            titleTimer = null;
        }
        if (kind === "desc" && descTimer) {
            clearInterval(descTimer);
            descTimer = null;
        }

        el.textContent = "";
        let i = 0;

        const timer = setInterval(() => {
            if (i >= text.length) {
                clearInterval(timer);
                return;
            }
            el.textContent += text.charAt(i);
            i++;
        }, speed);

        if (kind === "title") {
            titleTimer = timer;
        } else {
            descTimer = timer;
        }
    }

    // シーン画像のフェードイン・フェードアウト用アニメーション
    [imgLeft, imgCenter, imgRight].forEach(img => {
        img.style.transition = "opacity 0.35s ease, transform 0.35s ease";
    });

    function renderImages() {
        const total = scenes.length;
        const leftIndex  = (current + total - 1) % total;
        const rightIndex = (current + 1) % total;

        imgCenter.src = scenes[current].img;
        imgLeft.src   = scenes[leftIndex].img;
        imgRight.src  = scenes[rightIndex].img;
    }

    // 👇 hidden の値を同期する処理
    // current は 0/1/2 → サーブレットに渡すのは 1/2/3 にしたいので +1
    function syncScenarioId() {
        if (hiddenScenarioId) {
            hiddenScenarioId.value = current + 1;
        }
    }

    function renderTexts() {
        const scene = scenes[current];
        clearTyping();
        typeText(titleEl, scene.title, 60, "title");
        typeText(descEl,  scene.desc,  35, "desc");

        // テキスト更新時に hidden の値も更新
        syncScenarioId();
    }

    function switchGroup(dir) {
        if (isAnimating) return;
        isAnimating = true;

        // dir = 1 → 右に移動 / dir = -1 → 左に移動
        const offset = dir === 1 ? -15 : 15; 

        [imgLeft, imgCenter, imgRight].forEach(img => {
            img.style.opacity   = "0";
            img.style.transform = `translateX(${offset}px) scale(0.98)`;
        });

        setTimeout(() => {
            // current を更新して次のシーンへ切り替える
            current = (current + dir + scenes.length) % scenes.length;

            // 新しい current に基づいて画像とテキストを反映
            renderImages();
            renderTexts(); // 内部で hidden も同期される

            [imgLeft, imgCenter, imgRight].forEach(img => {
                img.style.transition = "none";
                img.style.transform  = `translateX(${-offset}px) scale(0.98)`;
                img.style.opacity    = "0";
            });

            // リフロー（アニメーション再適用のため）
            void imgCenter.offsetWidth;

            [imgLeft, imgCenter, imgRight].forEach(img => {
                img.style.transition = "opacity 0.35s ease, transform 0.35s ease";
                img.style.transform  = "translateX(0) scale(1)";
                img.style.opacity    = "1";
            });
        }, 180);

        setTimeout(() => {
            isAnimating = false;
        }, 380);
    }

    btnLeft.addEventListener("click", () => {
        switchGroup(-1);
    });
    btnRight.addEventListener("click", () => {
        switchGroup(1);
    });

    // 初期表示（ページ読み込み時）
    renderImages();
    renderTexts(); // 初期表示時に hidden の値も 1 回同期
});
