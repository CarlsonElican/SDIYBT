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

    let rarity = randomize.getRarity();
    let mutation = randomize.getMutation();
    let health = randomize.getHealth();
    let health_growth = randomize.getHealthGrowth();
    let attack = randomize.getAttack();
    let attack_growth = randomize.getAttackGrowth();
    let defense = randomize.getDefense();
    let defense_growth = randomize.getDefenseGrowth();
    let speed = randomize.getSpeed();
    let type = randomize.getType();


    const pet = {
        username: req.session.username,
        name: "Test",
        rarity: rarity,
        sprite: "images/fluffy.png",
        level: 1,
        mutations: mutation ? [mutation] : [],
        health: health,
        health_growth: health_growth,
        attack: attack,
        attack_growth: attack_growth,
        defense: defense,
        defense_growth: defense_growth,
        speed: speed,
        type: type,
        
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

    console.log("Generated pet for user:", pet);

    res.json(pet);
});


app.listen(port, hostname, () => {
  console.log(`Listening at: http://${hostname}:${port}`);
});