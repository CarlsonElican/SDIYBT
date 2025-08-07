function getRarity() {
    const random = Math.random();
    if (random < 0.50) return "Common";
    if (random < 0.80) return "Uncommon";
    if (random < 0.90) return "Rare";
    if (random < 0.95) return "Epic";
    if (random < 0.995) return "Mythical";
    if (random < 0.9999) return "Divine";
    return "The One and Only"; 
}

function getMutation() {
    const mutations = [
        "Frozen", "Fiery", "Golden", "Shadow", "Crystal", "Toxic", "Glowing", "Radiant",
        "Cursed", "Shocked", "Ancient", "Metallic", "Obsidian", "Lunar", "Solar", "Stormy",
        "Void", "Arcane", "Spiky", "Corrupted", "Astral", "Blighted", "Runic", "Chaotic",
        "Enchanted", "Ghostly", "Cutesy", "Slimey", "Grassy", "Sigma", "Skibidi",
        "Holy", "Shiny"
    ];
    const random = Math.random();
    if (random < 0.25) {
        const rand = Math.floor(Math.random() * mutations.length);
        return mutations[rand];
    }
    return null; 
}

function getHealth() {
    return Math.floor(Math.random() * 101) + 100;  // 100 to 200
}

function getHealthGrowth() {
    return Math.floor(Math.random() * 11) + 10; // 10 to 20
}

function getAttack() {
    return Math.floor(Math.random() * 31) + 10; // 10 to 40
}

function getAttackGrowth() {
    return Math.floor(Math.random() * 5) + 2; // 2 to 6
}

function getDefense() {
    return Math.floor(Math.random() * 31) + 10; // 10 to 40
}

function getDefenseGrowth() {
    return Math.floor(Math.random() * 5) + 2; // 2 to 6
}

function getSpeed() {
    const options = ["slow", "medium", "fast"];
    return options[Math.floor(Math.random() * options.length)];
}

function getType() {
    const types = [
        "Normal", "Fire", "Water", "Electric", "Grass", "Ice", "Fighting", "Poison",
        "Ground", "Flying", "Psychic", "Bug", "Rock", "Ghost", "Dragon", "Dark",
        "Steel", "Fairy"
    ];
    return types[Math.floor(Math.random() * types.length)];
}


module.exports = {
    getRarity,
    getMutation,
    getHealth,
    getHealthGrowth,
    getAttack,
    getAttackGrowth,
    getDefense,
    getDefenseGrowth,
    getSpeed,
    getType,
};