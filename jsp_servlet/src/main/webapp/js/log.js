// サーブレットから渡されたJSONデータを取得
const conversationsData = window.conversationsData || []

// ログエリアの要素を取得
const logArea = document.getElementById("logArea")

/**
 * 会話ログを動的に生成する関数
 */
function renderConversations(conversations) {
  // ログエリアをクリア
  logArea.innerHTML = ""

  // 会話データが空の場合
  if (!conversations || conversations.length === 0) {
    const emptyMessage = document.createElement("div")
    emptyMessage.className = "log-row npc-row"
    emptyMessage.innerHTML = '<div class="bubble npc-bubble">会話ログがありません</div>'
    logArea.appendChild(emptyMessage)
    return
  }

  conversations.forEach((conv, index) => {
    // ラリー番号を追加
    const rallyNumber = document.createElement("div")
    rallyNumber.className = "rally-number"
    rallyNumber.textContent = `${index + 1}ラリー目`
    logArea.appendChild(rallyNumber)

    // ユーザーの発言（ME）を先に追加
    if (conv.user && conv.user.trim() !== "") {
      const meRow = createUserBubble(conv.user)
      logArea.appendChild(meRow)
    }

    // AIの発言（NPC）を後に追加
    if (conv.ai && conv.ai.trim() !== "") {
      const npcRow = createNPCBubble(conv.ai)
      logArea.appendChild(npcRow)
    }
  })
}

/**
 * NPC（AI）の吹き出しを生成する関数
 */
function createNPCBubble(text) {
  const npcRow = document.createElement("div")
  npcRow.className = "log-row npc-row"

  const npcBubble = document.createElement("div")
  npcBubble.className = "bubble npc-bubble"
  npcBubble.textContent = text

  npcRow.appendChild(npcBubble)
  return npcRow
}

/**
 * ユーザー（ME）の吹き出しを生成する関数
 */
function createUserBubble(text) {
  const meRow = document.createElement("div")
  meRow.className = "log-row me-row"

  const meBubble = document.createElement("div")
  meBubble.className = "bubble me-bubble"
  meBubble.textContent = text

  const meIcon = document.createElement("div")
  meIcon.className = "me-icon"
  meIcon.textContent = "ME"

  meRow.appendChild(meBubble)
  meRow.appendChild(meIcon)
  return meRow
}

// ページ読み込み時に会話ログを描画
document.addEventListener("DOMContentLoaded", () => {
  renderConversations(conversationsData)

  const logArea = document.getElementById("logArea")
  if (logArea) {
    logArea.scrollTop = logArea.scrollHeight
  }
})
