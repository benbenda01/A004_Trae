// 游戏变量
let canvas, ctx;
let snake = [];
let food = {};
let direction = 'right';
let gameSpeed = 100;
let gameInterval;
let score = 0;
let isPaused = false;
let gameStarted = false;
let aiEnabled = false; // AI托管状态
let gridSize = 20; // 添加全局网格大小变量

// 汉密尔顿路径 - 预计算游戏区域的汉密尔顿回路
let hamiltonPath = [];
let hamiltonMap = {};
let useHamiltonPath = false;

// 获取下一个位置
function getNextPosition(pos, dir) {
    const nextPos = { x: pos.x, y: pos.y };
    
    switch (dir) {
        case 'up':
            nextPos.y -= 1;
            break;
        case 'down':
            nextPos.y += 1;
            break;
        case 'left':
            nextPos.x -= 1;
            break;
        case 'right':
            nextPos.x += 1;
            break;
    }
    
    return nextPos;
}

// 检查是否会碰撞
function isCollision(pos) {
    // 检查是否撞墙
    if (pos.x < 0 || pos.x >= canvas.width / gridSize || 
        pos.y < 0 || pos.y >= canvas.height / gridSize) {
        return true;
    }
    
    // 检查是否撞到蛇身
    for (let i = 0; i < snake.length; i++) {
        if (pos.x === snake[i].x && pos.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 检查移动方向是否会导致碰撞
function willCollide(dir) {
    const head = snake[0];
    const nextPos = getNextPosition(head, dir);
    
    // 检查是否撞墙
    if (nextPos.x < 0 || nextPos.x >= Math.floor(canvas.width / gridSize) || 
        nextPos.y < 0 || nextPos.y >= Math.floor(canvas.height / gridSize)) {
        return true;
    }
    
    // 检查是否撞到蛇身（排除尾部，因为尾部会移动）
    for (let i = 0; i < snake.length - 1; i++) {
        if (nextPos.x === snake[i].x && nextPos.y === snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 辅助函数 - 旋转方向
function rotateDirection(dir, rotation) {
    const directions = ['up', 'right', 'down', 'left'];
    const currentIndex = directions.indexOf(dir);
    
    if (currentIndex === -1) return dir;
    
    if (rotation === 'left') {
        return directions[(currentIndex + 3) % 4]; // 向左旋转（逆时针）
    } else if (rotation === 'right') {
        return directions[(currentIndex + 1) % 4]; // 向右旋转（顺时针）
    }
    
    return dir;
}

// 生成食物
function generateFood() {
    const maxX = Math.floor(canvas.width / gridSize);
    const maxY = Math.floor(canvas.height / gridSize);
    
    // 创建可用位置列表（排除蛇身占据的位置）
    const availablePositions = [];
    
    for (let x = 0; x < maxX; x++) {
        for (let y = 0; y < maxY; y++) {
            let isAvailable = true;
            
            for (let i = 0; i < snake.length; i++) {
                if (x === snake[i].x && y === snake[i].y) {
                    isAvailable = false;
                    break;
                }
            }
            
            if (isAvailable) {
                availablePositions.push({x, y});
            }
        }
    }
    
    // 如果没有可用位置，游戏胜利
    if (availablePositions.length === 0) {
        gameOver();
        return;
    }
    
    // 如果蛇比较长，确保生成的食物是可达的
    if (snake.length > Math.floor((maxX * maxY) * 0.3)) {
        // 找出所有可达的位置
        const reachablePositions = findReachablePositions();
        
        if (reachablePositions.length > 0) {
            // 优先选择距离较远的食物，让游戏更有挑战性
            const head = snake[0];
            reachablePositions.sort((a, b) => {
                const distA = Math.abs(a.x - head.x) + Math.abs(a.y - head.y);
                const distB = Math.abs(b.x - head.x) + Math.abs(b.y - head.y);
                return distB - distA;
            });
            
            // 选择一个距离适中的食物（前20%中随机）
            const selectionCount = Math.max(1, Math.floor(reachablePositions.length * 0.2));
            const randomIndex = Math.floor(Math.random() * selectionCount);
            food = reachablePositions[randomIndex];
        } else {
            // 如果没有可达位置，游戏结束
            gameOver();
        }
    } else {
        // 蛇比较短时，随机选择
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        food = availablePositions[randomIndex];
    }
}

// 使用BFS找出所有从蛇头可达的位置
function findReachablePositions() {
    const head = snake[0];
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);
    
    // 创建蛇身位置集合
    const snakeSet = new Set();
    for (const segment of snake) {
        snakeSet.add(`${segment.x},${segment.y}`);
    }
    
    const visited = new Set();
    const reachable = [];
    const queue = [head];
    visited.add(`${head.x},${head.y}`);
    
    const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
    ];
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        // 排除蛇头位置本身
        if (!(current.x === head.x && current.y === head.y)) {
            reachable.push({ x: current.x, y: current.y });
        }
        
        for (const dir of directions) {
            const nextX = current.x + dir.dx;
            const nextY = current.y + dir.dy;
            
            if (nextX >= 0 && nextX < gridWidth && 
                nextY >= 0 && nextY < gridHeight) {
                const key = `${nextX},${nextY}`;
                if (!visited.has(key) && !snakeSet.has(key)) {
                    visited.add(key);
                    queue.push({ x: nextX, y: nextY });
                }
            }
        }
    }
    
    return reachable;
}

// 绘制网格
function drawGrid() {
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.lineWidth = 1;
    
    // 绘制垂直线
    for (let x = 0; x <= canvas.width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    
    // 绘制水平线
    for (let y = 0; y <= canvas.height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

// 绘制游戏
function drawGame() {
    // 清空画布
    ctx.fillStyle = '#f0f2f5';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // 绘制网格背景
    drawGrid();
    
    // 绘制蛇
    snake.forEach((segment, index) => {
        // 蛇头使用不同颜色
        if (index === 0) {
            ctx.fillStyle = '#096dd9';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
            
            // 在蛇头上绘制"笨"字
            ctx.fillStyle = 'white';
            ctx.font = '16px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText('笨', segment.x * gridSize + gridSize/2, segment.y * gridSize + gridSize/2);
        } else {
            ctx.fillStyle = '#1890ff';
            ctx.fillRect(segment.x * gridSize, segment.y * gridSize, gridSize - 1, gridSize - 1);
            
            // 在蛇身上绘制序号
            ctx.fillStyle = 'white';
            ctx.font = '12px Arial';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(index.toString(), segment.x * gridSize + gridSize/2, segment.y * gridSize + gridSize/2);
        }
    });
    
    // 绘制食物
    const foodX = food.x * gridSize + gridSize/2;
    const foodY = food.y * gridSize + gridSize/2;
    const radius = gridSize/2 - 1;
    
    // 绘制一个苹果形状
    ctx.beginPath();
    ctx.arc(foodX, foodY, radius, 0, Math.PI * 2);
    ctx.fillStyle = '#ff4d4f';
    ctx.fill();
    
    // 绘制苹果柄
    ctx.fillStyle = '#52c41a';
    ctx.fillRect(foodX - 1, foodY - radius - 3, 2, 4);
    
    
}

// 更新按钮状态
function updateButtonStates() {
    const startBtn = document.getElementById('startBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const endBtn = document.getElementById('endBtn');
    const aiBtn = document.getElementById('aiBtn');
    
    if (gameStarted) {
        startBtn.textContent = '重新开始';
        pauseBtn.disabled = false;
        endBtn.disabled = false;
    } else {
        startBtn.textContent = '开始游戏';
        pauseBtn.disabled = true;
        endBtn.disabled = true;
    }
    
    if (isPaused) {
        pauseBtn.textContent = '继续';
    } else {
        pauseBtn.textContent = '暂停';
    }
    
    if (aiEnabled) {
        aiBtn.textContent = '关闭AI';
        aiBtn.classList.add('btn-danger');
        aiBtn.classList.remove('btn-primary');
    } else {
        aiBtn.textContent = 'AI托管';
        aiBtn.classList.add('btn-primary');
        aiBtn.classList.remove('btn-danger');
    }
}

// 处理键盘按键
function handleKeyPress(event) {
    if (!gameStarted || isPaused) return;
    
    switch (event.key) {
        case 'ArrowUp':
            if (direction !== 'down') direction = 'up';
            break;
        case 'ArrowDown':
            if (direction !== 'up') direction = 'down';
            break;
        case 'ArrowLeft':
            if (direction !== 'right') direction = 'left';
            break;
        case 'ArrowRight':
            if (direction !== 'left') direction = 'right';
            break;
        case ' ': // 空格键暂停/继续游戏
            pauseGame();
            break;
    }
}

// 游戏结束
function gameOver() {
    clearInterval(gameInterval);
    gameStarted = false;
    
    // 显示游戏结束界面
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOver').style.display = 'block';
    
    // 更新按钮状态
    updateButtonStates();
}

// 改变游戏速度
function changeSpeed(speed) {
    gameSpeed = speed;
    
    // 如果游戏正在运行，则重新设置游戏循环
    if (gameStarted && !isPaused) {
        clearInterval(gameInterval);
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
}

// 切换AI托管状态
function toggleAI() {
    aiEnabled = !aiEnabled;
    
    // 更新按钮状态
    updateButtonStates();
}

// 暂停游戏
function pauseGame() {
    if (!gameStarted) return;
    
    isPaused = !isPaused;
    
    if (isPaused) {
        clearInterval(gameInterval);
    } else {
        gameInterval = setInterval(gameLoop, gameSpeed);
    }
    
    updateButtonStates();
}

// 游戏循环
function gameLoop() {
    if (!gameStarted || isPaused) return;
    
    // 如果启用AI，让AI控制方向
    if (aiEnabled) {
        aiControl();
    }
    
    // 获取蛇头位置
    const head = snake[0];
    
    // 根据方向计算新的头部位置
    const newHead = getNextPosition(head, direction);
    
    // 检查是否撞墙或撞到自己
    if (newHead.x < 0 || newHead.x >= Math.floor(canvas.width / gridSize) || 
        newHead.y < 0 || newHead.y >= Math.floor(canvas.height / gridSize)) {
        gameOver();
        return;
    }
    
    // 检查是否撞到自己（除了尾部，因为它会移动）
    for (let i = 0; i < snake.length - 1; i++) {
        if (newHead.x === snake[i].x && newHead.y === snake[i].y) {
            gameOver();
            return;
        }
    }
    
    // 将新头部添加到蛇身前面
    snake.unshift(newHead);
    
    // 检查是否吃到食物
    if (newHead.x === food.x && newHead.y === food.y) {
        // 增加分数
        score += 10;
        document.getElementById('score').textContent = score;
        
        // 生成新食物
        generateFood();
    } else {
        // 如果没有吃到食物，移除尾部
        snake.pop();
    }
    
    // 重新绘制游戏
    drawGame();
}

// 开始游戏
function startGame() {
    // 重置游戏状态
    snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
    ];
    direction = 'right';
    score = 0;
    document.getElementById('score').textContent = score;
    isPaused = false;
    gameStarted = true;
    
    // 隐藏游戏结束界面
    document.getElementById('gameOver').style.display = 'none';
    
    // 生成食物
    generateFood();
    
    // 初始化汉密尔顿路径
    initHamiltonPath();
    
    // 清除之前的游戏循环
    if (gameInterval) {
        clearInterval(gameInterval);
    }
    
    // 设置游戏循环
    gameInterval = setInterval(gameLoop, gameSpeed);
    
    // 更新按钮状态
    updateButtonStates();
    
    // 绘制游戏
    drawGame();
}

// 初始化汉密尔顿路径
function initHamiltonPath() {
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);
    
    // 尝试构建汉密尔顿路径
    hamiltonPath = buildHamiltonPath(gridWidth, gridHeight);
    
    // 检查路径是否有效
    if (hamiltonPath.length > 0) {
        // 构建位置到路径索引的映射
        hamiltonMap = {};
        for (let i = 0; i < hamiltonPath.length; i++) {
            const pos = hamiltonPath[i];
            hamiltonMap[`${pos.x},${pos.y}`] = i;
        }
        
        useHamiltonPath = true;
    } else {
        useHamiltonPath = false;
    }
}

// 构建汉密尔顿路径 - 主函数
function buildHamiltonPath(width, height) {
    if (width < 2 || height < 2) {
        return [];
    }
    
    return buildSpiralHamiltonPath(width, height);
}

// 使用蛇形方式构建哈密顿回路（适用于所有尺寸）
function buildSpiralHamiltonPath(width, height) {
    const path = [];
    
    // 对于偶数宽度，使用标准蛇形
    if (width % 2 === 0) {
        // 前height-1行使用蛇形
        for (let y = 0; y < height - 1; y++) {
            if (y % 2 === 0) {
                // 偶数行：从左到右
                for (let x = 0; x < width; x++) {
                    path.push({x, y});
                }
            } else {
                // 奇数行：从右到左
                for (let x = width - 1; x >= 0; x--) {
                    path.push({x, y});
                }
            }
        }
        
        // 最后一行：特殊处理以形成回路
        // 如果height是偶数，最后一行从左到右
        // 如果height是奇数，最后一行从右到左
        if (height % 2 === 0) {
            for (let x = 0; x < width; x++) {
                path.push({x, y: height - 1});
            }
        } else {
            for (let x = width - 1; x >= 0; x--) {
                path.push({x, y: height - 1});
            }
        }
    } else {
        // 对于奇数宽度，需要特殊处理
        // 使用螺旋方式但确保形成回路
        const grid = Array(height).fill().map(() => Array(width).fill(false));
        
        let x = 0, y = 0;
        let dx = 1, dy = 0; // 初始方向：向右
        
        for (let i = 0; i < width * height; i++) {
            path.push({x, y});
            grid[y][x] = true;
            
            const nextX = x + dx;
            const nextY = y + dy;
            
            if (nextX >= 0 && nextX < width && nextY >= 0 && nextY < height && !grid[nextY][nextX]) {
                x = nextX;
                y = nextY;
            } else {
                if (dx === 1 && dy === 0) { // 向右 → 向下
                    dx = 0;
                    dy = 1;
                } else if (dx === 0 && dy === 1) { // 向下 → 向左
                    dx = -1;
                    dy = 0;
                } else if (dx === -1 && dy === 0) { // 向左 → 向上
                    dx = 0;
                    dy = -1;
                } else { // 向上 → 向右
                    dx = 1;
                    dy = 0;
                }
                x += dx;
                y += dy;
            }
        }
    }
    
    return path;
}

// AI控制函数
function aiControl() {
    const head = snake[0];
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);
    const totalCells = gridWidth * gridHeight;
    const snakeRatio = snake.length / totalCells;
    
    // 当蛇较短时（<40%），使用A*直接寻路到食物
    if (snakeRatio < 0.4) {
        const path = aStarPathfinding();
        if (path && path.length > 1) {
            const nextPos = path[1];
            const newDirection = getDirectionTo(head, nextPos);
            
            if (newDirection && !isOppositeDirection(newDirection, direction)) {
                direction = newDirection;
                return;
            }
        }
    }
    
    // 当蛇较长时（>=40%），使用边界跟踪策略
    // 这可以确保蛇始终保持一条畅通的路径
    const boundaryDirection = followBoundaryDirection();
    if (boundaryDirection) {
        if (!isOppositeDirection(boundaryDirection, direction)) {
            direction = boundaryDirection;
            return;
        }
    }
    
    // 最后手段：安全逃离策略
    safeEscapeStrategy();
}

// 检查两个方向是否相反
function isOppositeDirection(dir1, dir2) {
    return (dir1 === 'up' && dir2 === 'down') ||
           (dir1 === 'down' && dir2 === 'up') ||
           (dir1 === 'left' && dir2 === 'right') ||
           (dir1 === 'right' && dir2 === 'left');
}

// 边界跟踪策略 - 选择最安全的方向
function followBoundaryDirection() {
    const head = snake[0];
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);
    
    const directions = ['up', 'down', 'left', 'right'];
    const safeDirections = [];
    const spaceMap = {};
    
    for (const dir of directions) {
        // 避免180度转弯
        if (isOppositeDirection(dir, direction)) {
            continue;
        }
        
        const nextPos = getNextPosition(head, dir);
        
        // 检查边界
        if (nextPos.x < 0 || nextPos.x >= gridWidth || 
            nextPos.y < 0 || nextPos.y >= gridHeight) {
            continue;
        }
        
        // 检查是否撞到蛇身（不包括尾部）
        let willHit = false;
        for (let i = 0; i < snake.length - 1; i++) {
            if (nextPos.x === snake[i].x && nextPos.y === snake[i].y) {
                willHit = true;
                break;
            }
        }
        
        if (!willHit) {
            safeDirections.push(dir);
            // 计算该方向的可达空间
            spaceMap[dir] = calculateSpace(nextPos);
        }
    }
    
    if (safeDirections.length === 0) {
        return null;
    }
    
    // 优先选择空间最大的方向
    safeDirections.sort((a, b) => spaceMap[b] - spaceMap[a]);
    return safeDirections[0];
}

// 使用汉密尔顿路径控制蛇
function hamiltonPathControl() {
    const head = snake[0];
    const headKey = `${head.x},${head.y}`;
    
    // 如果蛇头不在汉密尔顿路径上，使用高级寻路
    if (!(headKey in hamiltonMap)) {
        advancedPathfinding();
        return;
    }
    
    // 获取蛇头在汉密尔顿路径中的索引
    const headIndex = hamiltonMap[headKey];
    
    // 创建蛇身位置到索引的映射
    const snakeMap = {};
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        snakeMap[`${segment.x},${segment.y}`] = i;
    }
    
    // 沿着哈密顿路径找下一个安全位置
    const totalLength = hamiltonPath.length;
    
    // 最多检查蛇长度+1步
    for (let i = 1; i <= snake.length + 1; i++) {
        const nextIndex = (headIndex + i) % totalLength;
        const nextPos = hamiltonPath[nextIndex];
        const nextPosKey = `${nextPos.x},${nextPos.y}`;
        
        // 检查该位置是否被蛇身占据
        if (nextPosKey in snakeMap) {
            const segmentIndex = snakeMap[nextPosKey];
            // 如果该段是尾部（会先离开），可以通过
            if (segmentIndex >= snake.length - i) {
                // 找到安全位置，计算方向
                const directionToTarget = getDirectionTo(head, nextPos);
                if (directionToTarget) {
                    // 避免180度转弯
                    if (!((directionToTarget === 'up' && direction === 'down') ||
                          (directionToTarget === 'down' && direction === 'up') ||
                          (directionToTarget === 'left' && direction === 'right') ||
                          (directionToTarget === 'right' && direction === 'left'))) {
                        direction = directionToTarget;
                        return;
                    }
                }
            }
        } else {
            // 该位置未被占据，直接移动
            const directionToTarget = getDirectionTo(head, nextPos);
            if (directionToTarget) {
                if (!((directionToTarget === 'up' && direction === 'down') ||
                      (directionToTarget === 'down' && direction === 'up') ||
                      (directionToTarget === 'left' && direction === 'right') ||
                      (directionToTarget === 'right' && direction === 'left'))) {
                    direction = directionToTarget;
                    return;
                }
            }
        }
    }
    
    // 如果找不到合适的路径，使用安全逃离策略
    safeEscapeStrategy();
}

// 获取从当前位置到目标位置的方向
function getDirectionTo(from, to) {
    if (to.x > from.x) return 'right';
    if (to.x < from.x) return 'left';
    if (to.y > from.y) return 'down';
    if (to.y < from.y) return 'up';
    return null;
}

// A*寻路算法 - 从蛇头到食物的最短路径（考虑蛇尾移动）
function aStarPathfinding() {
    const head = snake[0];
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);
    
    // 创建蛇身位置到索引的映射，用于判断尾部移动
    const snakeMap = {};
    for (let i = 0; i < snake.length; i++) {
        const segment = snake[i];
        snakeMap[`${segment.x},${segment.y}`] = i;
    }
    
    // A*算法节点
    class Node {
        constructor(x, y, g = 0, h = 0, parent = null) {
            this.x = x;
            this.y = y;
            this.g = g; // 从起点到当前节点的代价
            this.h = h; // 从当前节点到终点的估计代价（曼哈顿距离）
            this.f = g + h; // 总代价
            this.parent = parent;
        }
    }
    
    // 计算曼哈顿距离
    const heuristic = (x1, y1, x2, y2) => {
        return Math.abs(x1 - x2) + Math.abs(y1 - y2);
    };
    
    // 方向数组
    const directions = [
        { dx: 0, dy: -1 }, // 上
        { dx: 0, dy: 1 },  // 下
        { dx: -1, dy: 0 }, // 左
        { dx: 1, dy: 0 }   // 右
    ];
    
    // 开放列表和关闭列表
    const openList = [];
    const closedList = new Set();
    
    // 起点
    const startNode = new Node(head.x, head.y, 0, heuristic(head.x, head.y, food.x, food.y));
    openList.push(startNode);
    
    while (openList.length > 0) {
        // 找到f值最小的节点
        openList.sort((a, b) => a.f - b.f);
        const current = openList.shift();
        
        // 如果到达食物，回溯路径
        if (current.x === food.x && current.y === food.y) {
            return reconstructPath(current);
        }
        
        closedList.add(`${current.x},${current.y}`);
        
        // 检查四个方向
        for (const dir of directions) {
            const nextX = current.x + dir.dx;
            const nextY = current.y + dir.dy;
            
            // 检查边界
            if (nextX < 0 || nextX >= gridWidth || nextY < 0 || nextY >= gridHeight) {
                continue;
            }
            
            const key = `${nextX},${nextY}`;
            
            // 检查是否已访问
            if (closedList.has(key)) {
                continue;
            }
            
            // 检查是否在蛇身内 - 考虑尾部会移动
            if (key in snakeMap) {
                const segmentIndex = snakeMap[key];
                // 如果该蛇身段在尾部（索引较大），且路径长度足够长，尾部会先离开
                // 只有当路径长度 <= (蛇长度 - 该段索引) 时才会碰撞
                // current.g + 1 是到达该点的路径长度
                if (current.g + 1 <= snake.length - segmentIndex) {
                    // 蛇头到达时该段还在，不能通过
                    continue;
                }
                // 否则，尾部会先离开，可以通过
            }
            
            // 计算代价
            const g = current.g + 1;
            const h = heuristic(nextX, nextY, food.x, food.y);
            const nextNode = new Node(nextX, nextY, g, h, current);
            
            // 检查是否已在开放列表中
            const existingNode = openList.find(n => n.x === nextX && n.y === nextY);
            if (existingNode) {
                if (g < existingNode.g) {
                    existingNode.g = g;
                    existingNode.f = g + existingNode.h;
                    existingNode.parent = current;
                }
            } else {
                openList.push(nextNode);
            }
        }
    }
    
    // 如果没有找到路径，返回null
    return null;
}

// 从终点回溯路径
function reconstructPath(endNode) {
    const path = [];
    let current = endNode;
    
    while (current !== null) {
        path.unshift({ x: current.x, y: current.y });
        current = current.parent;
    }
    
    return path;
}

// 安全检查 - 检查选择某个方向后是否还有足够的空间
function isSafeDirection(dir) {
    const head = snake[0];
    const nextPos = getNextPosition(head, dir);
    
    // 检查是否会立即碰撞
    if (isCollision(nextPos)) {
        return false;
    }
    
    // 检查是否会导致死胡同（使用BFS检查可达空间）
    return hasEnoughSpace(nextPos);
}

// 检查某个位置是否有足够的活动空间
function hasEnoughSpace(pos) {
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);
    const totalCells = gridWidth * gridHeight;
    
    // 创建蛇身位置集合（排除当前头部，因为它会移动）
    const snakeSet = new Set();
    for (let i = 1; i < snake.length; i++) {
        snakeSet.add(`${snake[i].x},${snake[i].y}`);
    }
    
    // BFS计算可达格子数
    const visited = new Set();
    const queue = [pos];
    visited.add(`${pos.x},${pos.y}`);
    
    const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
    ];
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        for (const dir of directions) {
            const nextX = current.x + dir.dx;
            const nextY = current.y + dir.dy;
            
            if (nextX >= 0 && nextX < gridWidth && 
                nextY >= 0 && nextY < gridHeight) {
                const key = `${nextX},${nextY}`;
                if (!visited.has(key) && !snakeSet.has(key)) {
                    visited.add(key);
                    queue.push({ x: nextX, y: nextY });
                }
            }
        }
    }
    
    // 根据蛇的长度动态调整空间要求
    const snakeRatio = snake.length / totalCells;
    
    if (snakeRatio < 0.3) {
        // 蛇较短时，要求有足够的空间
        return visited.size >= snake.length;
    } else if (snakeRatio < 0.6) {
        // 蛇中等长度，降低要求
        return visited.size >= snake.length * 0.5;
    } else {
        // 蛇较长，只要有空间就可以
        return visited.size >= Math.max(1, totalCells - snake.length);
    }
}

// 使用A*算法的高级寻路
function advancedPathfinding() {
    const head = snake[0];
    
    // 尝试使用A*找到到食物的路径
    const path = aStarPathfinding();
    
    if (path && path.length > 1) {
        // 获取下一步位置
        const nextPos = path[1];
        
        // 确定方向
        let newDirection;
        if (nextPos.x > head.x) {
            newDirection = 'right';
        } else if (nextPos.x < head.x) {
            newDirection = 'left';
        } else if (nextPos.y > head.y) {
            newDirection = 'down';
        } else if (nextPos.y < head.y) {
            newDirection = 'up';
        }
        
        // 检查方向是否有效且安全
        if (newDirection) {
            // 避免180度转弯
            if (!((newDirection === 'up' && direction === 'down') ||
                  (newDirection === 'down' && direction === 'up') ||
                  (newDirection === 'left' && direction === 'right') ||
                  (newDirection === 'right' && direction === 'left'))) {
                
                // 安全检查
                if (isSafeDirection(newDirection)) {
                    direction = newDirection;
                    return;
                }
            }
        }
    }
    
    // 如果A*失败或不安全，使用安全逃离策略
    safeEscapeStrategy();
}

// 安全逃离策略 - 当A*无法找到安全路径时使用
function safeEscapeStrategy() {
    const head = snake[0];
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);
    
    // 计算每个方向的可移动空间
    const directions = ['up', 'down', 'left', 'right'];
    const safeDirections = [];
    const spaceMap = {};
    
    for (const dir of directions) {
        // 避免180度转弯
        if ((dir === 'up' && direction === 'down') ||
            (dir === 'down' && direction === 'up') ||
            (dir === 'left' && direction === 'right') ||
            (dir === 'right' && direction === 'left')) {
            continue;
        }
        
        const nextPos = getNextPosition(head, dir);
        
        // 检查边界和碰撞
        if (nextPos.x < 0 || nextPos.x >= gridWidth || 
            nextPos.y < 0 || nextPos.y >= gridHeight) {
            continue;
        }
        
        let isBlocked = false;
        for (const segment of snake) {
            if (nextPos.x === segment.x && nextPos.y === segment.y) {
                isBlocked = true;
                break;
            }
        }
        
        if (!isBlocked) {
            safeDirections.push(dir);
            spaceMap[dir] = calculateSpace(nextPos);
        }
    }
    
    if (safeDirections.length === 0) {
        return;
    }
    
    // 选择空间最大的方向
    safeDirections.sort((a, b) => spaceMap[b] - spaceMap[a]);
    direction = safeDirections[0];
}

// 计算某个位置的可达空间大小
function calculateSpace(pos) {
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);
    
    const snakeSet = new Set();
    for (const segment of snake) {
        snakeSet.add(`${segment.x},${segment.y}`);
    }
    
    const visited = new Set();
    const queue = [pos];
    visited.add(`${pos.x},${pos.y}`);
    
    const directions = [
        { dx: 0, dy: -1 },
        { dx: 0, dy: 1 },
        { dx: -1, dy: 0 },
        { dx: 1, dy: 0 }
    ];
    
    while (queue.length > 0) {
        const current = queue.shift();
        
        for (const dir of directions) {
            const nextX = current.x + dir.dx;
            const nextY = current.y + dir.dy;
            
            if (nextX >= 0 && nextX < gridWidth && 
                nextY >= 0 && nextY < gridHeight) {
                const key = `${nextX},${nextY}`;
                if (!visited.has(key) && !snakeSet.has(key)) {
                    visited.add(key);
                    queue.push({ x: nextX, y: nextY });
                }
            }
        }
    }
    
    return visited.size;
}

// 验证食物可达性
function verifyFoodAccessibility() {
    // 如果蛇的长度已经接近游戏区域的大小，可能需要更仔细地检查
    const totalCells = Math.floor(canvas.width / gridSize) * Math.floor(canvas.height / gridSize);
    if (snake.length > totalCells * 0.7) {
        // 使用广度优先搜索检查是否有路径从蛇头到食物
        if (!isPathToFoodExists()) {
            // 如果没有路径，重新生成食物
            generateFood();
            // 递归检查新生成的食物
            verifyFoodAccessibility();
        }
    }
}

// 使用广度优先搜索检查是否存在从蛇头到食物的路径
function isPathToFoodExists() {
    const head = snake[0];
    const gridWidth = Math.floor(canvas.width / gridSize);
    const gridHeight = Math.floor(canvas.height / gridSize);
    
    // 创建访问标记数组
    const visited = Array(gridWidth).fill().map(() => Array(gridHeight).fill(false));
    
    // 标记蛇身占据的格子为已访问
    for (const segment of snake) {
        visited[segment.x][segment.y] = true;
    }
    
    // 队列用于BFS
    const queue = [{x: head.x, y: head.y}];
    visited[head.x][head.y] = true;
    
    // 方向数组
    const directions = [
        {x: 0, y: -1}, // 上
        {x: 1, y: 0},  // 右
        {x: 0, y: 1},  // 下
        {x: -1, y: 0}  // 左
    ];
    
    // BFS
    while (queue.length > 0) {
        const current = queue.shift();
        
        // 检查是否到达食物
        if (current.x === food.x && current.y === food.y) {
            return true;
        }
        
        // 尝试四个方向
        for (const dir of directions) {
            const nextX = current.x + dir.x;
            const nextY = current.y + dir.y;
            
            // 检查是否在边界内且未访问过
            if (nextX >= 0 && nextX < gridWidth && 
                nextY >= 0 && nextY < gridHeight && 
                !visited[nextX][nextY]) {
                
                queue.push({x: nextX, y: nextY});
                visited[nextX][nextY] = true;
            }
        }
    }
    
    // 如果队列为空且未找到食物，则不存在路径
    return false;
}

// 辅助函数：打乱数组
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

// 初始化函数 - 在页面加载完成后执行
window.addEventListener('DOMContentLoaded', function() {
    // 获取canvas元素和上下文
    canvas = document.getElementById('gameBoard');
    ctx = canvas.getContext('2d');
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyPress);
    
    // 初始绘制游戏
    drawGame();
    
    // 更新按钮状态
    updateButtonStates();
});