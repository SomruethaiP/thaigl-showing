import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  updateDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

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

// 👉 cache input (สำคัญมาก กัน bug)
const inputs = {
  title: document.getElementById("title"),
  startDate: document.getElementById("startDate"),
  totalEpisodes: document.getElementById("totalEpisodes"),
  time: document.getElementById("time"),
  platform: document.getElementById("platform"),
  status: document.getElementById("status"),
};

let editId = null;

// ---------- SAVE ----------
window.saveSeries = async function () {
  const data = {
    title: inputs.title.value,
    startDate: inputs.startDate.value,
    totalEpisodes: Number(inputs.totalEpisodes.value),
    time: inputs.time.value,
    platform: inputs.platform.value,
    status: inputs.status.value || "",
    poster: posterUrl.value || ""   // 👈 เพิ่มตรงนี้

  };

  try {
    if (editId) {
      await updateDoc(doc(db, "thaigl", editId), data);
      editId = null;
    } else {
      await addDoc(collection(db, "thaigl"), data);
    }

    clearForm();
    loadList();
  } catch (err) {
    console.error(err);
    alert("Error saving data");
  }
};

// ---------- RENDER LIST (ใหม่) ----------
function renderList(snapshot) {
  const list = document.getElementById("list");
  list.innerHTML = "";

  snapshot.forEach(d => {
    const data = d.data();

    const div = document.createElement("div");
    div.className = "series-item";

    div.innerHTML = `
      <div class="series-title">${data.title}</div>
      <div>${data.startDate || "-"} • ${data.time || "-"}</div>
      <div>EP: ${data.totalEpisodes}</div>

      <div class="actions">
        <button class="edit-btn" data-id="${d.id}">Edit</button>
        <button class="delete-btn" data-id="${d.id}">Delete</button>
      </div>
    `;

    // 👉 ใช้ addEventListener แทน onclick (clean กว่า)
    div.querySelector(".edit-btn").addEventListener("click", () => editSeries(d.id));
    div.querySelector(".delete-btn").addEventListener("click", () => deleteSeries(d.id));

    list.appendChild(div);
  });
}

// ---------- LOAD ----------
async function loadList() {
  const snapshot = await getDocs(collection(db, "thaigl"));
  renderList(snapshot);
}

// ---------- DELETE ----------
async function deleteSeries(id) {
  if (!confirm("Delete this series?")) return;

  try {
    await deleteDoc(doc(db, "thaigl", id));
    loadList();
  } catch (err) {
    console.error(err);
  }
}

// ---------- EDIT ----------
async function editSeries(id) {
  const snapshot = await getDocs(collection(db, "thaigl"));

  snapshot.forEach(d => {
    if (d.id === id) {
      const data = d.data();

      inputs.title.value = data.title || "";
      inputs.startDate.value = data.startDate || "";
      inputs.totalEpisodes.value = data.totalEpisodes || "";
      inputs.time.value = data.time || "";
      inputs.platform.value = data.platform || "";
      inputs.status.value = data.status || "";


      editId = id;

      // 👉 scroll ไปบน (UX ดีขึ้น)
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
}

// ---------- CLEAR ----------
function clearForm() {
  Object.values(inputs).forEach(input => input.value = "");
}

// INIT
loadList();