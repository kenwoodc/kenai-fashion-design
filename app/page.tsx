'use client';

import { useState } from 'react';
import { Sparkles, Image, Palette, Wand2, ArrowRight, Shirt, Brush, Users } from 'lucide-react';
import Link from 'next/link';

/**
 * 主页组件
 */
export default function Home() {
  const features = [
    {
      id: 'text-to-image',
      title: '文生图',
      description: '通过文字描述生成服装设计图',
      icon: Wand2,
      available: true,
      color: 'bg-blue-100 text-blue-600',
    },
    {
      id: 'sketch-to-image',
      title: '线稿生图',
      description: '将服装线稿转换为彩色设计图',
      icon: Brush,
      available: true,
      color: 'bg-purple-100 text-purple-600',
    },
    {
      id: 'colored-sketch-to-image',
      title: '上色线稿生图',
      description: '优化已上色线稿的图像质量',
      icon: Palette,
      available: true,
      color: 'bg-orange-100 text-orange-600',
    },
    {
      id: 'model-dressing',
      title: '模特换装',
      description: '智能服装与模特图像合成',
      icon: Users,
      available: true,
      color: 'bg-green-100 text-green-600',
    },
    {
      id: 'fabric-application',
      title: '服装材质应用',
      description: '为服装应用不同材质效果',
      icon: Shirt,
      available: true,
      color: 'bg-pink-100 text-pink-600',
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
              <Link href="/" className="text-primary-600 font-medium border-b-2 border-primary-600 pb-1">
                首页
              </Link>
              <Link href="/ai-create" className="text-gray-600 hover:text-gray-900 transition-colors">
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
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* 英雄区域 */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            服装设计的AI助手
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            使用人工智能技术，让服装设计变得更加简单、高效、创新。
            从文字描述到精美设计图，KenAI为您提供专业的AI辅助设计解决方案。
          </p>
          <Link 
            href="/ai-create"
            className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-8 py-4 rounded-xl transition-colors duration-200 text-lg"
          >
            <span>开始创作</span>
            <ArrowRight className="h-5 w-5" />
          </Link>
        </div>

        {/* 功能特性 */}
        <div className="mb-16">
          <h3 className="text-3xl font-bold text-gray-900 text-center mb-12">核心功能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:scale-105 transition-all duration-200"
                >
                  <div className={`flex items-center justify-center w-14 h-14 ${feature.color} rounded-xl mb-4 mx-auto`}>
                    <IconComponent className="h-7 w-7" />
                  </div>
                  <h4 className="text-lg font-semibold text-gray-900 text-center mb-3">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-center text-sm mb-4 leading-relaxed">
                    {feature.description}
                  </p>
                  <div className="text-center">
                    {feature.available ? (
                      <Link
                        href="/ai-create"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
                      >
                        立即体验
                        <ArrowRight className="h-3 w-3 ml-1" />
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-xs">即将推出</span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 产品优势 */}
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-3xl p-12 mb-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">为什么选择KenAI？</h3>
            <p className="text-lg text-gray-600">5大AI功能，全方位服装设计解决方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">⚡</div>
              <h4 className="font-semibold text-gray-900 mb-2">快速生成</h4>
              <p className="text-sm text-gray-600">几分钟内从想法到设计图</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">🎨</div>
              <h4 className="font-semibold text-gray-900 mb-2">多样化创作</h4>
              <p className="text-sm text-gray-600">5种不同的AI生成模式</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">💡</div>
              <h4 className="font-semibold text-gray-900 mb-2">智能优化</h4>
              <p className="text-sm text-gray-600">AI自动优化设计效果</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">🔧</div>
              <h4 className="font-semibold text-gray-900 mb-2">易于使用</h4>
              <p className="text-sm text-gray-600">简单直观的操作界面</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">📱</div>
              <h4 className="font-semibold text-gray-900 mb-2">实时预览</h4>
              <p className="text-sm text-gray-600">即时查看生成结果</p>
            </div>
          </div>
        </div>

        {/* 使用流程 */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-12">简单三步，开始创作</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mx-auto mb-4">
                1
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">选择创作模式</h4>
              <p className="text-gray-600">从5种AI生成模式中选择最适合的创作方式</p>
            </div>
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">输入创作素材</h4>
              <p className="text-gray-600">上传图片或输入文字描述，提供创作灵感</p>
            </div>
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">获得设计作品</h4>
              <p className="text-gray-600">AI智能生成高质量设计图，支持下载和管理</p>
            </div>
          </div>
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