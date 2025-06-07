@echo off
title KenAI 启动脚本
color 0A

echo ========================================
echo           KenAI 启动脚本
echo ========================================
echo.

echo [1/3] 检查 ComfyUI 是否运行...
timeout /t 2 /nobreak >nul

:: 检查 ComfyUI 是否在运行
curl -s http://localhost:8188/system_stats >nul 2>&1
if %errorlevel% equ 0 (
    echo ✓ ComfyUI 已在运行
) else (
    echo ✗ ComfyUI 未运行，请先启动 ComfyUI
    echo.
    echo 请在 ComfyUI 目录下运行：
    echo python main.py --enable-cors-header
    echo.
    pause
    exit /b 1
)

echo.
echo [2/3] 启动 ngrok 内网穿透...
timeout /t 2 /nobreak >nul

:: 启动 ngrok
start "ngrok" cmd /k "ngrok http 8188"

echo ✓ ngrok 已启动
echo.
echo [3/3] 等待 ngrok 建立连接...
timeout /t 5 /nobreak >nul

echo.
echo ========================================
echo           启动完成！
echo ========================================
echo.
echo 📋 接下来的步骤：
echo.
echo 1. 查看 ngrok 窗口，复制 HTTPS URL
echo    例如：https://abc123.ngrok.io
echo.
echo 2. 在 Vercel 项目设置中更新环境变量：
echo    COMFYUI_URL = 您的ngrok URL
echo.
echo 3. 重新部署 Vercel 项目
echo.
echo 4. 访问您的网站测试 AI 功能
echo.
echo ========================================
echo.
pause 