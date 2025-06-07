'use client';

import { useState } from 'react';
import { Sparkles, Image, Palette } from 'lucide-react';
import Link from 'next/link';
import {
  TextToImageGenerator,
  SketchToImageGenerator,
  ColoredSketchToImageGenerator,
  FabricApplicationGenerator,
  ModelDressingGenerator
} from '@/components';

/**
 * AI创作页面组件
 */
export default function AICreatePage() {
  const [activeFeature, setActiveFeature] = useState('text-to-image');

  const features = [
    {
      id: 'text-to-image',
      name: '文生图',
      description: '通过文字描述生成服装设计',
      icon: '✨',
      color: 'bg-blue-50 border-blue-200 text-blue-800'
    },
    {
      id: 'sketch-to-image', 
      name: '线稿生图',
      description: '基于线稿图生成服装设计',
      icon: '🎨',
      color: 'bg-green-50 border-green-200 text-green-800'
    },
    {
      id: 'colored-sketch-to-image',
      name: '上色线稿生图', 
      description: '基于已上色线稿生成服装设计',
      icon: '🖌️',
      color: 'bg-purple-50 border-purple-200 text-purple-800'
    },
    {
      id: 'fabric-application',
      name: '服装材质应用',
      description: '将面料材质应用到服装设计上',
      icon: '🧵',
      color: 'bg-orange-50 border-orange-200 text-orange-800'
    },
    {
      id: 'model-dressing',
      name: '模特换装',
      description: '为模特换上不同的服装',
      icon: '👗',
      color: 'bg-pink-50 border-pink-200 text-pink-800'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 头部导航 */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
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

      {/* 主要内容 - 左右布局 */}
      <main className="flex h-[calc(100vh-4rem)]">
        {/* 左侧：模式选择 */}
        <div className="w-80 bg-white border-r border-gray-200 p-6 overflow-y-auto">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-2">
              AI创作工作台
            </h2>
            <p className="text-sm text-gray-600">
              选择创作模式，开始您的AI设计之旅
            </p>
          </div>

          {/* 功能选择 */}
          <div className="space-y-3">
            {features.map((feature) => {
              const isActive = activeFeature === feature.id;
              
              return (
                <button
                  key={feature.id}
                  onClick={() => setActiveFeature(feature.id)}
                  className={`
                    w-full text-left p-4 rounded-xl border-2 transition-all duration-200
                    ${isActive 
                      ? `${feature.color} shadow-sm` 
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <span className={`text-2xl mt-0.5`}>
                      {feature.icon}
                    </span>
                    <div className="flex-1">
                      <h3 className={`font-semibold ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                        {feature.name}
                      </h3>
                      <p className={`text-sm mt-1 ${isActive ? 'text-gray-600' : 'text-gray-500'}`}>
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* 右侧：参数设置和图片展示 */}
        <div className="flex-1 flex flex-col">
          {/* 功能内容区域 */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeFeature === 'text-to-image' && <TextToImageGenerator />}
            {activeFeature === 'sketch-to-image' && <SketchToImageGenerator />}
            {activeFeature === 'colored-sketch-to-image' && <ColoredSketchToImageGenerator />}
            {activeFeature === 'fabric-application' && <FabricApplicationGenerator />}
            {activeFeature === 'model-dressing' && <ModelDressingGenerator />}
          </div>
        </div>
      </main>
    </div>
  );
} 