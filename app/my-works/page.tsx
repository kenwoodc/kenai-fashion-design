'use client';

import { useState, useEffect } from 'react';
import { Sparkles, Download, Calendar, Image as ImageIcon, Search, Filter } from 'lucide-react';
import Link from 'next/link';

interface WorkItem {
  id: string;
  description: string;
  resultCount?: number;
  images?: string[];
  timestamp: number;
  type: string;
  createdAt?: string;
  prompt?: string;
}

/**
 * 我的作品页面组件
 */
export default function MyWorksPage() {
  const [works, setWorks] = useState<WorkItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  // 从localStorage加载作品数据
  useEffect(() => {
    const savedWorks = localStorage.getItem('kenai-works');
    if (savedWorks) {
      try {
        setWorks(JSON.parse(savedWorks));
      } catch (error) {
        console.error('加载作品数据失败:', error);
      }
    }
  }, []);

  // 过滤作品
  const filteredWorks = works.filter(work => {
    const searchText = work.description || work.prompt || '';
    const matchesSearch = searchText.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || work.type === filterType;
    return matchesSearch && matchesFilter;
  });

  /**
   * 下载图片
   */
  const handleDownload = async (imageUrl: string, description: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kenai-${description.slice(0, 20)}-${index + 1}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('下载失败:', err);
    }
  };

  /**
   * 清除所有作品
   */
  const handleClearAll = () => {
    if (confirm('确定要清除所有作品吗？此操作不可撤销。')) {
      setWorks([]);
      localStorage.removeItem('kenai-works');
    }
  };

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
              <Link href="/ai-create" className="text-gray-600 hover:text-gray-900 transition-colors">
                AI创作
              </Link>
              <Link href="/my-works" className="text-primary-600 font-medium border-b-2 border-primary-600 pb-1">
                我的作品
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* 主要内容 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 页面标题 */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              我的作品
            </h2>
            <p className="text-lg text-gray-600">
              共 {works.length} 个作品
            </p>
          </div>
          {works.length > 0 && (
            <button
              onClick={handleClearAll}
              className="px-4 py-2 text-red-600 hover:text-red-700 border border-red-300 hover:border-red-400 rounded-lg transition-colors"
            >
              清除所有
            </button>
          )}
        </div>

        {works.length > 0 ? (
          <>
            {/* 搜索和筛选 */}
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索作品描述..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="all">所有类型</option>
                  <option value="text-to-image">文生图</option>
                  <option value="sketch-to-image">线稿生图</option>
                  <option value="colored-sketch-to-image">上色线稿生图</option>
                  <option value="fabric-application">材质应用</option>
                  <option value="model-dressing">模特换装</option>
                </select>
              </div>
            </div>

            {/* 作品网格 */}
            {filteredWorks.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {filteredWorks.map((work) => (
                  <div key={work.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                    {/* 作品信息 */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                          {work.type === 'text-to-image' ? '文生图' : 
                           work.type === 'sketch-to-image' ? '线稿生图' :
                           work.type === 'colored-sketch-to-image' ? '上色线稿生图' :
                           work.type === 'fabric-application' ? '材质应用' : 
                           work.type === 'model-dressing' ? '模特换装' : '未知类型'}
                        </span>
                        <div className="flex items-center text-sm text-gray-500">
                          <Calendar className="h-4 w-4 mr-1" />
                          {new Date(work.timestamp).toLocaleString('zh-CN')}
                        </div>
                      </div>
                      <p className="text-gray-800 bg-gray-50 rounded-lg p-3 text-sm">
                        {work.description || work.prompt || '无描述'}
                      </p>
                    </div>

                    {/* 图片展示 */}
                    {work.images && work.images.length > 0 ? (
                      <div className="grid grid-cols-2 gap-3">
                        {work.images.map((imageUrl, imageIndex) => (
                          <div key={imageIndex} className="relative group">
                            <img
                              src={imageUrl}
                              alt={`作品图片 ${imageIndex + 1}`}
                              className="w-full h-48 object-cover rounded-lg border border-gray-200"
                              onError={(e) => {
                                const target = e.target as HTMLImageElement;
                                target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4=';
                              }}
                            />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center">
                              <button
                                onClick={() => handleDownload(imageUrl, work.description || work.prompt || '未知', imageIndex)}
                                className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-200"
                                title="下载图片"
                              >
                                <Download className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
                        <ImageIcon className="h-12 w-12 text-gray-400 mx-auto mb-3" />
                        <p className="text-sm text-gray-600 mb-2">图片数据已优化清理</p>
                        <p className="text-xs text-gray-500">
                          {work.resultCount ? `生成了 ${work.resultCount} 张图片` : '图片预览不可用'}
                        </p>
                        <p className="text-xs text-gray-400 mt-2">
                          为节省存储空间，旧作品的图片数据已被清理
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-900 mb-2">未找到匹配的作品</h3>
                <p className="text-gray-600">尝试调整搜索条件或筛选器</p>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-16">
            <ImageIcon className="h-24 w-24 text-gray-400 mx-auto mb-6" />
            <h3 className="text-2xl font-semibold text-gray-900 mb-4">还没有作品</h3>
            <p className="text-lg text-gray-600 mb-8">
              开始您的第一次AI创作，作品将自动保存在这里
            </p>
            <Link
              href="/ai-create"
              className="inline-flex items-center space-x-2 bg-primary-600 hover:bg-primary-700 text-white font-medium px-6 py-3 rounded-lg transition-colors duration-200"
            >
              <span>开始创作</span>
            </Link>
          </div>
        )}
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