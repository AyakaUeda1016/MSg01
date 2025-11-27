window.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOMContentLoaded - growth_record.js 初期化")

  const container = document.querySelector(".records-container")
  const items = document.querySelectorAll(".record-item")
  if (!container || items.length === 0) {
    console.log("[v0] レコード要素が見つかりません")
    return
  }
  // --- アニメーション用のインライン style を追加（既存の CSS と併用） ---
  ;(function addAppearStyles() {
    const style = document.createElement("style")
    style.textContent = `
      .records-container { opacity: 0; transform: translateY(-32px); filter: blur(4px); transition: opacity .8s cubic-bezier(.16,.68,.32,1.02), transform .8s cubic-bezier(.16,.68,.32,1.02), filter .8s;}
      .records-container.__appear { opacity:1; transform: translateY(0); filter: blur(0);}
      .record-item { opacity:0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease;}
      .record-item.__item-in { opacity:1; transform: translateY(0); }
      .tutorial-highlight { box-shadow: 0 0 0 4px rgba(255, 200, 0, 0.6); border-radius: 4px; z-index: 9999; position: relative; }
    `
    document.head.appendChild(style)
  })()

  requestAnimationFrame(() => {
    container.classList.add("__appear")
    items.forEach((el, index) => {
      const delay = 400 + index * 120
      setTimeout(() => el.classList.add("__item-in"), delay)
    })
  })

  // --- チュートリアル要素 ---
  const tutorialOverlay = document.getElementById("tutorial-overlay")
  const tutorialTooltip = document.getElementById("tutorial-tooltip")
  const tutorialText = document.getElementById("tutorial-text")
  const tutorialStep = document.getElementById("tutorial-step")
  const skipButton = document.getElementById("skip-tutorial")
  const helpButton = document.getElementById("tutorial-help-btn")

  // チュートリアル要素が存在しない場合は終了
  if (!tutorialOverlay || !tutorialTooltip || !tutorialText || !tutorialStep || !skipButton) {
    console.error("[v0] チュートリアル要素が見つかりません")
    console.error("[v0] overlay:", tutorialOverlay)
    console.error("[v0] tooltip:", tutorialTooltip)
    console.error("[v0] text:", tutorialText)
    console.error("[v0] step:", tutorialStep)
    console.error("[v0] skip:", skipButton)
    return
  }
  console.log("[v0] チュートリアル要素が正常に取得されました")

  // チュートリアルステップ定義
  const tutorialSteps = [
    {
      text: "成長記録画面へようこそ!<br>この画面では、あなたの成長記録を確認できます。<br><br>クリックして次に進んでください。",
      target: null,
      position: "center",
    },
    {
      text: "カテゴリーでフィルタリングできます。<br>自己紹介、放課後、部活動から選択できます。",
      target: "#category-filter",
      position: "bottom",
    },
    {
      text: "記録を新しい順または古い順に並べ替えることができます。",
      target: "#sort-filter",
      position: "bottom",
    },
    {
      text: "カレンダーから日付を選択して、特定の日の記録を表示できます。",
      target: "#calendar-button",
      position: "bottom",
    },
    {
      text: "選択した日付フィルターをクリアして、すべての記録を表示します。",
      target: "#clear-date-button",
      position: "bottom",
    },
    {
      text: "各リザルトを確認できます。",
      target: ".record-item:first-child",
      position: "bottom",
    },
    {
      text: "棒グラフ画面に進みます。",
      target: "#navRightArrow",
      position: "top",
    },
  ]

  let currentStep = 0
  let tutorialActive = false

  function startTutorial() {
    console.log("[v0] チュートリアル開始")
    tutorialActive = true
    currentStep = 0
    showStep(currentStep)
  }

  function showStep(stepIndex) {
    console.log("[v0] ステップ表示:", stepIndex)
    if (stepIndex >= tutorialSteps.length) {
      endTutorial()
      return
    }

    const step = tutorialSteps[stepIndex]

    // すべてのハイライトをクリア
    document.querySelectorAll(".tutorial-highlight").forEach((el) => {
      el.classList.remove("tutorial-highlight")
    })

    tutorialOverlay.style.display = "block"
    tutorialOverlay.classList.add("active")
    console.log("[v0] オーバーレイ表示")

    tutorialTooltip.style.display = "block"
    tutorialTooltip.classList.add("active")
    console.log("[v0] ツールチップ表示")

    // テキストを設定
    tutorialText.innerHTML = step.text
    tutorialStep.textContent = `${stepIndex + 1} / ${tutorialSteps.length}`

    // ツールチップの位置とスタイルをリセット
    tutorialTooltip.className = "tutorial-tooltip active"

    if (stepIndex === 6) {
      tutorialTooltip.classList.add("step-7")
      tutorialTooltip.classList.add("arrow-bottom")
    }

    if (step.target) {
      const targetElement = document.querySelector(step.target)
      if (targetElement) {
        targetElement.classList.add("tutorial-highlight")
        if (stepIndex !== 6) {
          const rect = targetElement.getBoundingClientRect()
          positionTooltip(rect, step.position)
        }
        console.log("[v0] ターゲット要素にハイライト:", step.target)
      } else {
        console.warn("[v0] ターゲット要素が見つかりません:", step.target)
      }
    } else {
      // 中央表示
      tutorialTooltip.classList.add("center")
      tutorialTooltip.style.left = "50%"
      tutorialTooltip.style.top = "50%"
      tutorialTooltip.style.transform = "translate(-50%, -50%)"
      console.log("[v0] 中央表示")
    }
  }

  function positionTooltip(rect, position) {
    tutorialTooltip.style.visibility = "hidden"
    tutorialTooltip.style.display = "block"
    const tooltipRect = tutorialTooltip.getBoundingClientRect()
    tutorialTooltip.style.visibility = "visible"

    const padding = 20
    tutorialTooltip.style.transform = "none"

    tutorialTooltip.classList.remove("arrow-top", "arrow-bottom", "arrow-left", "arrow-right")

    switch (position) {
      case "top":
        tutorialTooltip.classList.add("arrow-bottom")
        tutorialTooltip.style.left = rect.left + rect.width / 2 - tooltipRect.width / 2 + "px"
        tutorialTooltip.style.top = rect.top - tooltipRect.height - padding + "px"
        break
      case "bottom":
        tutorialTooltip.classList.add("arrow-top")
        tutorialTooltip.style.left = rect.left + rect.width / 2 - tooltipRect.width / 2 + "px"
        tutorialTooltip.style.top = rect.bottom + padding + "px"
        break
      case "left":
        tutorialTooltip.classList.add("arrow-right")
        tutorialTooltip.style.left = rect.left - tooltipRect.width - padding + "px"
        tutorialTooltip.style.top = rect.top + rect.height / 2 - tooltipRect.height / 2 + "px"
        break
      case "right":
        tutorialTooltip.classList.add("arrow-left")
        tutorialTooltip.style.left = rect.right + padding + "px"
        tutorialTooltip.style.top = rect.top + rect.height / 2 - tooltipRect.height / 2 + "px"
        break
    }

    // 画面外に出ないよう調整
    const tooltipNewRect = tutorialTooltip.getBoundingClientRect()
    if (tooltipNewRect.right > window.innerWidth)
      tutorialTooltip.style.left = window.innerWidth - tooltipRect.width - 20 + "px"
    if (tooltipNewRect.left < 0) tutorialTooltip.style.left = "20px"
    if (tooltipNewRect.bottom > window.innerHeight)
      tutorialTooltip.style.top = window.innerHeight - tooltipRect.height - 20 + "px"
    if (tooltipNewRect.top < 0) tutorialTooltip.style.top = "20px"
  }

  function nextStep() {
    console.log("[v0] 次のステップへ")
    currentStep++
    showStep(currentStep)
  }

  function endTutorial() {
    console.log("[v0] チュートリアル終了")
    tutorialActive = false
    tutorialOverlay.classList.remove("active")
    tutorialOverlay.style.display = "none"
    tutorialTooltip.classList.remove("active")
    tutorialTooltip.style.display = "none"
    document.querySelectorAll(".tutorial-highlight").forEach((el) => {
      el.classList.remove("tutorial-highlight")
    })
  }

  tutorialOverlay.addEventListener("click", (e) => {
    if (tutorialActive && e.target === tutorialOverlay) {
      console.log("[v0] オーバーレイクリック")
      nextStep()
    }
  })

  skipButton.addEventListener("click", (e) => {
    e.stopPropagation()
    console.log("[v0] スキップボタンクリック")
    endTutorial()
  })

  if (helpButton) {
    helpButton.addEventListener("click", (e) => {
      e.stopPropagation()
      console.log("[v0] ヘルプボタンクリック - チュートリアル再開")
      startTutorial()
    })
  }

  // チュートリアルは?ボタンをクリックして開始するように変更しました

  // --- フィルタ要素 ---
  const categoryFilter = document.getElementById("category-filter")
  const dateInput = document.getElementById("fecha")
  const calendarButton = document.getElementById("calendar-button")
  const clearDateButton = document.getElementById("clear-date-button")
  const calendarPicker = document.getElementById("calendar-picker")
  const calendarGrid = document.getElementById("calendarGrid")
  const currentMonthSpan = document.getElementById("currentMonth")
  const prevMonthBtn = document.getElementById("prevMonth")
  const nextMonthBtn = document.getElementById("nextMonth")
  const sortFilter = document.getElementById("sort-filter")

  if (!calendarButton) {
    console.error("[v0] カレンダーボタンが見つかりません")
    return
  }

  const currentDate = new Date()
  let selectedDate = dateInput.value ? new Date(dateInput.value) : null
  let calendarAttachedToBody = false

  function attachCalendarToBody() {
    if (!calendarPicker) return
    if (!calendarAttachedToBody) {
      calendarPicker.__originalParent = calendarPicker.parentElement
      document.body.appendChild(calendarPicker)
      calendarAttachedToBody = true
      console.log("[v0] カレンダーピッカーをbodyに移動しました")
    }
    calendarPicker.style.position = "fixed"
    calendarPicker.style.zIndex = "9999"
    calendarPicker.setAttribute("aria-hidden", "false")
  }

  function detachCalendarToOriginal() {
    if (!calendarPicker || !calendarPicker.__originalParent) return
    calendarPicker.setAttribute("aria-hidden", "true")
  }

function openCalendar() {
  if (!calendarPicker || !calendarButton) return
  console.log("[v0] カレンダーを開く")
  attachCalendarToBody()
  const rect = calendarButton.getBoundingClientRect()
  const topCandidate = rect.bottom + 8
  const leftCandidate = rect.left - 120
  calendarPicker.style.minWidth = "280px"
  calendarPicker.style.left = Math.max(8, leftCandidate) + "px"

  const pickerHeight = 320
  const availableBelow = window.innerHeight - rect.bottom
  if (availableBelow < pickerHeight && rect.top > pickerHeight) {
    calendarPicker.style.top = rect.top - pickerHeight - 8 + "px"
  } else {
    calendarPicker.style.top = topCandidate + "px"
  }

  calendarPicker.classList.add("active")
  calendarPicker.style.display = "block"
  calendarButton.setAttribute("aria-expanded", "true")
  renderCalendar()
}


  function closeCalendar() {
    if (!calendarPicker) return
    console.log("[v0] カレンダーを閉じる")
    calendarPicker.classList.remove("active")
    calendarPicker.style.display = "none"
    calendarButton.setAttribute("aria-expanded", "false")
  }

  calendarButton.addEventListener("click", (e) => {
    e.stopPropagation()
    e.preventDefault()
    console.log("[v0] カレンダーボタンクリック")
    if (!calendarPicker) return
    if (calendarPicker.classList.contains("active")) {
      closeCalendar()
    } else {
      openCalendar()
    }
  })

  calendarButton.addEventListener("pointerdown", (e) => {
    e.stopPropagation()
    console.log("[v0] カレンダーボタンポインターダウン")
  })

  document.addEventListener(
    "click",
    (e) => {
      if (!calendarPicker) return
      if (!calendarPicker.contains(e.target) && e.target !== calendarButton && !calendarButton.contains(e.target)) {
        closeCalendar()
      }
    },
    true
  )

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCalendar()
  })

  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      currentDate.setMonth(currentDate.getMonth() - 1)
      renderCalendar()
    })
  }
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", (e) => {
      e.stopPropagation()
      currentDate.setMonth(currentDate.getMonth() + 1)
      renderCalendar()
    })
  }

  function renderCalendar() {
    if (!calendarGrid || !currentMonthSpan) return
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    currentMonthSpan.textContent = `${year}年 ${month + 1}月`

    calendarGrid.innerHTML = ""

    const weekdays = ["日", "月", "火", "水", "木", "金", "土"]
    weekdays.forEach((day) => {
      const el = document.createElement("div")
      el.className = "calendar-weekday"
      el.textContent = day
      calendarGrid.appendChild(el)
    })

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDay = firstDay.getDay()
    const daysInMonth = lastDay.getDate()

    const prevMonthLastDay = new Date(year, month, 0).getDate()
    for (let i = startDay - 1; i >= 0; i--) {
      const dayDiv = document.createElement("div")
      dayDiv.className = "calendar-day other-month"
      dayDiv.textContent = prevMonthLastDay - i
      calendarGrid.appendChild(dayDiv)
    }

    const today = new Date()
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement("div")
      dayDiv.className = "calendar-day"
      dayDiv.textContent = day

      if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
        dayDiv.classList.add("today")
      }
      if (
        selectedDate &&
        year === selectedDate.getFullYear() &&
        month === selectedDate.getMonth() &&
        day === selectedDate.getDate()
      ) {
        dayDiv.classList.add("selected")
      }

      dayDiv.addEventListener("click", (e) => {
        e.stopPropagation()
        e.preventDefault()
        console.log("[v0] 日付選択:", day)
        selectedDate = new Date(year, month, day)
        const dateString = formatDateISO(selectedDate)
        console.log("[v0] フォーマット済み日付:", dateString)
        dateInput.value = dateString
        console.log("[v0] 選択日付を保存:", dateString)
        renderCalendar()
        filterRecords()
        closeCalendar()
      })

      calendarGrid.appendChild(dayDiv)
    }

    const totalCellsSoFar = startDay + daysInMonth
    const remainingDays = 7 * 6 - totalCellsSoFar
    for (let d = 1; d <= remainingDays; d++) {
      const dayDiv = document.createElement("div")
      dayDiv.className = "calendar-day other-month"
      dayDiv.textContent = d
      calendarGrid.appendChild(dayDiv)
    }
  }

  function formatDateISO(d) {
    if (!d) return ""
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, "0")
    const day = String(d.getDate()).padStart(2, "0")
    return `${y}-${m}-${day}`
  }

  function filterRecords() {
    const selectedCategory = categoryFilter ? categoryFilter.value : ""
    const selectedDateVal = dateInput ? dateInput.value : ""
    const recordLinks = document.querySelectorAll(".record-link")

    recordLinks.forEach((link) => {
      const item = link.querySelector(".record-item")
      const category = item.getAttribute("data-category")
      const date = item.getAttribute("data-date")

      let showItem = true
      if (selectedCategory && category !== selectedCategory) showItem = false

      if (selectedDateVal) {
        const selectedMonthDay = selectedDateVal.slice(5)
        const recordMonthDay = date.slice(5)
        if (recordMonthDay !== selectedMonthDay) showItem = false
      }

      if (showItem) {
        link.style.display = "block"
        item.classList.add("__item-in")
        console.log("[v0] 表示:", date, category)
      } else {
        link.style.display = "none"
        item.classList.remove("__item-in")
        console.log("[v0] 非表示:", date, category)
      }
    })
  }

  function sortRecords(order) {
    const recordList = document.querySelector(".record-list")
    const recordLinks = Array.from(document.querySelectorAll(".record-link"))

    recordLinks.sort((a, b) => {
      const dateA = a.querySelector(".record-item").getAttribute("data-date")
      const dateB = b.querySelector(".record-item").getAttribute("data-date")
      if (order === "asc") return dateA.localeCompare(dateB)
      return dateB.localeCompare(dateA)
    })

    recordLinks.forEach((link) => recordList.appendChild(link))

    const allItems = document.querySelectorAll(".record-item")
    allItems.forEach((item, index) => {
      item.classList.remove("__item-in")
      setTimeout(() => item.classList.add("__item-in"), 100 + index * 100)
    })
  }

  if (categoryFilter) categoryFilter.addEventListener("change", filterRecords)
  if (sortFilter) sortFilter.addEventListener("change", (e) => sortRecords(e.target.value))

  attachCalendarToBody()
  renderCalendar()
  sortRecords(sortFilter ? sortFilter.value : "desc")

  if (clearDateButton) {
    clearDateButton.addEventListener("click", (e) => {
      e.stopPropagation()
      e.preventDefault()
      console.log("[v0] 日付フィルターをクリア")
      selectedDate = null
      dateInput.value = ""
      filterRecords()
      closeCalendar()
    })
  }

  const navRightArrow = document.getElementById("navRightArrow")
  if (navRightArrow) {
    navRightArrow.addEventListener("click", (e) => {
      e.preventDefault()
      console.log("[v0] 右矢印クリック - 右スライドアニメーション開始")
      const screenWrapper = document.querySelector(".screen-wrapper")
      screenWrapper.classList.add("slide-out-left")
      setTimeout(() => {
        console.log("[v0] ページ遷移実行")
        window.location.href = "record_list.jsp"
      }, 500)
    })
  }
})
