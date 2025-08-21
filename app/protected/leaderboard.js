
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

function renderProfileToContainer(pet, container) {
container.innerHTML = "";

const title = document.createElement("h3");
title.style.textAlign = "center";
title.textContent = `${pet.name} — ${pet.username || ""}`;
container.appendChild(title);

const img = document.createElement("img");
img.src = pet.sprite;
img.alt = "Pet sprite";
img.style.display = "block";
img.style.margin = "12px auto";
container.appendChild(img);

const rows = [
    ["Rarity", pet.rarity],
    ["Type", pet.type],
    ["Speed", pet.speed],
    ["Mutations", joinOrNone(pet.mutations)],
    ["Level", pet.level],
    ["XP", `${pet.xp ?? 0} / ${pet.xp_cap ?? 10}`],
    ["Health", `${pet.health} (+${pet.health_growth}/level)`],
    ["Attack", `${pet.attack} (+${pet.attack_growth}/level)`],
    ["Defense", `${pet.defense} (+${pet.defense_growth}/level)`],
    ["Rerolls available", `${pet.available_rerolls ?? 0}`],
];

rows.forEach(([k, v]) => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${k}:</strong> ${v}`;
    container.appendChild(p);
});

const movesHeader = document.createElement("p");
movesHeader.innerHTML = "<strong>Moves:</strong>";
container.appendChild(movesHeader);

const ul = document.createElement("ul");
ul.style.paddingLeft = "18px";

for (let s = 1; s <= 4; s++) {
    const name = pet[`move${s}name`];
    if (!name) continue;
    const type = pet[`move${s}type`];
    const dmg  = pet[`move${s}damage`];
    if (typeof dmg !== "number" || dmg <= 0) continue;

    let rar = pet[`move${s}rarity`] || rarityFromDmg(dmg);

    const li = document.createElement("li");
    li.classList.add("move-chip");
    if (rar === "weak") li.classList.add("rarity-weak");
    else if (rar === "average") li.classList.add("rarity-average");
    else if (rar === "based") li.classList.add("rarity-based");
    else if (rar === "awesome") li.classList.add("rarity-awesome");
    else if (rar === "legendary") li.classList.add("rarity-legendary");

    li.textContent = `${name} (${type}) - ${dmg} dmg`;
    ul.appendChild(li);
}

container.appendChild(ul);
}

function openProfileModal(pet) {
const overlay = qs("#profile-modal");
const content = qs("#profile-content");
const closeBtn = qs("#profile-close");
if (!overlay || !content) return;

renderProfileToContainer(pet, content);
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
    lvlBtn.textContent = "Level" + (sortKey === "level" ? (sortDir === "asc" ? " ↑" : " ↓") : "");
    lvlBtn.addEventListener("click", () => toggleSort("level"));
    thLevel.appendChild(lvlBtn);
    tr.appendChild(thLevel);

    const thRarity = document.createElement("th");
    const rarBtn = document.createElement("button");
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
    const link = document.createElement("a");
    link.href = "#";
    link.textContent = username;
    link.addEventListener("click", (e) => {
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
    tdUser.appendChild(link);
    tr.appendChild(tdUser);

    const tdPet = document.createElement("td");
    tdPet.textContent = petName;
    tr.appendChild(tdPet);

    const tdLvl = document.createElement("td");
    tdLvl.textContent = String(level);
    tr.appendChild(tdLvl);

    const tdRarity = document.createElement("td");
    tdRarity.textContent = String(rarity);
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
