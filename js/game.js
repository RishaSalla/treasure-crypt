/* محرك لعبة سرداب الكنوز
   المهام: تحريك اللاعب، التخزين التلقائي، تفعيل التخطي السري
*/
const TILE_SIZE = 35;
let currentLevelIndex = 0;
let currentMap = [];
let playerPos = { x: 0, y: 0 };
let moves = 0;

const container = document.getElementById('game-container');
const levelDisplay = document.getElementById('level-display');
const movesDisplay = document.getElementById('moves-display');

window.onload = function() {
    // استعادة المستوى المحفوظ
    const saved = localStorage.getItem('treasure_crypt_progress');
    currentLevelIndex = saved ? parseInt(saved) : 0;
    loadLevel(currentLevelIndex);
    setupSecretCheat();
    
    document.addEventListener('keydown', handleInput);
    container.addEventListener('touchstart', handleTouchStart, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: false });
};

function loadLevel(index) {
    if (index >= levels.length) {
        alert("هنيئاً لك يا كوتو موتو! ختمت اللعبة!");
        index = 0;
    }
    currentLevelIndex = index;
    localStorage.setItem('treasure_crypt_progress', index); // حفظ التقدم
    
    const raw = levels[index];
    currentMap = raw.map(row => row.split('').map(c => {
        if (c === '#') return 1; if (c === '$') return 2;
        if (c === '.') return 3; if (c === '@' || c === '+') return 4;
        if (c === '*') return 5; return 0;
    }));

    moves = 0;
    findPlayer();
    render();
    updateUI();
}

function findPlayer() {
    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            if (currentMap[y][x] === 4) {
                playerPos = { x, y };
                const char = levels[currentLevelIndex][y][x];
                currentMap[y][x] = (char === '+' || char === '.') ? 3 : 0;
            }
        }
    }
}

function render() {
    container.innerHTML = '';
    const maxWidth = Math.max(...currentMap.map(r => r.length));
    container.style.width = maxWidth * TILE_SIZE + 'px';
    container.style.height = currentMap.length * TILE_SIZE + 'px';

    currentMap.forEach((row, y) => {
        row.forEach((cell, x) => {
            const div = document.createElement('div');
            div.className = 'cell ' + (cell === 1 ? 'wall' : (cell === 3 ? 'goal' : 'floor'));
            div.style.left = x * TILE_SIZE + 'px'; div.style.top = y * TILE_SIZE + 'px';
            container.appendChild(div);
            if (cell === 2 || cell === 5) {
                const box = document.createElement('div');
                box.className = 'cell box' + (cell === 5 ? ' completed' : '');
                box.style.left = x * TILE_SIZE + 'px'; box.style.top = y * TILE_SIZE + 'px';
                container.appendChild(box);
            }
        });
    });
    const p = document.createElement('div');
    p.className = 'cell player';
    p.style.left = playerPos.x * TILE_SIZE + 'px'; p.style.top = playerPos.y * TILE_SIZE + 'px';
    container.appendChild(p);
}

function moveLogic(dx, dy) {
    let nx = playerPos.x + dx, ny = playerPos.y + dy;
    if (!currentMap[ny] || currentMap[ny][nx] === 1) return;

    if (currentMap[ny][nx] === 2 || currentMap[ny][nx] === 5) {
        let ax = nx + dx, ay = ny + dy;
        if (currentMap[ay][ax] === 0 || currentMap[ay][ax] === 3) {
            currentMap[ay][ax] = currentMap[ay][ax] === 3 ? 5 : 2;
            currentMap[ny][nx] = currentMap[ny][nx] === 5 ? 3 : 0;
        } else return;
    }
    playerPos = { x: nx, y: ny }; moves++;
    render(); updateUI(); checkWin();
}

function checkWin() {
    if (!currentMap.some(row => row.includes(2))) {
        document.getElementById('win-popup').style.display = 'flex';
    }
}

function nextLevel() {
    document.getElementById('win-popup').style.display = 'none';
    loadLevel(currentLevelIndex + 1);
}

function resetLevel() { loadLevel(currentLevelIndex); }
function updateUI() { levelDisplay.innerText = currentLevelIndex + 1; movesDisplay.innerText = moves; }

// --- الزر السري لتخطي المرحلة (كوتو موتو الخاص) ---
function setupSecretCheat() {
    const trigger = document.getElementById('cheat-trigger');
    let timer;
    trigger.onmousedown = () => timer = setTimeout(() => { alert("🔓 تم تفعيل تخطي كوتو موتو!"); nextLevel(); }, 1500);
    trigger.onmouseup = () => clearTimeout(timer);
}

function handleInput(e) {
    if (e.key === 'ArrowUp') moveLogic(0, -1);
    if (e.key === 'ArrowDown') moveLogic(0, 1);
    if (e.key === 'ArrowLeft') moveLogic(-1, 0);
    if (e.key === 'ArrowRight') moveLogic(1, 0);
}

let tX, tY;
function handleTouchStart(e) { tX = e.touches[0].screenX; tY = e.touches[0].screenY; }
function handleTouchEnd(e) {
    let dX = e.changedTouches[0].screenX - tX, dY = e.changedTouches[0].screenY - tY;
    if (Math.abs(dX) > Math.abs(dY)) moveLogic(dX > 0 ? 1 : -1, 0);
    else moveLogic(0, dY > 0 ? 1 : -1);
}
