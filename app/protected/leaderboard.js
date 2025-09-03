
function qs(sel) { return document.querySelector(sel); }
function qsa(sel) { return Array.from(document.querySelectorAll(sel)); }

function joinOrNone(arr) {
return Array.isArray(arr) && arr.length ? arr.join(", ") : "None";
}

function rarityFromDmg(dmg) {
if (typeof dmg !== "number" || isNaN(dmg) || dmg <= 0) return null;
if (dmg > 135) return "legendary";
if (dmg >= 101) return "awesome";
if (dmg >= 81)  return "based";
if (dmg >= 50)  return "average";
if (dmg >= 1)   return "weak";
return null;
}

const RARITY_ORDER = [
"Common", "Uncommon", "Rare", "Epic", "Mythical", "Divine", "The One and Only"
];
const rarityRank = (r) => {
if (!r) return -1;
const i = RARITY_ORDER.findIndex(x => x.toLowerCase() === String(r).toLowerCase());
return i === -1 ? 999 : i;
};

function rarityClassName(r) {
  const key = String(r || "").toLowerCase().replace(/[^a-z]/g, "");
  const map = {
    common: "r-common",
    uncommon: "r-uncommon",
    rare: "r-rare",
    epic: "r-epic",
    mythical: "r-mythical",
    divine: "r-divine",
    theoneandonly: "r-legend", 
    legend: "r-legend",
    legendary: "r-legend",
  };
  return map[key] || "";
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (m) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[m]));
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


function renderProfileToContainer(pet, container) {
  if (!container) return;
  container.innerHTML = "";
  if (!window.PetDisplay || typeof PetDisplay.render !== "function") return;

  PetDisplay.render(
    container,
    pet,
    {
      showTitle: true,
      showMutations: true,
      showBars: { health: true, xp: true },
      showGridStats: true,
      showMoves: true,
      showReroll: false,
      showRerollCount: false,
      showRankUp: false
    }
  );
}

function openProfileModal(pet) {
  const overlay = qs("#profile-modal");
  const content = qs("#profile-content");
  const closeBtn = qs("#profile-close");
  if (!overlay || !content) return;

  renderProfileToContainer(pet, content);

  if (closeBtn) {
    closeBtn.classList.remove("modal-btn");
    closeBtn.classList.add("btn", "modal-close-btn");
  }

  overlay.style.display = "flex";

  const close = () => { overlay.style.display = "none"; };
  closeBtn?.addEventListener("click", close, { once: true });
  overlay.addEventListener("click", (e) => {
    if (e.target === overlay) close();
  }, { once: true });
}

async function fetchLeaderboard() {
const res = await fetch("/api/leaderboard", { credentials: "include" });
if (res.status === 401) {
    window.location.href = "/login.html";
    return [];
}
if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Failed to fetch leaderboard");
}
const data = await res.json();
if (!Array.isArray(data)) throw new Error("Unexpected leaderboard payload");
return data;
}

let rowsState = [];
let sortKey = null;     
let sortDir = "desc";   

function applySort(rows) {
if (!sortKey) return rows.slice();
const out = rows.slice();
if (sortKey === "level") {
    out.sort((a, b) => {
    const va = Number(a.level || 0);
    const vb = Number(b.level || 0);
    return sortDir === "asc" ? va - vb : vb - va;
    });
} else if (sortKey === "rarity") {
    out.sort((a, b) => {
    const va = rarityRank(a.rarity);
    const vb = rarityRank(b.rarity);
    return sortDir === "asc" ? va - vb : vb - va;
    });
}
return out;
}

function toggleSort(key) {
if (sortKey === key) {
    sortDir = (sortDir === "asc") ? "desc" : "asc";
} else {
    sortKey = key;
    sortDir = "desc";
}
renderLeaderboard(rowsState);
}

function renderLeaderboard(rows) {
const table = qs("#lb-table");
const tbody = qs("#lb-body");
if (!table || !tbody) return;


const thead = table.querySelector("thead");
if (thead) {
    thead.innerHTML = "";
    const tr = document.createElement("tr");

    const thProfile = document.createElement("th");
    thProfile.textContent = "Profile";
    tr.appendChild(thProfile);

    const thUser = document.createElement("th");
    thUser.textContent = "User";
    tr.appendChild(thUser);

    const thPet = document.createElement("th");
    thPet.textContent = "Pet Name";
    tr.appendChild(thPet);

    const thLevel = document.createElement("th");
    const lvlBtn = document.createElement("button");
    lvlBtn.className = "btn lb-sort-btn";
    lvlBtn.textContent = "Level" + (sortKey === "level" ? (sortDir === "asc" ? " ↑" : " ↓") : "");
    lvlBtn.addEventListener("click", () => toggleSort("level"));
    thLevel.appendChild(lvlBtn);
    tr.appendChild(thLevel);

    const thRarity = document.createElement("th");
    const rarBtn = document.createElement("button");
    rarBtn.className = "btn lb-sort-btn";
    rarBtn.textContent = "Rarity" + (sortKey === "rarity" ? (sortDir === "asc" ? " ↑" : " ↓") : "");
    rarBtn.addEventListener("click", () => toggleSort("rarity"));
    thRarity.appendChild(rarBtn);
    tr.appendChild(thRarity);

    thead.appendChild(tr);
}

const sorted = applySort(rows);

tbody.innerHTML = "";
sorted.forEach(row => {
  const tr = document.createElement("tr");

  const username = row.username || row.user || "";
  const petName  = row.name || row.pet_name || "(unnamed)";
  const level    = row.level ?? "";
  const rarity   = row.rarity || "";

  const tdProfile = document.createElement("td");
  const img = document.createElement("img");
  img.src = row.avatar_url || "/uploads/catstare.png";
  img.alt = `${username}'s avatar`;
  img.style.width = "36px";
  img.style.height = "36px";
  img.style.objectFit = "cover";
  img.style.borderRadius = "50%";
  tdProfile.appendChild(img);
  tr.appendChild(tdProfile);

  const tdUser = document.createElement("td");
  tdUser.textContent = username;
  tr.appendChild(tdUser);

  const tdPet = document.createElement("td");
  const petLink = document.createElement("a");
  petLink.href = "#";
  petLink.textContent = petName;
  petLink.addEventListener("click", (e) => {
    e.preventDefault();
    if (!username) return;
    fetch(`/pet/${encodeURIComponent(username)}`, { credentials: "include" })
      .then(res => {
        if (!res.ok) return res.json().then(e => { throw new Error(e.error || "Failed to get profile"); });
        return res.json();
      })
      .then(pet => openProfileModal(pet))
      .catch(err => {
        alert(err.message || "Failed to get profile");
        console.error(err);
      });
  });
  tdPet.appendChild(petLink);
  tr.appendChild(tdPet);

  const tdLvl = document.createElement("td");
  tdLvl.textContent = String(level);
  tr.appendChild(tdLvl);

  const tdRarity = document.createElement("td");
  tdRarity.innerHTML = `<span class="rarity-text ${rarityClassName(rarity)}">${escapeHtml(rarity)}</span>`;
  tr.appendChild(tdRarity);


  tbody.appendChild(tr);
});
}

document.addEventListener("DOMContentLoaded", async () => {
try {
    rowsState = await fetchLeaderboard();
    renderLeaderboard(rowsState);
} catch (e) {
    console.error(e);
    const tbody = qs("#lb-body");
    if (tbody) {
    const tr = document.createElement("tr");
    const td = document.createElement("td");
    td.colSpan = 4;
    td.textContent = "Failed to load leaderboard.";
    tr.appendChild(td);
    tbody.appendChild(tr);
    }
}
});
