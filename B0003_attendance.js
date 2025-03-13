// 当前登录的用户
let currentUser = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 更新时间显示
    updateTimeDisplay();
    setInterval(updateTimeDisplay, 1000);
    
    // 检查是否已登录
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainContent();
    } else {
        showLoginForm();
    }
});

// 更新时间显示
function updateTimeDisplay() {
    const now = new Date();
    
    // 更新时间
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    document.getElementById('timeDisplay').textContent = `${hours}:${minutes}:${seconds}`;
    
    // 更新日期
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    const date = now.getDate();
    const day = ['日', '一', '二', '三', '四', '五', '六'][now.getDay()];
    document.getElementById('dateDisplay').textContent = `${year}年${month}月${date}日 星期${day}`;
}

// 显示登录表单
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('mainContent').style.display = 'none';
}

// 显示主界面
function showMainContent() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    
    // 显示用户名
    document.getElementById('userName').textContent = currentUser.name;
    
    // 加载考勤记录
    loadAttendanceRecords();
    
    // 检查今日打卡状态
    checkTodayAttendance();
}

// 用户登录
function login() {
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    if (!username || !password) {
        alert('请输入用户名和密码！');
        return;
    }
    
    // 获取用户数据
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showMainContent();
    } else {
        alert('用户名或密码错误！');
    }
}

// 退出登录
function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showLoginForm();
}

// 上班打卡
function checkIn() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);
    
    // 获取考勤记录
    let records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    
    // 检查是否已打卡
    let todayRecord = records.find(r => r.username === currentUser.username && r.date === today);
    
    if (todayRecord) {
        if (todayRecord.checkIn) {
            alert('今日已打卡！');
            return;
        }
        todayRecord.checkIn = time;
    } else {
        // 创建新记录
        todayRecord = {
            username: currentUser.username,
            date: today,
            checkIn: time,
            checkOut: null
        };
        records.push(todayRecord);
    }
    
    // 保存考勤记录
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
    
    // 更新界面
    document.getElementById('checkInBtn').disabled = true;
    document.getElementById('checkOutBtn').disabled = false;
    
    // 重新加载考勤记录
    loadAttendanceRecords();
    
    alert('上班打卡成功！');
}

// 下班打卡
function checkOut() {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    const time = now.toTimeString().split(' ')[0].substring(0, 5);
    
    // 获取考勤记录
    let records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    
    // 检查是否已打卡
    let todayRecord = records.find(r => r.username === currentUser.username && r.date === today);
    
    if (!todayRecord || !todayRecord.checkIn) {
        alert('请先进行上班打卡！');
        return;
    }
    
    if (todayRecord.checkOut) {
        alert('今日已完成下班打卡！');
        return;
    }
    
    // 更新下班时间
    todayRecord.checkOut = time;
    
    // 保存考勤记录
    localStorage.setItem('attendanceRecords', JSON.stringify(records));
    
    // 更新界面
    document.getElementById('checkOutBtn').disabled = true;
    
    // 重新加载考勤记录
    loadAttendanceRecords();
    
    alert('下班打卡成功！');
}

// 检查今日打卡状态
function checkTodayAttendance() {
    const today = new Date().toISOString().split('T')[0];
    
    // 获取考勤记录
    const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    
    // 查找今日记录
    const todayRecord = records.find(r => r.username === currentUser.username && r.date === today);
    
    if (todayRecord) {
        if (todayRecord.checkIn) {
            document.getElementById('checkInBtn').disabled = true;
        }
        
        if (todayRecord.checkOut) {
            document.getElementById('checkOutBtn').disabled = true;
        } else if (todayRecord.checkIn) {
            document.getElementById('checkOutBtn').disabled = false;
        }
    }
}

// 加载考勤记录
function loadAttendanceRecords() {
    // 获取考勤记录
    const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    
    // 获取工作时间设置
    const settings = JSON.parse(localStorage.getItem('workSettings')) || {
        startTime: '09:00',
        endTime: '18:00'
    };
    
    // 获取表格体
    const tableBody = document.getElementById('recordsTableBody');
    tableBody.innerHTML = '';
    
    // 筛选并填充当前用户的考勤记录
    records
        .filter(record => record.username === currentUser.username)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(record => {
            const row = document.createElement('tr');
            
            // 计算工作时长
            let workHours = '-';
            if (record.checkIn && record.checkOut) {
                const checkIn = new Date(`${record.date} ${record.checkIn}`);
                const checkOut = new Date(`${record.date} ${record.checkOut}`);
                const hours = (checkOut - checkIn) / (1000 * 60 * 60);
                workHours = hours.toFixed(1) + '小时';
            }
            
            // 判断考勤状态
            let status = '正常';
            if (!record.checkIn && !record.checkOut) {
                status = '缺勤';
            } else if (!record.checkOut) {
                status = '未签退';
            } else {
                const checkIn = new Date(`${record.date} ${record.checkIn}`);
                const checkOut = new Date(`${record.date} ${record.checkOut}`);
                const workStart = new Date(`${record.date} ${settings.startTime}`);
                const workEnd = new Date(`${record.date} ${settings.endTime}`);
                
                if (checkIn > workStart) {
                    status = '迟到';
                } else if (checkOut < workEnd) {
                    status = '早退';
                }
            }
            
            row.innerHTML = `
                <td>${record.date}</td>
                <td>${record.checkIn || '-'}</td>
                <td>${record.checkOut || '-'}</td>
                <td>${workHours}</td>
                <td>${status}</td>
            `;
            tableBody.appendChild(row);
        });
}