// 音声音量の値
let soundVolume = 5

// マイク音量の値
let micVolume = 5

// 音声音量ボタンのイベント設定
const soundButtons = document.getElementById("soundButtons")
soundButtons.addEventListener("click", (e) => {
  if (e.target.classList.contains("number-btn")) {
    // すべてのボタンからactiveクラスを削除
    soundButtons.querySelectorAll(".number-btn").forEach((btn) => {
      btn.classList.remove("active")
    })

    // クリックされたボタンにactiveクラスを追加
    e.target.classList.add("active")

    // 音量の値を更新
    soundVolume = Number.parseInt(e.target.dataset.value)
    console.log("音声音量:", soundVolume)
  }
})

// マイク音量ボタンのイベント設定
const micButtons = document.getElementById("micButtons")
micButtons.addEventListener("click", (e) => {
  if (e.target.classList.contains("number-btn")) {
    // すべてのボタンからactiveクラスを削除
    micButtons.querySelectorAll(".number-btn").forEach((btn) => {
      btn.classList.remove("active")
    })

    // クリックされたボタンにactiveクラスを追加
    e.target.classList.add("active")

    // 音量の値を更新
    micVolume = Number.parseInt(e.target.dataset.value)
    console.log("マイク音量:", micVolume)
  }
})

// マイクテストボタン
const micTestBtn = document.getElementById("micTestBtn")
micTestBtn.addEventListener("click", () => {
  console.log("マイクテスト開始")
  console.log("現在の設定 - 音声:", soundVolume, "マイク:", micVolume)
  alert(`マイクテスト開始\n音声音量: ${soundVolume}\nマイク音量: ${micVolume}`)
})


// 戻るボタン
const backBtn = document.getElementById("backBtn")
backBtn.addEventListener("click", () => {
  console.log("戻るボタンがクリックされました")
  // 前のページに戻る、または特定のページに遷移
  if (window.history.length > 1) {
    window.history.back()
  } else {
    alert("戻る先がありません")
  }
})

// 音量値を取得する関数（他のスクリプトから使用可能）
function getSoundVolume() {
  return soundVolume
}

function getMicVolume() {
  return micVolume
}
