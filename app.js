const calendarMonths = [
  {
    year: 2026,
    monthIndex: 3,
    label: "April 2026",
    note: "เริ่มตอนแรกวันศุกร์ที่ 3 เมษายน 2026",
    episodes: {
      3: {
        episode: "EP.1",
        title: "Hometown Romance",
        time: "22:30 / 23:30",
        platform: "One31 • oneD • iQIYI",
        status: "ตอนแรก",
      },
      10: {
        episode: "EP.2",
        title: "Hometown Romance",
        time: "22:30 / 23:30",
        platform: "One31 • oneD • iQIYI",
        status: "ออนแอร์แล้ว",
      },
      17: {
        episode: "EP.3",
        title: "Hometown Romance",
        time: "22:30 / 23:30",
        platform: "One31 • oneD • iQIYI",
        status: "ออนแอร์แล้ว",
      },
      24: {
        episode: "EP.4",
        title: "Hometown Romance",
        time: "22:30 / 23:30",
        platform: "One31 • oneD • iQIYI",
        status: "ตามรอบประจำสัปดาห์",
      },
    },
  },
  {
    year: 2026,
    monthIndex: 4,
    label: "May 2026",
    note: "ตอนท้ายของซีซันจนถึงตอนจบ",
    episodes: {
      1: {
        episode: "EP.5",
        title: "Hometown Romance",
        time: "22:30 / 23:30",
        platform: "One31 • oneD • iQIYI",
        status: "ตามรอบประจำสัปดาห์",
      },
      8: {
        episode: "EP.6",
        title: "Hometown Romance",
        time: "22:30 / 23:30",
        platform: "One31 • oneD • iQIYI",
        status: "ตามรอบประจำสัปดาห์",
      },
      15: {
        episode: "EP.7",
        title: "Hometown Romance",
        time: "22:30 / 23:30",
        platform: "One31 • oneD • iQIYI",
        status: "ก่อนตอนจบ",
      },
      22: {
        episode: "EP.8",
        title: "Hometown Romance",
        time: "22:30 / 23:30",
        platform: "One31 • oneD • iQIYI",
        status: "ตอนจบ",
      },
    },
  },
];

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const state = { currentMonth: 0 };

const nodes = {
  calendarRoot: document.querySelector("#calendarRoot"),
  calendarTemplate: document.querySelector("#calendarTemplate"),
  monthLabel: document.querySelector("#monthLabel"),
  calendarNote: document.querySelector("#calendarNote"),
  calendarHeading: document.querySelector("#calendarHeading"),
  prevMonthButton: document.querySelector("#prevMonthButton"),
  nextMonthButton: document.querySelector("#nextMonthButton"),
  modal: document.querySelector("#detailModal"),
  backdrop: document.querySelector("#detailBackdrop"),
  closeButton: document.querySelector("#closeDetailButton"),
  episode: document.querySelector("#detailEpisode"),
  title: document.querySelector("#detailTitle"),
  date: document.querySelector("#detailDate"),
  time: document.querySelector("#detailTime"),
  platform: document.querySelector("#detailPlatform"),
  status: document.querySelector("#detailStatus"),
};

let longPressTimer = null;
let suppressClick = false;
let closeTimer = null;

function openDetailModal(detail) {
  if (closeTimer) {
    window.clearTimeout(closeTimer);
    closeTimer = null;
  }

  nodes.episode.textContent = detail.episode;
  nodes.title.textContent = detail.title;
  nodes.date.textContent = `วันออนแอร์ ${String(detail.day).padStart(2, "0")} ${
    monthLabels[detail.monthIndex]
  } ${detail.year}`;
  nodes.time.textContent = `เวลา ${detail.time}`;
  nodes.platform.textContent = `รับชม ${detail.platform}`;
  nodes.status.textContent = detail.status;
  nodes.modal.hidden = false;
  nodes.modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  window.requestAnimationFrame(() => {
    nodes.modal.classList.add("is-open");
  });
}

function closeDetailModal() {
  nodes.modal.classList.remove("is-open");
  nodes.modal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
  closeTimer = window.setTimeout(() => {
    nodes.modal.hidden = true;
    closeTimer = null;
  }, 280);
}

function attachLongPress(cell, detail) {
  const startPress = () => {
    longPressTimer = window.setTimeout(() => {
      openDetailModal(detail);
      suppressClick = true;
    }, 350);
  };

  const cancelPress = () => {
    if (longPressTimer) {
      window.clearTimeout(longPressTimer);
      longPressTimer = null;
    }
  };

  cell.addEventListener("pointerdown", startPress);
  cell.addEventListener("pointerup", cancelPress);
  cell.addEventListener("pointerleave", cancelPress);
  cell.addEventListener("pointercancel", cancelPress);
  cell.addEventListener("click", () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    openDetailModal(detail);
  });
}

function renderCalendar() {
  const current = calendarMonths[state.currentMonth];
  nodes.calendarRoot.innerHTML = "";

  const calendar = nodes.calendarTemplate.content.firstElementChild.cloneNode(true);
  const firstDay = new Date(current.year, current.monthIndex, 1).getDay();
  const daysInMonth = new Date(current.year, current.monthIndex + 1, 0).getDate();

  for (let i = 0; i < firstDay; i += 1) {
    const emptyCell = document.createElement("article");
    emptyCell.className = "calendar-day empty";
    calendar.append(emptyCell);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const cell = document.createElement("article");
    const episode = current.episodes[day];
    cell.className = `calendar-day ${episode ? "has-episode" : ""}`.trim();

    const number = document.createElement("strong");
    number.className = "day-number";
    number.textContent = String(day).padStart(2, "0");
    cell.append(number);

    if (episode) {
      const title = document.createElement("strong");
      title.className = "episode-title";
      title.textContent = episode.title;

      const tag = document.createElement("span");
      tag.className = "episode-tag";
      tag.textContent = episode.episode;

      cell.append(title, tag);
      attachLongPress(cell, {
        ...episode,
        day,
        monthIndex: current.monthIndex,
        year: current.year,
      });
    }

    calendar.append(cell);
  }

  nodes.calendarRoot.append(calendar);
  nodes.monthLabel.textContent = current.label;
  nodes.calendarHeading.textContent = current.label;
  nodes.calendarNote.textContent = current.note;
  nodes.prevMonthButton.disabled = state.currentMonth === 0;
  nodes.nextMonthButton.disabled = state.currentMonth === calendarMonths.length - 1;
}

nodes.prevMonthButton.addEventListener("click", () => {
  if (state.currentMonth > 0) {
    state.currentMonth -= 1;
    renderCalendar();
  }
});

nodes.nextMonthButton.addEventListener("click", () => {
  if (state.currentMonth < calendarMonths.length - 1) {
    state.currentMonth += 1;
    renderCalendar();
  }
});

nodes.backdrop.addEventListener("click", closeDetailModal);
nodes.closeButton.addEventListener("click", closeDetailModal);
window.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !nodes.modal.hidden) {
    closeDetailModal();
  }
});

renderCalendar();
