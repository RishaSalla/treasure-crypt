const TILE_SIZE = 35;
let currentLevelIndex = 0;
let currentMap = [];
let playerPos = { x: 0, y: 0 };
let moves = 0;
let playerFacingRight = true;

const container = document.getElementById('game-container');

window.onload = function() {
    const saved = localStorage.getItem('treasure_crypt_progress');
    currentLevelIndex = saved ? parseInt(saved) : 0;
    loadLevel(currentLevelIndex);
    setupCheat(); // تفعيل الزر السري
    document.addEventListener('keydown', handleInput);
};

function loadLevel(index) {
    if(index >= levels.length) { alert("أنت عبقري يا كوتو موتو!"); index = 0; }
    currentLevelIndex = index;
    localStorage.setItem('treasure_crypt_progress', index);
    moves = 0;
    
    currentMap = levels[index].map(row => row.split('').map(c => {
        if(c==='#') return 1; if(c==='$') return 2; if(c==='.') return 3;
        if(c==='@') return 4; if(c==='*') return 5; return 0;
    }));
    
    findPlayer();
    render();
}

function findPlayer() {
    for(let y=0; y<currentMap.length; y++) {
        for(let x=0; x<currentMap[y].length; x++) {
            if(currentMap[y][x] === 4) { 
                playerPos = {x, y}; 
                currentMap[y][x] = (levels[currentLevelIndex][y][x] === '+') ? 3 : 0; 
            }
        }
    }
}

function render() {
    container.innerHTML = '';
    const maxWidth = Math.max(...currentMap.map(r => r.length));
    container.style.width = (maxWidth * TILE_SIZE) + 'px';
    container.style.height = (currentMap.length * TILE_SIZE) + 'px';

    currentMap.forEach((row, y) => {
        row.forEach((cell, x) => {
            const floor = document.createElement('div');
            floor.className = 'cell ' + (cell===1?'wall':cell===3||cell===5?'goal':'floor');
            floor.style.left = x*TILE_SIZE+'px'; floor.style.top = y*TILE_SIZE+'px';
            container.appendChild(floor);

            if(cell===2 || cell===5) {
                const box = document.createElement('div');
                box.className = 'cell box ' + (cell===5?'completed':'');
                box.style.left = x*TILE_SIZE+'px'; box.style.top = y*TILE_SIZE+'px';
                container.appendChild(box);
            }
        });
    });
    
    const p = document.createElement('div');
    p.className = 'cell player' + (playerFacingRight ? '' : ' facing-left');
    p.style.left = playerPos.x*TILE_SIZE+'px'; p.style.top = playerPos.y*TILE_SIZE+'px';
    container.appendChild(p);
    
    document.getElementById('level-display').innerText = currentLevelIndex + 1;
    document.getElementById('moves-display').innerText = moves;
}

function moveLogic(dx, dy) {
    if(dx !== 0) playerFacingRight = (dx > 0);
    let nx = playerPos.x + dx, ny = playerPos.y + dy;
    if(currentMap[ny][nx] === 1) return;
    
    if(currentMap[ny][nx] === 2 || currentMap[ny][nx] === 5) {
        let bx = nx+dx, by = ny+dy;
        if(currentMap[by][bx] === 0 || currentMap[by][bx] === 3) {
            currentMap[by][bx] = currentMap[by][bx] === 3 ? 5 : 2;
            currentMap[ny][nx] = (levels[currentLevelIndex][ny][nx] === '.' || levels[currentLevelIndex][ny][nx] === '*') ? 3 : 0;
        } else return;
    }
    playerPos = {x: nx, y: ny}; moves++;
    render();
    if(!currentMap.some(r => r.includes(2))) document.getElementById('win-popup').style.display='flex';
}

function setupCheat() {
    const trigger = document.getElementById('cheat-trigger');
    let timer;
    // الزر السري: ضغط مطول 1.5 ثانية على عنوان اللعبة
    trigger.onmousedown = () => timer = setTimeout(() => { alert("🔓 تخطي كوتو موتو!"); nextLevel(); }, 1500);
    trigger.onmouseup = () => clearTimeout(timer);
}

function handleInput(e) {
    if(e.key === "ArrowUp") moveLogic(0, -1);
    if(e.key === "ArrowDown") moveLogic(0, 1);
    if(e.key === "ArrowLeft") moveLogic(-1, 0);
    if(e.key === "ArrowRight") moveLogic(1, 0);
}

function nextLevel() {
    document.getElementById('win-popup').style.display='none';
    loadLevel(currentLevelIndex + 1);
}
function resetLevel() { loadLevel(currentLevelIndex); }
