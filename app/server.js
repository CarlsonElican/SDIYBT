const express = require("express");
const pg = require("pg");
const bcrypt = require("bcrypt");
const session = require("express-session");

const app = express();
const port = 3000;
const hostname = "localhost";
const randomize = require("./randomize.js");

const pool = new pg.Pool({
  connectionString: "postgresql://neondb_owner:npg_mpqW7HL6crvz@ep-cold-base-aep1ue78-pooler.c-2.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require"
});

app.use(session({
  secret: "sdiybt-secret-code-word",
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false } // change this when moving to online server/https
}));

app.use(express.static("public"));
app.use(express.json());
// add any protected links through
app.use("/protected", express.static(__dirname + "/protected"));

app.post("/signup", async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password || typeof username !== "string" || typeof password !== "string") {
    return res.status(400).send("Invalid input");
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    await pool.query(
      "INSERT INTO users (username, password_hash) VALUES ($1, $2)",
      [username, hashedPassword]
    );

    res.status(200).send("User created");
  } catch (err) {
    console.error(err);
    res.status(500).send("User creation failed");
  }
});

app.post("/login", async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      "SELECT password_hash FROM users WHERE username = $1",
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).send("Invalid username or password");
    }

    const isValid = await bcrypt.compare(password, result.rows[0].password_hash);

    if (isValid) {
      req.session.username = username;
      res.status(200).send("Login successful");
    } else {
      res.status(401).send("Invalid username or password");
    }
  } catch (err) {
    console.error(err);
    res.status(500).send("Login failed");
  }
});

app.post("/logout", (req, res) => {
  req.session.destroy();
  res.status(200).send("Logged out!");
});

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/public/welcome.html");
});

app.get("/me", (req, res) => {
  if (req.session.username) {
    res.json({ username: req.session.username });
  } else {
    res.status(401).json({ error: "Not logged in" });
  }
});

app.get("/main", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login.html");
  }
  res.sendFile(__dirname + "/protected/main.html");
});

app.get("/profile", (req, res) => {
  if (!req.session.username) {
    return res.redirect("/login.html");
  }
  res.sendFile(__dirname + "/protected/profile.html");
});


const PET_TO_MOVE_DIST = {
  "Common":           { weak:60,  average:20,  based:15,  awesome:5, legendary:0 },
  "Uncommon":         { weak:40, average:30, based:20, awesome:10,  legendary:0 },
  "Rare":             { weak:20, average:40, based:25, awesome:15,  legendary:0 },
  "Epic":             { weak:10, average:20, based:40, awesome:20,  legendary:10 },
  "Mythical":         { weak:0,  average:10, based:45, awesome:30,  legendary:15 },
  "Divine":           { weak:0,  average:10, based:20, awesome:40,  legendary:30 },
  "The One and Only": { weak:0,  average:0,  based:0,  awesome:0,   legendary:100 }
};


function inWeak(power)       { return power >= 1   && power <= 49; }
function inAverage(power)    { return power >= 50  && power <= 80; }
function inBased(power)      { return power >= 81  && power <= 100; }
function inAwesome(power)    { return power >= 101 && power <= 135; }
function inLegendary(power)  { return power > 135; }

function bucketForPower(power) {
  if (inLegendary(power)) return "legendary";
  if (inAwesome(power))   return "awesome";
  if (inBased(power))     return "based";
  if (inAverage(power))   return "average";
  if (inWeak(power))      return "weak";
  return null;
}

function rollBucket(weights) {
  const r = Math.random() * 100;
  let sum = 0;
  const keys = Object.keys(weights);
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    sum += weights[k];
    if (r <= sum) return k;
  }
  return keys[keys.length - 1];
}


async function pickDamagingMoveFromBucket(bucket, excludeLower, tries) {
  let t = 0;
  while (t < tries) {
    const id = Math.floor(Math.random() * 920) + 1;
    const res = await fetch(`https://pokeapi.co/api/v2/move/${id}`);
    if (res.ok) {
      const m = await res.json();
      const power = typeof m.power === "number" ? m.power : 0;
      if (power > 0) {
        let ok = false;
        if (bucket === "legendary") ok = inLegendary(power);
        if (bucket === "awesome")   ok = inAwesome(power);
        if (bucket === "based")     ok = inBased(power);
        if (bucket === "average")   ok = inAverage(power);
        if (bucket === "weak")      ok = inWeak(power);

        if (ok) {
          const apiName = (m.name || "").toLowerCase();  
          const displayName = apiName.replace(/-/g, " ");  
          const lower = displayName;                       
          if (!excludeLower.has(lower)) {
            const typeField = (m.type && m.type.name) ? m.type.name : "normal";
            const rarity = bucketForPower(power) || "awesome"; 
            return { name: displayName, type: typeField, power, rarity };
          }
        }
      }
    }
    t += 1;
  }
  return null;
}

async function generateMovesForPet(petRarity) {
  const exclude = new Set();
  const out = [];

  const weights = PET_TO_MOVE_DIST[petRarity] || PET_TO_MOVE_DIST["Common"];
  const mustLegendaryOnly = (weights.legendary === 100);
  const order = ["legendary", "awesome", "based", "average", "weak"];

  while (out.length < 4) {
    let bucket = rollBucket(weights);
    if (mustLegendaryOnly) bucket = "legendary";

    let pick = null;

    if (bucket === "legendary") {
      for (let attempts = 0; attempts < 6 && pick === null; attempts++) {
        pick = await pickDamagingMoveFromBucket("legendary", exclude, 80);
      }
      if (pick === null) continue;
    } else {
      let start = order.indexOf(bucket);
      if (start < 0) start = 0;

      for (let j = start; j < order.length && pick === null; j++) {
        pick = await pickDamagingMoveFromBucket(order[j], exclude, 40);
      }
      for (let j = start - 1; j >= 0 && pick === null; j--) {
        pick = await pickDamagingMoveFromBucket(order[j], exclude, 40);
      }
      if (pick === null) throw new Error("No suitable move found");
    }

    exclude.add(pick.name.toLowerCase());
    out.push(pick);
  }
  return out;
}

async function randomizePet(sessionUser) {
  const randomId = Math.floor(Math.random() * 898) + 1;
  const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
  if (!pokeRes.ok) throw new Error("PokeAPI request failed");
  const pokeData = await pokeRes.json();
  const sprite = pokeData.sprites.front_default;

  const level = 1;
  const rarity = randomize.getRarity();
  const mutation = randomize.getMutation();
  const health = randomize.getHealth();
  const health_growth = randomize.getHealthGrowth();
  const attack = randomize.getAttack();
  const attack_growth = randomize.getAttackGrowth();
  const defense = randomize.getDefense();
  const defense_growth = randomize.getDefenseGrowth();
  const speed = randomize.getSpeed();
  const type = randomize.getType();

  const allowed = Math.min(1 + Math.floor((level - 1) / 20), 4);
  let moves = await generateMovesForPet(rarity);
  if (moves.length > allowed) moves = moves.slice(0, allowed);

  const pet = {
    username: sessionUser || null,
    name: "NO NAME",
    rarity: rarity,
    sprite: sprite,
    level: level,
    mutations: mutation ? [mutation] : [],
    health,
    health_growth,
    attack,
    attack_growth,
    defense,
    defense_growth,
    speed,
    type,

    move1name: null, move1type: null, move1damage: null, move1rarity: null,
    move2name: null, move2type: null, move2damage: null, move2rarity: null,
    move3name: null, move3type: null, move3damage: null, move3rarity: null,
    move4name: null, move4type: null, move4damage: null, move4rarity: null
  };

  for (let i = 0; i < moves.length; i++) {
    const m = moves[i];
    if (i === 0) { pet.move1name = m.name; pet.move1type = m.type; pet.move1damage = m.power; pet.move1rarity = m.rarity; }
    else if (i === 1) { pet.move2name = m.name; pet.move2type = m.type; pet.move2damage = m.power; pet.move2rarity = m.rarity; }
    else if (i === 2) { pet.move3name = m.name; pet.move3type = m.type; pet.move3damage = m.power; pet.move3rarity = m.rarity; }
    else if (i === 3) { pet.move4name = m.name; pet.move4type = m.type; pet.move4damage = m.power; pet.move4rarity = m.rarity; }
  }

  return pet;
}

const SAVABLE_FIELDS = new Set([
  "name",
  "rarity",
  "sprite",
  "level",
  "mutations",
  "health",
  "health_growth",
  "attack",
  "attack_growth",
  "defense",
  "defense_growth",
  "speed",
  "type",
  "move1name",
  "move1type",
  "move1damage",
  "move1rarity",
  "move2name",
  "move2type",
  "move2damage",
  "move2rarity",
  "move3name",
  "move3type",
  "move3damage",
  "move3rarity",
  "move4name",
  "move4type",
  "move4damage",
  "move4rarity",
]);

app.post("/test/levelup20", async (req, res) => {
  if (!req.session.username) return res.status(401).json({ error: "Not logged in" });

  try {
    const up = await pool.query(
      "UPDATE pets SET level = COALESCE(level, 1) + 20 WHERE username = $1 RETURNING *",
      [req.session.username]
    );
    if (up.rows.length === 0) return res.status(404).json({ error: "No pet found" });

    const pet = up.rows[0];
    const allowed = Math.min(1 + Math.floor((pet.level - 1) / 20), 4);

    function filledCount(p) {
      let c = 0;
      if (p.move1name) c += 1;
      if (p.move2name) c += 1;
      if (p.move3name) c += 1;
      if (p.move4name) c += 1;
      return c;
    }

    let have = filledCount(pet);
    if (have < allowed) {
      const moves = await generateMovesForPet(pet.rarity);
      const known = new Set();
      if (pet.move1name) known.add(pet.move1name.toLowerCase());
      if (pet.move2name) known.add(pet.move2name.toLowerCase());
      if (pet.move3name) known.add(pet.move3name.toLowerCase());
      if (pet.move4name) known.add(pet.move4name.toLowerCase());

      let next = null;
      for (let i = 0; i < moves.length; i++) {
        const nm = moves[i].name.toLowerCase();
        if (!known.has(nm)) { next = moves[i]; break; }
      }
      if (!next) next = moves[0];

      let setSql = "";
      if (!pet.move1name) { setSql = "move1name=$2, move1type=$3, move1damage=$4, move1rarity=$5"; }
      else if (!pet.move2name) { setSql = "move2name=$2, move2type=$3, move2damage=$4, move2rarity=$5"; }
      else if (!pet.move3name) { setSql = "move3name=$2, move3type=$3, move3damage=$4, move3rarity=$5"; }
      else if (!pet.move4name) { setSql = "move4name=$2, move4type=$3, move4damage=$4, move4rarity=$5"; }

      if (setSql) {
        await pool.query(
          `UPDATE pets SET ${setSql} WHERE username=$1`,
          [req.session.username, next.name, next.type, next.power, next.rarity]
        );
      }
    }

    const out = await pool.query("SELECT * FROM pets WHERE username = $1", [req.session.username]);
    return res.json(out.rows[0]);

  } catch (e) {
    console.error("Error level-up:", e);
    return res.status(500).json({ error: "Failed to level up" });
  }
});

function sanitizePetForSave(body) {
  const pet = {};
  for (const key of Object.keys(body || {})) {
    if (SAVABLE_FIELDS.has(key)) pet[key] = body[key];
  }
  pet.name = typeof pet.name === "string" && pet.name.trim() ? pet.name.trim() : "Test";
  pet.level = Number.isInteger(pet.level) && pet.level > 0 ? pet.level : 1;
  if (!Array.isArray(pet.mutations)) pet.mutations = [];
  return pet;
}

app.post("/generate-pet", async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const pet = await randomizePet(null);
    res.json(pet);
  } catch (err) {
    console.error("Error generating pet:", err);
    res.status(500).json({ error: "Failed to generate pet" });
  }
});

app.post("/save-pet", async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const pet = sanitizePetForSave(req.body || {});
    const username = req.session.username;

    await pool.query(
      `INSERT INTO pets (
        username, name, rarity, sprite, level, mutations,
        health, health_growth, attack, attack_growth,
        defense, defense_growth, speed, type,
        move1name, move1type, move1damage, move1rarity,
        move2name, move2type, move2damage, move2rarity,
        move3name, move3type, move3damage, move3rarity,
        move4name, move4type, move4damage, move4rarity
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16, $17, $18,
        $19, $20, $21, $22,
        $23, $24, $25, $26,
        $27, $28, $29, $30
      )
      ON CONFLICT (username) DO UPDATE SET
        name = EXCLUDED.name,
        rarity = EXCLUDED.rarity,
        sprite = EXCLUDED.sprite,
        level = EXCLUDED.level,
        mutations = EXCLUDED.mutations,
        health = EXCLUDED.health,
        health_growth = EXCLUDED.health_growth,
        attack = EXCLUDED.attack,
        attack_growth = EXCLUDED.attack_growth,
        defense = EXCLUDED.defense,
        defense_growth = EXCLUDED.defense_growth,
        speed = EXCLUDED.speed,
        type = EXCLUDED.type,
        move1name = EXCLUDED.move1name,
        move1type = EXCLUDED.move1type,
        move1damage = EXCLUDED.move1damage,
        move1rarity = EXCLUDED.move1rarity,
        move2name = EXCLUDED.move2name,
        move2type = EXCLUDED.move2type,
        move2damage = EXCLUDED.move2damage,
        move2rarity = EXCLUDED.move2rarity,
        move3name = EXCLUDED.move3name,
        move3type = EXCLUDED.move3type,
        move3damage = EXCLUDED.move3damage,
        move3rarity = EXCLUDED.move3rarity,
        move4name = EXCLUDED.move4name,
        move4type = EXCLUDED.move4type,
        move4damage = EXCLUDED.move4damage,
        move4rarity = EXCLUDED.move4rarity,
        date_received = NOW()
      `,
      [
        username,
        pet.name,
        pet.rarity,
        pet.sprite,
        pet.level,
        pet.mutations,
        pet.health,
        pet.health_growth,
        pet.attack,
        pet.attack_growth,
        pet.defense,
        pet.defense_growth,
        pet.speed,
        pet.type,
        pet.move1name,
        pet.move1type,
        pet.move1damage,
        pet.move1rarity,
        pet.move2name,
        pet.move2type,
        pet.move2damage,
        pet.move2rarity,
        pet.move3name,
        pet.move3type,
        pet.move3damage,
        pet.move3rarity,
        pet.move4name,
        pet.move4type,
        pet.move4damage,
        pet.move4rarity,
      ]
    );

    console.log("Saved pet for user:", username);
    res.json({ ok: true });
  } catch (err) {
    console.error("Error saving pet:", err);
    res.status(500).json({ error: "Failed to save pet" });
  }
});

app.get("/my-pet", async (req, res) => {
  console.log("Getting pet for:", req.session.username);

  if (!req.session.username) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const result = await pool.query(
      "SELECT * FROM pets WHERE username = $1",
      [req.session.username]
    );

    if (result.rows.length === 0) {
      console.log("No pet found for:", req.session.username);
      return res.status(404).json({ error: "No pet found" });
    }

    console.log("Pet retrieved for:", req.session.username);
    res.json(result.rows[0]);

  } catch (err) {
    console.error("Error fetching pet:", err);
    res.status(500).json({ error: "Failed to retrieve pet" });
  }
});

app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});
