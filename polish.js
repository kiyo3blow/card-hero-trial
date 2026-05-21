enemyList[0].spriteType = "slime";
enemyList[2].spriteType = "orc";
enemyList[3].spriteType = "dragon";

function renderEnemySprite() {
  if (!state.enemy) return;

  const spriteType = state.enemy.spriteType || "slime";
  els.enemySprite.className = `sprite enemy-sprite ${spriteType}`;
  els.enemySprite.innerHTML = `
    <img class="monster-art" src="assets/monsters/${spriteType}.png" alt="">
    <span class="ground-shadow"></span>
  `;
}

if (state.enemy && state.enemy.name === "スライム") {
  state.enemy.spriteType = "slime";
}

render();
