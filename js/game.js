const TILE_SIZE = 35; 
const container = document.getElementById('game-container');
const levelDisplay = document.getElementById('level-display');
const movesDisplay = document.getElementById('moves-display');

let currentLevelIndex = 0;
let currentMap = []; 
let playerPos = {x: 0, y: 0};
let playerFacingRight = true; // لتتبع اتجاه الوجه
let moves = 0;

let touchStartX = 0;
let touchStartY = 0;

window.onload = function() {
    loadLevel(currentLevelIndex);
    document.addEventListener('keydown', handleInput);
    container.addEventListener('touchstart', handleTouchStart, {passive: false});
    container.addEventListener('touchend', handleTouchEnd, {passive: false});
};

function loadLevel(index) {
    if (index >= levels.length) {
        alert("🎉 مبروك! ختمت جميع المراحل!");
        currentLevelIndex = 0;
        index = 0;
    }
    currentMap = JSON.parse(JSON.stringify(levels[index]));
    moves = 0;
    playerFacingRight = true; // إعادة تعيين الاتجاه
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
    
    // حساب العرض تلقائياً
    let maxWidth = 0;
    for(let row of currentMap) if(row.length > maxWidth) maxWidth = row.length;
    
    container.style.width = maxWidth * TILE_SIZE + 'px';
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

            // رسم الصناديق
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

    // رسم اللاعب وتحديد اتجاهه
    let player = document.createElement('div');
    player.classList.add('cell', 'player');
    
    // تطبيق الاتجاه
    if (!playerFacingRight) {
        player.classList.add('facing-left');
    }
    
    player.style.left = playerPos.x * TILE_SIZE + 'px';
    player.style.top = playerPos.y * TILE_SIZE + 'px';
    // إضافة معرف ID لتسهيل الوصول إليه عند التحريك
    player.id = 'player-entity'; 
    container.appendChild(player);
}

function handleInput(e) {
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) e.preventDefault();
    let dx = 0, dy = 0;
    if (e.key === 'ArrowUp') dy = -1;
    else if (e.key === 'ArrowDown') dy = 1;
    else if (e.key === 'ArrowLeft') dx = -1;
    else if (e.key === 'ArrowRight') dx = 1;
    else return;
    moveLogic(dx, dy);
}

function handleTouchStart(e) {
    e.preventDefault();
    touchStartX = e.changedTouches[0].screenX;
    touchStartY = e.changedTouches[0].screenY;
}
function handleTouchEnd(e) {
    e.preventDefault();
    let dx = e.changedTouches[0].screenX - touchStartX;
    let dy = e.changedTouches[0].screenY - touchStartY;
    if (Math.abs(dx) > Math.abs(dy)) moveLogic(dx > 0 ? 1 : -1, 0);
    else moveLogic(0, dy > 0 ? 1 : -1);
}

function moveLogic(dx, dy) {
    // منطق توجيه الوجه (يمين/يسار)
    if (dx === 1) playerFacingRight = true;
    else if (dx === -1) playerFacingRight = false;

    let nextX = playerPos.x + dx;
    let nextY = playerPos.y + dy;
    
    if (!currentMap[nextY] || typeof currentMap[nextY][nextX] === 'undefined') return;

    let nextTile = currentMap[nextY][nextX];
    if (nextTile === 1) return;

    // التعامل مع الصناديق
    if (nextTile === 2 || nextTile === 5) {
        let afterBoxX = nextX + dx;
        let afterBoxY = nextY + dy;
        if (!currentMap[afterBoxY] || typeof currentMap[afterBoxY][afterBoxX] === 'undefined') return;
        
        let afterBoxTile = currentMap[afterBoxY][afterBoxX];
        if (afterBoxTile === 0 || afterBoxTile === 3) {
            // تحريك الصندوق منطقياً
            currentMap[afterBoxY][afterBoxX] = (afterBoxTile === 3) ? 5 : 2;
            currentMap[nextY][nextX] = (nextTile === 5) ? 3 : 0;
            nextTile = currentMap[nextY][nextX]; // تحديث المربع القادم ليصبح فارغاً
        } else {
            return; // مسدود
        }
    }

    // تحريك اللاعب منطقياً
    playerPos.x = nextX;
    playerPos.y = nextY;
    moves++;
    
    // بدلاً من إعادة رسم كل شيء (render) مما يسبب وميضاً، سنحدث المواقع فقط
    // لكن للتبسيط وضمان عدم حدوث أخطاء رسم، سنعيد الرسم الكامل حالياً
    // لأن الأداء ممتاز مع هذا العدد من العناصر
    updateUI();
    render();
    checkWin();
}

function checkWin() {
    let remainingBoxes = 0;
    for (let row of currentMap) for (let cell of row) if (cell === 2) remainingBoxes++;
    if (remainingBoxes === 0) {
        setTimeout(() => {
            alert("✨ أحسنت! المستوى التالي...");
            currentLevelIndex++;
            loadLevel(currentLevelIndex);
        }, 100);
    }
}
