# KenAI - 服装行业AI应用平台

![KenAI Logo](https://img.shields.io/badge/KenAI-服装AI平台-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14.0-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-18.0-blue?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.3-38B2AC?style=flat-square&logo=tailwind-css)

## 📖 项目简介

KenAI是一个专注于服装行业的AI应用平台，提供智能化的服装设计工具。通过集成ComfyUI工作流，为设计师和时尚从业者提供高效、创新的AI辅助设计解决方案。

## ✨ 主要特性

- 🎨 **文生图功能** - 通过文字描述生成服装设计图
- 🖼️ **图生图功能** - 基于现有图片生成新的设计（开发中）
- 🎭 **风格转换** - 将设计转换为不同风格（开发中）
- 🚀 **现代化界面** - 美观、极简、优雅的用户体验
- 🔧 **ComfyUI集成** - 无缝对接本地ComfyUI工作流
- 📱 **响应式设计** - 支持各种设备和屏幕尺寸

## 🛠️ 技术栈

- **前端框架**: Next.js 14 + React 18
- **开发语言**: TypeScript
- **样式框架**: Tailwind CSS
- **UI组件**: Lucide React Icons
- **HTTP客户端**: Axios
- **AI后端**: ComfyUI

## 📋 系统要求

- Node.js 18.0 或更高版本
- npm 或 yarn 包管理器
- ComfyUI 服务（用于AI图像生成）

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone <repository-url>
cd KenAI
```

### 2. 安装依赖

```bash
npm install
# 或
yarn install
```

### 3. 启动ComfyUI服务

确保ComfyUI服务在本地运行：
```bash
# 在ComfyUI目录下
python main.py --listen 127.0.0.1 --port 8188
```

### 4. 启动开发服务器

```bash
npm run dev
# 或
yarn dev
```

### 5. 访问应用

打开浏览器访问 [http://localhost:3000](http://localhost:3000)

## 📁 项目结构

```
KenAI/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   │   └── comfyui/      # ComfyUI集成API
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 主页
├── components/            # React组件
│   └── TextToImageGenerator.tsx
├── workflow/             # ComfyUI工作流配置
│   ├── 文生图.json
│   ├── 图生图.json
│   └── 线稿生图.json
├── public/               # 静态资源
├── package.json          # 项目配置
├── tailwind.config.js    # Tailwind配置
├── tsconfig.json         # TypeScript配置
└── README.md            # 项目文档
```

## 🎯 功能说明

### 文生图功能

1. **输入描述**: 在文本框中输入详细的服装设计描述
2. **生成图片**: 点击"生成图片"按钮开始AI生成
3. **查看结果**: 生成完成后可查看、下载图片
4. **历史记录**: 保存生成历史，方便回顾

### 工作流配置

项目使用ComfyUI工作流进行图像生成：
- `workflow/文生图.json` - 文字生成图像工作流
- `workflow/图生图.json` - 图像生成图像工作流
- `workflow/线稿生图.json` - 线稿生成图像工作流

## 🔧 配置说明

### ComfyUI配置

确保ComfyUI服务配置正确：
- 默认地址: `http://127.0.0.1:8188`
- 支持的模型: Flux.1-dev
- 文本编码器: CLIP-L + T5XXL

### 环境变量

可以通过环境变量自定义配置：
```env
COMFYUI_HOST=127.0.0.1
COMFYUI_PORT=8188
```

## 📝 开发指南

### 添加新功能

1. 在`components/`目录下创建新组件
2. 在`app/page.tsx`中集成新功能
3. 如需API支持，在`app/api/`下添加路由
4. 更新工作流配置文件

### 代码规范

- 使用TypeScript进行类型检查
- 遵循JSDoc注释规范
- 使用Tailwind CSS进行样式开发
- 保持组件的单一职责原则

## 🐛 故障排除

### 常见问题

1. **ComfyUI连接失败**
   - 检查ComfyUI服务是否正常运行
   - 确认端口配置是否正确
   - 查看防火墙设置

2. **图片生成失败**
   - 检查工作流配置文件
   - 确认模型文件是否完整
   - 查看ComfyUI日志

3. **页面加载缓慢**
   - 检查网络连接
   - 清除浏览器缓存
   - 优化图片资源

## 🤝 贡献指南

欢迎提交Issue和Pull Request来改进项目：

1. Fork项目
2. 创建功能分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 创建Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情

## 📞 联系我们

- 项目主页: [GitHub Repository]
- 问题反馈: [Issues]
- 邮箱: kenai@example.com

## 🙏 致谢

感谢以下开源项目的支持：
- [Next.js](https://nextjs.org/)
- [React](https://reactjs.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [ComfyUI](https://github.com/comfyanonymous/ComfyUI)
- [Lucide Icons](https://lucide.dev/)

---

**KenAI Team** - 让AI赋能服装设计创新 ✨ 