import { NextRequest, NextResponse } from 'next/server';

/**
 * 获取ComfyUI生成的图片
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const filename = searchParams.get('filename');
    const subfolder = searchParams.get('subfolder') || '';
    const type = searchParams.get('type') || 'output';

    if (!filename) {
      return NextResponse.json(
        { error: '缺少文件名参数' },
        { status: 400 }
      );
    }

    const comfyuiUrl = process.env.COMFYUI_URL || 'http://localhost:8188';
    const url = new URL(`${comfyuiUrl}/view`);
    url.searchParams.set('filename', filename);
    if (subfolder) url.searchParams.set('subfolder', subfolder);
    url.searchParams.set('type', type);

    const response = await fetch(url.toString());

    if (!response.ok) {
      throw new Error(`ComfyUI响应错误: ${response.status}`);
    }

    const imageBuffer = await response.arrayBuffer();
    const contentType = response.headers.get('content-type') || 'image/png';

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000',
      },
    });
  } catch (error) {
    console.error('ComfyUI图片API错误:', error);
    return NextResponse.json(
      { error: '无法获取图片' },
      { status: 500 }
    );
  }
} 