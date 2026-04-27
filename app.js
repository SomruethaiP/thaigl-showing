import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const today = new Date();
const todayDay = today.getDate();
const todayMonth = today.getMonth();
const todayYear = today.getFullYear();

const firebaseConfig = {
  apiKey: "AIzaSyBJpNvlY_hIX5OzGEfDNDYw-kgrjrrGFg0",
  authDomain: "thaigl-showing.firebaseapp.com",
  projectId: "thaigl-showing",
  storageBucket: "thaigl-showing.firebasestorage.app",
  messagingSenderId: "115777994879",
  appId: "1:115777994879:web:7736a44ebf343095923f4a",
  measurementId: "G-HSB0BJQWQR"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let calendarMonths = [];
const monthLabels = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
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
  title: document.querySelector("#detailTitle"),
  date: document.querySelector("#detailDate"),
};

let longPressTimer = null;
let suppressClick = false;

// ---------- MODAL ----------
function openDetailModal(detail) {
  const list = detail.list || [detail];

  nodes.title.innerHTML = "";

  list.forEach(item => {
    const div = document.createElement("div");
    div.className = "multi-item";

    div.innerHTML = `
  <div class="popup-row">

    <div class="popup-text">
      <strong class="popup-title">${item.episode} - ${item.title}</strong>
      <p>เวลา ${item.time || "-"}</p>
      <p>${item.platform || ""}</p>
      <p class="popup-status">${item.status || ""}</p>
    </div>

    ${item.poster ? `
      <div class="popup-image">
        <img src="${item.poster}" />
      </div>
    ` : ""}

  </div>
`;

    nodes.title.appendChild(div);
  });

  nodes.date.textContent = `วันออนแอร์ ${String(detail.day).padStart(2,"0")} ${monthLabels[detail.monthIndex]} ${detail.year}`;

  nodes.modal.hidden = false;
  nodes.modal.classList.add("is-open");
}

function closeDetailModal() {
  nodes.modal.classList.remove("is-open");
  setTimeout(() => nodes.modal.hidden = true, 200);
}

function attachLongPress(cell, detail) {
  const start = () => {
    longPressTimer = setTimeout(() => {
      openDetailModal(detail);
      suppressClick = true;
    }, 300);
  };

  const cancel = () => {
    clearTimeout(longPressTimer);
  };

  cell.addEventListener("pointerdown", start);
  cell.addEventListener("pointerup", cancel);
  cell.addEventListener("pointerleave", cancel);

  cell.addEventListener("click", () => {
    if (suppressClick) {
      suppressClick = false;
      return;
    }
    openDetailModal(detail);
  });
}

// ---------- TIME SORT ----------
function parseTime(timeStr) {
  if (!timeStr) return 9999;
  const t = timeStr.split("/")[0].trim();
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

// ---------- RENDER ----------
function renderCalendar() {
  const current = calendarMonths[state.currentMonth];
  if (!current) return;

  nodes.calendarRoot.innerHTML = "";

  const calendar = nodes.calendarTemplate.content.firstElementChild.cloneNode(true);

  const firstDay = new Date(current.year, current.monthIndex, 1).getDay();
  const daysInMonth = new Date(current.year, current.monthIndex + 1, 0).getDate();

  for (let i = 0; i < firstDay; i++) {
    const empty = document.createElement("article");
    empty.className = "calendar-day empty";
    calendar.append(empty);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    const cell = document.createElement("article");
  
    const dayEpisodes = current.episodes[day];
  
    // ⭐ เช็ค today
    const isToday =
      day === todayDay &&
      current.monthIndex === todayMonth &&
      current.year === todayYear;
  
    // ✅ รวม class ทีเดียว (แก้ปัญหา overwrite)
    cell.className = `
      calendar-day
      ${dayEpisodes ? "has-episode" : ""}
      ${isToday ? "today" : ""}
    `.trim();
  
    const number = document.createElement("strong");
    number.textContent = String(day).padStart(2, "0");
    number.className = "day-number";
    cell.append(number);
  
    if (dayEpisodes && dayEpisodes.length > 0) {
      const first = dayEpisodes[0];
  
      const title = document.createElement("strong");
      title.className = "episode-title";
      title.textContent = first.title;
  
      const tag = document.createElement("span");
      tag.className = "episode-tag";
      tag.textContent = first.episode;
  
      cell.append(title, tag);
  
      if (dayEpisodes.length > 1) {
        const more = document.createElement("span");
        more.className = "episode-more";
        more.textContent = `+${dayEpisodes.length - 1}`;
        cell.append(more);
      }
  
      attachLongPress(cell, {
        list: dayEpisodes,
        day,
        monthIndex: current.monthIndex,
        year: current.year
      });
    }
  
    calendar.append(cell);
  }

  nodes.calendarRoot.append(calendar);
  nodes.monthLabel.textContent = current.label;
  nodes.calendarHeading.textContent = current.label;
}

// ---------- LOAD DATA ----------
async function loadData() {
  const snapshot = await getDocs(collection(db, "thaigl"));
  const map = {};

  snapshot.forEach(doc => {
    const serie = doc.data();
    const start = new Date(serie.startDate);

    for (let i = 0; i < serie.totalEpisodes; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i * 7);

      const ep = {
        episode: `EP.${i + 1}`,
        day: d.getDate(),
        monthIndex: d.getMonth(),
        year: d.getFullYear(),
        title: serie.title,
        platform: serie.platform,
        status: serie.status || "",
        time: serie.time || "",
        poster: serie.poster || ""   // 👈 เพิ่มตรงนี้
      };

      const key = `${ep.year}-${ep.monthIndex}`;

      if (!map[key]) {
        map[key] = {
          year: ep.year,
          monthIndex: ep.monthIndex,
          label: `${monthLabels[ep.monthIndex]} ${ep.year}`,
          episodes: {}
        };
      }

      if (!map[key].episodes[ep.day]) {
        map[key].episodes[ep.day] = [];
      }

      map[key].episodes[ep.day].push(ep);
    }
  });

  // ✅ SORT เวลา
  Object.values(map).forEach(month => {
    Object.values(month.episodes).forEach(dayArr => {
      dayArr.sort((a, b) => parseTime(a.time) - parseTime(b.time));
    });
  });

  calendarMonths = Object.values(map).sort((a, b) =>
    a.year === b.year ? a.monthIndex - b.monthIndex : a.year - b.year
  );
  
  // 👉 หา index เดือนปัจจุบัน
  const currentIndex = calendarMonths.findIndex(
    m => m.year === todayYear && m.monthIndex === todayMonth
  );
  
  state.currentMonth = currentIndex !== -1 ? currentIndex : 0;
  
  renderCalendar();
}

// ---------- EVENTS ----------
nodes.prevMonthButton.onclick = () => {
  if (state.currentMonth > 0) {
    state.currentMonth--;
    renderCalendar();
  }
};

nodes.nextMonthButton.onclick = () => {
  if (state.currentMonth < calendarMonths.length - 1) {
    state.currentMonth++;
    renderCalendar();
  }
};

nodes.backdrop.onclick = closeDetailModal;
nodes.closeButton.onclick = closeDetailModal;

loadData();