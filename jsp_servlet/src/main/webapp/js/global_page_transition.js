// ===========================
// ページ全体のトランジション演出（白いフラッシュを防ぐ版）
// ===========================

(function () {
  const DURATION = 350; // CSS の 0.35s と合わせる

  document.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;

    const href = a.getAttribute("href");
    if (!href) return;

    // アンカー／新規タブ／ダウンロードリンクは対象外
    if (href.startsWith("#")) return;
    if (a.target === "_blank") return;
    if (a.hasAttribute("download")) return;

    // 中クリック／Ctrl／Command／Shift／Alt押しながらのクリックは
    // 「新しいタブで開く」とみなし、処理を阻害しない
    if (e.button === 1 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) {
      return;
    }

    let url;
    try {
      url = new URL(a.href);
    } catch (err) {
      // 不正な URL の場合はブラウザに任せる
      return;
    }

    // 同一ドメインのページ遷移のみ演出を適用（外部サイトへは干渉しない）
    if (url.origin !== window.location.origin) return;

    e.preventDefault();

    const body = document.body;
    if (!body) {
      // body が取得できないケースは通常の遷移
      window.location.href = href;
      return;
    }

    // 退場アニメーション用の class を付与
    body.classList.add("pt-leave");

    // アニメーション完了後に遷移を実行
    window.setTimeout(() => {
      window.location.href = href;
    }, DURATION);
  });
})();
