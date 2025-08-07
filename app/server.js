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

app.post("/generate-pet", async (req, res) => {
  if (!req.session.username) {
    return res.status(401).json({ error: "Not logged in" });
  }

  try {
    const randomId = Math.floor(Math.random() * 898) + 1;
    const pokeRes = await fetch(`https://pokeapi.co/api/v2/pokemon/${randomId}`);
    const pokeData = await pokeRes.json();
    const sprite = pokeData.sprites.front_default || "images/fluffy.png";

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

    const pet = {
      username: req.session.username,
      name: "Test",
      rarity,
      sprite,
      level: 1,
      mutations: mutation ? [mutation] : [],
      health,
      health_growth,
      attack,
      attack_growth,
      defense,
      defense_growth,
      speed,
      type,

      move1name: "Bite",
      move1type: "normal",
      move1damage: 12,
      move2name: "Flame Burst",
      move2type: "fire",
      move2damage: 18,
      move3name: "Scratch",
      move3type: "normal",
      move3damage: 10,
      move4name: "Quick Attack",
      move4type: "normal",
      move4damage: 14,
    };

    await pool.query(
      `INSERT INTO pets (
        username, name, rarity, sprite, level, mutations,
        health, health_growth, attack, attack_growth,
        defense, defense_growth, speed, type,
        move1name, move1type, move1damage,
        move2name, move2type, move2damage,
        move3name, move3type, move3damage,
        move4name, move4type, move4damage
      ) VALUES (
        $1, $2, $3, $4, $5, $6,
        $7, $8, $9, $10,
        $11, $12, $13, $14,
        $15, $16, $17,
        $18, $19, $20,
        $21, $22, $23,
        $24, $25, $26
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
        move2name = EXCLUDED.move2name,
        move2type = EXCLUDED.move2type,
        move2damage = EXCLUDED.move2damage,
        move3name = EXCLUDED.move3name,
        move3type = EXCLUDED.move3type,
        move3damage = EXCLUDED.move3damage,
        move4name = EXCLUDED.move4name,
        move4type = EXCLUDED.move4type,
        move4damage = EXCLUDED.move4damage,
        date_received = NOW()
    `,
      [
        pet.username, pet.name, pet.rarity, pet.sprite, pet.level, pet.mutations,
        pet.health, pet.health_growth, pet.attack, pet.attack_growth,
        pet.defense, pet.defense_growth, pet.speed, pet.type,
        pet.move1name, pet.move1type, pet.move1damage,
        pet.move2name, pet.move2type, pet.move2damage,
        pet.move3name, pet.move3type, pet.move3damage,
        pet.move4name, pet.move4type, pet.move4damage
      ]
    );

    console.log("Saved pet for user:", pet.username);
    res.json(pet);
  } catch (err) {
    console.error("Error generating or saving pet:", err);
    res.status(500).json({ error: "Failed to generate and save pet" });
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