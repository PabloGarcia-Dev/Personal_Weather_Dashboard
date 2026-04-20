let playerCount = 4;
let holdTimer = null;
let startingPlayerLife = 40
const grid = document.getElementById('player-grid');

function createPlayerCards(){
    grid.innerHTML = '';
    grid.className = playerCount <= 2 ? 'grid-2' : playerCount <= 4 ? 'grid-4' : 'grid-10';
    for(let i = 1; i <= playerCount; i++){
        createPlayerCard(i);
    }
}

function createPlayerCard(id){
    const playerBackgroundColor = {
        1: `rgba(232, 59, 59, 0.8)`,
        2: `rgba(13, 71, 161, 0.8)`,
        3: `rgba(63, 172, 69, 0.8)`,
        4: `rgba(133, 61, 177, 0.8)`,
        5: `rgba(255, 143, 0, 0.8)`,
        6: `rgba(136, 14, 79, 0.8)`,
        7: `rgba(0, 105, 92, 0.8)`,
        8: `rgba(69, 39, 160, 0.8)`
    }

    const card = document.createElement('div');
    card.className = 'player-card';
    card.id = `card-${id}`;
    card.style.backgroundColor = playerBackgroundColor[id];

    card.innerHTML = `
        <h2 class="player-title">Player ${id}</h2>
        <div class="life-total" id="life-${id}">${startingPlayerLife}</div>
        <div class="btn-group">
            <button class="life-btn minus" onmousedown="startHold(${id}, -1)" onmouseup="stopHold()" onmouseleave="stopHold()">-</button>
            <button class="life-btn plus" onmousedown="startHold(${id}, 1)" onmouseup="stopHold()" onmouseleave="stopHold()">+</button>
        </div>
        <div class="special-damage-grid">
            <div class="damage-section cmdr-section">
                <button class="menu-toggle-btn" onclick="toggleCmdrMenu(${id}, event)">
                    Commander Damage ▼
                </button>
                <div id="cmdr-menu-${id}" class="cmdr-menu-dropdown hidden">
                    <div class="cmdr-opponents-list">
                        ${commanderDamageButtons(playerCount, id)}
                    </div>
                </div>
            </div>
            <div class="damage-section poison-section">
                <span>Poison Damage</span>
                <div class="damg-bttns">
                    <button onclick="updatePoison(${id}, -1)">-</button>
                    <b id="poison-${id}" class="damg-count">0</b>
                    <button onclick="updatePoison(${id}, 1)">+</button>
                </div>
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

function updateLife(id, amount){
    const lifeEl = document.getElementById(`life-${id}`);
    const card = document.getElementById(`card-${id}`);

    if(!(card.classList.contains('defeated'))){
        let newLife = Math.max(0, parseInt(lifeEl.innerText) + amount);
        lifeEl.innerText = newLife;
        checkStatus(id);
    }
}

function updateCmdr(targetId, attackerId, amount) {
    const cmdrEl = document.getElementById(`cmdr-target${targetId}-from${attackerId}`);
    const lifeEl = document.getElementById(`life-${targetId}`);
    
    let currentCmdrVal = parseInt(cmdrEl.innerText);
    let newVal = currentCmdrVal + amount;
    let currentLife = parseInt(lifeEl.innerText);

    const card = document.getElementById(`card-${targetId}`);

    if(newVal >= 0 && newVal <= 21 && !(card.classList.contains('defeated'))){
        cmdrEl.innerText = newVal;
        // Commander damage also reduces life total
        lifeEl.innerText = Math.max(0, currentLife - amount);
        
        checkStatus(targetId);
    }
}

function updatePoison(id, amount){
    const poisonEl = document.getElementById(`poison-${id}`);
    const lifeEl = document.getElementById(`life-${id}`);
    
    let oldPoisonVal = parseInt(poisonEl.innerText);
    let newPoisonVal = oldPoisonVal + amount;

    // Only proceed if within the legal 0-10 range
    if(newPoisonVal >= 0 && newPoisonVal <= 10){
        let currentLife = parseInt(lifeEl.innerText);
        
        // Check if life is at 0 before subtracting the damage
        if (amount < 0 && currentLife === 0) {
            // Do nothing to Life, just update the Poison number
            poisonEl.innerText = newPoisonVal;
        }
        else{
            // Normal behavior: Update both
            poisonEl.innerText = newPoisonVal;
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
        9: "slaughtered",
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
    const poison = parseInt(document.getElementById(`poison-${id}`).innerText);
    const card = document.getElementById(`card-${id}`);
    
    // Check ALL commander damage sources for this player
    const cmdrElements = card.querySelectorAll('.cmdr-count');
    let maxCmdrDamage = 0;
    cmdrElements.forEach(el => {
        maxCmdrDamage = Math.max(maxCmdrDamage, parseInt(el.innerText));
    });

    const isDefeated = life <= 0 || poison >= 10 || maxCmdrDamage >= 21;
    if(isDefeated && !(card.classList.contains('defeated'))){
        const randNum = Math.floor(Math.random() * 22);
        card.style.setProperty('--defeat-msg', `"${defeatedMessage[randNum]}"`);
        card.classList.add('defeated');
    }
    else if(!isDefeated){
        card.classList.remove('defeated');
    }
}

function commanderDamageButtons(totalPlayers, targetId) {
    let html = '';
    for(let attackerId = 1; attackerId <= totalPlayers; attackerId++){
        // Don't show a commander damage tracker for yourself
        if(attackerId !== targetId){
            html += `
                <div class="cmdr-row">
                    <small>From P${attackerId}</small>
                    <div class="damg-bttns cmdr-damg-bttns">
                        <button onclick="updateCmdr(${targetId}, ${attackerId}, -1)">-</button>
                        <b id="cmdr-target${targetId}-from${attackerId}" class="cmdr-count">0</b>
                        <button onclick="updateCmdr(${targetId}, ${attackerId}, 1)">+</button>
                    </div>
                </div>
            `;
        }
    }
    return html;
}

function toggleCmdrMenu(id, event) {
    // Prevent the click from immediately triggering the "click-off" listener
    event.stopPropagation();
    
    const menu = document.getElementById(`cmdr-menu-${id}`);
    const isHidden = menu.classList.contains('hidden');
    
    // Close all other open menus first
    closeAllMenus();
    
    if (isHidden) {
        // Reset all positioning before measuring so stale styles don't skew getBoundingClientRect()
        menu.style.top = '100%';
        menu.style.bottom = 'auto';
        menu.style.left = '0';
        menu.style.right = 'auto';
        menu.classList.remove('hidden');

        // --- Overflow Correction Logic ---
        const rect = menu.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        // Horizontal: flip left if right edge overflows
        if (rect.right > viewportWidth) {
            menu.style.left = 'auto';
            menu.style.right = '0';
        }

        // Vertical: flip upward if bottom edge overflows viewport
        if (rect.bottom > viewportHeight) {
            menu.style.top = 'auto';
            menu.style.bottom = '100%';
        }
    }
}

function closeAllMenus() {
    document.querySelectorAll('.cmdr-menu-dropdown').forEach(menu => {
        menu.classList.add('hidden');
        // Clear inline styles so next open always starts from a clean slate
        menu.style.top = '';
        menu.style.bottom = '';
        menu.style.left = '';
        menu.style.right = '';
    });
}

// Global listener: Close menus when clicking anywhere else
document.addEventListener('click', (event) => {
    const isInsideMenu = event.target.closest('.cmdr-menu-dropdown');
    const isToggleButton = event.target.closest('.menu-toggle-btn');
    
    if (!isInsideMenu && !isToggleButton) {
        closeAllMenus();
    }
});

// Existing Controls
function addPlayer() { if (playerCount < 8) { playerCount++; createPlayerCards(); } }
function removePlayer() { if (playerCount > 1) { playerCount--; createPlayerCards(); } }
function resetGame() { playerCount = 4; createPlayerCards(); }

createPlayerCards();