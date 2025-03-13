// 钢琴配置
const pianoConfig = {
    startNote: 'C3',
    endNote: 'B5',
    whiteKeyWidth: 60,
    blackKeyWidth: 40,
    whiteKeyHeight: 200,
    blackKeyHeight: 120
};

// 音符与频率映射
const noteFrequencies = {
    'C3': 130.81, 'C#3': 138.59, 'D3': 146.83, 'D#3': 155.56, 'E3': 164.81, 'F3': 174.61,
    'F#3': 185.00, 'G3': 196.00, 'G#3': 207.65, 'A3': 220.00, 'A#3': 233.08, 'B3': 246.94,
    'C4': 261.63, 'C#4': 277.18, 'D4': 293.66, 'D#4': 311.13, 'E4': 329.63, 'F4': 349.23,
    'F#4': 369.99, 'G4': 392.00, 'G#4': 415.30, 'A4': 440.00, 'A#4': 466.16, 'B4': 493.88,
    'C5': 523.25, 'C#5': 554.37, 'D5': 587.33, 'D#5': 622.25, 'E5': 659.25, 'F5': 698.46,
    'F#5': 739.99, 'G5': 783.99, 'G#5': 830.61, 'A5': 880.00, 'A#5': 932.33, 'B5': 987.77
};

// 音符顺序
const noteOrder = [
    'C3', 'C#3', 'D3', 'D#3', 'E3', 'F3', 'F#3', 'G3', 'G#3', 'A3', 'A#3', 'B3',
    'C4', 'C#4', 'D4', 'D#4', 'E4', 'F4', 'F#4', 'G4', 'G#4', 'A4', 'A#4', 'B4',
    'C5', 'C#5', 'D5', 'D#5', 'E5', 'F5', 'F#5', 'G5', 'G#5', 'A5', 'A#5', 'B5'
];

// 音频上下文
let audioContext;

// 录制相关变量
let isRecording = false;
let recordedNotes = [];
let recordStartTime;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 创建钢琴键
    createPianoKeys();
    
    // 初始化音频上下文
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
    } catch (e) {
        alert('您的浏览器不支持Web Audio API，请使用现代浏览器。');
    }
    
    // 添加键盘事件监听
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
});

// 创建钢琴键
function createPianoKeys() {
    const piano = document.getElementById('piano');
    piano.style.width = `${noteOrder.filter(note => !note.includes('#')).length * pianoConfig.whiteKeyWidth}px`;
    piano.style.height = `${pianoConfig.whiteKeyHeight}px`;
    
    // 先创建所有白键
    let whiteKeyIndex = 0;
    noteOrder.forEach(note => {
        if (!note.includes('#')) {
            const key = document.createElement('div');
            key.className = 'white-key';
            key.dataset.note = note;
            key.style.left = `${whiteKeyIndex * pianoConfig.whiteKeyWidth}px`;
            
            // 添加音符名称
            const noteName = document.createElement('div');
            noteName.className = 'note-name';
            noteName.textContent = note;
            key.appendChild(noteName);
            
            // 添加事件监听
            key.addEventListener('mousedown', () => playNote(note));
            key.addEventListener('mouseup', () => stopNote(note));
            key.addEventListener('mouseleave', () => stopNote(note));
            
            piano.appendChild(key);
            whiteKeyIndex++;
        }
    });
    
    // 再创建所有黑键
    noteOrder.forEach(note => {
        if (note.includes('#')) {
            const key = document.createElement('div');
            key.className = 'black-key';
            key.dataset.note = note;
            
            // 计算黑键位置
            const prevNote = noteOrder[noteOrder.indexOf(note) - 1];
            const prevWhiteKeyIndex = noteOrder.filter(n => !n.includes('#') && noteOrder.indexOf(n) <= noteOrder.indexOf(prevNote)).length - 1;
            key.style.left = `${prevWhiteKeyIndex * pianoConfig.whiteKeyWidth + pianoConfig.whiteKeyWidth - pianoConfig.blackKeyWidth / 2}px`;
            
            // 添加事件监听
            key.addEventListener('mousedown', () => playNote(note));
            key.addEventListener('mouseup', () => stopNote(note));
            key.addEventListener('mouseleave', () => stopNote(note));
            
            piano.appendChild(key);
        }
    });
}

// 播放音符
function playNote(note) {
    if (!audioContext) return;
    
    // 高亮显示按键
    const key = document.querySelector(`.piano [data-note="${note}"]`);
    if (key) key.classList.add('active');
    
    // 创建音频振荡器
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = noteFrequencies[note];
    
    // 连接节点
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    // 开始播放
    oscillator.start();
    
    // 存储振荡器引用
    key.oscillator = oscillator;
    key.gainNode = gainNode;
    
    // 如果正在录制，记录音符
    if (isRecording) {
        const time = Date.now() - recordStartTime;
        recordedNotes.push({
            note,
            time,
            duration: 0 // 将在停止时更新
        });
    }
}

// 停止音符
function stopNote(note) {
    const key = document.querySelector(`.piano [data-note="${note}"]`);
    if (!key || !key.oscillator) return;
    
    // 移除高亮
    key.classList.remove('active');
    
    // 淡出音频
    key.gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
    key.oscillator.stop(audioContext.currentTime + 0.1);
    
    // 清除引用
    key.oscillator = null;
    key.gainNode = null;
    
    // 如果正在录制，更新音符持续时间
    if (isRecording) {
        const lastNoteIndex = recordedNotes.findLastIndex(n => n.note === note && n.duration === 0);
        if (lastNoteIndex !== -1) {
            recordedNotes[lastNoteIndex].duration = Date.now() - recordStartTime - recordedNotes[lastNoteIndex].time;
        }
    }
}

// 处理键盘按键
function handleKeyDown(event) {
    // 简单映射键盘按键到音符
    const keyToNote = {
        'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4', 'f': 'F4',
        't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4', 'u': 'A#4', 'j': 'B4', 'k': 'C5'
    };
    
    const note = keyToNote[event.key.toLowerCase()];
    if (note) {
        // 防止按住键重复触发
        if (event.repeat) return;
        
        playNote(note);
    }
}

// 处理键盘松开
function handleKeyUp(event) {
    const keyToNote = {
        'a': 'C4', 'w': 'C#4', 's': 'D4', 'e': 'D#4', 'd': 'E4', 'f': 'F4',
        't': 'F#4', 'g': 'G4', 'y': 'G#4', 'h': 'A4', 'u': 'A#4', 'j': 'B4', 'k': 'C5'
    };
    
    const note = keyToNote[event.key.toLowerCase()];
    if (note) {
        stopNote(note);
    }
}

// 切换录制状态
function toggleRecording() {
    if (!isRecording) {
        // 开始录制
        isRecording = true;
        recordedNotes = [];
        recordStartTime = Date.now();
        document.querySelector('.controls button:nth-child(1)').textContent = '停止录制';
    } else {
        // 停止录制
        isRecording = false;
        document.querySelector('.controls button:nth-child(1)').textContent = '录制';
    }
}

// 播放录制的音符
function playRecording() {
    if (recordedNotes.length === 0) {
        alert('没有录制的音符可播放！');
        return;
    }
    
    // 禁用按钮
    const buttons = document.querySelectorAll('.controls button');
    buttons.forEach(btn => btn.disabled = true);
    
    // 播放每个音符
    recordedNotes.forEach(noteData => {
        setTimeout(() => {
            playNote(noteData.note);
            
            // 停止音符
            setTimeout(() => {
                stopNote(noteData.note);
            }, noteData.duration);
        }, noteData.time);
    });
    
    // 播放完成后启用按钮
    const maxTime = Math.max(...recordedNotes.map(n => n.time + n.duration));
    setTimeout(() => {
        buttons.forEach(btn => btn.disabled = false);
    }, maxTime + 100);
}

// 清除录制
function clearRecording() {
    recordedNotes = [];
    alert('录制已清除！');
}