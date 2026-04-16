let playerCount = 4;
let holdTimer = null;
let startingPlayerLife = 40
const grid = document.getElementById('player-grid');

function createPlayerCards(){
    grid.innerHTML = '';
    grid.className = playerCount <= 2 ? 'grid-2' : playerCount <= 4 ? 'grid-4' : 'grid-10';
    for (let i = 1; i <= playerCount; i++) {
        createPlayerCard(i);
    }
}

function createPlayerCard(id) {
    const card = document.createElement('div');
    card.className = 'player-card';
    card.id = `card-${id}`;
    card.innerHTML = `
        <h2 class="player-title">Player ${id}</h2>
        <div class="life-total" id="life-${id}">${startingPlayerLife}</div>
        <div class="btn-group">
            <button class="life-btn minus" 
                onmousedown="startHold(${id}, -1)" 
                onmouseup="stopHold()" 
                onmouseleave="stopHold()">-</button>
            <button class="life-btn plus" 
                onmousedown="startHold(${id}, 1)" 
                onmouseup="stopHold()" 
                onmouseleave="stopHold()">+</button>
        </div>
        <div class="cmdr-section">
            <span>Commander Damage</span>
            <div class="cmdr-damg-bttns">
                <button onclick="updateCmdr(${id}, -1)">-</button>
                <b id="cmdr-${id}" class="cmdr-count">0</b>
                <button onclick="updateCmdr(${id}, 1)">+</button>
            </div>
        </div>
    `;

    grid.appendChild(card);
}

// Logic for Press and Hold
function startHold(id, amount) {
    // Initial immediate change for the first "click"
    updateLife(id, amount);

    // After a short delay, start repeating the change
    holdTimer = setInterval(() => {
        updateLife(id, amount);
    }, 180); // 100ms = 10 changes per second
}

function stopHold() {
    if (holdTimer) {
        clearInterval(holdTimer);
        holdTimer = null;
    }
}

function updateLife(id, amount) {
    const lifeEl = document.getElementById(`life-${id}`);
    let newLife = Math.max(0, parseInt(lifeEl.innerText) + amount);
    lifeEl.innerText = newLife;
    checkStatus(id);
}

function updateCmdr(id, amount) {
    const cmdrEl = document.getElementById(`cmdr-${id}`);
    const lifeEl = document.getElementById(`life-${id}`);
    
    let oldCmdrVal = parseInt(cmdrEl.innerText);
    let newCmdrVal = oldCmdrVal + amount;

    // Only proceed if within the legal 0-21 range
    if(newCmdrVal >= 0 && newCmdrVal <= 21){
        let currentLife = parseInt(lifeEl.innerText);
        
        // Check if life is at 0 before subtracting the damage
        if (amount < 0 && currentLife === 0) {
            // Do nothing to Life, just update the Commander number
            cmdrEl.innerText = newCmdrVal;
        } else {
            // Normal behavior: Update both
            cmdrEl.innerText = newCmdrVal;
            lifeEl.innerText = Math.max(0, currentLife - amount);
        }
    }
    checkStatus(id);
}

function checkStatus(id){
    const defeatedMessage = {
        0: "Defeated",
        1: "One Shot",
        2: "Exiled",
        3: "Eliminated",
        4: "Destroyed",
        5: "Neutralized",
        6: "Finished",
        7: "Cooked",
        8: "Wiped",
        9: "laughtered",
        10: "Obliterated",
        11: "Seg Faulted",
        12: "Dog Water",
        13: "Removed",
        14: "Didn't Compile",
        15: "Folded",
        16: "Took the L",
        17: "Done For",
        18: "Terminated",
        19: "Tapped Out",
        20: "Blue-Shelled",
        21: "No more Stocks"
    }

    const life = parseInt(document.getElementById(`life-${id}`).innerText);
    const cmdr = parseInt(document.getElementById(`cmdr-${id}`).innerText);
    const card = document.getElementById(`card-${id}`);
    const randNum = Math.floor(Math.random() * 22);
    
    if((life <= 0 || cmdr >= 21) && !(card.classList.contains('defeated'))){
        card.style.setProperty('--defeat-msg', `"${defeatedMessage[randNum]}"`);
        card.classList.add('defeated');
    } 
    else if(life > 0 && cmdr < 21){
        card.classList.remove('defeated');
    }
}

// Existing Controls
function addPlayer() { if (playerCount < 10) { playerCount++; createPlayerCards(); } }
function removePlayer() { if (playerCount > 1) { playerCount--; createPlayerCards(); } }
function resetGame() { playerCount = 4; createPlayerCards(); }

createPlayerCards();