import { NextRequest, NextResponse } from 'next/server';

/**
 * 获取ComfyUI生成历史
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { promptId: string } }
) {
  try {
    const { promptId } = params;
    
    const response = await fetch(`http://127.0.0.1:8188/history/${promptId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`ComfyUI响应错误: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('ComfyUI历史API错误:', error);
    return NextResponse.json(
      { error: '无法获取生成历史' },
      { status: 500 }
    );
  }
} 