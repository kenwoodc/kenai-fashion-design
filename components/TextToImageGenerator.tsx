'use client';

import { useState, useRef } from 'react';
import { Send, Download, RefreshCw, Sparkles, Monitor, Hash, X, ZoomIn } from 'lucide-react';
import axios from 'axios';

interface GenerationResult {
  images: string[];
  prompt: string;
  timestamp: number;
  aspectRatio: string;
  imageCount: number;
}

interface WorkItem {
  id: string;
  prompt: string;
  images: string[];
  timestamp: number;
  type: 'text-to-image' | 'image-to-image' | 'style-transfer';
}

// 画面比例配置
const ASPECT_RATIOS = {
  "1:2": { 
    label: "1:2", 
    icon: (
      <svg width="16" height="24" viewBox="0 0 16 24" className="inline-block">
        <rect x="2" y="2" width="12" height="20" fill="none" stroke="black" strokeWidth="2"/>
      </svg>
    )
  },
  "9:16": { 
    label: "9:16", 
    icon: (
      <svg width="16" height="24" viewBox="0 0 16 24" className="inline-block">
        <rect x="2" y="2" width="12" height="20" fill="none" stroke="black" strokeWidth="2"/>
      </svg>
    )
  },
  "2:3": { 
    label: "2:3", 
    icon: (
      <svg width="16" height="22" viewBox="0 0 16 22" className="inline-block">
        <rect x="2" y="2" width="12" height="18" fill="none" stroke="black" strokeWidth="2"/>
      </svg>
    )
  },
  "3:4": { 
    label: "3:4", 
    icon: (
      <svg width="18" height="22" viewBox="0 0 18 22" className="inline-block">
        <rect x="2" y="2" width="14" height="18" fill="none" stroke="black" strokeWidth="2"/>
      </svg>
    )
  },
  "1:1": { 
    label: "1:1", 
    icon: (
      <svg width="20" height="20" viewBox="0 0 20 20" className="inline-block">
        <rect x="2" y="2" width="16" height="16" fill="none" stroke="black" strokeWidth="2"/>
      </svg>
    )
  },
  "4:3": { 
    label: "4:3", 
    icon: (
      <svg width="22" height="18" viewBox="0 0 22 18" className="inline-block">
        <rect x="2" y="2" width="18" height="14" fill="none" stroke="black" strokeWidth="2"/>
      </svg>
    )
  },
  "3:2": { 
    label: "3:2", 
    icon: (
      <svg width="22" height="16" viewBox="0 0 22 16" className="inline-block">
        <rect x="2" y="2" width="18" height="12" fill="none" stroke="black" strokeWidth="2"/>
      </svg>
    )
  },
  "16:9": { 
    label: "16:9", 
    icon: (
      <svg width="24" height="16" viewBox="0 0 24 16" className="inline-block">
        <rect x="2" y="2" width="20" height="12" fill="none" stroke="black" strokeWidth="2"/>
      </svg>
    )
  },
  "2:1": { 
    label: "2:1", 
    icon: (
      <svg width="24" height="14" viewBox="0 0 24 14" className="inline-block">
        <rect x="2" y="2" width="20" height="10" fill="none" stroke="black" strokeWidth="2"/>
      </svg>
    )
  }
};

// 出图数量选项
const IMAGE_COUNT_OPTIONS = [1, 2, 4];

/**
 * 保存作品到localStorage
 */
const saveWorkToStorage = (work: WorkItem) => {
  try {
    const existingWorks = localStorage.getItem('kenai-works');
    const works: WorkItem[] = existingWorks ? JSON.parse(existingWorks) : [];
    works.unshift(work); // 添加到开头
    localStorage.setItem('kenai-works', JSON.stringify(works));
  } catch (error) {
    console.error('保存作品失败:', error);
  }
};

/**
 * 文生图生成器组件
 */
export default function TextToImageGenerator() {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState<string>('1:1');
  const [imageCount, setImageCount] = useState<number>(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 生成图片
   */
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      setError('请输入描述文字');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      // 读取工作流配置
      const workflowResponse = await fetch('/workflow/文生图.json');
      const workflow = await workflowResponse.json();

      // 更新工作流中的提示词
      if (workflow['11'] && workflow['11'].inputs) {
        workflow['11'].inputs.text = prompt;
      }

      // 设置画面比例和出图数量（节点4：EmptyLatentSizePicker）
      if (workflow['4'] && workflow['4'].inputs) {
        workflow['4'].inputs.image_ratio = aspectRatio;
        workflow['4'].inputs.batch_size = imageCount;
      }

      // 生成随机种子
      const seed = Math.floor(Math.random() * 1000000000000000);
      if (workflow['3'] && workflow['3'].inputs) {
        workflow['3'].inputs.seed = seed;
      }

      // 发送到ComfyUI
      const response = await axios.post('/api/comfyui/prompt', {
        prompt: workflow,
        client_id: 'kenai-web-client'
      });

      if (response.data && response.data.prompt_id) {
        // 轮询检查生成状态
        await pollForResults(response.data.prompt_id);
      } else {
        throw new Error('生成请求失败');
      }
    } catch (err) {
      console.error('生成错误:', err);
      setError(err instanceof Error ? err.message : '生成失败，请检查ComfyUI是否正常运行');
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * 轮询检查生成结果
   */
  const pollForResults = async (promptId: string) => {
    const maxAttempts = 60; // 最多等待5分钟
    let attempts = 0;

    const poll = async (): Promise<void> => {
      return new Promise((resolve, reject) => {
        const checkStatus = async () => {
          try {
            const response = await axios.get(`/api/comfyui/history/${promptId}`);
            const history = response.data;

            if (history[promptId] && history[promptId].status?.completed) {
              // 生成完成，获取图片
              const outputs = history[promptId].outputs;
              const images: string[] = [];

              // 查找预览图像节点的输出
              for (const nodeId in outputs) {
                const output = outputs[nodeId];
                if (output.images) {
                  for (const image of output.images) {
                    images.push(`/api/comfyui/view?filename=${image.filename}&subfolder=${image.subfolder || ''}&type=${image.type || 'output'}`);
                  }
                }
              }

              if (images.length > 0) {
                const newResult: GenerationResult = {
                  images,
                  prompt,
                  timestamp: Date.now(),
                  aspectRatio,
                  imageCount,
                };
                setResults(prev => [newResult, ...prev]);

                // 保存到localStorage
                const workItem: WorkItem = {
                  id: `work-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  prompt,
                  images,
                  timestamp: Date.now(),
                  type: 'text-to-image'
                };
                saveWorkToStorage(workItem);
                resolve();
              } else {
                reject(new Error('未找到生成的图片'));
              }
            } else if (attempts < maxAttempts) {
              // 继续等待
              attempts++;
              setTimeout(checkStatus, 5000); // 5秒后再次检查
            } else {
              reject(new Error('生成超时，请重试'));
            }
          } catch (err) {
            if (attempts < maxAttempts) {
              attempts++;
              setTimeout(checkStatus, 5000);
            } else {
              reject(err);
            }
          }
        };

        checkStatus();
      });
    };

    await poll();
  };

  /**
   * 下载图片
   */
  const handleDownload = async (imageUrl: string, prompt: string) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `kenai-${prompt.slice(0, 20)}-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('下载失败:', err);
    }
  };

  /**
   * 清除结果
   */
  const handleClearResults = () => {
    setResults([]);
    setError(null);
  };

  return (
    <div className="space-y-6">
      {/* 输入区域 */}
      <div className="space-y-6">
        {/* 提示词输入 */}
        <div>
          <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
            提示词
          </label>
          <div className="relative">
            <textarea
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder=""
              className="input min-h-[120px] resize-none pr-12"
              disabled={isGenerating}
            />
            <Sparkles className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* 参数设置区域 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 画面比例选择 */}
          <div>
            <label htmlFor="aspectRatio" className="block text-sm font-medium text-gray-700 mb-2">
              <Monitor className="inline h-4 w-4 mr-1" />
              画面比例
            </label>
            <div className="flex items-center gap-3">
              <select
                id="aspectRatio"
                value={aspectRatio}
                onChange={(e) => setAspectRatio(e.target.value)}
                disabled={isGenerating}
                className="input flex-1"
              >
                {Object.entries(ASPECT_RATIOS).map(([ratio, config]) => (
                  <option key={ratio} value={ratio}>
                    {config.label}
                  </option>
                ))}
              </select>
              <div className={`flex items-center justify-center w-8 h-8 bg-gray-50 rounded border relative ${
                isGenerating ? 'opacity-50' : ''
              }`}>
                {isGenerating ? (
                  <>
                    {ASPECT_RATIOS[aspectRatio].icon}
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="loading-spinner w-4 h-4" />
                    </div>
                  </>
                ) : (
                  ASPECT_RATIOS[aspectRatio].icon
                )}
              </div>
            </div>
          </div>

          {/* 出图数量选择 */}
          <div>
            <label htmlFor="imageCount" className="block text-sm font-medium text-gray-700 mb-2">
              <Hash className="inline h-4 w-4 mr-1" />
              出图数量
            </label>
            <select
              id="imageCount"
              value={imageCount}
              onChange={(e) => setImageCount(Number(e.target.value))}
              disabled={isGenerating}
              className="input"
            >
              {IMAGE_COUNT_OPTIONS.map((count) => (
                <option key={count} value={count}>
                  {count}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-wrap gap-3">
          <button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="btn-primary flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <>
                <div className="loading-spinner" />
                <span>生成中...</span>
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                <span>生成图片</span>
              </>
            )}
          </button>

          {results.length > 0 && (
            <button
              onClick={handleClearResults}
              className="btn-secondary flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>清除结果</span>
            </button>
          )}
        </div>
      </div>

      {/* 生成结果 */}
      {results.length > 0 && (
        <div className="space-y-6">
          <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
          
          {results.map((result, index) => (
            <div key={result.timestamp} className="border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-sm text-gray-600">
                      {new Date(result.timestamp).toLocaleString('zh-CN')}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {result.aspectRatio}
                    </span>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {result.imageCount} 张
                    </span>
                  </div>
                  <p className="text-gray-800 bg-gray-50 rounded-lg p-3 text-sm">
                    {result.prompt}
                  </p>
                </div>
              </div>

              <div className={`grid gap-4 ${
                result.images.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                result.images.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {result.images.map((imageUrl, imageIndex) => (
                  <div key={imageIndex} className="relative group cursor-pointer">
                    <img
                      src={imageUrl}
                      alt={`生成的图片 ${imageIndex + 1}`}
                      className="w-full h-64 object-cover rounded-lg border border-gray-200 transition-transform duration-200 group-hover:scale-105"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4=';
                      }}
                      onClick={() => setSelectedImage(imageUrl)}
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 rounded-lg flex items-center justify-center gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImage(imageUrl);
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-200"
                        title="放大查看"
                      >
                        <ZoomIn className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(imageUrl, result.prompt);
                        }}
                        className="opacity-0 group-hover:opacity-100 bg-white text-gray-700 p-2 rounded-full shadow-lg hover:bg-gray-50 transition-all duration-200"
                        title="下载图片"
                      >
                        <Download className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 图片放大查看 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-full max-h-full">
            <img
              src={selectedImage}
              alt="放大查看"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute top-4 right-4 bg-black bg-opacity-50 text-white hover:bg-opacity-75 p-2 rounded-full transition-all duration-200"
              title="关闭"
            >
              <X className="h-6 w-6" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleDownload(selectedImage, '放大图片');
              }}
              className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white hover:bg-opacity-75 p-2 rounded-full transition-all duration-200"
              title="下载图片"
            >
              <Download className="h-6 w-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}