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
app.use('/protected', express.static(__dirname + '/protected'));


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
  "Common":                 { weak:60, average:20, based:20, awesome:0,  legendary:0 },
  "Uncommon":               { weak:40, average:30, based:20, awesome:10, legendary:0 },
  "Rare":                   { weak:20, average:40, based:25, awesome:15, legendary:0 },
  "Epic":                   { weak:10, average:20, based:40, awesome:20, legendary:10 },
  "Mythical":               { weak:0,  average:10, based:45, awesome:30, legendary:15 },
  "Divine":                 { weak:0,  average:10, based:20, awesome:40, legendary:30 },
  "The One and Only":       { weak:0,  average:0,  based:0,  awesome:0,  legendary:100 }
};

function inWeak(power)    { return power >= 1 && power <= 49; }
function inAverage(power) { return power >= 50 && power <= 80; }
function inBased(power)   { return power >= 81 && power <= 100; }
function inAwesome(power) { return power >= 101; }

function bucketForPower(power) {
  if (inWeak(power)) return "weak";
  if (inAverage(power)) return "average";
  if (inBased(power)) return "based";
  return "awesome";
}

const LEGENDARY_MOVES = [
  {type:"normal",   name:"Explosion", power:250},
  {type:"normal",   name:"Pulverizing Pancake", power:210},
  {type:"normal",   name:"Self-Destruct", power:200},
  {type:"normal",   name:"Hyper Beam", power:150},
  {type:"fire",     name:"V-create", power:180},
  {type:"fire",     name:"G-Max Fireball", power:160},
  {type:"fire",     name:"Shell Trap", power:150},
  {type:"fire",     name:"Mind Blown", power:150},
  {type:"water",    name:"Oceanic Operetta", power:195},
  {type:"water",    name:"G-Max Hydrosnipe", power:160},
  {type:"water",    name:"Water Spout", power:150},
  {type:"water",    name:"Hydro Cannon", power:150},
  {type:"electric", name:"Catastropika", power:210},
  {type:"electric", name:"10,000,000 Volt Thunderbolt", power:195},
  {type:"electric", name:"Stoked Sparksurfer", power:175},
  {type:"electric", name:"Electro Shot", power:130},
  {type:"grass",    name:"G-Max Drum Solo", power:160},
  {type:"grass",    name:"Frenzy Plant", power:150},
  {type:"grass",    name:"Chloroblast", power:150},
  {type:"grass",    name:"Leaf Storm", power:130},
  {type:"ice",      name:"Ice Burn", power:140},
  {type:"ice",      name:"Freeze Shock", power:140},
  {type:"ice",      name:"Glacial Lance", power:120},
  {type:"ice",      name:"Blizzard", power:110},
  {type:"fighting", name:"Meteor Assault", power:150},
  {type:"fighting", name:"Focus Punch", power:150},
  {type:"fighting", name:"High Jump Kick", power:130},
  {type:"fighting", name:"Superpower", power:120},
  {type:"poison",   name:"Gunk Shot", power:120},
  {type:"poison",   name:"Belch", power:120},
  {type:"poison",   name:"Noxious Torque", power:100},
  {type:"poison",   name:"Malignant Chain", power:100},
  {type:"ground",   name:"Precipice Blades", power:120},
  {type:"ground",   name:"Headlong Rush", power:120},
  {type:"ground",   name:"Sandsear Storm", power:100},
  {type:"ground",   name:"Earthquake", power:100},
  {type:"flying",   name:"Sky Attack", power:140},
  {type:"flying",   name:"Dragon Ascent", power:120},
  {type:"flying",   name:"Brave Bird", power:120},
  {type:"flying",   name:"Hurricane", power:110},
  {type:"psychic",  name:"Light That Burns the Sky", power:200},
  {type:"psychic",  name:"Genesis Supernova", power:185},
  {type:"psychic",  name:"Prismatic Laser", power:160},
  {type:"psychic",  name:"Psycho Boost", power:140},
  {type:"bug",      name:"Megahorn", power:120},
  {type:"bug",      name:"Pollen Puff", power:90},
  {type:"bug",      name:"First Impression", power:90},
  {type:"bug",      name:"Bug Buzz", power:90},
  {type:"rock",     name:"Splintered Stormshards", power:190},
  {type:"rock",     name:"Rock Wrecker", power:150},
  {type:"rock",     name:"Head Smash", power:150},
  {type:"rock",     name:"Meteor Beam", power:120},
  {type:"ghost",    name:"Menacing Moonraze Maelstrom", power:200},
  {type:"ghost",    name:"Soul-Stealing 7-Star Strike", power:195},
  {type:"ghost",    name:"Sinister Arrow Raid", power:180},
  {type:"ghost",    name:"Shadow Force", power:120},
  {type:"dragon",   name:"Clangorous Soulblaze", power:185},
  {type:"dragon",   name:"Eternabeam", power:160},
  {type:"dragon",   name:"Roar of Time", power:150},
  {type:"dragon",   name:"Dragon Energy", power:150},
  {type:"dark",     name:"Malicious Moonsault", power:180},
  {type:"dark",     name:"Hyperspace Fury", power:100},
  {type:"dark",     name:"Foul Play", power:95},
  {type:"dark",     name:"Fiery Wrath", power:90},
  {type:"steel",    name:"Searing Sunraze Smash", power:200},
  {type:"steel",    name:"Gigaton Hammer", power:160},
  {type:"steel",    name:"Steel Beam", power:140},
  {type:"steel",    name:"Doom Desire", power:140},
  {type:"fairy",    name:"Let's Snuggle Forever", power:190},
  {type:"fairy",    name:"Light of Ruin", power:140},
  {type:"fairy",    name:"Fleur Cannon", power:130},
  {type:"fairy",    name:"Springtide Storm", power:100}
];

function pickLegendary(excludeLower) {
  var pool = [];
  for (var i = 0; i < LEGENDARY_MOVES.length; i++) {
    var nm = LEGENDARY_MOVES[i].name.toLowerCase();
    if (!excludeLower.has(nm)) pool.push(LEGENDARY_MOVES[i]);
  }
  if (pool.length === 0) return null;
  var idx = Math.floor(Math.random() * pool.length);
  var m = pool[idx];
  return { name: m.name, type: m.type, power: m.power, rarity: "legendary" };
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
        if (bucket === "weak")    ok = inWeak(power);
        if (bucket === "average") ok = inAverage(power);
        if (bucket === "based")   ok = inBased(power);
        if (bucket === "awesome") ok = inAwesome(power);
        if (ok) {
          const raw = m.name;
          const name = raw.replace(/-/g, " ");
          const lower = name.toLowerCase();
          if (!excludeLower.has(lower)) {
            const typeField = m.type && m.type.name ? m.type.name : "normal";
            const rar = bucketForPower(power);
            return { name: name, type: typeField, power: power, rarity: rar };
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
  while (out.length < 4) {
    const weights = PET_TO_MOVE_DIST[petRarity] || PET_TO_MOVE_DIST["Common"];
    let bucket = rollBucket(weights);

    if (bucket === "legendary") {
      const leg = pickLegendary(exclude);
      if (leg !== null) {
        exclude.add(leg.name.toLowerCase());
        out.push(leg);
        continue;
      } else {
        bucket = "awesome";
      }
    }

    const order = ["awesome", "based", "average", "weak"];
    let start = 0;
    let i = 0;
    for (i = 0; i < order.length; i++) {
      if (order[i] === bucket) {
        start = i;
        break;
      }
    }

    let pick = null;
    let j = start;
    while (j < order.length && pick === null) {
      pick = await pickDamagingMoveFromBucket(order[j], exclude, 40);
      j += 1;
    }
    if (pick === null) {
      const lastTry = pickLegendary(exclude);
      if (lastTry !== null) {
        exclude.add(lastTry.name.toLowerCase());
        out.push(lastTry);
      } else {
        throw new Error("No suitable move found");
      }
    } else {
      exclude.add(pick.name.toLowerCase());
      out.push(pick);
    }
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

      let setSql = "", vals = [];
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