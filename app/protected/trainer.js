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

  petBox.appendChild(title);
  petBox.appendChild(img);

  const lines = [
    ["Rarity", data.rarity],
    ["Type", data.type],
    ["Speed", data.speed],
    ["Mutations", joinOrNone(data.mutations)],
    ["Level", data.level],
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

document.getElementById("level20")?.addEventListener("click", function() {
  fetch("/test/levelup20", { method: "POST", credentials: "include" })
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

loadPet();