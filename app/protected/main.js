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

  petBox.appendChild(title);
  petBox.appendChild(img);
  petBox.appendChild(moveList);

  container.appendChild(petBox);
}

const generateBtn = document.getElementById("generate");
if (generateBtn) {
  generateBtn.addEventListener("click", function () {
    fetch("/generate-pet", {
      method: "POST",
      credentials: "include"
    })
      .then(res => res.json())
      .then(() => {
        const container = document.getElementById("pet-container");
        container.innerHTML = "<p style='text-align:center;'>Pet generated!</p>";
      })
      .catch(err => {
        console.error("Failed to generate pet", err);
      });
  });
}

const showBtn = document.getElementById("show-pet");
if (showBtn) {
  showBtn.addEventListener("click", function () {
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
  });
}
