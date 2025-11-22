// --- Game Data ---
const Mobs = {
    Karen: { name: "Karen", hp: 150, attack: 15, weakness: 1, text: "needs the manager" }, // Weak to "Oh Jamie" (1)
    Bob: { name: "Bob", hp: 120, attack: 10, weakness: 4, text: "narcotics refill early" }, // Weak to "Call Doctor" (4)
    Jim: { name: "Jim", hp: 100, attack: 8, weakness: 5, text: "doctor said it'd be ready" }, // Weak to "Explain Policy" (5)
    Becky: { name: "Becky", hp: 80, attack: 5, weakness: 3, text: "price isn't what the doctor said" }, // Weak to "Turn Computer" (3)
    Brett: { name: "Brett", hp: 140, attack: 12, weakness: 2, text: "pissed about the line" } // Weak to "Good Day" (2)
};

const Weapons = {
    1: { name: "Oh Jamie", damage: 40, cost: 10, special: true },
    2: { name: "Good Day", damage: 20, cost: 5, special: false },
    3: { name: "Turn Computer", damage: 30, cost: 8, special: false },
    4: { name: "Call Doctor", damage: 35, cost: 10, special: false },
    5: { name: "Explain Policy", damage: 30, cost: 8, special: false },
    6: { name: "Witchcraft", damage: 0, cost: 20, special: true }, // Special effect in code
    7: { name: "Get Manager", damage: 100, cost: 30, special: true } // Ultimate
};

// --- Game State ---
let gameState = {
    patience: 100,
    maxPatience: 100,
    score: 0,
    currentMob: null,
    ap: 50, // Action Points
    maxAp: 100
};

// --- DOM Elements ---
const patienceBar = document.getElementById('patience-bar');
const scoreDisplay = document.getElementById('score');
const mobDisplay = document.getElementById('mob-display');
const weaponButtons = document.querySelectorAll('.weapon-btn');
const gameOverModal = document.getElementById('game-over-modal');
const finalScoreDisplay = document.getElementById('final-score');

// --- Game Functions ---

function updatePatience(amount) {
    gameState.patience = Math.max(0, Math.min(gameState.maxPatience, gameState.patience + amount));
    const widthPercent = (gameState.patience / gameState.maxPatience) * 100;
    patienceBar.style.width = `${widthPercent}%`;
    patienceBar.style.backgroundColor = widthPercent > 30 ? '#4CAF50' : '#ff4d4d'; // Color change
    
    if (gameState.patience <= 0) {
        endGame();
    }
}

function updateScore(amount) {
    gameState.score += amount;
    scoreDisplay.textContent = `Score: ${gameState.score}`;
}

function spawnMob() {
    const mobKeys = Object.keys(Mobs);
    const randomKey = mobKeys[Math.floor(Math.random() * mobKeys.length)];
    gameState.currentMob = JSON.parse(JSON.stringify(Mobs[randomKey])); // Deep copy
    gameState.currentMob.hpLeft = gameState.currentMob.hp;

    renderMob();
}

function renderMob() {
    if (!gameState.currentMob) {
        mobDisplay.innerHTML = '<p>The queue is clear!</p>';
        return;
    }
    
    mobDisplay.innerHTML = `
        <h2 class="mob-name">${gameState.currentMob.name}</h2>
        <p>${gameState.currentMob.text}</p>
        <p class="mob-hp">HP/Toughness: ${gameState.currentMob.hpLeft} / ${gameState.currentMob.hp}</p>
    `;
}

function defeatMob() {
    updateScore(gameState.currentMob.hp); // Reward based on mob toughness
    gameState.currentMob = null;
    setTimeout(spawnMob, 2000); // Small delay before next mob appears
}

function handleMobAttack() {
    if (gameState.currentMob) {
        const damage = gameState.currentMob.attack;
        updatePatience(-damage);
        // Display a message or visual cue that patience was drained
        console.log(`Patience drained by ${damage}`);
    }
}

function useWeapon(weaponId) {
    if (!gameState.currentMob) return;

    const weapon = Weapons[weaponId];
    let damage = weapon.damage;
    let attackMessage = `Used ${weapon.name}!`;

    // 1. Critical Hit Check
    if (gameState.currentMob.weakness === weaponId) {
        damage *= 1.5; // 50% extra damage for critical hit
        attackMessage += " **Critical Hit!**";
    }

    // 2. Special Weapon Logic
    if (weaponId == 6) { // Witchcraft
        damage = Math.floor(Math.random() * 150) - 50; // Random damage or heal
        if (damage > 0) {
            attackMessage = `Witchcraft: Black Magic! Dealt ${damage} damage.`;
        } else {
            updatePatience(Math.abs(damage)); // White Magic: heals patience
            damage = 0; // No damage to mob
            attackMessage = `Witchcraft: White Magic! Healed ${Math.abs(damage)} Patience.`;
        }
    } else if (weaponId == 7) { // Get Manager
        // Great damage, but immediate patience penalty (cooldown simulation)
        updatePatience(-10);
        attackMessage += " (-10 Patience penalty)";
    }

    // 3. Apply Damage
    gameState.currentMob.hpLeft -= Math.round(damage);
    console.log(attackMessage);

    // 4. Check for Defeat
    if (gameState.currentMob.hpLeft <= 0) {
        defeatMob();
    } else {
        renderMob();
        handleMobAttack(); // Mob counter-attacks after every weapon use
    }
}

function endGame() {
    // Stop all ongoing timers/spawning mechanisms
    clearInterval(mobAttackInterval);
    
    finalScoreDisplay.textContent = gameState.score;
    gameOverModal.classList.remove('hidden');
}


// --- Event Listeners and Initialization ---

weaponButtons.forEach(button => {
    button.addEventListener('click', (e) => {
        const weaponId = parseInt(e.target.dataset.weaponId);
        useWeapon(weaponId);
    });
});

// Start the game!
updatePatience(0); // Initialize bar
updateScore(0);
spawnMob();

// Mob attack interval (drains patience periodically)
const mobAttackInterval = setInterval(handleMobAttack, 5000); // Mobs drain patience every 5 seconds