'use client';

import { useState } from 'react';
import { Sparkles, Image, Palette, Wand2 } from 'lucide-react';
import Link from 'next/link';
import TextToImageGenerator from '@/components/TextToImageGenerator';

/**
 * AI创作页面组件
 */
export default function AICreatePage() {
  const [activeFeature, setActiveFeature] = useState<string>('text-to-image');

  const features = [
    {
      id: 'text-to-image',
      title: '文生图',
      description: '通过文字描述生成服装设计图',
      icon: Wand2,
      available: true,
    },
    {
      id: 'image-to-image',
      title: '图生图',
      description: '基于现有图片生成新的设计',
      icon: Image,
      available: false,
    },
    {
      id: 'style-transfer',
      title: '风格转换',
      description: '将设计转换为不同风格',
      icon: Palette,
      available: false,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* 头部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Sparkles className="h-8 w-8 text-primary-600" />
              <h1 className="text-2xl font-bold text-gray-900">KenAI</h1>
            </div>
            <nav className="flex space-x-8">
              <Link href="/" className="text-gray-600 hover:text-gray-900 transition-colors">
                首页
              </Link>
              <Link href="/ai-create" className="text-primary-600 font-medium border-b-2 border-primary-600 pb-1">
                AI创作
              </Link>
              <Link href="/my-works" className="text-gray-600 hover:text-gray-900 transition-colors">
                我的作品
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            AI创作工作台
          </h2>
          <p className="text-lg text-gray-600">
            选择创作模式，开始您的AI设计之旅
          </p>
        </div>

        {/* 功能选择 */}
        <div className="mb-8">
          <div className="flex flex-wrap justify-center gap-4">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <button
                  key={feature.id}
                  onClick={() => feature.available && setActiveFeature(feature.id)}
                  disabled={!feature.available}
                  className={`
                    flex items-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all duration-200
                    ${
                      activeFeature === feature.id
                        ? 'border-primary-500 bg-primary-50 text-primary-700'
                        : feature.available
                        ? 'border-gray-200 bg-white hover:border-gray-300 text-gray-700'
                        : 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <IconComponent className="h-5 w-5" />
                  <div className="text-left">
                    <div className="font-medium">{feature.title}</div>
                    <div className="text-sm opacity-75">{feature.description}</div>
                  </div>
                  {!feature.available && (
                    <span className="text-xs bg-gray-200 text-gray-500 px-2 py-1 rounded-full">
                      即将推出
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* 功能内容区域 */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
          {activeFeature === 'text-to-image' && <TextToImageGenerator />}
          {activeFeature === 'image-to-image' && (
            <div className="text-center py-12">
              <Image className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">图生图功能</h3>
              <p className="text-gray-600">此功能正在开发中，敬请期待...</p>
            </div>
          )}
          {activeFeature === 'style-transfer' && (
            <div className="text-center py-12">
              <Palette className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 mb-2">风格转换功能</h3>
              <p className="text-gray-600">此功能正在开发中，敬请期待...</p>
            </div>
          )}
        </div>
      </main>

      {/* 页脚 */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 KenAI. 专注于服装行业的AI应用平台.</p>
          </div>
        </div>
      </footer>
    </div>
  );
} 