import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import {
  getFirestore,
  collection,
  addDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "YOUR_KEY",
  authDomain: "YOUR_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

window.addEpisode = async function () {
  const data = {
    day: Number(document.getElementById("day").value),
    monthIndex: Number(document.getElementById("month").value),
    year: Number(document.getElementById("year").value),
    episode: document.getElementById("episode").value,
    title: document.getElementById("title").value,
    time: document.getElementById("time").value,
    platform: document.getElementById("platform").value,
    status: document.getElementById("status").value,
  };

  await addDoc(collection(db, "episodes"), data);
  alert("Saved!");
};