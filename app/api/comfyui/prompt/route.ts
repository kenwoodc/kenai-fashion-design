import { NextRequest, NextResponse } from 'next/server';
import { checkComfyUIAvailability, simulateGeneration, DEMO_IMAGES } from '../../../../lib/demo-mode';

/**
 * 发送提示词到ComfyUI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const comfyuiUrl = process.env.COMFYUI_URL || 'http://localhost:8188';
    
    // 检查 ComfyUI 是否可用
    const isAvailable = await checkComfyUIAvailability();
    
    if (!isAvailable) {
      console.log('ComfyUI 不可用，使用演示模式');
      
      // 模拟生成延迟
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 返回演示数据
      const demoImages = DEMO_IMAGES['text-to-image'];
      return NextResponse.json({
        prompt_id: 'demo-' + Date.now(),
        number: 1,
        node_errors: {},
        demo_mode: true,
        images: demoImages
      });
    }

    const response = await fetch(`${comfyuiUrl}/prompt`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`ComfyUI响应错误: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('ComfyUI API错误:', error);
    
    // 如果连接失败，返回演示数据
    console.log('连接失败，使用演示模式');
    const demoImages = DEMO_IMAGES['text-to-image'];
    
    return NextResponse.json({
      prompt_id: 'demo-fallback-' + Date.now(),
      number: 1,
      node_errors: {},
      demo_mode: true,
      images: demoImages
    });
  }
} 