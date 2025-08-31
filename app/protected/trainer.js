function joinOrNone(arr) {
  if (Array.isArray(arr) && arr.length > 0) return arr.join(", ");
  return "None";
}

function inferMoveRarity(dmg) {
  if (typeof dmg !== "number" || isNaN(dmg)) return null;
  if (dmg > 135) return "legendary";
  if (dmg >= 101) return "awesome";
  if (dmg >= 81)  return "based";
  if (dmg >= 50)  return "average";
  if (dmg >= 1)   return "weak";
  return null;
}

const MUTATION_META = {
  Frozen:     { emoji: "❄️", aura: "aura-pulse",   color: "#76c7ff" },
  Fiery:      { emoji: "🔥", aura: "aura-flicker", color: "#ff6b3d" },
  Golden:     { emoji: "🪙", aura: "aura-sparkle", color: "#ffd54f" },
  Shadow:     { emoji: "🌑", aura: "aura-wave",    color: "#5e5b8a" },
  Crystal:    { emoji: "💎", aura: "aura-sparkle", color: "#7fe3ff" },
  Toxic:      { emoji: "☣️", aura: "aura-pulse",   color: "#99e26b" },
  Glowing:    { emoji: "💡", aura: "aura-pulse",   color: "#f5ff7a" },
  Radiant:    { emoji: "✨", aura: "aura-sparkle", color: "#ffd54f" },
  Cursed:     { emoji: "🕯️", aura: "aura-wave",    color: "#a675ff" },
  Shocked:    { emoji: "⚡", aura: "aura-flicker", color: "#ffe45e" },
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
  Runic:      { emoji: "ᚠ", aura: "aura-spin",    color: "#7dd3fc" },
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

const TYPE_EMOJI = {
    normal:   "⚪️",
    fire:     "🔥",
    water:    "💧",
    grass:    "🌿",
    electric: "⚡",
    ice:      "❄️",
    fighting: "🥊",
    poison:   "☠️",
    ground:   "⛰️",
    flying:   "🕊️",
    psychic:  "🔮",
    bug:      "🐛",
    rock:     "🪨",
    ghost:    "👻",
    dragon:   "🐉",
    steel:    "⚙️",
    dark:     "🌑",
    fairy:    "✨"
  };

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

function mountPetSpriteWithAura(imgEl, mutations = []) {
  const seenColors = new Set();
  const colors = [];
  const effects = [];
  (mutations || []).forEach(name => {
    const meta = MUTATION_META[name];
    if (!meta) return;
    if (!seenColors.has(meta.color)) {
      seenColors.add(meta.color);
      colors.push(meta.color);
    }
    if (effects.length < 2 && meta.aura && !effects.includes(meta.aura)) {
      effects.push(meta.aura);
    }
  });

  const wrap = document.createElement("div");
  wrap.className = ["aura-base", ...effects].join(" ").trim();

  const c1 = colors[0] || "transparent";
  const c2 = colors[1] || colors[0] || "transparent";
  const c3 = colors[2] || colors[1] || colors[0] || "transparent";
  wrap.style.setProperty("--aura-color-1", c1);
  wrap.style.setProperty("--aura-color-2", c2);
  wrap.style.setProperty("--aura-color-3", c3);

  imgEl.classList.add("pet-sprite");
  wrap.appendChild(imgEl);
  return wrap;
}

function buildSpriteWithAuras(spriteUrl, mutations = []) {
  const wrapper = document.createElement("div");
  wrapper.className = "aura-base";

  const effects = new Set();
  const colors = [];
  mutations.forEach(m => {
    const meta = MUTATION_META[m];
    if (!meta) return;
    effects.add(meta.aura);
    colors.push(meta.color);
  });

  effects.forEach(cls => wrapper.classList.add(cls));

  if (colors[0]) wrapper.style.setProperty("--aura-color-1", colors[0]);
  if (colors[1]) wrapper.style.setProperty("--aura-color-2", colors[1]);
  if (colors[2]) wrapper.style.setProperty("--aura-color-3", colors[2]);

  const img = document.createElement("img");
  img.className = "pet-sprite";
  img.src = spriteUrl;
  img.alt = "Pet sprite";
  wrapper.appendChild(img);
  return wrapper;
}

function ensureRankUpButton(data) {
  const host = document.querySelector(".trainer-actions-inner");
  if (!host) return;

  let btn = document.getElementById("rankup");
  const shouldShow = !!(data.rank_up_pending && data.rank_up_target);

  if (!shouldShow) {
    if (btn) btn.style.display = "none";
    return;
  }

  if (!btn) {
    btn = document.createElement("button");
    btn.id = "rankup";
    btn.className = "btn";
    btn.style.marginBottom = "14px";
    btn.addEventListener("click", async () => {
      try {
        const res = await fetch("/rank-up", { method: "POST", credentials: "include" });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          alert(json.error || "Rank up failed");
          return;
        }
        displayPet(json);
      } catch (e) {
        console.error("Rank up failed:", e);
        alert("Rank up failed");
      }
    });
    host.prepend(btn);
  }

  btn.textContent = `RANK UP (${data.rank_up_target})`;
  btn.style.display = "block";
}

function displayPet(data) {
  const container = document.getElementById("pet-container");

  PetDisplay.render(
    container,
    data,
    {
      showTitle: true,
      showMutations: true,
      showBars: { health: true, xp: true },
      showGridStats: true,
      showMoves: true,
      showReroll: true,
      availableRerolls: Number(data.available_rerolls || 0),
      showRerollCount: true,
      showRankUp: true
    },
    {
      onReroll: (slot) => {
        fetch("/reroll-move", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot })
        })
          .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
          .then(updated => displayPet(updated))
          .catch(err => alert(err.error || "Reroll failed"));
      },
      onRankUp: () => {
        fetch("/rank-up", { method: "POST", credentials: "include" })
          .then(res => res.ok ? res.json() : res.json().then(e => Promise.reject(e)))
          .then(updated => displayPet(updated))
          .catch(err => alert(err.error || "Rank up failed"));
      }
    }
  );

  const pexp = Number(data.passive_exp ?? 0);
  const cap = 2500;
  const percent = Math.max(0, Math.min(100, Math.round((pexp / cap) * 100)));

  const claimBtn = document.getElementById("claimxp");
  if (claimBtn) claimBtn.textContent = "Claim Passive XP";

  const fill = document.getElementById("claimxp-fill");
  if (fill) fill.style.width = percent + "%";

  const label = document.getElementById("claimxp-label");
  if (label) label.textContent = `${pexp}/${cap}`;
}



function loadPet() {
  fetch("/my-pet", { credentials: "include" })
    .then(res => {
      if (res.status === 200) return res.json();
      if (res.status === 404) {
        const container = document.getElementById("pet-container");
        container.innerHTML = "<p style='text-align:center;'>No pet found.</p>";
        return null;
      }
    })
    .then(data => {
      if (data) displayPet(data);
    })
    .catch(err => {
      console.error("Failed to load pet", err);
    });
}

document.getElementById("levelup")?.addEventListener("click", function() {
  fetch("/levelup", { method: "POST", credentials: "include" })
    .then(function (res) {
      if (res.status === 404) {
        alert("No saved pet. Generate and Save first.");
        return null;
      }
      if (!res.ok) throw new Error("Failed to level up");
      return res.json();
    })
    .then(function (row) {
      if (row) displayPet(row);
    })
    .catch(function (err) {
      console.error("Level up failed:", err);
    });
});

document.getElementById("xpgain")?.addEventListener("click", function() {
  fetch("/gain-xp", { method: "POST", credentials: "include" })
    .then(res => {
      if (res.status === 404) {
        alert("No saved pet. Generate and Save first.");
        return null;
      }
      if (!res.ok) throw new Error("Failed to gain XP");
      return res.json();
    })
    .then(function (row) {
      if (row) displayPet(row);
    })
    .catch(function (err) {
      console.error("XP gain failed:", err);
    });
});

document.getElementById("claimxp")?.addEventListener("click", async () => {
  try {
    const res = await fetch("/train", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    if (res.status === 404) {
      alert("No saved pet. Generate and Save first.");
      return;
    }
    const json = await res.json();
    if (!res.ok) {
      alert(json.error || "Claim failed");
      return;
    }
    displayPet(json);
  } catch (e) {
    console.error("Claim failed:", e);
    alert("Claim failed");
  }
});



// REMOVE THIS WHEN FINALIZING
document.getElementById("levelup")?.addEventListener("click", function() {
  fetch("/levelup", { method: "POST", credentials: "include" })
    .then(function (res) {
      if (res.status === 404) {
        alert("No saved pet. Generate and Save first.");
        return null;
      }
      if (!res.ok) throw new Error("Failed to level up");
      return res.json();
    })
    .then(function (row) {
      if (row) displayPet(row);
    })
    .catch(function (err) {
      console.error("Level up failed:", err);
    });
});

function initializeAvatar() {
  fetch("/me", { credentials: "include" })
    .then(r => r.ok ? r.json() : null)
    .then(data => {
      const img = document.getElementById("avatar-img");
      const nameEl = document.getElementById("trainer-username");
      if (data?.avatar_url && img) {
        img.src = data.avatar_url + "?t=" + Date.now();
      }
      if (data?.username && nameEl) {
        nameEl.textContent = data.username;
      }
    })
    .catch(() => {});

  const form = document.getElementById("avatar-form");
  const fileInput = document.getElementById("avatar-file");
  if (!form || !fileInput) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!fileInput.files.length) return alert("Choose an image file first");

    const formData = new FormData();
    formData.append("avatar", fileInput.files[0]);

    const res = await fetch("/upload-avatar", {
      method: "POST",
      body: formData,
      credentials: "include",
    });

    const json = await res.json().catch(() => ({}));
    if (!res.ok) return alert(json.error || "Upload failed");

    const img = document.getElementById("avatar-img");
    if (img) img.src = json.avatar_url + "?t=" + Date.now();
  });
}

initializeAvatar();
loadPet();

setInterval(() => {
  fetch("/my-pet", { credentials: "include" })
    .then(r => r.ok ? r.json() : null)
    .then(data => { if (data) displayPet(data); })
    .catch(() => {});
}, 15000);

