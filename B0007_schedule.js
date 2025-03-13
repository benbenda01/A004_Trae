// 课程数据结构
let courses = JSON.parse(localStorage.getItem('courses')) || [];

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化课程表格
    initScheduleGrid();
    
    // 加载课程数据
    loadCourses();
});

// 初始化课程表格
function initScheduleGrid() {
    const scheduleBody = document.getElementById('scheduleBody');
    const timeSlots = [
        '第一节\n8:00-9:40',
        '第二节\n10:00-11:40',
        '第三节\n14:00-15:40',
        '第四节\n16:00-17:40',
        '第五节\n19:00-20:40'
    ];
    
    // 创建时间段和课程单元格
    timeSlots.forEach((time, index) => {
        // 添加时间段
        const timeSlot = document.createElement('div');
        timeSlot.className = 'time-slot';
        timeSlot.innerHTML = time.replace('\n', '<br>');
        scheduleBody.appendChild(timeSlot);
        
        // 添加每天的课程单元格
        for (let day = 1; day <= 7; day++) {
            const cell = document.createElement('div');
            cell.className = 'course-cell';
            cell.dataset.day = day;
            cell.dataset.time = index + 1;
            cell.onclick = () => showAddCourseForm(day, index + 1);
            scheduleBody.appendChild(cell);
        }
    });
}

// 加载课程数据
function loadCourses() {
    // 清空所有课程单元格
    const cells = document.querySelectorAll('.course-cell');
    cells.forEach(cell => cell.innerHTML = '');
    
    // 填充课程数据
    courses.forEach(course => {
        const cell = document.querySelector(`.course-cell[data-day="${course.day}"][data-time="${course.time}"]`);
        if (cell) {
            const courseElement = document.createElement('div');
            courseElement.className = 'course-item';
            courseElement.innerHTML = `
                <div class="course-name">${course.name}</div>
                <div class="course-location">${course.location}</div>
            `;
            cell.appendChild(courseElement);
        }
    });
}

// 显示添加课程表单
function showAddCourseForm(day = 1, time = 1) {
    document.getElementById('courseDay').value = day;
    document.getElementById('courseTime').value = time;
    document.getElementById('courseName').value = '';
    document.getElementById('courseLocation').value = '';
    
    // 检查是否已有课程
    const existingCourse = courses.find(c => c.day === day && c.time === time);
    if (existingCourse) {
        document.getElementById('courseName').value = existingCourse.name;
        document.getElementById('courseLocation').value = existingCourse.location;
    }
    
    document.getElementById('courseForm').style.display = 'block';
}

// 隐藏课程表单
function hideCourseForm() {
    document.getElementById('courseForm').style.display = 'none';
}

// 保存课程
function saveCourse() {
    const name = document.getElementById('courseName').value;
    const day = parseInt(document.getElementById('courseDay').value);
    const time = parseInt(document.getElementById('courseTime').value);
    const location = document.getElementById('courseLocation').value;
    
    if (!name || !location) {
        alert('请填写完整信息！');
        return;
    }
    
    // 检查时间段是否已有课程
    const existingIndex = courses.findIndex(c => c.day === day && c.time === time);
    if (existingIndex !== -1) {
        // 更新现有课程
        courses[existingIndex] = { name, day, time, location };
    } else {
        // 添加新课程
        courses.push({ name, day, time, location });
    }
    
    // 保存到localStorage
    localStorage.setItem('courses', JSON.stringify(courses));
    
    // 重新加载课程表
    loadCourses();
    
    // 隐藏表单
    hideCourseForm();
}