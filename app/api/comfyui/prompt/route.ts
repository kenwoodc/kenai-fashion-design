import { NextRequest, NextResponse } from 'next/server';

/**
 * 发送提示词到ComfyUI
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    const response = await fetch('http://127.0.0.1:8188/prompt', {
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
    return NextResponse.json(
      { error: '无法连接到ComfyUI服务' },
      { status: 500 }
    );
  }
} 