let playerCount = 4;
let holdTimer = null;
const grid = document.getElementById('player-grid');

function initPlayers() {
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
        <h2 style="color: var(--mint); text-align: center;">Player ${id}</h2>
        <div class="life-total" id="life-${id}">40</div>
        <div class="btn-group" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
            <button class="life-btn minus" 
                onmousedown="startHold(${id}, -1)" 
                onmouseup="stopHold()" 
                onmouseleave="stopHold()">-</button>
            <button class="life-btn plus" 
                onmousedown="startHold(${id}, 1)" 
                onmouseup="stopHold()" 
                onmouseleave="stopHold()">+</button>
        </div>
        <div style="margin-top: 15px; border-top: 1px solid #444; padding-top: 10px; text-align: center;">
            <span>Commander Damage</span>
            <div class="cmdr-damg-bttns" style="display: flex; justify-content: center; align-items: center; gap: 15px;">
                <button onclick="updateCmdr(${id}, -1)" style="padding: 5px 10px;">-</button>
                <b id="cmdr-${id}" style="font-size: 2rem;">0</b>
                <button onclick="updateCmdr(${id}, 1)" style="padding: 5px 10px;">+</button>
            </div>
        </div>
    `;

    document.getElementById('button-hover-style').innerHTML = `
        .cmdr-damg-bttns button:hover{
            cursor: pointer;
        }
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

    if (newCmdrVal >= 0) {
        cmdrEl.innerText = newCmdrVal;
        let currentLife = parseInt(lifeEl.innerText);
        lifeEl.innerText = Math.max(0, currentLife - amount);
    }
    checkStatus(id);
}

function checkStatus(id) {
    const life = parseInt(document.getElementById(`life-${id}`).innerText);
    const cmdr = parseInt(document.getElementById(`cmdr-${id}`).innerText);
    const card = document.getElementById(`card-${id}`);
    if (life <= 0 || cmdr >= 21) card.classList.add('defeated');
    else card.classList.remove('defeated');
}

// Existing Controls
function addPlayer() { if (playerCount < 10) { playerCount++; initPlayers(); } }
function removePlayer() { if (playerCount > 1) { playerCount--; initPlayers(); } }
function resetGame() { playerCount = 4; initPlayers(); }

initPlayers();