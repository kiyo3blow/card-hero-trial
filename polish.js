enemyList[0].spriteType = "slime";
enemyList[2].spriteType = "orc";
enemyList[3].spriteType = "dragon";

function renderEnemySprite() {
  if (!state.enemy) return;

  const spriteTemplates = {
    slime: `
      <span class="slime-body"></span>
      <span class="slime-shine"></span>
      <span class="eye left"></span>
      <span class="eye right"></span>
      <span class="ground-shadow"></span>
    `,
    goblin: `
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
      <span class="ground-shadow"></span>
    `,
    orc: `
      <span class="orc-axe"></span>
      <span class="orc-ear left"></span>
      <span class="orc-ear right"></span>
      <span class="orc-body"></span>
      <span class="orc-head"></span>
      <span class="orc-brow left"></span>
      <span class="orc-brow right"></span>
      <span class="eye left"></span>
      <span class="eye right"></span>
      <span class="orc-tusk left"></span>
      <span class="orc-tusk right"></span>
      <span class="ground-shadow"></span>
    `,
    dragon: `
      <span class="dragon-wing left"></span>
      <span class="dragon-wing right"></span>
      <span class="dragon-tail"></span>
      <span class="dragon-body"></span>
      <span class="dragon-head"></span>
      <span class="dragon-horn left"></span>
      <span class="dragon-horn right"></span>
      <span class="dragon-eye left"></span>
      <span class="dragon-eye right"></span>
      <span class="ground-shadow"></span>
    `
  };

  const spriteType = state.enemy.spriteType || "slime";
  els.enemySprite.className = `sprite enemy-sprite ${spriteType}`;
  els.enemySprite.innerHTML = spriteTemplates[spriteType] || spriteTemplates.slime;
}

if (state.enemy && state.enemy.name === "スライム") {
  state.enemy.spriteType = "slime";
}

render();
