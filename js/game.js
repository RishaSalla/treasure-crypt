// === تعديل هام: تغيير حجم الشبكة ليتطابق مع CSS ===
const TILE_SIZE = 35; // كان 50، أصبح 35 ليتناسب مع الخرائط الكبيرة

const container = document.getElementById('game-container');
const levelDisplay = document.getElementById('level-display');
const movesDisplay = document.getElementById('moves-display');

let currentLevelIndex = 0;
let currentMap = []; 
let playerPos = {x: 0, y: 0};
let moves = 0;

// متغيرات للمس
let touchStartX = 0;
let touchStartY = 0;

window.onload = function() {
    loadLevel(currentLevelIndex);
    document.addEventListener('keydown', handleInput);
    
    // إضافة مستمعات اللمس (للجوال)
    container.addEventListener('touchstart', handleTouchStart, {passive: false});
    container.addEventListener('touchend', handleTouchEnd, {passive: false});
};

// ... (دوال loadLevel, render, resetLevel, checkWin تبقى كما هي) ...
// فقط تأكد أنك نسخت دوال render و loadLevel من الكود السابق
// سأعيد كتابة دوال اللمس الجديدة فقط هنا للإيجاز، أضفها في نهاية الملف

function loadLevel(index) {
    if (index >= levels.length) {
        alert("🎉 مبروك! أنهيت جميع المراحل!");
        currentLevelIndex = 0;
        index = 0;
    }
    currentMap = JSON.parse(JSON.stringify(levels[index]));
    moves = 0;
    updateUI();
    findPlayerStart();
    render();
}

function findPlayerStart() {
    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            if (currentMap[y][x] === 4) {
                playerPos = {x: x, y: y};
                currentMap[y][x] = 0; 
            }
        }
    }
}

function resetLevel() { loadLevel(currentLevelIndex); }

function updateUI() {
    if(levelDisplay) levelDisplay.innerText = currentLevelIndex + 1;
    if(movesDisplay) movesDisplay.innerText = moves;
}

function render() {
    container.innerHTML = '';
    container.style.width = currentMap[0].length * TILE_SIZE + 'px';
    container.style.height = currentMap.length * TILE_SIZE + 'px';

    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            let type = currentMap[y][x];
            let tile = document.createElement('div');
            tile.classList.add('cell');
            tile.style.left = x * TILE_SIZE + 'px';
            tile.style.top = y * TILE_SIZE + 'px';

            if (type === 1) tile.classList.add('wall');
            else if (type === 3) tile.classList.add('goal');
            else tile.classList.add('floor');

            if (type === 2 || type === 5) {
                let box = document.createElement('div');
                box.classList.add('cell', 'box');
                box.style.left = x * TILE_SIZE + 'px';
                box.style.top = y * TILE_SIZE + 'px';
                if (type === 5) {
                    box.classList.add('completed');
                    tile.classList.add('goal');
                }
                container.appendChild(box);
            }
            container.appendChild(tile);
        }
    }
    let player = document.createElement('div');
    player.classList.add('cell', 'player');
    player.style.left = playerPos.x * TILE_SIZE + 'px';
    player.style.top = playerPos.y * TILE_SIZE + 'px';
    container.appendChild(player);
}

function handleInput(e) {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }
    let dx = 0, dy = 0;
    if (e.key === 'ArrowUp') dy = -1;
    else if (e.key === 'ArrowDown') dy = 1;
    else if (e.key === 'ArrowLeft') dx = -1;
    else if (e.key === 'ArrowRight') dx = 1;
    else return;

    moveLogic(dx, dy);
}

// === منطق اللمس الجديد ===
function handleTouchStart(e) {
    e.preventDefault(); // لمنع التمرير
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}

function handleTouchEnd(e) {
    e.preventDefault();
    let touchEndX = e.changedTouches[0].screenX;
    let touchEndY = e.changedTouches[0].screenY;
    
    handleSwipe(touchStartX, touchStartY, touchEndX, touchEndY);
}

function handleSwipe(startX, startY, endX, endY) {
    let diffX = endX - startX;
    let diffY = endY - startY;
    
    // يجب أن تكون الحركة قوية كفاية لتعتبر سحباً
    if (Math.abs(diffX) < 30 && Math.abs(diffY) < 30) return;

    let dx = 0, dy = 0;
    
    // تحديد الاتجاه الأقوى (أفقي أم عمودي)
    if (Math.abs(diffX) > Math.abs(diffY)) {
        dx = diffX > 0 ? 1 : -1;
    } else {
        dy = diffY > 0 ? 1 : -1;
    }
    
    moveLogic(dx, dy);
}

// فصلنا منطق الحركة ليعمل مع اللمس ومع الكيبورد
function moveLogic(dx, dy) {
    let nextX = playerPos.x + dx;
    let nextY = playerPos.y + dy;
    let nextTile = currentMap[nextY][nextX];

    if (nextTile === 1) return;

    if (nextTile === 2 || nextTile === 5) {
        let afterBoxX = nextX + dx;
        let afterBoxY = nextY + dy;
        let afterBoxTile = currentMap[afterBoxY][afterBoxX];

        if (afterBoxTile === 0 || afterBoxTile === 3) {
            currentMap[afterBoxY][afterBoxX] = (afterBoxTile === 3) ? 5 : 2;
            if (nextTile === 5) currentMap[nextY][nextX] = 3;
            else currentMap[nextY][nextX] = 0;
            nextTile = currentMap[nextY][nextX]; 
        } else {
            return; 
        }
    }

    playerPos.x = nextX;
    playerPos.y = nextY;
    moves++;
    updateUI();
    render();
    checkWin();
}

function checkWin() {
    let remainingBoxes = 0;
    for (let row of currentMap) {
        for (let cell of row) {
            if (cell === 2) remainingBoxes++;
        }
    }
    if (remainingBoxes === 0) {
        setTimeout(() => {
            alert("✨ أحسنت!");
            currentLevelIndex++;
            loadLevel(currentLevelIndex);
        }, 100);
    }
}
