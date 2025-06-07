/**
 * 演示模式配置
 * 当 ComfyUI 服务器不可用时，使用演示数据
 */

export const DEMO_MODE = process.env.NODE_ENV === 'production' && !process.env.COMFYUI_URL;

export const DEMO_IMAGES = {
  'text-to-image': [
    'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?w=400'
  ],
  'sketch-to-image': [
    'https://images.unsplash.com/photo-1539109136881-3be0616acf4b?w=400',
    'https://images.unsplash.com/photo-1544441893-675973e31985?w=400'
  ],
  'colored-sketch-to-image': [
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?w=400',
    'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400'
  ],
  'model-dressing': [
    'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=400',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400'
  ],
  'fabric-application': [
    'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=400',
    'https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400'
  ]
};

/**
 * 模拟生成延迟
 */
export const simulateGeneration = async (type: keyof typeof DEMO_IMAGES): Promise<string[]> => {
  // 模拟 3-5 秒的生成时间
  await new Promise(resolve => setTimeout(resolve, 3000 + Math.random() * 2000));
  
  // 返回演示图片
  return DEMO_IMAGES[type] || DEMO_IMAGES['text-to-image'];
};

/**
 * 检查是否为演示模式
 */
export const isDemoMode = (): boolean => {
  return DEMO_MODE;
}; 