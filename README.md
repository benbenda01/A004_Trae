# 多功能Web应用集合

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)

## 项目概述

本项目是一个基于Web的多功能应用集合，包含工作管理、娱乐休闲等多种实用工具。项目采用纯前端实现，使用HTML、CSS和JavaScript构建，数据存储采用浏览器的localStorage机制，无需后端服务器支持，可直接在浏览器中运行。

## 功能特点

- **纯前端实现**：无需服务器，直接在浏览器中运行
- **多功能集成**：工作管理、游戏娱乐等多种功能于一体
- **本地数据存储**：使用localStorage保存用户数据
- **响应式设计**：适配不同设备屏幕尺寸
- **无外部依赖**：不依赖任何第三方框架或库

## 应用模块

项目由以下几个主要模块组成：

- **应用导航** (B0001_index.html): 项目主页，提供所有应用的入口
- **后台管理** (B0002_admin.html, B0002_admin.js): 系统管理员控制面板
- **工作打卡系统** (B0003_attendance.html, B0003_attendance.js): 员工考勤管理和打卡记录系统
- **斗地主游戏** (B0004_doudizhu.html, B0004_doudizhu.js): 经典扑克牌游戏
- **贪吃蛇游戏** (B0005_snake.html, B0005_snake.js): 经典休闲小游戏
- **在线钢琴** (B0006_piano.html, B0006_piano.js): 在线弹奏钢琴的音乐工具
- **日程安排** (B0007_schedule.html, B0007_schedule.js): 个人日程管理工具

## 功能详情

### 1. 应用导航

提供所有应用的入口，采用卡片式布局，直观展示各个应用的基本信息和访问链接。

### 2. 后台管理

系统管理员控制面板，提供用户管理、考勤管理和系统设置等功能，管理员可以在此进行系统配置和数据管理。

### 3. 工作打卡系统

员工考勤管理系统，提供上下班打卡、考勤记录查询等功能。系统记录员工的打卡时间，并根据设定的工作时间计算出勤状态。

### 4. 斗地主游戏

经典的中国扑克牌游戏，提供单机版斗地主游戏体验。

### 5. 贪吃蛇游戏

经典的休闲小游戏，玩家控制蛇吃食物并不断成长，同时避免碰到墙壁或自身。

### 6. 在线钢琴

在线弹奏钢琴的音乐工具，用户可以通过键盘或鼠标点击进行演奏。

### 7. 日程安排

个人日程管理工具，提供课程表或日程安排的添加、编辑和查看功能，帮助用户合理规划时间。

## 技术实现

- **前端技术**: HTML5, CSS3, JavaScript (ES6+)
- **UI设计**: 采用简洁现代的设计风格，响应式布局适配不同设备
- **数据存储**: 使用浏览器的localStorage进行数据持久化存储
- **无依赖**: 不依赖任何第三方框架或库，纯原生JavaScript实现

## 数据存储

项目使用浏览器的localStorage机制存储数据，主要包括以下几类数据：

- 用户信息和登录状态
- 考勤记录数据
- 游戏配置和记录
- 日程安排数据

由于使用localStorage，数据仅保存在用户本地浏览器中，不同设备或浏览器之间的数据不会同步。

## 快速开始

### 安装

1. 克隆仓库到本地
   ```bash
   git clone https://github.com/benbenda01/A004_Trae.git
   ```

2. 无需安装任何依赖，直接打开项目文件即可

### 使用方法

1. 直接打开`B0001_index.html`进入应用导航页面
2. 点击对应应用的入口链接进入具体应用
3. 各应用的具体使用方法可在应用内查看

## 浏览器兼容性

本项目已在以下浏览器中测试通过：

- Google Chrome (最新版)
- Mozilla Firefox (最新版)
- Microsoft Edge (最新版)
- Safari (最新版)

## 注意事项

- 本项目为纯前端应用，所有数据存储在浏览器本地，清除浏览器缓存会导致数据丢失
- 建议使用现代浏览器（Chrome, Firefox, Edge等）访问以获得最佳体验
- 首次使用工作打卡系统和后台管理需要注册或使用默认账户登录

## 贡献指南

欢迎贡献代码或提出建议，请按以下步骤操作：

1. Fork 本仓库
2. 创建您的特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交您的更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开一个 Pull Request

## 许可证

本项目采用 MIT 许可证 - 详情请参阅 [LICENSE](LICENSE) 文件

## 联系方式

如有任何问题或建议，请通过以下方式联系我们：

- 项目团队: Web应用集合项目团队
- GitHub Issues: [https://github.com/benbenda01/A004_Trae/issues](https://github.com/yourusername/web-app-collection/issues)