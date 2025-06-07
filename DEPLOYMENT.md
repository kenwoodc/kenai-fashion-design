# KenAI 部署指南

## 🚀 使用本地 ComfyUI 部署到 Vercel

### 前提条件
- 已安装并配置好的 ComfyUI 服务器（本地运行在 8188 端口）
- GitHub 账户
- Vercel 账户
- ngrok 账户（免费）

### 第一步：配置 ngrok 内网穿透

1. **下载并安装 ngrok**
   ```bash
   # 方法1：直接下载
   # 访问 https://ngrok.com/download 下载 Windows 版本
   
   # 方法2：使用 Chocolatey
   choco install ngrok
   ```

2. **注册 ngrok 账户**
   - 访问 https://ngrok.com 注册免费账户
   - 获取您的 authtoken

3. **配置 ngrok**
   ```bash
   # 配置 authtoken
   ngrok config add-authtoken YOUR_AUTHTOKEN_HERE
   ```

4. **启动 ComfyUI 内网穿透**
   ```bash
   # 确保 ComfyUI 正在运行在 localhost:8188
   # 然后运行：
   ngrok http 8188
   ```

5. **获取公网地址**
   - ngrok 会显示类似这样的地址：`https://abc123.ngrok.io`
   - 复制这个 HTTPS 地址，稍后会用到

### 第二步：部署到 GitHub

1. **创建 GitHub 仓库**
   ```bash
   # 在 GitHub 上创建新仓库：kenai-fashion-design
   # 然后在本地执行：
   git remote add origin https://github.com/YOUR_USERNAME/kenai-fashion-design.git
   git branch -M main
   git push -u origin main
   ```

### 第三步：部署到 Vercel

1. **连接 Vercel**
   - 访问 https://vercel.com
   - 使用 GitHub 账户登录
   - 点击 "New Project"
   - 选择您的 `kenai-fashion-design` 仓库

2. **配置环境变量**
   在 Vercel 项目设置中添加以下环境变量：
   ```
   COMFYUI_URL=https://YOUR_NGROK_URL.ngrok.io
   NODE_ENV=production
   ```

3. **部署**
   - 点击 "Deploy" 开始部署
   - 等待构建完成

### 第四步：保持 ngrok 持续运行

#### 方法1：使用 ngrok 保留域名（推荐）
```bash
# 在 ngrok 仪表板中创建保留域名
# 然后使用：
ngrok http 8188 --domain=your-reserved-domain.ngrok.io
```

#### 方法2：使用 Windows 服务
```bash
# 以管理员身份运行 PowerShell
ngrok service install --config=C:\Users\YOUR_USERNAME\.ngrok2\ngrok.yml
ngrok service start
```

#### 方法3：使用批处理脚本
创建 `start-ngrok.bat` 文件：
```batch
@echo off
cd /d "C:\path\to\ngrok"
ngrok http 8188
pause
```

### 第五步：更新 Vercel 环境变量

每次 ngrok 重启后，如果没有使用保留域名，需要：
1. 获取新的 ngrok URL
2. 在 Vercel 项目设置中更新 `COMFYUI_URL` 环境变量
3. 重新部署项目

### 🔧 故障排除

#### ComfyUI 连接问题
1. 确保 ComfyUI 正在运行：`http://localhost:8188`
2. 确保 ngrok 正在运行并显示正确的 URL
3. 检查 Vercel 环境变量是否正确设置

#### ngrok 免费限制
- 免费版本有连接数限制
- 每次重启会获得新的随机 URL
- 考虑升级到付费版本获得固定域名

#### CORS 问题
如果遇到跨域问题，在 ComfyUI 启动时添加参数：
```bash
python main.py --enable-cors-header
```

### 📱 使用说明

部署完成后：
1. 访问您的 Vercel 应用 URL
2. 如果 ComfyUI 可用，将使用真实的 AI 生成
3. 如果 ComfyUI 不可用，将自动切换到演示模式

### 🔄 自动化部署

为了简化流程，可以创建自动化脚本：

**start-kenai.bat**：
```batch
@echo off
echo 启动 ComfyUI...
start /d "C:\path\to\ComfyUI" python main.py --enable-cors-header

echo 等待 ComfyUI 启动...
timeout /t 10

echo 启动 ngrok...
start /d "C:\path\to\ngrok" ngrok http 8188

echo KenAI 服务已启动！
echo 请复制 ngrok URL 并更新 Vercel 环境变量
pause
```

### 💡 生产环境建议

1. **使用 ngrok 付费版本**：获得固定域名和更高的连接限制
2. **云服务器部署**：将 ComfyUI 部署到云服务器获得更稳定的服务
3. **负载均衡**：使用多个 ComfyUI 实例提高可用性
4. **监控告警**：设置服务监控和故障告警

### 📞 技术支持

如果遇到问题：
1. 检查 ComfyUI 日志
2. 检查 ngrok 连接状态
3. 检查 Vercel 部署日志
4. 确认环境变量配置正确 