// Elementos da página usados pelo jogo.
const board = document.querySelector(".board");
const cards = [...document.querySelectorAll(".cards")];
const timerDisplay = document.querySelector(".timer");
const startButton = document.querySelector(".start-button");
const rankingList = document.querySelector(".ranking-list");
const rankingEmpty = document.querySelector(".ranking-empty");

// Estado compartilhado entre as funcionalidades.
let firstCard = null;
let secondCard = null;
let lockBoard = true;
let matchedPairs = 0;
let elapsedSeconds = 0;
let timerInterval = null;
let mismatchTimeout = null;
let gameStarted = false;
// O ranking existe apenas enquanto esta página estiver aberta; não usa armazenamento local.
const bestTimes = [];

// Funcionalidades base: prepara cartas, embaralha e controla os turnos.
function shuffleCards() {
  const shuffledCards = [...cards];

  for (let index = shuffledCards.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [shuffledCards[index], shuffledCards[randomIndex]] = [
      shuffledCards[randomIndex],
      shuffledCards[index],
    ];
  }

  shuffledCards.forEach((card) => board.append(card));
}

function handleCardClick(event) {
  const card = event.currentTarget;

  if (lockBoard || card === firstCard || card.classList.contains("is-matched")) return;

  flipCard(card);

  if (!firstCard) {
    firstCard = card;
    return;
  }

  secondCard = card;
  lockBoard = true;
  checkForMatch();
}

// Animação: a classe muda a rotação no CSS, mantendo o efeito fora da lógica JS.
function flipCard(card) {
  card.classList.add("is-flipped");
  card.setAttribute("aria-pressed", "true");
}

function unflipCard(card) {
  card.classList.remove("is-flipped");
  card.setAttribute("aria-pressed", "false");
}

// Verificação: compara os Pokémon e encerra a partida quando todos combinam.
function checkForMatch() {
  const firstPokemon = firstCard.querySelector(".frente").getAttribute("src");
  const secondPokemon = secondCard.querySelector(".frente").getAttribute("src");

  if (firstPokemon === secondPokemon) {
    firstCard.classList.add("is-matched");
    secondCard.classList.add("is-matched");
    matchedPairs += 1;
    resetTurn();

    if (matchedPairs === cards.length / 2) finishGame();
    return;
  }

  mismatchTimeout = window.setTimeout(() => {
    unflipCard(firstCard);
    unflipCard(secondCard);
    mismatchTimeout = null;
    resetTurn();
  }, 850);
}

function resetTurn() {
  firstCard = null;
  secondCard = null;
  lockBoard = false;
}

// Cronômetro: conta segundos desde o início e para ao completar os pares.
function formatTime(totalSeconds) {
  const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
  const seconds = (totalSeconds % 60).toString().padStart(2, "0");
  return `${minutes}:${seconds}`;
}

function updateTimer() {
  elapsedSeconds += 1;
  timerDisplay.textContent = formatTime(elapsedSeconds);
  timerDisplay.setAttribute("aria-label", `Tempo: ${timerDisplay.textContent}`);
}

function startTimer() {
  window.clearInterval(timerInterval);
  timerInterval = window.setInterval(updateTimer, 1000);
}

function stopTimer() {
  window.clearInterval(timerInterval);
  timerInterval = null;
}

// Restart: limpa estado, reinicia o cronômetro e começa uma nova rodada.
function restartGame() {
  stopTimer();
  window.clearTimeout(mismatchTimeout);
  mismatchTimeout = null;
  elapsedSeconds = 0;
  timerDisplay.textContent = "00:00";
  timerDisplay.setAttribute("aria-label", "Tempo: 00:00");
  matchedPairs = 0;
  gameStarted = true;
  lockBoard = false;
  resetTurn();

  cards.forEach((card) => {
    card.classList.remove("is-flipped", "is-matched");
    card.setAttribute("aria-pressed", "false");
  });

  shuffleCards();
  startButton.querySelector("span").textContent = "Restart";
  startButton.setAttribute("aria-label", "Restart game");
  startTimer();
}

function finishGame() {
  stopTimer();
  gameStarted = false;
  lockBoard = true;
  addBestTime(elapsedSeconds);
  startButton.querySelector("span").textContent = "Play again";
  startButton.setAttribute("aria-label", "Play again");
}

// Ranking: guarda até três menores tempos em memória e atualiza a lista na tela.
function addBestTime(time) {
  bestTimes.push(time);
  bestTimes.sort((firstTime, secondTime) => firstTime - secondTime);
  bestTimes.splice(3);
  renderRanking();
}

function renderRanking() {
  rankingList.replaceChildren();
  rankingEmpty.hidden = bestTimes.length > 0;

  bestTimes.forEach((time) => {
    const entry = document.createElement("li");
    entry.textContent = formatTime(time);
    rankingList.append(entry);
  });
}

// Configuração inicial: deixa o tabuleiro fechado até apertar Play.
cards.forEach((card, index) => {
  card.setAttribute("tabindex", "0");
  card.setAttribute("role", "button");
  card.setAttribute("aria-pressed", "false");
  card.setAttribute("aria-label", `Carta ${index + 1}, fechada`);
  card.addEventListener("click", handleCardClick);
  card.addEventListener("keydown", (event) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      card.click();
    }
  });
});

startButton.addEventListener("click", () => {
  // O primeiro clique inicia; os seguintes reiniciam uma rodada nova.
  restartGame();
});
