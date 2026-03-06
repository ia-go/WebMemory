const memoryImages = [
  "Auto",
  "Baum",
  "Biber",
  "Erdbeere",
  "Fisch",
  "Gans",
  "Hund",
  "Maiskolben",
  "Uhr",
  "Vogel",
];

let allMemoryImages = memoryImages.concat(memoryImages);
const memoryImagesAmount = allMemoryImages.length;

const imagesPath = "images/";
const imagesExt = ".png";

let moves = 0; //züge
let matchedPairs = 0;

const PairsScore = document.getElementById("Score");

let locked = false; // bool
let firstCard = null;
let secondCard = null;

// Timer
let startTime = 0;
let timerId = null;
const timerEl = document.getElementById("timer");
const bestEl = document.getElementById("Highscore");

const KEY = "highscore_ms";

SetKEYdefault(); // KEY = 0

renderBest(); // Hihscore auslesn falls vorhanden

const Startbtn = document.getElementById("StartButton");
const pg = document.getElementById("Playground");

pg.addEventListener("click", CardClick);

Startbtn.addEventListener("click", StartGame);

function SetKEYdefault() {
  if (localStorage.getItem(KEY) === null) {
    localStorage.setItem(KEY, 0);
  }
}

function StartGame() {
  const overlay = document.querySelector(".overlay");
  overlay.classList.add("hidden");
  startTimer();
  createDivs();
}

function createDivs() {
  let randomPic = 0;

  for (let i = 1; i <= memoryImagesAmount; i++) {
    randomPic = Math.floor(Math.random() * allMemoryImages.length);
    const div = document.createElement("div");
    const img = document.createElement("img");
    div.className = "card";
    div.dataset.name = allMemoryImages[randomPic]; // um karte zu identifizieren
    div.dataset.matched = "false"; // in karte gespeichert ob sie schon gematcht ist
    img.className = "pic";
    img.src = imagesPath + allMemoryImages[randomPic] + imagesExt;
    div.style.margin = "7px";
    pg.appendChild(div); // wird in Div erstellt
    div.appendChild(img);

    allMemoryImages.splice(randomPic, 1);
  }
}

function CardClick(e) {
  // e = event objekt
  const pickedCard = e.target.closest(".card"); // chatttt GPTT
  if (!pickedCard) return 2; // falls keine card rausgekommen

  if (locked) return 2; // nciht bei locked-screen

  if (pickedCard.dataset.matched === "true") return 2; // nicht ein schon aufgedecktes paar

  revealCard(pickedCard);

  if (!firstCard) {
    firstCard = pickedCard; // falls erste karte
    return 1;
  }
  if (!secondCard) {
    secondCard = pickedCard;
  }
  moves++;
  MatchCheck();
}

function revealCard(pickedCard) {
  const img = pickedCard.querySelector("img");
  img.classList.remove("hidden");
  img.classList.add("revealed");
}

function hideCard(pickedCard) {
  const img = pickedCard.querySelector("img"); // query selector mit dani -> Chat !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
  img.classList.remove("revealed");
  img.classList.add("hidden");
}

function MatchCheck() {
  const Match = firstCard.dataset.name === secondCard.dataset.name;

  if (Match) {
    markMatched(firstCard);
    markMatched(secondCard);
    resetCards();

    matchedPairs++;
    PairsScore.textContent = matchedPairs + "/" + 10;
    if (matchedPairs === 1) {
      memoryImagesAmount / 2;
      finish();
    }
  } else {
    locked = true;
    setTimeout(NotMatched, 500); //Chat (einfachestimout -> wartezeit)
  }
}

function NotMatched() {
  // für setTimout
  hideCard(firstCard);
  hideCard(secondCard);
  resetCards();
  locked = false;
}

function markMatched(pic) {
  pic.dataset.matched = "true";
  pic.classList.add("Matched");
}

function resetCards() {
  firstCard = null;
  secondCard = null;
}

function RestartGame() {
  // pg.innerHTML = "";

  matchedPairs = 0;
  moves = 0;
  locked = false;
  firstCard = 0;
  secondCard = 0;

  PairsScore.textContent = "0/10";

  allMemoryImages = memoryImages.concat(memoryImages);

  const overlay = document.querySelector(".overlay");
  overlay.classList.add("hidden");

  const divs = document.querySelectorAll("div.card");
  divs.forEach((div) => {
    console.log(div);
    div.remove();
  });

  startTimer();
  createDivs();
}

function finish() {
  const passedTime = stopTimer();

  const overlay = document.querySelector(".overlay.hidden");
  overlay.classList.remove("hidden");
  Startbtn.textContent = "Restart";

  Startbtn.addEventListener("click", RestartGame);

  console.log("FINISH passedTime:", passedTime);

  const oldBest = getHighscoreMs(); // null, wenn noch keiner existiert
  const bestAfter = saveHighscoreIfBetter(passedTime);

  const isNew = oldBest === null || passedTime < oldBest;

  bestEl.textContent = isNew
    ? `Fastest Time: ${formatMs(bestAfter)} (NEW!)` // wenn true
    : `Fastest Time: ${formatMs(bestAfter)}`; // wenn false
}

// start of chat GPT work :) (Timer)

function startTimer() {
  if (timerId) clearInterval(timerId);

  startTime = Date.now();

  timerId = setInterval(showTime, 10);
}

function showTime() {
  const elapsedMs = Date.now() - startTime;
  timerEl.textContent = formatMs(elapsedMs);
}

function stopTimer() {
  if (!timerId) return 0;

  clearInterval(timerId);
  timerId = null;

  return Date.now() - startTime;
}

//HIGHSCORE (kleinster Wert) in localStorage
function saveHighscoreIfBetter(elapsedMs) {
  const best = getHighscoreMs();

  if (best === 0 || elapsedMs < best) {
    localStorage.setItem(KEY, String(elapsedMs));
    return elapsedMs;
  }
  return best;
}

function getHighscoreMs() {
  const v = Number(localStorage.getItem(KEY));
  return Number.isFinite(v) ? v : 0;
}

function formatMs(ms) {
  const min = Math.floor(ms / 60000);
  const sec = Math.floor((ms % 60000) / 1000);
  const cs = Math.floor((ms % 1000) / 10); // 00–99 (Zentisekunden)
  return `${String(min).padStart(2, "0")}:${String(sec).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

function renderBest() {
  const best = getHighscoreMs();
  bestEl.textContent =
    best === 0 ? "Fastest Time: --:--.--" : `Fastest Time: ${formatMs(best)}`;
}
// End of Chat GPT work :(
