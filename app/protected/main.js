let currentPet = null;
let GENERATE_COOLDOWN_MS = 2 * 60 * 1000; // 2 minutes

var generateBtn = document.getElementById("generate");
var saveBtn = document.getElementById("savepet");

var messageDiv = document.createElement("div");
messageDiv.style.textAlign = "center";
messageDiv.style.marginTop = "10px";
document.body.appendChild(messageDiv);

saveBtn.disabled = true;
let cooldownTimer = null;

var modalOverlay = document.createElement("div");
modalOverlay.style.position = "fixed";
modalOverlay.style.top = "0";
modalOverlay.style.left = "0";
modalOverlay.style.width = "100%";
modalOverlay.style.height = "100%";
modalOverlay.style.background = "rgba(0,0,0,0.5)";
modalOverlay.style.display = "none";
modalOverlay.style.justifyContent = "center";
modalOverlay.style.alignItems = "center";

var modalBox = document.createElement("div");
modalBox.style.background = "#fff";
modalBox.style.padding = "20px";
modalBox.style.borderRadius = "8px";
modalBox.style.minWidth = "300px";
modalBox.style.textAlign = "center";

var modalTitle = document.createElement("h3");
modalTitle.textContent = "Enter a name for your pet:";

var nameInput = document.createElement("input");
nameInput.type = "text";
nameInput.style.width = "90%";
nameInput.style.margin = "10px 0";

var modalButtons = document.createElement("div");

var modalSaveBtn = document.createElement("button");
modalSaveBtn.textContent = "Save";

var modalCancelBtn = document.createElement("button");
modalCancelBtn.textContent = "Cancel";
modalCancelBtn.style.marginLeft = "10px";

modalButtons.appendChild(modalSaveBtn);
modalButtons.appendChild(modalCancelBtn);

modalBox.appendChild(modalTitle);
modalBox.appendChild(nameInput);
modalBox.appendChild(modalButtons);
modalOverlay.appendChild(modalBox);
document.body.appendChild(modalOverlay);

function joinOrNone(arr) {
  if (Array.isArray(arr) && arr.length > 0) return arr.join(", ");
  return "None";
}

function inferMoveRarity(name, dmg) {
  var ln = typeof name === "string" ? name.toLowerCase() : "";
  var legendHints = [
    "hyper beam","explosion","roar of time","hydro cannon","v-create","eternabeam",
    "menacing moonraze","light that burns the sky","let's snuggle forever","pulverizing pancake",
    "self-destruct","catastropika","stoked sparksurfer","oceanic operetta","g-max fireball",
    "g-max hydrosnipe","clangorous soulblaze","searing sunraze smash","malicious moonsault",
    "soul-stealing 7-star strike","sinister arrow raid","splintered stormshards"
  ];
  for (var i = 0; i < legendHints.length; i++) {
    if (ln.indexOf(legendHints[i]) >= 0) return "legendary";
  }
  if (dmg >= 1 && dmg <= 49) return "weak";
  if (dmg >= 50 && dmg <= 80) return "average";
  if (dmg >= 81 && dmg <= 100) return "based";
  return "awesome";
}

function startCooldown(ms) {
  if (!generateBtn) return;
  let remaining = Math.max(0, Math.floor(ms / 1000)); 
  generateBtn.disabled = true;

  function tick() {
    const m = Math.floor(remaining / 60);
    const s = remaining % 60;
    generateBtn.textContent = `Generate (wait ${m}:${String(s).padStart(2, "0")})`;
    if (remaining <= 0) {
      clearInterval(cooldownTimer);
      cooldownTimer = null;
      generateBtn.disabled = false;
      generateBtn.textContent = "Generate Pet";
      return;
    }
    remaining -= 1;
  }

  tick();
  cooldownTimer = setInterval(tick, 1000);
}

function checkGenerateCooldownOnLoad() {
  fetch("/generate-cooldown", { credentials: "include" })
    .then(function (res) {
      if (!res.ok) throw new Error("status check failed");
      return res.json();
    })
    .then(function (j) {
      var ms = Number(j.remaining_ms) || 0;
      if (ms > 0) {
        messageDiv.textContent = "You must wait before generating again.";
        startCooldown(ms);
      } else {
        if (generateBtn) {
          generateBtn.disabled = false;
          generateBtn.textContent = "Generate Pet";
        }
      }
    })
    .catch(function () {
    });
}

function displayPet(data) {
  currentPet = data;
  saveBtn.disabled = false;

  var container = document.getElementById("pet-container");
  container.innerHTML = "";

  var petBox = document.createElement("div");
  petBox.style.border = "2px solid black";
  petBox.style.padding = "20px";
  petBox.style.width = "380px";
  petBox.style.backgroundColor = "#f9f9f9";
  petBox.style.borderRadius = "10px";
  petBox.style.textAlign = "left";

  var title = document.createElement("h2");
  title.textContent = data.name;
  title.style.textAlign = "center";

  var img = document.createElement("img");
  img.src = data.sprite;
  img.alt = "Pet sprite";
  img.style.display = "block";
  img.style.margin = "auto";

  petBox.appendChild(img);

  var lines = [
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

  var moveHeader = document.createElement("p");
  moveHeader.innerHTML = "<strong>Moves:</strong>";
  petBox.appendChild(moveHeader);

  var moveList = document.createElement("ul");
  moveList.style.paddingLeft = "18px";

  for (var s = 1; s <= 4; s++) {
    var name = data["move" + s + "name"];
    if (!name) continue;
    var type = data["move" + s + "type"];
    var dmg = data["move" + s + "damage"];
    var rar = data["move" + s + "rarity"] || inferMoveRarity(name, dmg);
    if (!rar) rar = inferMoveRarity(name, dmg);

    var li = document.createElement("li");
    li.classList.add("move-chip");
    if (rar === "weak") li.classList.add("rarity-weak");
    else if (rar === "average") li.classList.add("rarity-average");
    else if (rar === "based") li.classList.add("rarity-based");
    else if (rar === "awesome") li.classList.add("rarity-awesome");
    else if (rar === "legendary") li.classList.add("rarity-legendary");

    li.textContent = name + " (" + type + ") - " + dmg + " dmg";
    moveList.appendChild(li);
  }

  petBox.appendChild(moveList);
  container.appendChild(petBox);
}

if (generateBtn) {
  generateBtn.addEventListener("click", function () {
    messageDiv.textContent = "";
    fetch("/generate-pet", {
      method: "POST",
      credentials: "include"
    })
      .then(function (res) {
        if (res.status === 429) {
          return res.json().then(function (j) {
            const ms = Number(j.remaining_ms) || 0;
            messageDiv.textContent = "You must wait before generating again.";
            startCooldown(ms);
            throw new Error("On cooldown");
          });
        }
        if (!res.ok) throw new Error("Failed to generate pet");
        return res.json();
      })
      .then(function (data) {
        displayPet(data);
        startCooldown(GENERATE_COOLDOWN_MS);
      })
      .catch(function (err) {
        if (err && err.message === "On cooldown") return;
        console.error("Failed to generate pet", err);
      });
  });
}

if (saveBtn) {
  saveBtn.addEventListener("click", function () {
    if (!currentPet) {
      alert("You need to generate a pet first!");
      return;
    }
    nameInput.value = "";
    modalOverlay.style.display = "flex";
    nameInput.focus();
  });
}

modalSaveBtn.addEventListener("click", function () {
  var name = nameInput.value.trim();
  if (!name) {
    alert("Pet name cannot be empty.");
    return;
  }

  var petToSave = {};
  for (var k in currentPet) {
    if (Object.prototype.hasOwnProperty.call(currentPet, k)) {
      petToSave[k] = currentPet[k];
    }
  }
  petToSave.name = name;

  fetch("/save-pet", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(petToSave)
  })
    .then(function (res) {
      if (!res.ok) throw new Error("Failed to save pet");
      return res.json();
    })
    .then(function () {
      modalOverlay.style.display = "none";
      messageDiv.textContent = "Pet Saved Successfully!";
      var container = document.getElementById("pet-container");
      container.innerHTML = "";
      currentPet = null;
      saveBtn.disabled = true;
    })
    .catch(function (err) {
      console.error("Error saving pet:", err);
      alert("Failed to save pet.");
    });
});

modalCancelBtn.addEventListener("click", function () {
  modalOverlay.style.display = "none";
});

checkGenerateCooldownOnLoad();
