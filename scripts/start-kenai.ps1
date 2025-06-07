# KenAI 启动脚本 (PowerShell 版本)
param(
    [string]$ComfyUIPath = "",
    [switch]$AutoStart
)

# 设置控制台标题和颜色
$Host.UI.RawUI.WindowTitle = "KenAI 启动脚本"
Write-Host "========================================" -ForegroundColor Green
Write-Host "           KenAI 启动脚本" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 函数：检查 ComfyUI 是否运行
function Test-ComfyUI {
    try {
        $response = Invoke-WebRequest -Uri "http://localhost:8188/system_stats" -TimeoutSec 5 -ErrorAction Stop
        return $true
    }
    catch {
        return $false
    }
}

# 函数：启动 ComfyUI
function Start-ComfyUI {
    param([string]$Path)
    
    if (-not $Path) {
        Write-Host "请输入 ComfyUI 安装路径：" -ForegroundColor Yellow
        $Path = Read-Host
    }
    
    if (-not (Test-Path $Path)) {
        Write-Host "✗ ComfyUI 路径不存在：$Path" -ForegroundColor Red
        return $false
    }
    
    Write-Host "启动 ComfyUI..." -ForegroundColor Yellow
    $comfyProcess = Start-Process -FilePath "python" -ArgumentList "main.py --enable-cors-header" -WorkingDirectory $Path -PassThru -WindowStyle Normal
    
    # 等待 ComfyUI 启动
    Write-Host "等待 ComfyUI 启动..." -ForegroundColor Yellow
    $timeout = 30
    $elapsed = 0
    
    while ($elapsed -lt $timeout) {
        Start-Sleep -Seconds 2
        $elapsed += 2
        
        if (Test-ComfyUI) {
            Write-Host "✓ ComfyUI 启动成功" -ForegroundColor Green
            return $true
        }
        
        Write-Host "." -NoNewline -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "✗ ComfyUI 启动超时" -ForegroundColor Red
    return $false
}

# 步骤 1：检查 ComfyUI
Write-Host "[1/3] 检查 ComfyUI 是否运行..." -ForegroundColor Cyan
Start-Sleep -Seconds 1

if (Test-ComfyUI) {
    Write-Host "✓ ComfyUI 已在运行" -ForegroundColor Green
} else {
    Write-Host "✗ ComfyUI 未运行" -ForegroundColor Red
    
    if ($AutoStart) {
        if (-not (Start-ComfyUI -Path $ComfyUIPath)) {
            Write-Host "无法启动 ComfyUI，请手动启动后重试" -ForegroundColor Red
            Read-Host "按任意键退出"
            exit 1
        }
    } else {
        Write-Host ""
        Write-Host "请先启动 ComfyUI，在 ComfyUI 目录下运行：" -ForegroundColor Yellow
        Write-Host "python main.py --enable-cors-header" -ForegroundColor White
        Write-Host ""
        Read-Host "按任意键退出"
        exit 1
    }
}

Write-Host ""

# 步骤 2：启动 ngrok
Write-Host "[2/3] 启动 ngrok 内网穿透..." -ForegroundColor Cyan
Start-Sleep -Seconds 1

try {
    $ngrokProcess = Start-Process -FilePath "ngrok" -ArgumentList "http 8188" -PassThru -WindowStyle Normal
    Write-Host "✓ ngrok 已启动" -ForegroundColor Green
} catch {
    Write-Host "✗ 启动 ngrok 失败，请确保 ngrok 已安装并配置" -ForegroundColor Red
    Write-Host "下载地址：https://ngrok.com/download" -ForegroundColor Yellow
    Read-Host "按任意键退出"
    exit 1
}

Write-Host ""

# 步骤 3：等待连接建立
Write-Host "[3/3] 等待 ngrok 建立连接..." -ForegroundColor Cyan
Start-Sleep -Seconds 5

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "           启动完成！" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "📋 接下来的步骤：" -ForegroundColor Yellow
Write-Host ""
Write-Host "1. 查看 ngrok 窗口，复制 HTTPS URL" -ForegroundColor White
Write-Host "   例如：https://abc123.ngrok.io" -ForegroundColor Gray
Write-Host ""
Write-Host "2. 在 Vercel 项目设置中更新环境变量：" -ForegroundColor White
Write-Host "   COMFYUI_URL = 您的ngrok URL" -ForegroundColor Gray
Write-Host ""
Write-Host "3. 重新部署 Vercel 项目" -ForegroundColor White
Write-Host ""
Write-Host "4. 访问您的网站测试 AI 功能" -ForegroundColor White
Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host ""

# 获取 ngrok 隧道信息
try {
    Start-Sleep -Seconds 3
    $tunnels = Invoke-RestMethod -Uri "http://localhost:4040/api/tunnels" -ErrorAction SilentlyContinue
    if ($tunnels.tunnels) {
        Write-Host "🌐 ngrok 隧道信息：" -ForegroundColor Cyan
        foreach ($tunnel in $tunnels.tunnels) {
            if ($tunnel.proto -eq "https") {
                Write-Host "   HTTPS URL: $($tunnel.public_url)" -ForegroundColor Green
            }
        }
        Write-Host ""
    }
} catch {
    Write-Host "提示：可以访问 http://localhost:4040 查看 ngrok 状态" -ForegroundColor Yellow
    Write-Host ""
}

Read-Host "按任意键退出" 