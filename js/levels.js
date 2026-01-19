// --- 1. قاعدة بيانات المراحل (50 مرحلة Microban مصححة) ---
const levels = [
    ["  ###  ", "### .#  ", "#  $ ###", "#*@  #  ", "#  $ #  ", "#  ###  ", "####    "],
    ["######", "#    #", "# #  #", "# @  #", "# $* #", "# .* #", "#    #", "######"],
    ["  ####  ", "###  ###", "#      #", "# $ .  #", "# . $@ #", "########"],
    ["########", "# . .  #", "# $ $  #", "# . .  #", "#  @   #", "########"],
    ["#######", "#     #", "# .$. #", "##$@$##", "# .$. #", "#     #", "#######"],
    ["####  ", "#  #  ", "#  ###", "# $  #", "#@.  #", "######"],
    ["######", "#    #", "# .  #", "# $@ #", "# $. #", "#    #", "######"],
    ["#######", "#     #", "#  @  #", "# $ $ #", "# . . #", "#######"],
    ["#######", "# . . #", "#  $  #", "# $#$ #", "#  @  #", "#######"],
    ["  #####", "###   #", "#   $ #", "# . @ #", "#######"],
    ["#####", "#@  #", "# $ #", "#  .#", "#####"],
    ["#####", "# . #", "# $ #", "#  @#", "#####"],
    ["######", "#@ $ #", "#  . #", "######"],
    ["#######", "#@  $.#", "#######"],
    ["  ###  ", "###.#  ", "# $ @ #", "#######"],
    ["#####", "#  @#", "#$  #", "#.  #", "#####"],
    ["#####", "#.  #", "#  $#", "#@  #", "#####"],
    ["######", "#  $.#", "# @  #", "######"],
    ["#######", "#  @$ #", "#  .  #", "#######"],
    ["#######", "# . $ #", "#  @  #", "#######"],
    ["  #### ", "###  # ", "#  $ .#", "# @ ###", "####   "],
    [" ##### ", " # @ # ", " # $ # ", " # . # ", " ##### "],
    ["#######", "#     #", "# @$  #", "#  .  #", "#######"],
    ["######", "#.   #", "#  $ #", "#  @ #", "######"],
    ["######", "#  @ #", "# $  #", "#   .#", "######"],
    ["#######", "#. $ @#", "#######"],
    ["#####", "#. @#", "#$  #", "#####"],
    ["#####", "#  @#", "# $.#", "#####"],
    ["######", "# .  #", "#  $@#", "######"],
    ["#######", "#  $ .#", "#  @  #", "#######"],
    ["#####", "# . #", "# $ #", "# @ #", "#####"],
    ["######", "#  $ #", "# .@ #", "######"],
    ["#######", "#  . @#", "#  $  #", "#######"],
    ["#####", "#   #", "# @$#", "# . #", "#####"],
    ["######", "#  @ #", "#  $ #", "#  . #", "######"],
    ["#######", "# . $ #", "#   @ #", "#######"],
    ["#####", "# @ #", "# $ #", "# . #", "#####"],
    ["######", "# .  #", "#  $@#", "######"],
    ["#######", "# @$ .#", "#######"],
    ["#####", "#.  #", "# $ #", "# @ #", "#####"],
    ["######", "#. $ #", "#  @ #", "######"],
    ["#######", "# @ $.#", "#######"],
    ["#####", "#   #", "# @$#", "# . #", "#####"],
    ["######", "# .  #", "# @$ #", "######"],
    ["#######", "# . $ #", "#  @  #", "#######"],
    ["#####", "#   #", "#$@.#", "#####"],
    ["######", "#   .#", "# @$ #", "######"],
    ["#######", "# . $ #", "#  @  #", "#######"],
    ["#####", "#  .#", "#$@ #", "#####"],
    ["#######", "#  .  #", "# @$  #", "#######"]
];

// --- 2. المتغيرات والمحرك ---
const TILE_SIZE = 35;
let currentLevelIndex = 0;
let currentMap = [];
let playerPos = {x: 0, y: 0};
let moves = 0;
let playerFacingRight = true;

const container = document.getElementById('game-container');
const levelDisplay = document.getElementById('level-display');
const movesDisplay = document.getElementById('moves-display');

window.onload = function() {
    const saved = localStorage.getItem('treasure_crypt_progress');
    currentLevelIndex = saved ? parseInt(saved) : 0;
    loadLevel(currentLevelIndex);
    initCheatCode();
    document.addEventListener('keydown', handleInput);
    container.addEventListener('touchstart', handleTouchStart, {passive: false});
    container.addEventListener('touchend', handleTouchEnd, {passive: false});
};

function loadLevel(index) {
    if (index >= levels.length) {
        alert("🎉 هنيئاً لك يا كوتو موتو! ختمت اللعبة بالكامل!");
        index = 0;
    }
    currentLevelIndex = index;
    localStorage.setItem('treasure_crypt_progress', index);
    
    let rawLevel = levels[index];
    currentMap = rawLevel.map(row => row.split('').map(char => {
        if (char === '#') return 1;
        if (char === '$') return 2;
        if (char === '.') return 3;
        if (char === '@' || char === '+') return 4;
        if (char === '*') return 5;
        return 0;
    }));

    moves = 0;
    findPlayerStart();
    render();
    updateUI();
}

function findPlayerStart() {
    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            if (currentMap[y][x] === 4) {
                playerPos = {x: x, y: y};
                let char = levels[currentLevelIndex][y][x];
                currentMap[y][x] = (char === '+') ? 3 : 0;
            }
        }
    }
}

function render() {
    container.innerHTML = '';
    let maxWidth = Math.max(...currentMap.map(r => r.length));
    container.style.width = maxWidth * TILE_SIZE + 'px';
    container.style.height = currentMap.length * TILE_SIZE + 'px';

    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            let type = currentMap[y][x];
            let tile = document.createElement('div');
            tile.className = 'cell ' + (type === 1 ? 'wall' : (type === 3 ? 'goal' : 'floor'));
            tile.style.left = x * TILE_SIZE + 'px';
            tile.style.top = y * TILE_SIZE + 'px';
            container.appendChild(tile);

            if (type === 2 || type === 5) {
                let box = document.createElement('div');
                box.className = 'cell box' + (type === 5 ? ' completed' : '');
                box.style.left = x * TILE_SIZE + 'px';
                box.style.top = y * TILE_SIZE + 'px';
                container.appendChild(box);
            }
        }
    }
    let player = document.createElement('div');
    player.className = 'cell player' + (playerFacingRight ? '' : ' facing-left');
    player.style.left = playerPos.x * TILE_SIZE + 'px';
    player.style.top = playerPos.y * TILE_SIZE + 'px';
    container.appendChild(player);
}

function moveLogic(dx, dy) {
    if (dx !== 0) playerFacingRight = dx > 0;
    let nX = playerPos.x + dx, nY = playerPos.y + dy;
    if (!currentMap[nY] || currentMap[nY][nX] === 1) return;

    if (currentMap[nY][nX] === 2 || currentMap[nY][nX] === 5) {
        let aX = nX + dx, aY = nY + dy;
        if (currentMap[aY][aX] === 0 || currentMap[aY][aX] === 3) {
            currentMap[aY][aX] = (currentMap[aY][aX] === 3) ? 5 : 2;
            currentMap[nY][nX] = (currentMap[nY][nX] === 5) ? 3 : 0;
        } else return;
    }
    playerPos.x = nX; playerPos.y = nY;
    moves++; updateUI(); render(); checkWin();
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

// --- 3. الحركة السرية: ضغط مطول على الياقوتة 💎 ---
function initCheatCode() {
    const trigger = document.querySelector('h1');
    let timer;
    trigger.addEventListener('mousedown', () => timer = setTimeout(() => { alert("🔓 تخطي سري!"); nextLevel(); }, 1500));
    trigger.addEventListener('mouseup', () => clearTimeout(timer));
}

// --- 4. التحكم ---
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
