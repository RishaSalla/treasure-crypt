const TILE_SIZE = 50; // حجم المربع 50 بكسل
const container = document.getElementById('game-container');
const levelDisplay = document.getElementById('level-display');
const movesDisplay = document.getElementById('moves-display');

let currentLevelIndex = 0;
let currentMap = []; 
let playerPos = {x: 0, y: 0};
let moves = 0;

// عند تشغيل الصفحة
window.onload = function() {
    loadLevel(currentLevelIndex);
    document.addEventListener('keydown', handleInput);
};

// دالة تحميل المرحلة
function loadLevel(index) {
    if (index >= levels.length) {
        alert("🎉 مبروك! لقد أنهيت جميع المراحل المتاحة!");
        currentLevelIndex = 0; // العودة للأولى
        index = 0;
    }
    
    // نسخ عميق للمرحلة (Deep Copy) لكي لا نعدل الملف الأصلي
    currentMap = JSON.parse(JSON.stringify(levels[index]));
    
    // تصفير العدادات
    moves = 0;
    updateUI();
    
    // البحث عن موقع البطل وتعيينه
    findPlayerStart();
    
    // رسم الشاشة
    render();
}

// دالة لتحديد موقع البطل عند البداية
function findPlayerStart() {
    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            if (currentMap[y][x] === 4) {
                playerPos = {x: x, y: y};
                // بعد تحديد مكانه، نحول الخلية تحت البطل لأرضية أو هدف
                // (سنفترض أنها أرضية 0 مبدئياً للتبسيط)
                currentMap[y][x] = 0; 
            }
        }
    }
}

// دالة إعادة المرحلة
function resetLevel() {
    loadLevel(currentLevelIndex);
}

// دالة الرسم (Render)
function render() {
    container.innerHTML = '';
    // ضبط أبعاد الحاوية بناءً على حجم المرحلة
    container.style.width = currentMap[0].length * TILE_SIZE + 'px';
    container.style.height = currentMap.length * TILE_SIZE + 'px';

    for (let y = 0; y < currentMap.length; y++) {
        for (let x = 0; x < currentMap[y].length; x++) {
            let type = currentMap[y][x];
            let tile = document.createElement('div');
            tile.classList.add('cell');
            
            tile.style.left = x * TILE_SIZE + 'px';
            tile.style.top = y * TILE_SIZE + 'px';

            // رسم الخلفية (أرض أو جدار أو هدف)
            if (type === 1) tile.classList.add('wall');
            else if (type === 3) tile.classList.add('goal');
            else tile.classList.add('floor'); // 0 is floor

            // رسم الصناديق (فوق الأرضية أو الهدف)
            if (type === 2 || type === 5) {
                let box = document.createElement('div');
                box.classList.add('cell', 'box');
                box.style.left = x * TILE_SIZE + 'px';
                box.style.top = y * TILE_SIZE + 'px';
                
                if (type === 5) {
                    box.classList.add('completed');
                    tile.classList.add('goal'); // تأكيد رسم الهدف تحت الصندوق المكتمل
                }
                container.appendChild(box);
            }
            
            container.appendChild(tile);
        }
    }

    // رسم البطل (منفصل فوق الجميع)
    let player = document.createElement('div');
    player.classList.add('cell', 'player');
    player.style.left = playerPos.x * TILE_SIZE + 'px';
    player.style.top = playerPos.y * TILE_SIZE + 'px';
    container.appendChild(player);
}

// دالة التحكم
function handleInput(e) {
    let dx = 0, dy = 0;
    
    // منع تحريك الصفحة بالأسهم
    if(["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].indexOf(e.code) > -1) {
        e.preventDefault();
    }

    if (e.key === 'ArrowUp') dy = -1;
    else if (e.key === 'ArrowDown') dy = 1;
    else if (e.key === 'ArrowLeft') dx = -1;
    else if (e.key === 'ArrowRight') dx = 1;
    else return;

    let nextX = playerPos.x + dx;
    let nextY = playerPos.y + dy;
    let nextTile = currentMap[nextY][nextX];

    // 1. الاصطدام بالجدار
    if (nextTile === 1) return;

    // 2. التعامل مع الصناديق
    if (nextTile === 2 || nextTile === 5) {
        let afterBoxX = nextX + dx;
        let afterBoxY = nextY + dy;
        let afterBoxTile = currentMap[afterBoxY][afterBoxX];

        // هل المكان وراء الصندوق فارغ (0) أو هدف (3)؟
        if (afterBoxTile === 0 || afterBoxTile === 3) {
            // حرك الصندوق في المصفوفة
            // إذا كان المكان الجديد هدفاً، يصبح الصندوق (5)، وإلا (2)
            currentMap[afterBoxY][afterBoxX] = (afterBoxTile === 3) ? 5 : 2;
            
            // المكان القديم للصندوق: هل كان هدفاً؟
            if (nextTile === 5) currentMap[nextY][nextX] = 3; // يرجع هدف
            else currentMap[nextY][nextX] = 0; // يرجع أرض

            // تحديث نوع الخلية القادمة (لأن البطل سيتحرك إليها)
            nextTile = currentMap[nextY][nextX]; 
        } else {
            return; // الصندوق لا يمكن دفعه
        }
    }

    // 3. تحريك البطل
    playerPos.x = nextX;
    playerPos.y = nextY;
    moves++;
    
    updateUI();
    render();
    checkWin();
}

function checkWin() {
    // شرط الفوز: لا يوجد أي صندوق (2) متبقي، كلها أصبحت (5)
    let remainingBoxes = 0;
    for (let row of currentMap) {
        for (let cell of row) {
            if (cell === 2) remainingBoxes++;
        }
    }

    if (remainingBoxes === 0) {
        setTimeout(() => {
            alert("✨ أحسنت! المرحلة مكتملة.");
            currentLevelIndex++;
            loadLevel(currentLevelIndex);
        }, 100);
    }
}

function updateUI() {
    levelDisplay.innerText = currentLevelIndex + 1;
    movesDisplay.innerText = moves;
}
