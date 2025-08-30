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

function displayPet(data) {
  const container = document.getElementById("pet-container");
  container.innerHTML = '';

  const petBox = document.createElement("div");
  petBox.style.border = "2px solid black";
  petBox.style.padding = "20px";
  petBox.style.width = "420px";
  petBox.style.backgroundColor = "#f9f9f9";
  petBox.style.borderRadius = "10px";
  petBox.style.textAlign = "left";

  const title = document.createElement("h2");
  title.textContent = data.name;
  title.style.textAlign = "center";

  const img = document.createElement("img");
  img.src = data.sprite;
  img.alt = "Pet sprite";
  img.style.display = "block";
  img.style.margin = "auto";

  const wrap = document.createElement("div");
  wrap.className = "sprite-wrap";

  const muts = Array.isArray(data.mutations) ? data.mutations : [];
  muts.forEach((name) => {
    const meta = MUTATION_META[name];
    if (!meta) return;
    const aura = document.createElement("div");
    aura.className = "aura-base " + meta.aura;
    aura.style.setProperty("--aura-color-1", meta.color);
    aura.style.setProperty("--aura-color-2", meta.color);
    aura.style.setProperty("--aura-color-3", meta.color);
    wrap.appendChild(aura);
  });

  wrap.appendChild(img);

  petBox.appendChild(title);
  petBox.appendChild(wrap);

  const mutHeader = document.createElement("p");
  mutHeader.innerHTML = "<strong>Mutations:</strong>";
  petBox.appendChild(mutHeader);
  petBox.appendChild(renderMutationsChips(data.mutations || []));

  const lines = [
    ["Rarity", data.rarity],
    ["Type", data.type],
    ["Speed", data.speed],
    ["Level", data.level],
    ["XP", `${data.xp ?? 0} / ${data.xp_cap ?? 10}`],
    ["Health", String(data.health) + " (+" + data.health_growth + "/level)"],
    ["Attack", String(data.attack) + " (+" + data.attack_growth + "/level)"],
    ["Defense", String(data.defense) + " (+" + data.defense_growth + "/level)"]
  ];

  for (var i = 0; i < lines.length; i++) {
    var p = document.createElement("p");
    p.innerHTML = "<strong>" + lines[i][0] + ":</strong> " + lines[i][1];
    petBox.appendChild(p);
  }

  const moveHeader = document.createElement("div");
  moveHeader.style.display = "flex";
  moveHeader.style.justifyContent = "space-between";
  moveHeader.style.alignItems = "center";
  const mhLeft = document.createElement("p");
  mhLeft.innerHTML = "<strong>Moves:</strong>";
  const mhRight = document.createElement("p");
  const rerollsAvail = Number(data.available_rerolls || 0);
  mhRight.textContent = "Rerolls available: " + rerollsAvail;
  moveHeader.appendChild(mhLeft);
  moveHeader.appendChild(mhRight);
  petBox.appendChild(moveHeader);

  const moveList = document.createElement("ul");
  moveList.style.paddingLeft = "18px";

  for (let s = 1; s <= 4; s++) {
    const name = data["move" + s + "name"];
    if (!name) continue;
    const type = data["move" + s + "type"];
    const dmg  = data["move" + s + "damage"];
    if (typeof dmg !== "number" || dmg <= 0) continue;

    let rar = data["move" + s + "rarity"] || inferMoveRarity(dmg);
    if (!rar) rar = inferMoveRarity(dmg);

    const li = document.createElement("li");
    li.classList.add("move-chip");
    if (rar === "weak") li.classList.add("rarity-weak");
    else if (rar === "average") li.classList.add("rarity-average");
    else if (rar === "based") li.classList.add("rarity-based");
    else if (rar === "awesome") li.classList.add("rarity-awesome");
    else if (rar === "legendary") li.classList.add("rarity-legendary");

    const label = document.createElement("span");
    label.textContent = name + " (" + type + ") - " + dmg + " dmg";
    li.appendChild(label);

    if (rerollsAvail > 0) {
      const btn = document.createElement("button");
      btn.textContent = "Reroll";
      btn.style.marginLeft = "8px";
      btn.addEventListener("click", () => {
        fetch("/reroll-move", {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ slot: s })
        })
          .then(res => {
            if (!res.ok) return res.json().then(e => { throw new Error(e.error || "Reroll failed"); });
            return res.json();
          })
          .then(updated => {
            displayPet(updated);
          })
          .catch(err => {
            alert(err.message || "Reroll failed");
            console.error(err);
          });
      });
      li.appendChild(btn);
    }

    moveList.appendChild(li);
  }

  petBox.appendChild(moveList);
  container.appendChild(petBox);

  const claimBtn = document.getElementById("claimxp");
  if (claimBtn) {
    const pexp = Number(data.passive_exp ?? 0);
    claimBtn.innerHTML = `Claim Passive XP<br><small>${pexp}/2500</small>`;
  }
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

