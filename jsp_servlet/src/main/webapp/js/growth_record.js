window.addEventListener("DOMContentLoaded", () => {
  console.log("[v0] DOMContentLoaded - growth_record.js 初期化");

  const container = document.querySelector(".records-container");
  const items = document.querySelectorAll(".record-item");
  if (!container || items.length === 0) {
    console.log("[v0] レコード要素が見つかりません");
    return;
  }

  // --- アニメーション用のインライン style を追加（既存の CSS と併用） ---
  (function addAppearStyles() {
    const style = document.createElement("style");
    style.textContent = `
      .records-container { opacity: 0; transform: translateY(-32px); filter: blur(4px); transition: opacity .8s cubic-bezier(.16,.68,.32,1.02), transform .8s cubic-bezier(.16,.68,.32,1.02), filter .8s;}
      .records-container.__appear { opacity:1; transform: translateY(0); filter: blur(0);}
      .record-item { opacity:0; transform: translateY(10px); transition: opacity .45s ease, transform .45s ease;}
      .record-item.__item-in { opacity:1; transform: translateY(0); }
    `;
    document.head.appendChild(style);
  })();

  requestAnimationFrame(() => {
    container.classList.add("__appear");
    items.forEach((el, index) => {
      const delay = 400 + index * 120;
      setTimeout(() => el.classList.add("__item-in"), delay);
    });
  });

  // --- フィルタ要素 ---
  const categoryFilter = document.getElementById("category-filter");
  const dateInput = document.getElementById("fecha"); // 隠し input（状態管理用）
  const calendarButton = document.getElementById("calendar-button");
  let calendarPicker = document.getElementById("calendar-picker");
  const calendarGrid = document.getElementById("calendarGrid");
  const currentMonthSpan = document.getElementById("currentMonth");
  const prevMonthBtn = document.getElementById("prevMonth");
  const nextMonthBtn = document.getElementById("nextMonth");
  const sortFilter = document.getElementById("sort-filter");

  if (!calendarButton) {
    console.error("[v0] カレンダーボタンが見つかりません");
    return;
  }
  console.log("[v0] カレンダーボタンが見つかりました:", calendarButton);

  // state
  let currentDate = new Date();
  let selectedDate = dateInput.value ? new Date(dateInput.value) : null;
  let calendarAttachedToBody = false;

  // move calendarPicker to body when opening — prevents clipping/overflow/z-index issues
  function attachCalendarToBody() {
    if (!calendarPicker) return;
    if (!calendarAttachedToBody) {
      // keep a reference to original parent if needed later
      calendarPicker.__originalParent = calendarPicker.parentElement;
      document.body.appendChild(calendarPicker);
      calendarAttachedToBody = true;
      console.log("[v0] カレンダーピッカーをbodyに移動しました");
    }
    calendarPicker.style.position = "fixed"; // fixed so it won't be affected by parent overflow
    calendarPicker.style.zIndex = "9999";
    calendarPicker.setAttribute("aria-hidden", "false");
  }

  function detachCalendarToOriginal() {
    if (!calendarPicker || !calendarPicker.__originalParent) return;
    calendarPicker.setAttribute("aria-hidden", "true");
  }

  function openCalendar() {
    if (!calendarPicker || !calendarButton) return;
    console.log("[v0] カレンダーを開く");
    attachCalendarToBody();
    // compute position
    const rect = calendarButton.getBoundingClientRect();
    // prefer placing under the button; but if near bottom, flip above
    const topCandidate = rect.bottom + 8;
    const leftCandidate = rect.left;
    // set width minimum
    calendarPicker.style.minWidth = "280px";
    // position
    calendarPicker.style.left = Math.max(8, leftCandidate) + "px";

    // ensure it fits vertically; if not, place above
    const pickerHeight = 320; // approximate; CSS will adapt
    const availableBelow = window.innerHeight - rect.bottom;
    if (availableBelow < pickerHeight && rect.top > pickerHeight) {
      // place above
      calendarPicker.style.top = (rect.top - pickerHeight - 8) + "px";
    } else {
      calendarPicker.style.top = (topCandidate) + "px";
    }

    calendarPicker.classList.add("active");
    calendarPicker.style.display = "block";
    calendarButton.setAttribute("aria-expanded", "true");
    renderCalendar();
  }

  function closeCalendar() {
    if (!calendarPicker) return;
    console.log("[v0] カレンダーを閉じる");
    calendarPicker.classList.remove("active");
    calendarPicker.style.display = "none";
    calendarButton.setAttribute("aria-expanded", "false");
  }

  calendarButton.addEventListener("click", (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log("[v0] カレンダーボタンクリック");
    if (!calendarPicker) return;
    if (calendarPicker.classList.contains("active")) {
      closeCalendar();
    } else {
      openCalendar();
    }
  });

  // ポインターダウンでも対応
  calendarButton.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    console.log("[v0] カレンダーボタンポインターダウン");
  });

  // close when clicking outside
  document.addEventListener("click", (e) => {
    if (!calendarPicker) return;
    if (!calendarPicker.contains(e.target) && e.target !== calendarButton && !calendarButton.contains(e.target)) {
      closeCalendar();
    }
  }, true);

  // keyboard escape to close
  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeCalendar();
  });

  // prev / next month
  if (prevMonthBtn) {
    prevMonthBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentDate.setMonth(currentDate.getMonth() - 1);
      renderCalendar();
    });
  }
  if (nextMonthBtn) {
    nextMonthBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      currentDate.setMonth(currentDate.getMonth() + 1);
      renderCalendar();
    });
  }

  // render calendar grid
  function renderCalendar() {
    if (!calendarGrid || !currentMonthSpan) return;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    currentMonthSpan.textContent = `${year}年 ${month + 1}月`;

    calendarGrid.innerHTML = "";

    // weekday headers
    const weekdays = ["日", "月", "火", "水", "木", "金", "土"];
    weekdays.forEach(day => {
      const el = document.createElement("div");
      el.className = "calendar-weekday";
      el.textContent = day;
      calendarGrid.appendChild(el);
    });

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startDay = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // fill prev month trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startDay - 1; i >= 0; i--) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day other-month";
      dayDiv.textContent = prevMonthLastDay - i;
      calendarGrid.appendChild(dayDiv);
    }

    // days of current month
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day";
      dayDiv.textContent = day;

      // highlight today
      if (year === today.getFullYear() && month === today.getMonth() && day === today.getDate()) {
        dayDiv.classList.add("today");
      }
      // selected
      if (selectedDate && year === selectedDate.getFullYear() &&
          month === selectedDate.getMonth() && day === selectedDate.getDate()) {
        dayDiv.classList.add("selected");
      }

      dayDiv.addEventListener("click", (e) => {
        e.stopPropagation();
        e.preventDefault();
        console.log("[v0] 日付選択:", day);
        selectedDate = new Date(year, month, day);
        const dateString = formatDateISO(selectedDate);
        console.log("[v0] フォーマット済み日付:", dateString);
        dateInput.value = dateString;
        console.log("[v0] 選択日付を保存:", dateString);
        renderCalendar();
        filterRecords();
        closeCalendar();
      });

      calendarGrid.appendChild(dayDiv);
    }

    // fill next month leading days to total cells (make 6 rows)
    const totalCellsSoFar = startDay + daysInMonth;
    const remainingDays = (7 * 6) - totalCellsSoFar;
    for (let d = 1; d <= remainingDays; d++) {
      const dayDiv = document.createElement("div");
      dayDiv.className = "calendar-day other-month";
      dayDiv.textContent = d;
      calendarGrid.appendChild(dayDiv);
    }
  }

  // format Date -> YYYY-MM-DD
  function formatDateISO(d) {
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  // filter records by category and date
  function filterRecords() {
    const selectedCategory = categoryFilter ? categoryFilter.value : "";
    const selectedDateVal = dateInput ? dateInput.value : "";
    const recordLinks = document.querySelectorAll(".record-link");

    recordLinks.forEach(link => {
      const item = link.querySelector(".record-item");
      const category = item.getAttribute("data-category");
      const date = item.getAttribute("data-date");

      let showItem = true;
      if (selectedCategory && category !== selectedCategory) showItem = false;
      
      if (selectedDateVal) {
        const selectedMonthDay = selectedDateVal.slice(5); // "MM-DD"を抽出
        const recordMonthDay = date.slice(5); // "MM-DD"を抽出
        if (recordMonthDay !== selectedMonthDay) showItem = false;
      }

      if (showItem) {
        link.style.display = "block";
        item.classList.add("__item-in");
        console.log("[v0] 表示:", date, category);
      } else {
        link.style.display = "none";
        item.classList.remove("__item-in");
        console.log("[v0] 非表示:", date, category);
      }
    });
  }

  // sort function
  function sortRecords(order) {
    const recordList = document.querySelector(".record-list");
    const recordLinks = Array.from(document.querySelectorAll(".record-link"));

    recordLinks.sort((a, b) => {
      const dateA = a.querySelector(".record-item").getAttribute("data-date");
      const dateB = b.querySelector(".record-item").getAttribute("data-date");
      if (order === "asc") return dateA.localeCompare(dateB);
      return dateB.localeCompare(dateA);
    });

    recordLinks.forEach(link => recordList.appendChild(link));

    const allItems = document.querySelectorAll(".record-item");
    allItems.forEach((item, index) => {
      item.classList.remove("__item-in");
      setTimeout(() => item.classList.add("__item-in"), 100 + index * 100);
    });
  }

  // event listeners for filters
  if (categoryFilter) categoryFilter.addEventListener("change", filterRecords);
  if (sortFilter) sortFilter.addEventListener("change", (e) => sortRecords(e.target.value));

  // make sure calendar picker is attached to body to avoid clipping
  attachCalendarToBody();
  // initial render
  renderCalendar();
  // initial sort (desc)
  sortRecords(sortFilter ? sortFilter.value : "desc");

  const navRightArrow = document.getElementById("navRightArrow");
  if (navRightArrow) {
    navRightArrow.addEventListener("click", (e) => {
      e.preventDefault();
      console.log("[v0] 右矢印クリック - 右スライドアニメーション開始");
      const screenWrapper = document.querySelector(".screen-wrapper");
      
      // 左にスライドアウト
      screenWrapper.classList.add("slide-out-left");
      
      setTimeout(() => {
        console.log("[v0] ページ遷移実行");
        window.location.href = "record_list.jsp";
      }, 500);
    });
  }
});
