// ラリー数の管理
let currentRally = 7
let maxRally = 10

// 緊張度ポップアップの表示状態
let isTensionPopupVisible = true

// DOM要素の取得
const currentRallyElement = document.getElementById("currentRally")
const maxRallyElement = document.getElementById("maxRally")
const tensionPopup = document.getElementById("tensionPopup")
const menuButton = document.getElementById("menuButton")
const messageContent = document.getElementById("messageContent")
const speakerName = document.getElementById("speakerName")

// ラリー数を更新する関数
function updateRallyCount(current, max) {
  currentRally = current
  maxRally = max
  currentRallyElement.textContent = current
  maxRallyElement.textContent = max

  // 緊張度チェック（例：ラリー数が7以上で表示）
  if (current >= 7) {
    showTensionPopup()
  } else {
    hideTensionPopup()
  }
}

// 緊張度ポップアップを表示
function showTensionPopup() {
  tensionPopup.classList.remove("hidden")
  isTensionPopupVisible = true
}

// 緊張度ポップアップを非表示
function hideTensionPopup() {
  tensionPopup.classList.add("hidden")
  isTensionPopupVisible = false
}

// メッセージを更新する関数
function updateMessage(speaker, message) {
  speakerName.textContent = speaker
  messageContent.textContent = message
}

// メニューボタンのクリックイベント
menuButton.addEventListener("click", () => {
  console.log("[v0] メニューボタンがクリックされました")
  // ここにメニュー表示のロジックを追加
  alert("メニュー機能は実装予定です")
})

// 初期化
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] ページが読み込まれました")
  updateRallyCount(currentRally, maxRally)
})

// 外部から呼び出せる関数をエクスポート（必要に応じて使用）
window.chatInterface = {
  updateRallyCount,
  updateMessage,
  showTensionPopup,
  hideTensionPopup,
}
