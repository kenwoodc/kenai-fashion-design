'use client';

import { useState } from 'react';
import { Sparkles, Image, Palette, Wand2, ArrowRight } from 'lucide-react';
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature) => {
              const IconComponent = feature.icon;
              return (
                <div
                  key={feature.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 hover:shadow-md transition-shadow duration-200"
                >
                  <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-xl mb-6 mx-auto">
                    <IconComponent className="h-8 w-8 text-primary-600" />
                  </div>
                  <h4 className="text-xl font-semibold text-gray-900 text-center mb-4">
                    {feature.title}
                  </h4>
                  <p className="text-gray-600 text-center mb-6">
                    {feature.description}
                  </p>
                  <div className="text-center">
                    {feature.available ? (
                      <Link
                        href="/ai-create"
                        className="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium"
                      >
                        立即体验
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Link>
                    ) : (
                      <span className="text-gray-400 text-sm">即将推出</span>
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
            <p className="text-lg text-gray-600">专业、高效、创新的AI设计解决方案</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">⚡</div>
              <h4 className="font-semibold text-gray-900 mb-2">快速生成</h4>
              <p className="text-sm text-gray-600">几分钟内从想法到设计图</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">🎨</div>
              <h4 className="font-semibold text-gray-900 mb-2">专业品质</h4>
              <p className="text-sm text-gray-600">高质量的设计输出</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">💡</div>
              <h4 className="font-semibold text-gray-900 mb-2">创意无限</h4>
              <p className="text-sm text-gray-600">AI助力突破设计瓶颈</p>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary-600 mb-2">🔧</div>
              <h4 className="font-semibold text-gray-900 mb-2">易于使用</h4>
              <p className="text-sm text-gray-600">简单直观的操作界面</p>
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
              <h4 className="text-lg font-semibold text-gray-900 mb-2">描述想法</h4>
              <p className="text-gray-600">用文字详细描述您想要的服装设计</p>
            </div>
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mx-auto mb-4">
                2
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">AI生成</h4>
              <p className="text-gray-600">AI理解您的需求并生成专业设计图</p>
            </div>
            <div className="relative">
              <div className="flex items-center justify-center w-12 h-12 bg-primary-600 text-white rounded-full text-xl font-bold mx-auto mb-4">
                3
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">下载使用</h4>
              <p className="text-gray-600">获得高质量设计图，用于您的项目</p>
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