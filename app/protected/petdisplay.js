(function (global) {
  "use strict";

  const TYPE_EMOJI = {
    normal: "⚪️", fire: "🔥", water: "💧", grass: "🌿", electric: "⚡",
    ice: "❄️", fighting: "🥊", poison: "☠️", ground: "⛰️", flying: "🕊️",
    psychic: "🔮", bug: "🐛", rock: "🪨", ghost: "👻", dragon: "🐉",
    steel: "⚙️", dark: "🌑", fairy: "✨"
  };

  const MUTATION_META = {
    Frozen:     { emoji: "❄️", aura: "aura-pulse",   color: "#76c7ff" },
    Fiery:      { emoji: "🔥", aura: "aura-flicker", color: "#ff6b3d" },
    Golden:     { emoji: "🪙", aura: "aura-sparkle", color: "#ffd54f" },
    Shadow:     { emoji: "🌑", aura: "aura-wave",    color: "#5e5b8a" },
    Crystal:    { emoji: "💎", aura: "aura-sparkle", color: "#7fe3ff" },
    Toxic:      { emoji: "☣️", aura: "aura-pulse",   color: "#99e26b" },
    Glowing:    { emoji: "💡", aura: "aura-pulse",   color: "#f5ff7a" },
    Radiant:    { emoji: "✨", aura: "aura-sparkle", color: "#ffd54f" },
    Cursed:     { emoji: "🕯️", aura: "aura-wave",   color: "#a675ff" },
    Shocked:    { emoji: "⚡",  aura: "aura-flicker",color: "#ffe45e" },
    Ancient:    { emoji: "🏺", aura: "aura-pulse",   color: "#c9a36b" },
    Metallic:   { emoji: "⚙️", aura: "aura-spin",    color: "#b0bec5" },
    Obsidian:   { emoji: "🪨", aura: "aura-wave",    color: "#4a3f5c" },
    Lunar:      { emoji: "🌙", aura: "aura-pulse",   color: "#c3d8ff" },
    Solar:      { emoji: "☀️", aura: "aura-sparkle", color: "#ffcc66" },
    Stormy:     { emoji: "🌩️", aura: "aura-flicker",color: "#9ec3ff" },
    Void:       { emoji: "🕳️", aura: "aura-wave",    color: "#6b00b3" },
    Arcane:     { emoji: "🔮", aura: "aura-sparkle", color: "#c07bff" },
    Spiky:      { emoji: "🌵", aura: "aura-pulse",   color: "#88d06a" },
    Corrupted:  { emoji: "🧪", aura: "aura-flicker", color: "#b96eff" },
    Astral:     { emoji: "🌌", aura: "aura-sparkle", color: "#70b2ff" },
    Blighted:   { emoji: "🍂", aura: "aura-wave",    color: "#a8d65e" },
    Runic:      { emoji: "ᚠ",  aura: "aura-spin",    color: "#7dd3fc" },
    Chaotic:    { emoji: "🌀", aura: "aura-flicker", color: "#ff8fb1" },
    Enchanted:  { emoji: "🪄", aura: "aura-sparkle", color: "#b388ff" },
    Ghostly:    { emoji: "👻", aura: "aura-pulse",   color: "#b3e5fc" },
    Cutesy:     { emoji: "💖", aura: "aura-sparkle", color: "#ffa3d1" },
    Slimey:     { emoji: "🟢", aura: "aura-wave",    color: "#87e36e" },
    Grassy:     { emoji: "🌿", aura: "aura-pulse",   color: "#7dd37b" },
    Sigma:      { emoji: "Σ",  aura: "aura-spin",    color: "#8bc7ff" },
    Skibidi:    { emoji: "🧻", aura: "aura-flicker", color: "#ffc299" },
    Holy:       { emoji: "🕊️", aura: "aura-sparkle", color: "#fff2a8" },
    Shiny:      { emoji: "🌟", aura: "aura-sparkle", color: "#ffe06b" },
  };

  function capWords(str) { return String(str || "").replace(/\b\w/g, c => c.toUpperCase()); }
  function capFirst(str) { return str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : ""; }
  function normRarity(str = "") { return str.trim().toLowerCase().replace(/\s+/g, " "); }

  function inferMoveRarity(dmg) {
    if (typeof dmg !== "number" || isNaN(dmg)) return null;
    if (dmg > 135) return "legendary";
    if (dmg >= 101) return "awesome";
    if (dmg >= 81)  return "based";
    if (dmg >= 50)  return "average";
    if (dmg >= 1)   return "weak";
    return null;
  }

  function renderMutationsChips(muts = []) {
    const wrap = document.createElement("div");
    wrap.className = "mutations-wrap";
    muts.forEach(name => {
      const meta = MUTATION_META[name] || { emoji: "🧬", color: "#ccc" };
      const chip = document.createElement("span");
      chip.className = "mutation-chip";
      chip.style.borderColor = meta.color;
      chip.textContent = `${meta.emoji} ${name}`;
      wrap.appendChild(chip);
    });
    return wrap;
  }

  function buildAurasAround(imgEl, mutations = []) {
    const wrap = document.createElement("div");
    wrap.className = "sprite-wrap";
    (mutations || []).forEach((name) => {
      const meta = MUTATION_META[name];
      if (!meta) return;
      const aura = document.createElement("div");
      aura.className = "aura-base " + meta.aura;
      aura.style.setProperty("--aura-color-1", meta.color);
      aura.style.setProperty("--aura-color-2", meta.color);
      aura.style.setProperty("--aura-color-3", meta.color);
      wrap.appendChild(aura);
    });
    wrap.appendChild(imgEl);
    return wrap;
  }
  function render(containerEl, data, options = {}, callbacks = {}) {
    if (!containerEl) return;
    containerEl.innerHTML = "";

    const {
      showTitle = true,
      showMutations = true,
      showBars = { health: true, xp: true },
      showGridStats = true,
      showMoves = true,
      showReroll = false,
      availableRerolls = Number(data.available_rerolls || 0),
      showRerollCount = true,
      showRankUp = false,
    } = options;

    const { onReroll = null, onRankUp = null } = callbacks;

    const card = document.createElement("div");
    card.className = "pet-card";

    const remap = {
      "common": "common",
      "uncommon": "uncommon",
      "rare": "rare",
      "epic": "epic",
      "mythical": "mythical",
      "divine": "divine",
      "one and only": "legend",
      "the one and only": "legend"
    };
    const rarityCls = remap[normRarity(data.rarity)];
    if (rarityCls) card.classList.add(rarityCls);

    if (showTitle && data.name && String(data.name).trim().length > 0) {
      const title = document.createElement("h2");
      title.className = "pet-title";
      title.textContent = data.name;
      card.appendChild(title);
    }
    

    const img = document.createElement("img");
    img.src = data.sprite;
    img.alt = "Pet sprite";
    img.className = "pet-img";
    const sprite = buildAurasAround(img, Array.isArray(data.mutations) ? data.mutations : []);
    card.appendChild(sprite);

    if (showMutations) {
      const mutHeader = document.createElement("p");
      mutHeader.innerHTML = "<strong>Mutations:</strong>";
      card.appendChild(mutHeader);
      card.appendChild(renderMutationsChips(data.mutations || []));
    }

    const statsWrap = document.createElement("div");
    statsWrap.className = "stats";

    if (showBars && showBars.health) {
      const healthNow = Number(data.health ?? 0);
      const healthMax = Number(data.health_max ?? data.health ?? 0);
      const healthPct = healthMax > 0 ? Math.round((healthNow / healthMax) * 100) : 0;
      const healthGrowth = data.health_growth ?? 0;

      const statHealth = document.createElement("div");
      statHealth.className = "stat";
      statHealth.innerHTML = `<div class="stat-label">Health (+${healthGrowth}/level)</div>
        <div class="progress health">
          <div class="progress-fill" style="width:${Math.max(0, Math.min(100, healthPct))}%;">
            <span class="progress-text">${healthNow}/${healthMax}</span>
          </div>
        </div>`;
      statsWrap.appendChild(statHealth);
    }

    if (showBars && showBars.xp) {
      const xpNow = Number(data.xp ?? 0);
      const xpCap = Math.max(1, Number(data.xp_cap ?? 10));
      const xpPct = Math.round((xpNow / xpCap) * 100);

      const statXP = document.createElement("div");
      statXP.className = "stat";
      statXP.innerHTML = `<div class="stat-label">XP</div>
        <div class="progress xp">
          <div class="progress-fill" style="width:${Math.max(0, Math.min(100, xpPct))}%;">
            <span class="progress-text">${xpNow}/${xpCap}</span>
          </div>
        </div>`;
      statsWrap.appendChild(statXP);
    }

    if (statsWrap.children.length) {
      card.appendChild(statsWrap);
    }

    if (showGridStats) {
      const typeKey = (data.type || "").trim().toLowerCase();
      const typeEmoji = TYPE_EMOJI[typeKey] || "🔸";

      const grid = document.createElement("div");
      grid.className = "stat-grid";
      grid.innerHTML = `
        <div class="stat-item"><strong>Level:</strong> ${data.level}</div>
        <div class="stat-item"><strong>Rarity:</strong> ${data.rarity}</div>
        <div class="stat-item"><strong>Type:</strong> ${typeEmoji} ${capFirst(data.type || "")}</div>
        <div class="stat-item"><strong>Speed:</strong> ${data.speed}</div>
        <div class="stat-item"><strong>Attack:</strong> ${data.attack} (+${data.attack_growth}/level)</div>
        <div class="stat-item"><strong>Defense:</strong> ${data.defense} (+${data.defense_growth}/level)</div>
      `;
      card.appendChild(grid);
    }

    if (showMoves) {
      const header = document.createElement("div");
      header.className = "move-header";
      const left = document.createElement("p");
      left.innerHTML = "<strong>Moves:</strong>";
      const right = document.createElement("p");
      if (showReroll && showRerollCount) {
        right.textContent = "Rerolls available: " + availableRerolls;
      }
      header.appendChild(left);
      header.appendChild(right);
      card.appendChild(header);

      const list = document.createElement("ul");
      list.className = "move-list";

      for (let s = 1; s <= 4; s++) {
        const rawName = data["move" + s + "name"];
        if (!rawName) continue;
        const rawType = data["move" + s + "type"];
        const dmg = data["move" + s + "damage"];
        if (typeof dmg !== "number" || dmg <= 0) continue;

        const li = document.createElement("li");
        li.classList.add("move-chip");
        const rar = data["move" + s + "rarity"] || inferMoveRarity(dmg);
        if (rar === "weak") li.classList.add("rarity-weak");
        else if (rar === "average") li.classList.add("rarity-average");
        else if (rar === "based") li.classList.add("rarity-based");
        else if (rar === "awesome") li.classList.add("rarity-awesome");
        else if (rar === "legendary") li.classList.add("rarity-legendary");

        const nameCap = capWords(rawName);
        const typeCap = capFirst(rawType || "");
        const emoji = TYPE_EMOJI[(rawType || "").trim().toLowerCase()] || "🔸";

        const label = document.createElement("span");
        label.textContent = `${nameCap} (${emoji} ${typeCap}) - ${dmg} dmg`;
        li.appendChild(label);

        if (showReroll && availableRerolls > 0 && typeof onReroll === "function") {
          const btn = document.createElement("button");
          btn.textContent = "Reroll";
          btn.className = "inline-btn";
          btn.addEventListener("click", () => onReroll(s));
          li.appendChild(btn);
        }

        list.appendChild(li);
      }

      card.appendChild(list);
    }

    if (showRankUp && typeof onRankUp === "function" && data.rank_up_pending && data.rank_up_target) {
        const btn = document.createElement("button");
        btn.id = "pet-rankup";                 
        btn.textContent = `Rank Up (${data.rank_up_target})`;
        btn.addEventListener("click", onRankUp);
        sprite.insertAdjacentElement("afterend", btn);
    }
    containerEl.appendChild(card);
  }

  global.PetDisplay = { render, TYPE_EMOJI, MUTATION_META, inferMoveRarity };

})(window);
