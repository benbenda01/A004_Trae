// 当前登录的管理员
let currentAdmin = null;

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 检查是否已登录
    const savedAdmin = localStorage.getItem('currentAdmin');
    if (savedAdmin) {
        currentAdmin = JSON.parse(savedAdmin);
        document.getElementById('adminName').textContent = currentAdmin.name;
    } else {
        // 未登录则显示登录界面
        showLoginForm();
    }
    
    // 加载用户列表
    loadUsers();
    
    // 加载考勤记录
    loadAttendanceRecords();
    
    // 加载系统设置
    loadSettings();
    
    // 初始化用户筛选下拉框
    initUserFilter();
});

// 显示登录表单
function showLoginForm() {
    // 创建登录表单
    const loginForm = document.createElement('div');
    loginForm.id = 'adminLoginForm';
    loginForm.style.position = 'fixed';
    loginForm.style.top = '0';
    loginForm.style.left = '0';
    loginForm.style.width = '100%';
    loginForm.style.height = '100%';
    loginForm.style.backgroundColor = 'rgba(0,0,0,0.5)';
    loginForm.style.display = 'flex';
    loginForm.style.justifyContent = 'center';
    loginForm.style.alignItems = 'center';
    loginForm.style.zIndex = '1000';
    
    const formContent = document.createElement('div');
    formContent.style.backgroundColor = 'white';
    formContent.style.padding = '30px';
    formContent.style.borderRadius = '8px';
    formContent.style.width = '400px';
    formContent.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
    
    formContent.innerHTML = `
        <h2 style="margin-bottom: 20px; text-align: center;">管理员登录</h2>
        <div class="form-group">
            <label for="adminUsername">用户名</label>
            <input type="text" id="adminUsername" style="width: 100%; padding: 8px; margin-bottom: 15px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <div class="form-group">
            <label for="adminPassword">密码</label>
            <input type="password" id="adminPassword" style="width: 100%; padding: 8px; margin-bottom: 20px; border: 1px solid #ddd; border-radius: 4px;">
        </div>
        <button id="adminLoginBtn" style="width: 100%; padding: 10px; background-color: #1890ff; color: white; border: none; border-radius: 4px; cursor: pointer;">登录</button>
        <p style="margin-top: 15px; text-align: center;"><a href="B0201_attendance.html" style="color: #1890ff; text-decoration: none;">返回打卡系统</a></p>
    `;
    
    loginForm.appendChild(formContent);
    document.body.appendChild(loginForm);
    
    // 添加登录按钮事件
    document.getElementById('adminLoginBtn').addEventListener('click', adminLogin);
}

// 管理员登录
function adminLogin() {
    const username = document.getElementById('adminUsername').value;
    const password = document.getElementById('adminPassword').value;
    
    // 验证管理员账号
    if (username === 'admin' && password === 'admin123') {
        currentAdmin = {
            username: 'admin',
            name: '管理员'
        };
        
        // 保存登录状态
        localStorage.setItem('currentAdmin', JSON.stringify(currentAdmin));
        
        // 移除登录表单
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            document.body.removeChild(loginForm);
        }
        
        // 显示管理员名称
        document.getElementById('adminName').textContent = currentAdmin.name;
    } else {
        alert('管理员账号或密码错误！');
    }
}

// 退出登录
function logout() {
    currentAdmin = null;
    localStorage.removeItem('currentAdmin');
    showLoginForm();
}

// 显示指定的标签页
function showTab(tabName) {
    // 隐藏所有标签页内容
    const tabContents = document.querySelectorAll('.tab-content');
    tabContents.forEach(tab => tab.classList.remove('active'));
    
    // 移除所有标签的活动状态
    const tabs = document.querySelectorAll('.nav-tab');
    tabs.forEach(tab => tab.classList.remove('active'));
    
    // 显示选中的标签页
    document.getElementById(tabName + 'Tab').classList.add('active');
    
    // 设置选中标签的活动状态
    event.target.classList.add('active');
    
    // 如果是考勤管理标签，刷新数据
    if (tabName === 'attendance') {
        loadAttendanceRecords();
    }
}

// 加载用户列表
function loadUsers() {
    // 从localStorage获取用户数据
    let users = JSON.parse(localStorage.getItem('users')) || [
        { username: 'admin', password: 'admin123', name: '管理员' },
        { username: 'user1', password: 'user123', name: '张三' },
        { username: 'user2', password: 'user123', name: '李四' }
    ];
    
    // 保存默认用户数据
    if (!localStorage.getItem('users')) {
        localStorage.setItem('users', JSON.stringify(users));
    }
    
    // 获取表格体
    const tableBody = document.querySelector('#usersTable tbody');
    tableBody.innerHTML = '';
    
    // 填充用户数据
    users.forEach(user => {
        // 跳过管理员账号
        if (user.username === 'admin') return;
        
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${user.username}</td>
            <td>${user.name}</td>
            <td>
                <button class="action-btn edit-btn" onclick="editUser('${user.username}')">编辑</button>
                <button class="action-btn delete-btn" onclick="deleteUser('${user.username}')">删除</button>
            </td>
        `;
        tableBody.appendChild(row);
    });
}

// 显示添加用户表单
function showAddUserForm() {
    // 清空表单
    document.getElementById('editUsername').value = '';
    document.getElementById('editPassword').value = '';
    document.getElementById('editName').value = '';
    
    // 启用用户名输入框
    document.getElementById('editUsername').disabled = false;
    
    // 显示表单
    document.getElementById('userForm').style.display = 'block';
    
    // 设置当前编辑的用户为null
    currentEditingUser = null;
}

// 当前正在编辑的用户
let currentEditingUser = null;

// 编辑用户
function editUser(username) {
    // 获取用户数据
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const user = users.find(u => u.username === username);
    
    if (user) {
        // 填充表单
        document.getElementById('editUsername').value = user.username;
        document.getElementById('editPassword').value = user.password;
        document.getElementById('editName').value = user.name;
        
        // 禁用用户名输入框
        document.getElementById('editUsername').disabled = true;
        
        // 显示表单
        document.getElementById('userForm').style.display = 'block';
        
        // 设置当前编辑的用户
        currentEditingUser = user;
    }
}

// 删除用户
function deleteUser(username) {
    if (confirm('确定要删除该用户吗？')) {
        // 获取用户数据
        let users = JSON.parse(localStorage.getItem('users')) || [];
        
        // 删除用户
        users = users.filter(u => u.username !== username);
        
        // 保存更新后的用户数据
        localStorage.setItem('users', JSON.stringify(users));
        
        // 重新加载用户列表
        loadUsers();
        
        // 重新加载用户筛选下拉框
        initUserFilter();
    }
}

// 保存用户
function saveUser() {
    const username = document.getElementById('editUsername').value;
    const password = document.getElementById('editPassword').value;
    const name = document.getElementById('editName').value;
    
    if (!username || !password || !name) {
        alert('请填写完整信息！');
        return;
    }
    
    // 获取用户数据
    let users = JSON.parse(localStorage.getItem('users')) || [];
    
    if (currentEditingUser) {
        // 更新现有用户
        const index = users.findIndex(u => u.username === currentEditingUser.username);
        if (index !== -1) {
            users[index] = { username, password, name };
        }
    } else {
        // 检查用户名是否已存在
        if (users.some(u => u.username === username)) {
            alert('用户名已存在！');
            return;
        }
        
        // 添加新用户
        users.push({ username, password, name });
    }
    
    // 保存用户数据
    localStorage.setItem('users', JSON.stringify(users));
    
    // 重新加载用户列表
    loadUsers();
    
    // 重新加载用户筛选下拉框
    initUserFilter();
    
    // 隐藏表单
    cancelEdit();
}

// 取消编辑
function cancelEdit() {
    document.getElementById('userForm').style.display = 'none';
    currentEditingUser = null;
}

// 初始化用户筛选下拉框
function initUserFilter() {
    const users = JSON.parse(localStorage.getItem('users')) || [];
    const select = document.getElementById('userFilter');
    
    // 清空现有选项
    while (select.options.length > 1) {
        select.remove(1);
    }
    
    // 添加用户选项
    users.forEach(user => {
        if (user.username === 'admin') return;
        
        const option = document.createElement('option');
        option.value = user.username;
        option.textContent = `${user.name} (${user.username})`;
        select.appendChild(option);
    });
}

// 加载考勤记录
function loadAttendanceRecords() {
    // 获取考勤记录
    const records = JSON.parse(localStorage.getItem('attendanceRecords')) || [];
    
    // 获取选中的用户
    const selectedUser = document.getElementById('userFilter').value;
    
    // 获取用户数据
    const users = JSON.parse(localStorage.getItem('users')) || [];
    
    // 获取表格体
    const tableBody = document.querySelector('#attendanceTable tbody');
    tableBody.innerHTML = '';
    
    // 筛选并填充考勤记录
    records
        .filter(record => !selectedUser || record.username === selectedUser)
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .forEach(record => {
            const user = users.find(u => u.username === record.username);
            if (!user) return;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${record.username}</td>
                <td>${user.name}</td>
                <td>${record.date}</td>
                <td>${record.checkIn || '-'}</td>
                <td>${record.checkOut || '-'}</td>
                <td>${calculateWorkHours(record)}</td>
                <td>${getAttendanceStatus(record)}</td>
            `;
            tableBody.appendChild(row);
        });
}

// 计算工作时长
function calculateWorkHours(record) {
    if (!record.checkIn || !record.checkOut) return '-';
    
    const checkIn = new Date(`${record.date} ${record.checkIn}`);
    const checkOut = new Date(`${record.date} ${record.checkOut}`);
    
    const hours = (checkOut - checkIn) / (1000 * 60 * 60);
    return hours.toFixed(1) + '小时';
}

// 获取考勤状态
function getAttendanceStatus(record) {
    if (!record.checkIn && !record.checkOut) return '缺勤';
    if (!record.checkOut) return '未签退';
    
    const settings = JSON.parse(localStorage.getItem('workSettings')) || {
        startTime: '09:00',
        endTime: '18:00'
    };
    
    const checkIn = new Date(`${record.date} ${record.checkIn}`);
    const checkOut = new Date(`${record.date} ${record.checkOut}`);
    const workStart = new Date(`${record.date} ${settings.startTime}`);
    const workEnd = new Date(`${record.date} ${settings.endTime}`);
    
    if (checkIn > workStart) return '迟到';
    if (checkOut < workEnd) return '早退';
    return '正常';
}

// 加载系统设置
function loadSettings() {
    const settings = JSON.parse(localStorage.getItem('workSettings')) || {
        startTime: '09:00',
        endTime: '18:00'
    };
    
    document.getElementById('workStartTime').value = settings.startTime;
    document.getElementById('workEndTime').value = settings.endTime;
}