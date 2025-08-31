let currentPet = null;
let GENERATE_COOLDOWN_MS = 2 * 60 * 1000;

const generateBtn = document.getElementById("generate");
const saveBtn = document.getElementById("savepet");

const messageDiv = document.createElement("div");
messageDiv.id = "message";
document.body.appendChild(messageDiv);

saveBtn.classList.add("hidden"); 
let cooldownTimer = null;

const modalOverlay = document.createElement("div");
modalOverlay.className = "modal-overlay";

const modalBox = document.createElement("div");
modalBox.className = "modal-box";

const modalTitle = document.createElement("h3");
modalTitle.className = "modal-title";
modalTitle.textContent = "Enter a name for your pet:";

const nameInput = document.createElement("input");
nameInput.type = "text";
nameInput.className = "input";

const modalButtons = document.createElement("div");
modalButtons.className = "modal-actions";

const modalSaveBtn = document.createElement("button");
modalSaveBtn.textContent = "Save";
modalSaveBtn.className = "modal-btn";

const modalCancelBtn = document.createElement("button");
modalCancelBtn.textContent = "Cancel";
modalCancelBtn.className = "modal-btn modal-btn-secondary";

modalButtons.appendChild(modalCancelBtn);
modalButtons.appendChild(modalSaveBtn);
modalBox.appendChild(modalTitle);
modalBox.appendChild(nameInput);
modalBox.appendChild(modalButtons);
modalOverlay.appendChild(modalBox);
document.body.appendChild(modalOverlay);

function openNameModal() {
  modalOverlay.classList.add("is-open");
  nameInput.value = "";
  nameInput.focus();
}
function closeNameModal() {
  modalOverlay.classList.remove("is-open");
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
      generateBtn.classList.remove("hidden"); 
      return;
    }
    remaining -= 1;
  }

  tick();
  cooldownTimer = setInterval(tick, 1000);
}

function checkGenerateCooldownOnLoad() {
  fetch("/generate-cooldown", { credentials: "include" })
    .then(res => { if (!res.ok) throw new Error("status check failed"); return res.json(); })
    .then(j => {
      const ms = Number(j.remaining_ms) || 0;
      if (ms > 0) {
        messageDiv.textContent = "You must wait before generating again.";
        startCooldown(ms);
      } else if (generateBtn) {
        generateBtn.disabled = false;
        generateBtn.textContent = "Generate Pet";
        generateBtn.classList.remove("hidden");
      }
    })
    .catch(() => {});
}

function displayPet(data) {
  currentPet = data;
  saveBtn.classList.remove("hidden");  
  saveBtn.disabled = false;

  const container = document.getElementById("pet-container");
  PetDisplay.render(
    container,
    data,
    {
      showTitle: false,
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

if (generateBtn) {
  generateBtn.addEventListener("click", () => {
    messageDiv.textContent = "";

    generateBtn.classList.add("hidden");

    fetch("/generate-pet", { method: "POST", credentials: "include" })
      .then(res => {
        if (res.status === 429) {
          return res.json().then(j => {
            const ms = Number(j.remaining_ms) || 0;
            messageDiv.textContent = "You must wait before generating again.";
            startCooldown(ms);
            throw new Error("On cooldown");
          });
        }
        if (!res.ok) throw new Error("Failed to generate pet");
        return res.json();
      })
      .then(data => {
        displayPet(data);
        startCooldown(GENERATE_COOLDOWN_MS);
      })
      .catch(err => {
        if (err && err.message === "On cooldown") return;
        console.error("Failed to generate pet", err);
      });
  });
}

if (saveBtn) {
  saveBtn.addEventListener("click", () => {
    if (!currentPet) {
      alert("You need to generate a pet first!");
      return;
    }
    openNameModal();
  });
}

modalSaveBtn.addEventListener("click", () => {
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
    .then(res => { if (!res.ok) throw new Error("Failed to save pet"); return res.json(); })
    .then(() => {
      closeNameModal();
      messageDiv.textContent = "Pet Saved Successfully!";
      const container = document.getElementById("pet-container");
      container.innerHTML = "";
      currentPet = null;
      saveBtn.classList.add("hidden");  
    })
    .catch(err => {
      console.error("Error saving pet:", err);
      alert("Failed to save pet.");
    });
});

modalCancelBtn.addEventListener("click", closeNameModal);

checkGenerateCooldownOnLoad();
