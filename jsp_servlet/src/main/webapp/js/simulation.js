// グローバル変数
let conversationData = null;
const currentTurnIndex = 0;
const MAX_TURNS = 10;

// DOM要素の取得
const currentRallyElement = document.getElementById("currentRally");
const maxRallyElement = document.getElementById("maxRally");
const tensionPopup = document.getElementById("tensionPopup");
const tensionMessage = document.getElementById("tensionMessage");
const menuButton = document.getElementById("menuButton");
const messageContent = document.getElementById("messageContent");
const speakerName = document.getElementById("speakerName");

/**
 * サーブレットからJSONデータを取得
 */
async function fetchConversationData() {
  try {
    console.log("[v0] JSONデータを取得中...");

    const url = window.SERVLET_JSON_URL || "./log.json";

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log("[v0] JSONデータ取得成功:", data);

    conversationData = data;
    updateDisplay();
  } catch (error) {
    console.error("[v0] JSONデータ取得エラー:", error);
    messageContent.textContent = "データの取得に失敗しました。";
  }
}

/**
 * 画面表示を更新
 */
function updateDisplay() {
  if (!conversationData || !conversationData.conversations) {
    console.warn("[v0] 会話データが存在しません");
    return;
  }

  const totalTurns = conversationData.turns || 0;
  updateRallyCount(totalTurns, MAX_TURNS);

  const conversations = conversationData.conversations;
  if (conversations.length > 0) {
    const latestConversation = conversations[conversations.length - 1];

    updateMessage("あい", latestConversation.ai || "");

    checkAndShowTensionPopup(latestConversation, totalTurns);
  }
}

/**
 * ラリー数を更新
 */
function updateRallyCount(current, max) {
  currentRallyElement.textContent = current;
  maxRallyElement.textContent = max;

  console.log(`[v0] ラリー数更新: ${current}/${max}`);
}

/**
 * メッセージを更新
 */
function updateMessage(speaker, message) {
  speakerName.textContent = speaker;
  messageContent.textContent = message;

  console.log(`[v0] メッセージ更新 - ${speaker}: ${message}`);
}

/**
 * 緊張度ポップアップの表示判定
 */
function checkAndShowTensionPopup(conversation, turns) {
  let shouldShow = false;
  let popupText = "";

  if (conversation.appropriateness === "無関係な発言") {
    shouldShow = true;
    popupText = "文脈に関係のない話題になっています！<br>会話の流れを戻しましょう。";
  } else if (turns >= 7) {
    shouldShow = true;
    popupText = "会話が長引いています！";
  }

  if (shouldShow) {
    tensionMessage.innerHTML = popupText;
    showTensionPopup();
  } else {
    hideTensionPopup();
  }
}

/**
 * 緊張度ポップアップを表示
 */
function showTensionPopup() {
  tensionPopup.classList.remove("hidden");
  console.log("[v0] 緊張度ポップアップ表示");
}

/**
 * 緊張度ポップアップを非表示
 */
function hideTensionPopup() {
  tensionPopup.classList.add("hidden");
  console.log("[v0] 緊張度ポップアップ非表示");
}

/**
 * メニューボタンのクリックイベント
 */
menuButton.addEventListener("click", (e) => {
  e.preventDefault();
  console.log("[v0] メニューボタンがクリックされました");
});

/**
 * 定期的にデータを更新（オプション）
 */
function startAutoRefresh(intervalMs = 5000) {
  setInterval(() => {
    console.log("[v0] 自動更新実行");
    fetchConversationData();
  }, intervalMs);
}

/**
 * 初期化処理
 */
document.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] ページ読み込み完了");

  fetchConversationData();
  // startAutoRefresh(5000);
});

// 外部から呼び出せる関数をエクスポート
window.chatInterface = {
  fetchConversationData,
  updateRallyCount,
  updateMessage,
  showTensionPopup,
  hideTensionPopup,
  updateDisplay,
};
