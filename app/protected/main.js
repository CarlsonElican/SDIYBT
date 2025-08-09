let currentPet = null;

const generateBtn = document.getElementById("generate");
const saveBtn = document.getElementById("savepet");

const messageDiv = document.createElement("div");
messageDiv.style.textAlign = "center";
messageDiv.style.marginTop = "10px";
document.body.appendChild(messageDiv);

saveBtn.disabled = true;

const modalOverlay = document.createElement("div");
modalOverlay.style.position = "fixed";
modalOverlay.style.top = "0";
modalOverlay.style.left = "0";
modalOverlay.style.width = "100%";
modalOverlay.style.height = "100%";
modalOverlay.style.background = "rgba(0,0,0,0.5)";
modalOverlay.style.display = "none";
modalOverlay.style.justifyContent = "center";
modalOverlay.style.alignItems = "center";

const modalBox = document.createElement("div");
modalBox.style.background = "#fff";
modalBox.style.padding = "20px";
modalBox.style.borderRadius = "8px";
modalBox.style.minWidth = "300px";
modalBox.style.textAlign = "center";

const modalTitle = document.createElement("h3");
modalTitle.textContent = "Enter a name for your pet:";

const nameInput = document.createElement("input");
nameInput.type = "text";
nameInput.style.width = "90%";
nameInput.style.margin = "10px 0";

const modalButtons = document.createElement("div");

const modalSaveBtn = document.createElement("button");
modalSaveBtn.textContent = "Save";

const modalCancelBtn = document.createElement("button");
modalCancelBtn.textContent = "Cancel";
modalCancelBtn.style.marginLeft = "10px";

modalButtons.appendChild(modalSaveBtn);
modalButtons.appendChild(modalCancelBtn);

modalBox.appendChild(modalTitle);
modalBox.appendChild(nameInput);
modalBox.appendChild(modalButtons);
modalOverlay.appendChild(modalBox);
document.body.appendChild(modalOverlay);

function displayPet(data) {
  currentPet = data;
  saveBtn.disabled = false;
  const container = document.getElementById("pet-container");
  container.innerHTML = '';

  const petBox = document.createElement("div");
  petBox.style.border = "2px solid black";
  petBox.style.padding = "20px";
  petBox.style.width = "350px";
  petBox.style.backgroundColor = "#f9f9f9";
  petBox.style.borderRadius = "10px";
  petBox.style.textAlign = "left";

  const img = document.createElement("img");
  img.src = data.sprite;
  img.alt = "Pet sprite";
  img.style.display = "block";
  img.style.margin = "auto";
  petBox.appendChild(img);

  const lines = [
    ["Rarity", data.rarity],
    ["Type", data.type],
    ["Speed", data.speed],
    ["Mutations", data.mutations?.length > 0 ? data.mutations.join(", ") : "None"],
    ["Level", data.level],
    ["Health", `${data.health} (+${data.health_growth}/level)`],
    ["Attack", `${data.attack} (+${data.attack_growth}/level)`],
    ["Defense", `${data.defense} (+${data.defense_growth}/level)`],
  ];

  lines.forEach(([label, value]) => {
    const p = document.createElement("p");
    p.innerHTML = `<strong>${label}:</strong> ${value}`;
    petBox.appendChild(p);
  });

  const moveHeader = document.createElement("p");
  moveHeader.innerHTML = "<strong>Moves:</strong>";
  petBox.appendChild(moveHeader);

  const moveList = document.createElement("ul");
  for (let i = 1; i <= 4; i++) {
    const li = document.createElement("li");
    li.textContent = `${data[`move${i}name`]} (${data[`move${i}type`]}) - ${data[`move${i}damage`]} dmg`;
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
      .then(res => {
        if (!res.ok) throw new Error("Failed to generate pet");
        return res.json();
      })
      .then(data => {
        displayPet(data);
      })
      .catch(err => {
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
  const name = nameInput.value.trim();
  if (!name) {
    alert("Pet name cannot be empty.");
    return;
  }

  const petToSave = { ...currentPet, name };

  fetch("/save-pet", {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(petToSave)
  })
    .then(res => {
      if (!res.ok) throw new Error("Failed to save pet");
      return res.json();
    })
    .then(() => {
      modalOverlay.style.display = "none";
      messageDiv.textContent = "Pet Saved Successfully!";
      const container = document.getElementById("pet-container");
      container.innerHTML = "";
      currentPet = null;
      saveBtn.disabled = true;
    })
    .catch(err => {
      console.error("Error saving pet:", err);
      alert("Failed to save pet.");
    });
});

modalCancelBtn.addEventListener("click", function () {
  modalOverlay.style.display = "none";
});
