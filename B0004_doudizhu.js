// 游戏状态
let gameState = {
    deck: [],
    players: [
        { name: '玩家1', cards: [] },
        { name: '电脑1', cards: [] },
        { name: '电脑2', cards: [] }
    ],
    currentPlayer: 0,
    selectedCards: [],
    lastPlayedCards: [],
    lastPlayer: -1
};

// 卡牌定义
const cardValues = ['3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A', '2'];
const cardSuits = ['♠', '♥', '♣', '♦'];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    initGame();
});

// 初始化游戏
function initGame() {
    // 创建牌组
    createDeck();
    
    // 洗牌
    shuffleDeck();
    
    // 发牌
    dealCards();
    
    // 渲染玩家手牌
    renderPlayerHand();
}

// 创建牌组
function createDeck() {
    gameState.deck = [];
    
    // 添加普通牌
    for (let value of cardValues) {
        for (let suit of cardSuits) {
            gameState.deck.push({ value, suit });
        }
    }
    
    // 添加大小王
    gameState.deck.push({ value: 'Joker', suit: 'Black' });
    gameState.deck.push({ value: 'Joker', suit: 'Red' });
}

// 洗牌
function shuffleDeck() {
    for (let i = gameState.deck.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [gameState.deck[i], gameState.deck[j]] = [gameState.deck[j], gameState.deck[i]];
    }
}

// 发牌
function dealCards() {
    // 清空所有玩家手牌
    gameState.players.forEach(player => player.cards = []);
    
    // 每个玩家发17张牌
    for (let i = 0; i < 17; i++) {
        for (let j = 0; j < 3; j++) {
            gameState.players[j].cards.push(gameState.deck.pop());
        }
    }
    
    // 剩下的3张牌作为地主牌（暂不处理）
    
    // 对玩家手牌排序
    sortPlayerCards();
}

// 对玩家手牌排序
function sortPlayerCards() {
    const cardOrder = {};
    cardValues.forEach((value, index) => cardOrder[value] = index);
    cardOrder['Joker'] = cardValues.length;
    
    gameState.players.forEach(player => {
        player.cards.sort((a, b) => {
            if (a.value === 'Joker' && b.value === 'Joker') {
                return a.suit === 'Red' ? 1 : -1;
            }
            return cardOrder[a.value] - cardOrder[b.value];
        });
    });
}

// 渲染玩家手牌
function renderPlayerHand() {
    const playerHand = document.getElementById('playerHand');
    playerHand.innerHTML = '';
    
    gameState.players[0].cards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'card';
        cardElement.dataset.index = index;
        
        // 设置卡牌内容
        if (card.value === 'Joker') {
            cardElement.textContent = card.suit === 'Red' ? '大王' : '小王';
            cardElement.style.color = card.suit === 'Red' ? 'red' : 'black';
        } else {
            cardElement.textContent = card.suit + card.value;
            cardElement.style.color = (card.suit === '♥' || card.suit === '♦') ? 'red' : 'black';
        }
        
        // 添加点击事件
        cardElement.addEventListener('click', () => selectCard(index));
        
        playerHand.appendChild(cardElement);
    });
}

// 选择卡牌
function selectCard(index) {
    const cardElement = document.querySelector(`.card[data-index="${index}"]`);
    
    if (cardElement.classList.contains('selected')) {
        // 取消选择
        cardElement.classList.remove('selected');
        gameState.selectedCards = gameState.selectedCards.filter(i => i !== index);
    } else {
        // 选择卡牌
        cardElement.classList.add('selected');
        gameState.selectedCards.push(index);
    }
}

// 出牌
function playCards() {
    if (gameState.selectedCards.length === 0) {
        alert('请选择要出的牌！');
        return;
    }
    
    // 获取选中的牌
    const selectedCards = gameState.selectedCards.map(index => gameState.players[0].cards[index]);
    
    // 检查牌型是否合法（简化版）
    if (!isValidPlay(selectedCards)) {
        alert('出牌不符合规则！');
        return;
    }
    
    // 记录最后出牌
    gameState.lastPlayedCards = selectedCards;
    gameState.lastPlayer = 0;
    
    // 从手牌中移除出的牌
    gameState.selectedCards.sort((a, b) => b - a);
    gameState.selectedCards.forEach(index => {
        gameState.players[0].cards.splice(index, 1);
    });
    
    // 清空选中状态
    gameState.selectedCards = [];
    
    // 检查游戏是否结束
    if (gameState.players[0].cards.length === 0) {
        alert('恭喜你获胜！');
        initGame();
        return;
    }
    
    // 轮到下一个玩家
    gameState.currentPlayer = 1;
    document.getElementById('currentPlayer').textContent = gameState.players[1].name;
    
    // 重新渲染手牌
    renderPlayerHand();
    
    // 电脑玩家回合（简化版）
    setTimeout(computerTurn, 1000);
}

// 不出
function pass() {
    if (gameState.lastPlayer === 0) {
        alert('你必须出牌！');
        return;
    }
    
    // 轮到下一个玩家
    gameState.currentPlayer = 1;
    document.getElementById('currentPlayer').textContent = gameState.players[1].name;
    
    // 电脑玩家回合
    setTimeout(computerTurn, 1000);
}

// 电脑回合（简化版）
function computerTurn() {
    // 电脑1出牌
    let played = false;
    
    // 简单AI：随机出一张牌
    if (Math.random() > 0.3) {
        const randomIndex = Math.floor(Math.random() * gameState.players[1].cards.length);
        const card = gameState.players[1].cards[randomIndex];
        
        gameState.lastPlayedCards = [card];
        gameState.lastPlayer = 1;
        gameState.players[1].cards.splice(randomIndex, 1);
        played = true;
        
        alert(`${gameState.players[1].name}出了一张牌`);
    } else {
        alert(`${gameState.players[1].name}选择不出`);
    }
    
    // 检查游戏是否结束
    if (gameState.players[1].cards.length === 0) {
        alert(`${gameState.players[1].name}获胜！`);
        initGame();
        return;
    }
    
    // 电脑2出牌
    setTimeout(() => {
        if (Math.random() > 0.3) {
            const randomIndex = Math.floor(Math.random() * gameState.players[2].cards.length);
            const card = gameState.players[2].cards[randomIndex];
            
            gameState.lastPlayedCards = [card];
            gameState.lastPlayer = 2;
            gameState.players[2].cards.splice(randomIndex, 1);
            
            alert(`${gameState.players[2].name}出了一张牌`);
        } else {
            alert(`${gameState.players[2].name}选择不出`);
        }
        
        // 检查游戏是否结束
        if (gameState.players[2].cards.length === 0) {
            alert(`${gameState.players[2].name}获胜！`);
            initGame();
            return;
        }
        
        // 回到玩家回合
        gameState.currentPlayer = 0;
        document.getElementById('currentPlayer').textContent = gameState.players[0].name;
    }, 1000);
}

// 检查出牌是否合法（简化版）
function isValidPlay(cards) {
    // 简化版：只检查是否出了牌，不检查牌型
    return cards.length > 0;
}