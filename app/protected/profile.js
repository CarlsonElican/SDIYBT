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
  if (typeof dmg !== "number") return "weak";
  if (dmg >= 1 && dmg <= 49) return "weak";
  if (dmg >= 50 && dmg <= 80) return "average";
  if (dmg >= 81 && dmg <= 100) return "based";
  return "awesome";
}

function displayPet(data) {
  const container = document.getElementById("pet-container");
  container.innerHTML = '';

  const petBox = document.createElement("div");
  petBox.style.border = "2px solid black";
  petBox.style.padding = "20px";
  petBox.style.width = "350px";
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

  var moveHeader = document.createElement("p");
  moveHeader.innerHTML = "<strong>Moves:</strong>";
  petBox.appendChild(moveHeader);

  const moveList = document.createElement("ul");
  moveList.style.paddingLeft = "18px";

  for (var s = 1; s <= 4; s++) {
    var name = data["move" + s + "name"];
    if (!name) continue;
    var type = data["move" + s + "type"];
    var dmg = data["move" + s + "damage"];
    var rar = data["move" + s + "rarity"];
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
