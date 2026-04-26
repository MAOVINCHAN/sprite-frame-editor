# 精灵图帧编辑器

一个简单好用的在线精灵图（Sprite）编辑工具，帮助你快速标注和导出动画帧数据。

📱 **在线体验**: [http://spritetojson.cn](http://spritetojson.cn)

## 核心功能

### 🎯 上传和编辑
- 上传你的精灵图或者动画长图
- 在画布上自由标注每一帧的位置和大小
- 支持自动网格对齐，让帧的划分更精确

### 📦 灵活配置
- **帧大小设置**: 快速设定每个帧的宽高
- **网格吸附**: 启用智能网格对齐，加快编辑速度
- **实时预览**: 编辑的同时即时看到结果

### 💾 快速导出
- 导出帧数据为JSON格式
- 包含每一帧的坐标、尺寸等完整信息
- 直接用于游戏引擎或动画系统

## 快速开始

### 本地开发

```bash
# 进入项目目录
cd web

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 使用Docker运行

```bash
cd deploy
docker-compose up -d
```

访问 `http://localhost` 即可使用。

## 项目结构

```
web/
├── src/
│   ├── components/
│   │   ├── browser/        # 资源管理器
│   │   ├── canvas/         # 画布相关组件
│   │   ├── cards/          # 配置卡片
│   │   └── layout/         # 布局组件
│   ├── composables/        # Vue组合式API逻辑
│   ├── App.vue
│   ├── main.js
│   └── styles.css
├── package.json
└── vite.config.js
```

## 技术栈

- **前端框架**: Vue 3
- **构建工具**: Vite
- **UI组件**: Lucide Vue
- **工具库**: VueUse

## 开发贡献

欢迎提交Issue和Pull Request，一起让这个工具更好用！

## 许可证

MIT

---

**有建议或问题？** 欢迎在线反馈或通过项目仓库提交。
