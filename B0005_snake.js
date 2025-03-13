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
    if (pos.x < 0 || pos.x >= canvas.width / 20 || 
        pos.y < 0 || pos.y >= canvas.height / 20) {
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
    return isCollision(nextPos);
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
    // 随机生成食物位置
    const maxX = Math.floor(canvas.width / gridSize);
    const maxY = Math.floor(canvas.height / gridSize);
    
    // 创建可用位置列表（排除蛇身占据的位置）
    const availablePositions = [];
    
    for (let x = 0; x < maxX; x++) {
        for (let y = 0; y < maxY; y++) {
            let isAvailable = true;
            
            // 检查该位置是否被蛇身占据
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
    
    // 如果有可用位置，随机选择一个
    if (availablePositions.length > 0) {
        const randomIndex = Math.floor(Math.random() * availablePositions.length);
        food = availablePositions[randomIndex];
        console.log("食物生成在:", food.x, food.y); // 调试信息
    } else {
        console.log("没有可用位置生成食物");
        // 游戏胜利，蛇已经占满整个游戏区域
        gameOver();
    }
}

// 绘制网格
function drawGrid() {
    const gridSize = 20;
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
    
    // 调试信息 - 在食物位置显示坐标
    ctx.fillStyle = 'white';
    ctx.font = '10px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`${food.x},${food.y}`, foodX, foodY);
    
    // 绘制蛇头位置信息
    const head = snake[0];
    ctx.fillStyle = 'black';
    ctx.font = '12px Arial';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(`蛇头: ${head.x},${head.y}`, 10, 10);
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
        console.log("吃到食物!"); // 调试信息
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
    const gridWidth = Math.floor(canvas.width / 20);
    const gridHeight = Math.floor(canvas.height / 20);
    
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
    // 检查尺寸是否合适
    if (width < 2 || height < 2) {
        return [];
    }
    
    // 对于偶数尺寸的网格，使用标准算法
    if (width % 2 === 0 && height % 2 === 0) {
        return buildEvenSizeHamiltonPath(width, height);
    } else {
        // 对于奇数尺寸的网格，使用修改后的算法
        return buildOddSizeHamiltonPath(width, height);
    }
}

// 为偶数尺寸网格构建汉密尔顿路径
function buildEvenSizeHamiltonPath(width, height) {
    const path = [];
    
    // 对于偶数尺寸网格，我们使用蛇形模式
    for (let y = 0; y < height; y++) {
        if (y % 2 === 0) {
            // 从左到右
            for (let x = 0; x < width; x++) {
                path.push({x, y});
            }
        } else {
            // 从右到左
            for (let x = width - 1; x >= 0; x--) {
                path.push({x, y});
            }
        }
    }
    
    return path;
}

// 为奇数尺寸网格构建汉密尔顿路径
function buildOddSizeHamiltonPath(width, height) {
    const path = [];
    
    // 对于奇数尺寸网格，我们使用修改后的算法
    // 先处理偶数部分
    const evenWidth = width - (width % 2);
    const evenHeight = height - (height % 2);
    
    // 构建基本路径（偶数部分）
    for (let y = 0; y < evenHeight; y++) {
        if (y % 2 === 0) {
            // 从左到右
            for (let x = 0; x < evenWidth; x++) {
                path.push({x, y});
            }
        } else {
            // 从右到左
            for (let x = evenWidth - 1; x >= 0; x--) {
                path.push({x, y});
            }
        }
    }
    
    // 处理额外的奇数行（如果有）
    if (height > evenHeight) {
        // 添加连接到最后一行
        path.push({x: 0, y: evenHeight});
        
        // 从左到右遍历最后一行
        for (let x = 1; x < width; x++) {
            path.push({x, y: evenHeight});
        }
    }
    
    // 处理额外的奇数列（如果有）
    if (width > evenWidth && evenHeight > 0) {
        // 从下到上遍历最后一列
        for (let y = evenHeight - 1; y >= 0; y--) {
            path.push({x: evenWidth, y});
        }
    }
    
    // 添加连接路径，确保回到起点
    if (path.length > 0) {
        const start = path[0];
        const end = path[path.length - 1];
        
        // 如果路径没有形成循环，添加连接
        if (start.x !== end.x || start.y !== end.y) {
            // 添加连接路径
            if (end.x === 0) {
                // 如果结束在左侧，向上移动
                for (let y = end.y - 1; y >= start.y; y--) {
                    path.push({x: 0, y});
                }
            } else {
                // 否则，先移动到左侧，再向上
                for (let x = end.x - 1; x >= 0; x--) {
                    path.push({x, y: end.y});
                }
                
                for (let y = end.y - 1; y >= start.y; y--) {
                    path.push({x: 0, y});
                }
            }
        }
    }
    
    return path;
}

// AI控制函数
function aiControl() {
    // 如果启用了汉密尔顿路径，使用它来控制蛇
    if (useHamiltonPath && hamiltonPath.length > 0) {
        hamiltonPathControl();
    } else {
        // 否则使用简单的寻路算法
        simplePathfinding();
    }
}

// 使用汉密尔顿路径控制蛇
function hamiltonPathControl() {
    const head = snake[0];
    const headKey = `${head.x},${head.y}`;
    
    // 如果蛇头不在汉密尔顿路径上，使用简单寻路
    if (!(headKey in hamiltonMap)) {
        simplePathfinding();
        return;
    }
    
    // 获取蛇头在汉密尔顿路径中的索引
    const headIndex = hamiltonMap[headKey];
    
    // 获取食物在汉密尔顿路径中的索引
    const foodKey = `${food.x},${food.y}`;
    const foodIndex = hamiltonMap[foodKey];
    
    // 计算下一个位置的索引
    let nextIndex = (headIndex + 1) % hamiltonPath.length;
    
    // 优化：如果食物在前方，并且蛇的长度允许，可以尝试捷径
    if (foodIndex !== undefined && snake.length < hamiltonPath.length / 2) {
        // 检查食物是否在前方
        let distanceFollowingPath;
        if (foodIndex > headIndex) {
            distanceFollowingPath = foodIndex - headIndex;
        } else {
            distanceFollowingPath = hamiltonPath.length - headIndex + foodIndex;
        }
        
        // 尝试直接朝向食物的方向
        const possibleDirections = ['up', 'right', 'down', 'left'];
        for (const dir of possibleDirections) {
            // 避免180度转弯
            if ((dir === 'up' && direction === 'down') ||
                (dir === 'down' && direction === 'up') ||
                (dir === 'left' && direction === 'right') ||
                (dir === 'right' && direction === 'left')) {
                continue;
            }
            
            const nextPos = getNextPosition(head, dir);
            const nextPosKey = `${nextPos.x},${nextPos.y}`;
            
            // 检查这个方向是否安全且更接近食物
            if (!isCollision(nextPos) && nextPosKey in hamiltonMap) {
                const nextPosIndex = hamiltonMap[nextPosKey];
                let distanceDirectPath;
                
                if (foodIndex > nextPosIndex) {
                    distanceDirectPath = foodIndex - nextPosIndex;
                } else {
                    distanceDirectPath = hamiltonPath.length - nextPosIndex + foodIndex;
                }
                
                // 如果直接路径更短，使用它
                if (distanceDirectPath < distanceFollowingPath) {
                    direction = dir;
                    return;
                }
            }
        }
    }
    
    // 默认情况下，遵循汉密尔顿路径
    const nextPos = hamiltonPath[nextIndex];
    
    // 确定移动方向
    if (nextPos.x > head.x) {
        direction = 'right';
    } else if (nextPos.x < head.x) {
        direction = 'left';
    } else if (nextPos.y > head.y) {
        direction = 'down';
    } else if (nextPos.y < head.y) {
        direction = 'up';
    }
}

// 简单的寻路算法，当蛇不在汉密尔顿路径上时使用
function simplePathfinding() {
    const head = snake[0];
    const directions = ['up', 'right', 'down', 'left'];
    
    // 首先尝试朝向食物的方向
    let preferredDirections = [];
    
    // 水平方向优先级
    if (food.x > head.x) {
        preferredDirections.push('right');
    } else if (food.x < head.x) {
        preferredDirections.push('left');
    }
    
    // 垂直方向优先级
    if (food.y > head.y) {
        preferredDirections.push('down');
    } else if (food.y < head.y) {
        preferredDirections.push('up');
    }
    
    // 随机打乱其他方向
    const otherDirections = directions.filter(dir => !preferredDirections.includes(dir));
    shuffleArray(otherDirections);
    
    // 合并方向列表
    const allDirections = [...preferredDirections, ...otherDirections];
    
    // 尝试每个方向，选择第一个不会导致碰撞的方向
    for (const dir of allDirections) {
        // 避免180度转弯
        if ((dir === 'up' && direction === 'down') ||
            (dir === 'down' && direction === 'up') ||
            (dir === 'left' && direction === 'right') ||
            (dir === 'right' && direction === 'left')) {
            continue;
        }
        
        if (!willCollide(dir)) {
            direction = dir;
            break;
        }
    }
}

// 验证食物可达性
function verifyFoodAccessibility() {
    // 如果蛇的长度已经接近游戏区域的大小，可能需要更仔细地检查
    const gridSize = Math.floor(canvas.width / 20) * Math.floor(canvas.height / 20);
    if (snake.length > gridSize * 0.7) {
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
    const gridWidth = Math.floor(canvas.width / 20);
    const gridHeight = Math.floor(canvas.height / 20);
    
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