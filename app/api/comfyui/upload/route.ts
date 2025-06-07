import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const comfyuiUrl = process.env.COMFYUI_URL || 'http://localhost:8188';
    
    // 转发到ComfyUI的上传接口
    const comfyuiResponse = await fetch(`${comfyuiUrl}/upload/image`, {
      method: 'POST',
      body: formData,
    });

    if (!comfyuiResponse.ok) {
      throw new Error(`ComfyUI上传失败: ${comfyuiResponse.status}`);
    }

    const result = await comfyuiResponse.json();
    return NextResponse.json(result);
  } catch (error) {
    console.error('图片上传错误:', error);
    return NextResponse.json(
      { error: '图片上传失败' },
      { status: 500 }
    );
  }
} 