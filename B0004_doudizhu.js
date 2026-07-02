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
    
    // 检查牌型是否合法
    if (!isValidPlay(selectedCards)) {
        alert('出牌不符合规则！');
        return;
    }
    
    // 检查是否能压过上一家的牌（如果不是先手）
    if (gameState.lastPlayer !== -1 && gameState.lastPlayer !== 0) {
        if (!canBeat(gameState.lastPlayedCards, selectedCards)) {
            alert('你出的牌不能压过上一家！');
            return;
        }
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

// 电脑回合
function computerTurn() {
    playComputerTurn(1, () => {
        if (gameState.players[1].cards.length === 0) {
            alert(`${gameState.players[1].name}获胜！`);
            initGame();
            return;
        }
        
        setTimeout(() => {
            playComputerTurn(2, () => {
                if (gameState.players[2].cards.length === 0) {
                    alert(`${gameState.players[2].name}获胜！`);
                    initGame();
                    return;
                }
                
                gameState.currentPlayer = 0;
                document.getElementById('currentPlayer').textContent = gameState.players[0].name;
            });
        }, 1000);
    });
}

// 单个电脑玩家出牌
function playComputerTurn(playerIndex, callback) {
    const player = gameState.players[playerIndex];
    const playableCards = findPlayableCards(player.cards);
    
    if (playableCards.length > 0) {
        const selectedCards = playableCards[Math.floor(Math.random() * playableCards.length)];
        
        gameState.lastPlayedCards = selectedCards.cards;
        gameState.lastPlayer = playerIndex;
        
        selectedCards.indices.sort((a, b) => b - a);
        selectedCards.indices.forEach(index => {
            player.cards.splice(index, 1);
        });
        
        alert(`${player.name}出了${selectedCards.cards.length}张牌`);
    } else {
        alert(`${player.name}选择不出`);
    }
    
    callback();
}

// 查找可出的牌
function findPlayableCards(cards) {
    const playable = [];
    
    if (gameState.lastPlayer === -1 || gameState.lastPlayer === 0) {
        for (let i = 0; i < cards.length; i++) {
            const single = [cards[i]];
            if (isValidPlay(single)) {
                playable.push({ cards: [...single], indices: [i] });
            }
        }
        
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                const pair = [cards[i], cards[j]];
                if (isValidPlay(pair)) {
                    playable.push({ cards: [...pair], indices: [i, j] });
                }
            }
        }
    } else {
        for (let i = 0; i < cards.length; i++) {
            const single = [cards[i]];
            if (isValidPlay(single) && canBeat(gameState.lastPlayedCards, single)) {
                playable.push({ cards: [...single], indices: [i] });
            }
        }
        
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                const pair = [cards[i], cards[j]];
                if (isValidPlay(pair) && canBeat(gameState.lastPlayedCards, pair)) {
                    playable.push({ cards: [...pair], indices: [i, j] });
                }
            }
        }
        
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                for (let k = j + 1; k < cards.length; k++) {
                    const triple = [cards[i], cards[j], cards[k]];
                    if (isValidPlay(triple) && canBeat(gameState.lastPlayedCards, triple)) {
                        playable.push({ cards: [...triple], indices: [i, j, k] });
                    }
                }
            }
        }
        
        for (let i = 0; i < cards.length; i++) {
            for (let j = i + 1; j < cards.length; j++) {
                for (let k = j + 1; k < cards.length; k++) {
                    for (let l = k + 1; l < cards.length; l++) {
                        const four = [cards[i], cards[j], cards[k], cards[l]];
                        if (isValidPlay(four) && canBeat(gameState.lastPlayedCards, four)) {
                            playable.push({ cards: [...four], indices: [i, j, k, l] });
                        }
                    }
                }
            }
        }
    }
    
    return playable;
}

// 检查出牌是否合法
function isValidPlay(cards) {
    if (cards.length === 0) return false;
    
    const cardType = getCardType(cards);
    return cardType !== null;
}

// 获取牌型
function getCardType(cards) {
    const values = cards.map(c => c.value);
    const sortedValues = [...values].sort((a, b) => getCardValue(a) - getCardValue(b));
    
    if (cards.length === 1) {
        return { type: 'single', value: getCardValue(sortedValues[0]) };
    }
    
    if (cards.length === 2) {
        if (sortedValues[0] === sortedValues[1]) {
            return { type: 'pair', value: getCardValue(sortedValues[0]) };
        }
        if (values.includes('Joker') && values.filter(v => v === 'Joker').length === 2) {
            return { type: 'rocket', value: Infinity };
        }
        return null;
    }
    
    if (cards.length === 3) {
        if (sortedValues[0] === sortedValues[1] && sortedValues[1] === sortedValues[2]) {
            return { type: 'triple', value: getCardValue(sortedValues[0]) };
        }
        return null;
    }
    
    if (cards.length === 4) {
        if (sortedValues[0] === sortedValues[1] && sortedValues[1] === sortedValues[2] && sortedValues[2] === sortedValues[3]) {
            return { type: 'bomb', value: getCardValue(sortedValues[0]) };
        }
        
        const valueCounts = getValueCounts(cards);
        const tripleValue = Object.keys(valueCounts).find(k => valueCounts[k] === 3);
        const singleValue = Object.keys(valueCounts).find(k => valueCounts[k] === 1);
        if (tripleValue && singleValue) {
            return { type: 'triple_single', value: getCardValue(tripleValue) };
        }
        return null;
    }
    
    if (cards.length === 5) {
        const valueCounts = getValueCounts(cards);
        const pairValue = Object.keys(valueCounts).find(k => valueCounts[k] === 2);
        const tripleValue = Object.keys(valueCounts).find(k => valueCounts[k] === 3);
        if (pairValue && tripleValue) {
            return { type: 'triple_pair', value: getCardValue(tripleValue) };
        }
        
        if (isStraight(sortedValues)) {
            return { type: 'straight', value: getCardValue(sortedValues[sortedValues.length - 1]) };
        }
        return null;
    }
    
    if (cards.length >= 5 && cards.length <= 12 && cards.length % 1 === 0) {
        if (isStraight(sortedValues)) {
            return { type: 'straight', value: getCardValue(sortedValues[sortedValues.length - 1]) };
        }
    }
    
    if (cards.length >= 6 && cards.length % 2 === 0) {
        if (isDoubleStraight(sortedValues)) {
            return { type: 'double_straight', value: getCardValue(sortedValues[sortedValues.length - 1]) };
        }
    }
    
    if (cards.length >= 6 && cards.length % 3 === 0) {
        if (isTripleStraight(sortedValues)) {
            return { type: 'triple_straight', value: getCardValue(sortedValues[sortedValues.length - 1]) };
        }
    }
    
    return null;
}

// 获取牌的值（用于比较）
function getCardValue(value) {
    const cardOrder = { '3': 3, '4': 4, '5': 5, '6': 6, '7': 7, '8': 8, '9': 9, '10': 10, 'J': 11, 'Q': 12, 'K': 13, 'A': 14, '2': 15 };
    return cardOrder[value] || 0;
}

// 获取牌值计数
function getValueCounts(cards) {
    const counts = {};
    cards.forEach(c => {
        counts[c.value] = (counts[c.value] || 0) + 1;
    });
    return counts;
}

// 检查是否是顺子
function isStraight(values) {
    for (let i = 1; i < values.length; i++) {
        if (getCardValue(values[i]) - getCardValue(values[i - 1]) !== 1) {
            return false;
        }
    }
    return getCardValue(values[0]) < 15 && getCardValue(values[values.length - 1]) <= 14;
}

// 检查是否是连对
function isDoubleStraight(values) {
    if (values.length % 2 !== 0) return false;
    for (let i = 0; i < values.length; i += 2) {
        if (values[i] !== values[i + 1]) return false;
        if (i + 2 < values.length && getCardValue(values[i + 2]) - getCardValue(values[i]) !== 1) {
            return false;
        }
    }
    return getCardValue(values[0]) < 15;
}

// 检查是否是飞机（三顺）
function isTripleStraight(values) {
    if (values.length % 3 !== 0) return false;
    for (let i = 0; i < values.length; i += 3) {
        if (values[i] !== values[i + 1] || values[i + 1] !== values[i + 2]) return false;
        if (i + 3 < values.length && getCardValue(values[i + 3]) - getCardValue(values[i]) !== 1) {
            return false;
        }
    }
    return getCardValue(values[0]) < 15;
}

// 比较两副牌是否能压过
function canBeat(lastCards, newCards) {
    if (lastCards.length === 0) return true;
    
    const lastType = getCardType(lastCards);
    const newType = getCardType(newCards);
    
    if (!lastType || !newType) return false;
    
    if (newType.type === 'rocket') return true;
    if (lastType.type === 'rocket') return false;
    
    if (newType.type === 'bomb') {
        return lastType.type !== 'bomb' || newType.value > lastType.value;
    }
    if (lastType.type === 'bomb') return false;
    
    if (lastType.type !== newType.type) return false;
    
    if (lastCards.length !== newCards.length) return false;
    
    return newType.value > lastType.value;
}