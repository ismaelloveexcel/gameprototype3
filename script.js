const BOARD_SIZE = 5;
const TILE_COUNT = BOARD_SIZE * BOARD_SIZE;
const QUEUE_SIZE = 3;
const SERENITY_PER_MERGE = 18;
const SERENITY_BURST_THRESHOLD = 100;
const HOLD_COOLDOWN_TEXT = "Swap used this turn";

const tierData = [
  {
    label: "Sprout",
    emoji: "🌱",
    gradient: "linear-gradient(135deg, #a0ffa3, #5cd47a)",
    highlight: "rgba(164, 255, 190, 0.65)",
  },
  {
    label: "Leaflet",
    emoji: "🍃",
    gradient: "linear-gradient(135deg, #96ffd5, #4cd7c2)",
    highlight: "rgba(148, 255, 234, 0.65)",
  },
  {
    label: "Lavender",
    emoji: "💮",
    gradient: "linear-gradient(135deg, #c19bff, #9b79ff)",
    highlight: "rgba(196, 168, 255, 0.55)",
  },
  {
    label: "Sakura",
    emoji: "🌸",
    gradient: "linear-gradient(135deg, #ffc0e1, #ff87ba)",
    highlight: "rgba(255, 174, 212, 0.6)",
  },
  {
    label: "Bonsai",
    emoji: "🎋",
    gradient: "linear-gradient(135deg, #f4d9a0, #c5914c)",
    highlight: "rgba(244, 217, 160, 0.6)",
  },
  {
    label: "Spirit",
    emoji: "🕊️",
    gradient: "linear-gradient(135deg, #a7f3ff, #f7d7ff)",
    highlight: "rgba(191, 236, 255, 0.75)",
  },
];

const elements = {
  board: document.getElementById("board"),
  queue: document.getElementById("queue"),
  holdSlot: document.getElementById("hold-slot"),
  holdBtn: document.getElementById("hold-btn"),
  undoBtn: document.getElementById("undo-btn"),
  restartBtn: document.getElementById("restart-btn"),
  overlayRestartBtn: document.getElementById("overlay-restart"),
  overlayCloseBtn: document.getElementById("close-overlay"),
  overlay: document.getElementById("game-over"),
  nightToggle: document.getElementById("night-toggle"),
  scoreValue: document.getElementById("score-value"),
  bestValue: document.getElementById("best-value"),
  chainValue: document.getElementById("chain-value"),
  movesValue: document.getElementById("moves-value"),
  serenityFill: document.getElementById("serenity-fill"),
  serenityLabel: document.getElementById("serenity-label"),
};

const state = {
  board: Array.from({ length: TILE_COUNT }, () => null),
  queue: [],
  holdTile: null,
  holdLocked: false,
  selectedQueueIndex: 0,
  score: 0,
  bestScore: Number(localStorage.getItem("breezegarden_best") || 0),
  moves: 0,
  longestChain: 0,
  serenity: 0,
  history: [],
  gameOver: false,
  windTileIndex: null,
  windTimer: 0,
  movesUntilWind: randomBetween(10, 15),
  driftCountdown: 0,
  nightMode: false,
};

const directions = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

init();

function init() {
  injectBoardCells();
  generateFireflies();
  refillQueue();
  renderAll();
  attachEvents();
}

function attachEvents() {
  elements.holdBtn.addEventListener("click", handleHold);
  elements.undoBtn.addEventListener("click", handleUndo);
  elements.restartBtn.addEventListener("click", restartGame);
  elements.overlayRestartBtn.addEventListener("click", restartGame);
  elements.overlayCloseBtn.addEventListener("click", () => toggleOverlay(false));
  elements.nightToggle.addEventListener("click", toggleNightMode);
  document.addEventListener("keydown", handleShortcuts);
}

function injectBoardCells() {
  elements.board.innerHTML = "";
  for (let i = 0; i < TILE_COUNT; i += 1) {
    const cell = document.createElement("button");
    cell.type = "button";
    cell.className = "tile empty";
    cell.dataset.index = i;
    cell.addEventListener("click", () => handlePlacement(i));
    elements.board.appendChild(cell);
  }
}

function generateFireflies() {
  const existing = document.querySelectorAll(".firefly");
  existing.forEach((node) => node.remove());
  for (let i = 0; i < 12; i += 1) {
    const firefly = document.createElement("div");
    firefly.className = "firefly";
    firefly.style.left = `${Math.random() * 100}vw`;
    firefly.style.top = `${Math.random() * 100}vh`;
    firefly.style.animationDelay = `${Math.random() * 4}s`;
    document.body.appendChild(firefly);
  }
}

function toggleNightMode() {
  state.nightMode = !state.nightMode;
  document.body.classList.toggle("night", state.nightMode);
  elements.nightToggle.textContent = state.nightMode ? "Pastel Dawn" : "Firefly Night";
}

function handleShortcuts(event) {
  if (event.key === "r") {
    restartGame();
  }
  if (event.key === "u") {
    handleUndo();
  }
}

function handlePlacement(index) {
  if (state.gameOver) return;
  if (state.board[index]) return;
  const tile = getSelectedQueueTile();
  if (!tile) return;

  saveHistory();
  state.board[index] = {
    ...tile,
    id: cryptoRandomId(),
    spawn: true,
  };
  state.queue.splice(state.selectedQueueIndex, 1);
  state.selectedQueueIndex = 0;
  state.holdLocked = false;
  refillQueue();

  state.moves += 1;
  state.movesUntilWind -= 1;
  decrementWindTimer();
  maybeSpawnWind();

  const chainSize = resolveMerges(index);
  if (chainSize > state.longestChain) {
    state.longestChain = chainSize;
  }
  if (state.serenity >= SERENITY_BURST_THRESHOLD) {
    triggerZenBurst();
  }

  if (!state.board.some((slot) => slot === null)) {
    triggerGameOver();
  }

  renderAll();
}

function getSelectedQueueTile() {
  if (!state.queue.length) return null;
  const idx = Math.min(state.selectedQueueIndex, state.queue.length - 1);
  return state.queue[idx];
}

function resolveMerges(originIndex) {
  let chainCount = 0;
  let currentIndex = originIndex;
  let merging = true;

  while (merging) {
    const tile = state.board[currentIndex];
    if (!tile) break;

    const cluster = collectCluster(currentIndex, tile.tier);
    if (cluster.length < 3) {
      merging = false;
      continue;
    }

    chainCount += 1;
    const tierValue = tile.tier;
    const windBonus = cluster.includes(state.windTileIndex) ? 1.15 : 1;
    const driftBonus = tile.drift ? 1.3 : 1;
    const mergeScore = Math.round((tierValue + 1) * cluster.length * 12 * windBonus * driftBonus);
    state.score += mergeScore;
    state.serenity = Math.min(SERENITY_BURST_THRESHOLD, state.serenity + SERENITY_PER_MERGE + cluster.length * 2);

    cluster.forEach((idx) => {
      if (idx === currentIndex) return;
      state.board[idx] = null;
    });

    const nextTier = Math.min(tierValue + 1, tierData.length - 1);
    state.board[currentIndex] = {
      tier: nextTier,
      id: cryptoRandomId(),
      wind: idxIsWind(currentIndex),
    };

    if (state.board[currentIndex].tier === tierData.length - 1) {
      state.board[currentIndex].apex = true;
    }
  }

  state.bestScore = Math.max(state.bestScore, state.score);
  localStorage.setItem("breezegarden_best", String(state.bestScore));
  return chainCount;
}

function collectCluster(startIndex, tier) {
  const queue = [startIndex];
  const visited = new Set([startIndex]);
  while (queue.length) {
    const current = queue.shift();
    const [x, y] = indexToCoord(current);
    for (const [dx, dy] of directions) {
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) continue;
      const nextIndex = coordToIndex(nx, ny);
      if (visited.has(nextIndex)) continue;
      const neighbor = state.board[nextIndex];
      if (!neighbor || neighbor.tier !== tier) continue;
      visited.add(nextIndex);
      queue.push(nextIndex);
    }
  }
  return Array.from(visited);
}

function handleHold() {
  if (state.gameOver) return;
  if (!state.queue.length) return;
  if (state.holdLocked) return showHoldLocked();

  if (!state.holdTile) {
    state.holdTile = state.queue.splice(state.selectedQueueIndex, 1)[0];
    state.selectedQueueIndex = 0;
    refillQueue();
  } else {
    const current = state.queue[state.selectedQueueIndex];
    state.queue[state.selectedQueueIndex] = state.holdTile;
    state.holdTile = current;
  }

  state.holdLocked = true;
  renderQueue();
  renderHold();
}

function showHoldLocked() {
  state.holdBtnTextTimeout && clearTimeout(state.holdBtnTextTimeout);
  const original = elements.holdBtn.textContent;
  elements.holdBtn.textContent = HOLD_COOLDOWN_TEXT;
  state.holdBtnTextTimeout = setTimeout(() => {
    elements.holdBtn.textContent = "Hold / Swap";
  }, 1200);
  return original;
}

function handleUndo() {
  if (!state.history.length) return;
  const snapshot = state.history.pop();
  Object.assign(state, snapshot);
  renderAll();
}

function saveHistory() {
  const snapshot = {
    board: state.board.map((tile) => (tile ? { ...tile } : null)),
    queue: state.queue.map((tile) => ({ ...tile })),
    holdTile: state.holdTile ? { ...state.holdTile } : null,
    holdLocked: state.holdLocked,
    selectedQueueIndex: state.selectedQueueIndex,
    score: state.score,
    bestScore: state.bestScore,
    moves: state.moves,
    longestChain: state.longestChain,
    serenity: state.serenity,
    gameOver: state.gameOver,
    windTileIndex: state.windTileIndex,
    windTimer: state.windTimer,
    movesUntilWind: state.movesUntilWind,
    driftCountdown: state.driftCountdown,
  };
  state.history.push(snapshot);
  if (state.history.length > 25) state.history.shift();
}

function refillQueue() {
  while (state.queue.length < QUEUE_SIZE) {
    state.queue.push(generateTile());
  }
  renderQueue();
}

function generateTile() {
  const baseWeights = [0.36, 0.27, 0.2, 0.1, 0.06, 0.01];
  const boardCounts = tierData.map((_, idx) => state.board.filter((tile) => tile?.tier === idx).length);
  const mostCommonTier = boardCounts.indexOf(Math.max(...boardCounts));
  const biasTier = Math.max(0, mostCommonTier - 1);
  baseWeights[biasTier] += 0.12;

  if (state.driftCountdown <= 0) {
    state.driftCountdown = randomBetween(12, 18);
    return {
      tier: Math.min(tierData.length - 2, Math.max(1, biasTier + 1)),
      drift: true,
    };
  } else {
    state.driftCountdown -= 1;
  }

  const tier = weightedChoice(baseWeights);
  return { tier };
}

function weightedChoice(weights) {
  const sum = weights.reduce((acc, value) => acc + value, 0);
  const roll = Math.random() * sum;
  let cumulative = 0;
  for (let i = 0; i < weights.length; i += 1) {
    cumulative += weights[i];
    if (roll <= cumulative) return i;
  }
  return weights.length - 1;
}

function renderAll() {
  renderBoard();
  renderQueue();
  renderHold();
  updateStats();
}

function renderBoard() {
  state.board.forEach((tile, index) => {
    const cell = elements.board.children[index];
    if (!tile) {
      cell.className = "tile empty";
      cell.innerHTML = "";
      cell.style.background = "";
      return;
    }

    const tier = tierData[tile.tier];
    cell.className = `tile tier-${tile.tier}`;
    if (tile.wind) cell.classList.add("wind");
    if (tile.spawn) {
      cell.classList.add("spawn");
      delete tile.spawn;
    }
    cell.style.background = tier.gradient;
    cell.innerHTML = `
      <span class="tier-label">${tier.label}</span>
      <span class="tier-name">${tier.emoji}</span>
      <span class="tier-badge">T${tile.tier + 1}</span>
    `;
  });
}

function renderQueue() {
  elements.queue.innerHTML = "";
  state.queue.forEach((tile, index) => {
    const tier = tierData[tile.tier];
    const node = document.createElement("div");
    node.className = "queue-tile";
    if (index === state.selectedQueueIndex) {
      node.classList.add("selected");
    }
    node.style.background = tier.gradient;
    node.innerHTML = `
      <div class="tier">${tier.emoji}</div>
      <div class="label">T${tile.tier + 1}</div>
      ${tile.drift ? '<div class="label">Drift Seed</div>' : ""}
    `;
    node.addEventListener("click", () => {
      state.selectedQueueIndex = index;
      renderQueue();
    });
    elements.queue.appendChild(node);
  });
}

function renderHold() {
  const slot = elements.holdSlot;
  slot.className = "hold-slot";
  if (!state.holdTile) {
    slot.classList.add("empty");
    slot.textContent = "Empty";
    return;
  }
  const tier = tierData[state.holdTile.tier];
  slot.classList.add("active");
  slot.style.background = tier.highlight;
  slot.innerHTML = `
    <div>
      <div>${tier.emoji}</div>
      <small>T${state.holdTile.tier + 1}</small>
    </div>
  `;
}

function updateStats() {
  elements.scoreValue.textContent = state.score.toLocaleString();
  elements.bestValue.textContent = state.bestScore.toLocaleString();
  elements.chainValue.textContent = `${state.longestChain}x`;
  elements.movesValue.textContent = state.moves;
  elements.serenityFill.style.width = `${state.serenity}%`;
  elements.serenityLabel.textContent = `${Math.round(state.serenity)}%`;
}

function decrementWindTimer() {
  if (state.windTileIndex === null) return;
  state.windTimer -= 1;
  if (state.windTimer <= 0 || !state.board[state.windTileIndex]) {
    removeWindTile();
  }
}

function maybeSpawnWind() {
  if (state.movesUntilWind > 0) return;
  const filledIndices = state.board
    .map((tile, index) => (tile ? index : null))
    .filter((index) => index !== null);
  if (!filledIndices.length) return;
  const targetIndex = filledIndices[Math.floor(Math.random() * filledIndices.length)];
  state.windTileIndex = targetIndex;
  state.windTimer = randomBetween(6, 10);
  state.movesUntilWind = randomBetween(10, 15);
  if (state.board[targetIndex]) {
    state.board[targetIndex].wind = true;
  }
}

function removeWindTile() {
  if (state.windTileIndex !== null && state.board[state.windTileIndex]) {
    state.board[state.windTileIndex].wind = false;
  }
  state.windTileIndex = null;
  state.windTimer = 0;
}

function idxIsWind(index) {
  return index === state.windTileIndex;
}

function triggerZenBurst() {
  state.serenity = Math.max(0, state.serenity - SERENITY_BURST_THRESHOLD);
  const filledIndices = state.board
    .map((tile, index) => (tile ? index : null))
    .filter((index) => index !== null);
  if (!filledIndices.length) return;
  const target = filledIndices[Math.floor(Math.random() * filledIndices.length)];
  const tile = state.board[target];
  if (!tile) return;
  const nextTier = Math.min(tile.tier + 1, tierData.length - 1);
  state.board[target] = {
    ...tile,
    tier: nextTier,
    id: cryptoRandomId(),
  };
  spawnZenParticles(target);
}

function spawnZenParticles(index) {
  const cell = elements.board.children[index];
  cell.classList.add("merge");
  setTimeout(() => cell.classList.remove("merge"), 600);
}

function triggerGameOver() {
  state.gameOver = true;
  toggleOverlay(true);
}

function toggleOverlay(show) {
  elements.overlay.classList.toggle("hidden", !show);
}

function restartGame() {
  state.board = Array.from({ length: TILE_COUNT }, () => null);
  state.queue = [];
  state.holdTile = null;
  state.holdLocked = false;
  state.selectedQueueIndex = 0;
  state.score = 0;
  state.moves = 0;
  state.longestChain = 0;
  state.serenity = 0;
  state.history = [];
  state.gameOver = false;
  state.windTileIndex = null;
  state.windTimer = 0;
  state.movesUntilWind = randomBetween(10, 15);
  state.driftCountdown = randomBetween(6, 12);
  toggleOverlay(false);
  refillQueue();
  renderAll();
}

function indexToCoord(index) {
  const y = Math.floor(index / BOARD_SIZE);
  const x = index % BOARD_SIZE;
  return [x, y];
}

function coordToIndex(x, y) {
  return y * BOARD_SIZE + x;
}

function cryptoRandomId() {
  return Math.random().toString(36).slice(2, 9);
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
