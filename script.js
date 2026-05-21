const cardBook = {
  slash: {
    id: "slash",
    name: "斬撃",
    icon: "⚔️",
    className: "slash",
    text: "敵に6ダメージ",
    kind: "attack",
    damage: 6
  },
  heavy: {
    id: "heavy",
    name: "強打",
    icon: "💥",
    className: "heavy",
    text: "敵に10ダメージ",
    kind: "attack",
    damage: 10
  },
  guard: {
    id: "guard",
    name: "防御",
    icon: "🛡️",
    className: "guard",
    text: "次の敵攻撃を半分",
    kind: "guard"
  },
  heal: {
    id: "heal",
    name: "回復",
    icon: "✨",
    className: "heal",
    text: "HPを5回復",
    kind: "heal",
    heal: 5
  },
  focus: {
    id: "focus",
    name: "集中",
    icon: "⭐",
    className: "focus",
    text: "次の攻撃カードが2倍",
    kind: "focus"
  },
  flameSlash: {
    id: "flameSlash",
    name: "火炎斬り",
    icon: "🔥",
    className: "heavy",
    text: "敵に13ダメージ",
    kind: "attack",
    damage: 13
  },
  firstAid: {
    id: "firstAid",
    name: "応急手当",
    icon: "💚",
    className: "heal",
    text: "HPを8回復",
    kind: "heal",
    heal: 8
  },
  ironWall: {
    id: "ironWall",
    name: "鉄壁",
    icon: "🏰",
    className: "guard",
    text: "次の敵攻撃を半分 HP+2",
    kind: "guard",
    heal: 2
  },
  doubleSlash: {
    id: "doubleSlash",
    name: "連続斬り",
    icon: "⚔️",
    className: "slash",
    text: "敵に4ダメージを2回",
    kind: "attack",
    damage: 4,
    hits: 2
  },
  courage: {
    id: "courage",
    name: "勇気",
    icon: "🌟",
    className: "focus",
    text: "敵に5ダメージ HP3回復",
    kind: "attack",
    damage: 5,
    heal: 3
  }
};

const enemyList = [
  { name: "スライム", hp: 20, attack: 4, sprite: "🟢", spriteType: "emoji" },
  { name: "ゴブリン", hp: 28, attack: 5, spriteType: "goblin" },
  { name: "オーク", hp: 30, attack: 5, sprite: "👹", spriteType: "emoji" },
  { name: "ドラゴン", hp: 48, attack: 8, sprite: "🐲", spriteType: "emoji" }
];

const rewardPool = [
  "flameSlash",
  "firstAid",
  "ironWall",
  "doubleSlash",
  "courage",
  "slash",
  "heavy",
  "guard",
  "heal",
  "focus"
];

const strongRewardPool = [
  "flameSlash",
  "firstAid",
  "ironWall",
  "doubleSlash",
  "courage",
  "courage"
];

const enemyActions = {
  attack: {
    label: "攻撃",
    weight: 5,
    run(enemy) {
      return {
        damage: enemy.attack,
        message: `${enemy.name}の攻撃！ ${enemy.attack}ダメージ。`
      };
    }
  },
  strong: {
    label: "強攻撃",
    weight: 3,
    run(enemy) {
      const damage = Math.ceil(enemy.attack * 1.6);
      return {
        damage,
        message: `${enemy.name}の強攻撃！ ${damage}ダメージ。`
      };
    }
  },
  guard: {
    label: "防御",
    weight: 2,
    run(enemy) {
      enemy.guardReady = true;
      return {
        damage: 0,
        message: `${enemy.name}は身を守った！ 次に受けるダメージがへる。`
      };
    }
  },
  charge: {
    label: "ためる",
    weight: 2,
    run(enemy) {
      enemy.charged = true;
      return {
        damage: 0,
        message: `${enemy.name}は力をためた！ 次の攻撃が強くなる。`
      };
    }
  }
};

const initialDeck = [
  "slash", "slash", "slash", "slash",
  "heavy", "heavy", "heavy",
  "guard", "guard",
  "heal",
  "focus"
];

const state = {
  playerHp: 30,
  playerMaxHp: 30,
  deck: [...initialDeck],
  hand: [],
  reward: [],
  enemyIndex: 0,
  enemy: null,
  turn: "player",
  guardReady: false,
  focusReady: false,
  gameOver: false,
  gameStarted: false,
  messages: []
};

let audioContext = null;

const els = {
  turnBadge: document.getElementById("turnBadge"),
  stageBadge: document.getElementById("stageBadge"),
  deckCount: document.getElementById("deckCount"),
  playerHp: document.getElementById("playerHp"),
  playerHpBig: document.getElementById("playerHpBig"),
  playerMaxHp: document.getElementById("playerMaxHp"),
  playerMaxHpBig: document.getElementById("playerMaxHpBig"),
  playerBar: document.getElementById("playerBar"),
  playerEffect: document.getElementById("playerEffect"),
  enemyBox: document.getElementById("enemyBox"),
  enemyName: document.getElementById("enemyName"),
  enemyAttack: document.getElementById("enemyAttack"),
  enemyHp: document.getElementById("enemyHp"),
  enemyHpBig: document.getElementById("enemyHpBig"),
  enemyMaxHp: document.getElementById("enemyMaxHp"),
  enemyMaxHpBig: document.getElementById("enemyMaxHpBig"),
  enemyBar: document.getElementById("enemyBar"),
  enemySprite: document.getElementById("enemySprite"),
  enemyIntent: document.getElementById("enemyIntent"),
  enemyEffect: document.getElementById("enemyEffect"),
  hand: document.getElementById("hand"),
  logMessages: document.getElementById("logMessages"),
  restartButton: document.getElementById("restartButton"),
  centerPop: document.getElementById("centerPop"),
  popText: document.getElementById("popText"),
  rewardScreen: document.getElementById("rewardScreen"),
  rewardCards: document.getElementById("rewardCards"),
  startScreen: document.getElementById("startScreen"),
  startButton: document.getElementById("startButton")
};

function addMessage(text) {
  state.messages.unshift(text);
  state.messages = state.messages.slice(0, 5);
}

function randomDeckCard() {
  return state.deck[Math.floor(Math.random() * state.deck.length)];
}

function randomDeckCardExcluding(cardId) {
  const pool = state.deck.filter((id) => id !== cardId);
  const source = pool.length > 0 ? pool : state.deck;
  return source[Math.floor(Math.random() * source.length)];
}

function isAttackCard(cardId) {
  return cardBook[cardId]?.kind === "attack";
}

function isHealCard(cardId) {
  return cardBook[cardId]?.kind === "heal";
}

function randomAttackCard() {
  const attacks = state.deck.filter(isAttackCard);
  const attackPool = attacks.length > 0 ? attacks : ["slash", "heavy"];
  return attackPool[Math.floor(Math.random() * attackPool.length)];
}

function randomHealCard() {
  const heals = state.deck.filter(isHealCard);
  const healPool = heals.length > 0 ? heals : ["heal"];
  return healPool[Math.floor(Math.random() * healPool.length)];
}

function randomNonHealCard() {
  const nonHeals = state.deck.filter((id) => !isHealCard(id));
  const pool = nonHeals.length > 0 ? nonHeals : state.deck;
  return pool[Math.floor(Math.random() * pool.length)];
}

function randomFromPool(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

function drawHand() {
  state.hand = [randomDeckCard(), randomDeckCard(), randomDeckCard()];

  const healChance = healingCardChance();
  if (!state.hand.some(isHealCard) && Math.random() < healChance) {
    const index = Math.floor(Math.random() * state.hand.length);
    state.hand[index] = randomHealCard();
  }

  while (state.hand.filter(isHealCard).length > 1) {
    const firstHealIndex = state.hand.findIndex(isHealCard);
    const extraHealIndex = state.hand.findIndex((cardId, index) => index !== firstHealIndex && isHealCard(cardId));
    state.hand[extraHealIndex] = randomNonHealCard();
  }

  if (!state.hand.some(isAttackCard)) {
    const candidates = state.hand
      .map((cardId, index) => ({ cardId, index }))
      .filter(({ cardId }) => !isHealCard(cardId));
    const target = candidates.length > 0
      ? candidates[Math.floor(Math.random() * candidates.length)].index
      : Math.floor(Math.random() * state.hand.length);
    state.hand[target] = randomAttackCard();
  }
}

function healingCardChance() {
  const hpRate = state.playerHp / state.playerMaxHp;
  if (hpRate >= 0.7) return 0;
  if (hpRate >= 0.4) return 0.28;
  if (hpRate >= 0.2) return 0.58;
  return 0.86;
}

function ensureAudio() {
  if (!window.AudioContext && !window.webkitAudioContext) return null;
  if (!audioContext) {
    const AudioContextClass = window.AudioContext || window.webkitAudioContext;
    audioContext = new AudioContextClass();
  }
  if (audioContext.state === "suspended") {
    audioContext.resume();
  }
  return audioContext;
}

function playTone({ frequency, duration, type = "sine", volume = 0.08, delay = 0 }) {
  const ctx = ensureAudio();
  if (!ctx) return;

  const start = ctx.currentTime + delay;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, start);
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.exponentialRampToValueAtTime(volume, start + 0.015);
  gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(start);
  osc.stop(start + duration + 0.02);
}

function playSound(kind) {
  if (!state.gameStarted) return;

  if (kind === "attack") {
    playTone({ frequency: 190, duration: 0.08, type: "square", volume: 0.09 });
    playTone({ frequency: 90, duration: 0.06, type: "sawtooth", volume: 0.05, delay: 0.03 });
  }

  if (kind === "heal") {
    playTone({ frequency: 560, duration: 0.12, type: "sine", volume: 0.06 });
    playTone({ frequency: 740, duration: 0.14, type: "sine", volume: 0.06, delay: 0.08 });
    playTone({ frequency: 980, duration: 0.16, type: "sine", volume: 0.05, delay: 0.16 });
  }

  if (kind === "damage") {
    playTone({ frequency: 120, duration: 0.16, type: "sawtooth", volume: 0.08 });
    playTone({ frequency: 75, duration: 0.12, type: "triangle", volume: 0.06, delay: 0.08 });
  }

  if (kind === "victory") {
    playTone({ frequency: 523, duration: 0.11, type: "triangle", volume: 0.07 });
    playTone({ frequency: 659, duration: 0.11, type: "triangle", volume: 0.07, delay: 0.1 });
    playTone({ frequency: 784, duration: 0.18, type: "triangle", volume: 0.075, delay: 0.2 });
  }
}

function weightedEnemyAction() {
  const entries = Object.entries(enemyActions);
  const total = entries.reduce((sum, [, action]) => sum + action.weight, 0);
  let roll = Math.random() * total;

  for (const [id, action] of entries) {
    roll -= action.weight;
    if (roll <= 0) return id;
  }

  return "attack";
}

function chooseNextEnemyAction() {
  if (!state.enemy || state.enemy.hp <= 0) return;
  if (state.enemy.charged) {
    state.enemy.nextAction = Math.random() < 0.7 ? "strong" : "attack";
    return;
  }
  state.enemy.nextAction = weightedEnemyAction();
}

function createEnemy() {
  const base = enemyList[state.enemyIndex % enemyList.length];
  const lap = Math.floor(state.enemyIndex / enemyList.length);
  state.enemy = {
    name: base.name,
    maxHp: base.hp + lap * 12,
    hp: base.hp + lap * 12,
    attack: base.attack + lap * 2,
    sprite: base.sprite || "",
    spriteType: base.spriteType,
    guardReady: false,
    charged: false,
    nextAction: "attack"
  };
  chooseNextEnemyAction();
  els.enemyBox.classList.remove("enemy-defeated");
  addMessage(`${state.enemy.name}があらわれた！`);
}

function makeCardButton(cardId, onClick, disabled) {
  const card = cardBook[cardId];
  const button = document.createElement("button");
  button.type = "button";
  button.className = `card ${card.className}`;
  button.disabled = disabled;
  button.setAttribute("aria-label", `${card.name}。${card.text}`);
  button.innerHTML = `
    <span class="card-icon" aria-hidden="true">${card.icon}</span>
    <span class="card-name">${card.name}</span>
    <p class="card-desc">${card.text}</p>
  `;
  button.addEventListener("click", onClick);
  return button;
}

function applyEnemyGuard(damage) {
  if (!state.enemy.guardReady || damage <= 0) return damage;

  state.enemy.guardReady = false;
  const guardedDamage = Math.ceil(damage / 2);
  addMessage(`敵の防御でダメージが${guardedDamage}にへった！`);
  return guardedDamage;
}

function useCard(index) {
  if (state.turn !== "player" || state.gameOver) return;

  const card = cardBook[state.hand[index]];
  if (!card) return;

  if (card.kind === "attack") {
    const hits = card.hits || 1;
    let damage = card.damage * hits;
    if (state.focusReady) {
      damage *= 2;
      state.focusReady = false;
      addMessage(`集中の力で${card.name}が2倍！`);
    }
    damage = applyEnemyGuard(damage);
    state.enemy.hp = Math.max(0, state.enemy.hp - damage);
    addMessage(`${card.name}！ ${damage}ダメージ！`);
    playSound("attack");
  }

  if (card.kind === "guard") {
    state.guardReady = true;
    addMessage("防御！ 次の敵の攻撃ダメージを半分にする！");
  }

  if (card.kind === "heal") {
    healPlayer(card.heal, card.name);
  }

  if (card.kind === "focus") {
    state.focusReady = true;
    addMessage("集中！ 次の攻撃カードが2倍になる！");
  }

  if (card.kind !== "heal" && card.heal) {
    healPlayer(card.heal, card.name);
  }

  render();

  if (state.enemy.hp <= 0) {
    defeatEnemy();
    return;
  }

  state.turn = "enemy";
  render();
  window.setTimeout(enemyTurn, 700);
}

function enemyTurn() {
  if (state.gameOver || state.turn !== "enemy") return;

  const actionId = state.enemy.nextAction || "attack";
  const result = enemyActions[actionId].run(state.enemy);
  let damage = result.damage;

  if (state.enemy.charged && (actionId === "attack" || actionId === "strong")) {
    damage = Math.ceil(damage * 1.5);
    state.enemy.charged = false;
    addMessage(`${state.enemy.name}のためた力がのった！`);
  }

  if (damage > 0 && state.guardReady) {
    const reduced = Math.ceil(damage / 2);
    state.guardReady = false;
    addMessage(`防御が成功！ ダメージを${reduced}に半分へらした！`);
    damage = reduced;
  }

  if (damage > 0) {
    state.playerHp = Math.max(0, state.playerHp - damage);
    playSound("damage");
  }
  addMessage(result.message.replace(/\d+ダメージ。/, `${damage}ダメージ。`));

  if (state.playerHp <= 0) {
    state.gameOver = true;
    state.turn = "gameover";
    addMessage("勇者はたおれた... はじめから挑戦しよう！");
    render();
    return;
  }

  chooseNextEnemyAction();
  drawHand();
  state.turn = "player";
  addMessage("新しい手札になった！");
  render();
}

function healPlayer(amount, sourceName) {
  const before = state.playerHp;
  state.playerHp = Math.min(state.playerMaxHp, state.playerHp + amount);
  const healed = state.playerHp - before;
  if (healed > 0) {
    addMessage(`${sourceName}！ HPが${healed}もどった！`);
    playSound("heal");
  } else {
    addMessage(`${sourceName}！ HPは満タンだ！`);
  }
}

function defeatEnemy() {
  const defeatedName = state.enemy.name;
  state.turn = "defeat";
  els.enemyBox.classList.add("enemy-defeated");
  els.popText.textContent = `${defeatedName}を倒した！`;
  els.centerPop.classList.add("show");
  addMessage(`${defeatedName}を倒した！`);
  playSound("victory");
  render();

  window.setTimeout(() => {
    els.centerPop.classList.remove("show");
    showReward();
  }, 1200);
}

function showReward() {
  state.turn = "reward";
  const guaranteed = state.enemyIndex <= 1 ? randomFromPool(strongRewardPool) : randomFromPool(rewardPool);
  state.reward = [
    guaranteed,
    randomFromPool(rewardPool),
    Math.random() < 0.65 ? randomFromPool(strongRewardPool) : randomDeckCard()
  ];
  els.rewardScreen.classList.add("show");
  els.rewardScreen.setAttribute("aria-hidden", "false");
  renderReward();
  render();
}

function chooseReward(index) {
  const cardId = state.reward[index];
  if (!cardId) return;

  state.deck.push(cardId);
  addMessage(`${cardBook[cardId].name}をデッキに追加！`);
  els.rewardScreen.classList.remove("show");
  els.rewardScreen.setAttribute("aria-hidden", "true");

  state.enemyIndex += 1;
  state.guardReady = false;
  state.turn = "player";
  createEnemy();
  drawHand();
  render();
}

function renderReward() {
  els.rewardCards.innerHTML = "";
  state.reward.forEach((cardId, index) => {
    els.rewardCards.appendChild(makeCardButton(cardId, () => chooseReward(index), false));
  });
}

function renderHand() {
  els.hand.innerHTML = "";
  state.hand.forEach((cardId, index) => {
    const disabled = !state.gameStarted || state.turn !== "player" || state.gameOver;
    els.hand.appendChild(makeCardButton(cardId, () => useCard(index), disabled));
  });
}

function renderEnemySprite() {
  if (!state.enemy) return;

  if (state.enemy.spriteType === "goblin") {
    els.enemySprite.className = "sprite enemy-sprite goblin";
    els.enemySprite.innerHTML = `
      <span class="goblin-club"></span>
      <span class="goblin-ear left"></span>
      <span class="goblin-ear right"></span>
      <span class="goblin-body"></span>
      <span class="goblin-face"></span>
      <span class="goblin-eye left"></span>
      <span class="goblin-eye right"></span>
      <span class="goblin-mouth"></span>
      <span class="goblin-fang left"></span>
      <span class="goblin-fang right"></span>
    `;
    return;
  }

  els.enemySprite.className = "sprite enemy-sprite";
  els.enemySprite.textContent = state.enemy.sprite;
}

function render() {
  const playerPercent = Math.max(0, (state.playerHp / state.playerMaxHp) * 100);
  const enemyPercent = state.enemy ? Math.max(0, (state.enemy.hp / state.enemy.maxHp) * 100) : 0;

  els.turnBadge.textContent =
    state.turn === "player" ? "プレイヤーのターン" :
    state.turn === "enemy" ? "敵のターン" :
    state.turn === "reward" ? "報酬をえらぶ" :
    state.turn === "gameover" ? "ゲームオーバー" : "勝利！";
  els.stageBadge.textContent = `${state.enemyIndex + 1}体目`;
  els.deckCount.textContent = state.deck.length;

  els.playerHp.textContent = state.playerHp;
  els.playerHpBig.textContent = state.playerHp;
  els.playerMaxHp.textContent = state.playerMaxHp;
  els.playerMaxHpBig.textContent = state.playerMaxHp;
  els.playerBar.style.width = `${playerPercent}%`;
  els.playerEffect.textContent = [
    state.guardReady ? "防御中：次の敵攻撃が半分" : "",
    state.focusReady ? "集中中：次の攻撃が2倍" : ""
  ].filter(Boolean).join(" / ") || "カードを1枚えらぼう！";

  if (state.enemy) {
    els.enemyName.textContent = state.enemy.name;
    els.enemyAttack.textContent = state.enemy.attack;
    els.enemyHp.textContent = state.enemy.hp;
    els.enemyHpBig.textContent = state.enemy.hp;
    els.enemyMaxHp.textContent = state.enemy.maxHp;
    els.enemyMaxHpBig.textContent = state.enemy.maxHp;
    els.enemyBar.style.width = `${enemyPercent}%`;
    els.enemyIntent.textContent = `次の行動：${enemyActions[state.enemy.nextAction]?.label || "攻撃"}`;
    els.enemyEffect.textContent = state.enemy.guardReady ? "敵は守りを固めている！" : "行動予告を見てカードを選ぼう！";
    renderEnemySprite();
  }

  els.logMessages.innerHTML = state.messages
    .map((message) => `<p class="message">${message}</p>`)
    .join("");
  renderHand();
}

function restart() {
  state.playerHp = 30;
  state.playerMaxHp = 30;
  state.deck = [...initialDeck];
  state.hand = [];
  state.reward = [];
  state.enemyIndex = 0;
  state.turn = "player";
  state.guardReady = false;
  state.focusReady = false;
  state.gameOver = false;
  state.messages = [];
  els.centerPop.classList.remove("show");
  els.rewardScreen.classList.remove("show");
  els.rewardScreen.setAttribute("aria-hidden", "true");
  if (state.gameStarted) {
    els.startScreen.classList.add("hide");
  } else {
    els.startScreen.classList.remove("hide");
  }
  createEnemy();
  drawHand();
  render();
}

function startGame() {
  state.gameStarted = true;
  ensureAudio();
  els.startScreen.classList.add("hide");
  addMessage("ゲーム開始！ カードを選ぼう！");
  render();
}

els.startButton.addEventListener("click", startGame);
els.restartButton.addEventListener("click", restart);
restart();
