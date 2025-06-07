'use client';

import React, { useState, useRef } from 'react';
import { Send, Download, RefreshCw, Sparkles, Upload, Image as ImageIcon, ZoomIn, X } from 'lucide-react';
import axios from 'axios';

interface GenerationResult {
  id: string;
  prompt: string;
  images: string[];
  timestamp: number;
  uploadedImage: string;
}

interface WorkItem {
  id: string;
  prompt: string;
  images: string[];
  timestamp: number;
  type: 'colored-sketch-to-image';
  uploadedImage: string;
}

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
 * 上色线稿生图生成器组件
 */
export default function ColoredSketchToImageGenerator() {
  const [coloredSketchPrompt, setColoredSketchPrompt] = useState('');
  const [uploadedColoredSketch, setUploadedColoredSketch] = useState<string | null>(null);
  const [uploadedColoredSketchFile, setUploadedColoredSketchFile] = useState<File | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [results, setResults] = useState<GenerationResult[]>([]);
  const [error, setError] = useState<string>('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  
  // 引用
  const coloredSketchFileInputRef = useRef<HTMLInputElement>(null);

  /**
   * 处理上色线稿图片上传
   */
  const handleColoredSketchUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setUploadedColoredSketchFile(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setUploadedColoredSketch(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * 生成图片 - 上色线稿生图
   */
  const handleColoredSketchToImageGenerate = async () => {
    if (!coloredSketchPrompt.trim()) {
      setError('请输入服装描述');
      return;
    }
    if (!uploadedColoredSketchFile) {
      setError('请上传已上色的服装线稿图');
      return;
    }

    setIsGenerating(true);
    setError('');

    try {
      // 首先上传图片到ComfyUI
      const formData = new FormData();
      formData.append('image', uploadedColoredSketchFile);
      formData.append('type', 'input');
      formData.append('subfolder', '');

      const uploadResponse = await axios.post('/api/comfyui/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      const uploadedImageName = uploadResponse.data.name;

      // 读取上色线稿生图工作流配置
      const workflowResponse = await fetch('/workflow/colored-sketch-to-image.json');
      const workflow = await workflowResponse.json();

      // 更新工作流中的图片（节点1）
      if (workflow['1'] && workflow['1'].inputs) {
        workflow['1'].inputs.image = uploadedImageName;
      }

      // 更新工作流中的提示词（节点6）
      if (workflow['6'] && workflow['6'].inputs) {
        workflow['6'].inputs.text = coloredSketchPrompt;
      }

      // 生成随机种子（节点10）
      const seed = Math.floor(Math.random() * 1000000000000000);
      if (workflow['10'] && workflow['10'].inputs) {
        workflow['10'].inputs.seed = seed;
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
                  id: `work-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  images,
                  prompt: coloredSketchPrompt,
                  timestamp: Date.now(),
                  uploadedImage: uploadedColoredSketch!
                };
                setResults(prev => [newResult, ...prev]);

                // 保存到localStorage
                const workItem: WorkItem = {
                  id: `work-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                  prompt: coloredSketchPrompt,
                  images,
                  timestamp: Date.now(),
                  type: 'colored-sketch-to-image',
                  uploadedImage: uploadedColoredSketch!
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
      a.download = `kenai-colored-sketch-${prompt.slice(0, 20)}-${Date.now()}.png`;
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
    setError('');
  };

  return (
    <div className="flex h-full gap-6">
      {/* 左侧：参数设置 */}
      <div className="w-96 flex-shrink-0 space-y-6">
        {/* 图片上传 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Upload className="inline h-4 w-4 mr-1" />
            上传已上色的服装线稿图
          </label>
          <div className="space-y-4">
            <div
              onClick={() => coloredSketchFileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
                ${uploadedColoredSketch 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                }
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {uploadedColoredSketch ? (
                <div className="space-y-3">
                  <img
                    src={uploadedColoredSketch}
                    alt="上传的上色线稿"
                    className="max-h-48 mx-auto rounded-lg border border-gray-200"
                  />
                  <p className="text-sm text-blue-600">点击重新上传</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600">点击上传已上色的线稿图片</p>
                    <p className="text-sm text-gray-400">支持 JPG、PNG 格式</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={coloredSketchFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleColoredSketchUpload}
              className="hidden"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* 服装描述 */}
        <div>
          <label htmlFor="coloredSketchPrompt" className="block text-sm font-medium text-gray-700 mb-2">
            描述服装
          </label>
          <div className="relative">
            <textarea
              id="coloredSketchPrompt"
              value={coloredSketchPrompt}
              onChange={(e) => setColoredSketchPrompt(e.target.value)}
              placeholder="请描述您想要生成的服装样式、颜色、材质等..."
              className="input min-h-[120px] resize-none pr-12"
              disabled={isGenerating}
            />
            <Sparkles className="absolute top-3 right-3 h-5 w-5 text-gray-400" />
          </div>
        </div>

        {/* 错误提示 */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* 操作按钮 */}
        <div className="flex flex-col gap-3">
          <button
            onClick={handleColoredSketchToImageGenerate}
            disabled={isGenerating || !coloredSketchPrompt.trim() || !uploadedColoredSketchFile}
            className="btn-primary flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed w-full"
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
              className="btn-secondary flex items-center justify-center space-x-2 w-full"
            >
              <RefreshCw className="h-4 w-4" />
              <span>清除结果</span>
            </button>
          )}
        </div>
      </div>

      {/* 右侧：图片展示 */}
      <div className="flex-1 min-w-0">
        {/* 生成结果 */}
        {results.length > 0 ? (
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
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        上色线稿生图
                      </span>
                    </div>
                    <p className="text-gray-800 bg-gray-50 rounded-lg p-3 text-sm">
                      {result.prompt}
                    </p>
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">原始上色线稿：</p>
                      <img
                        src={result.uploadedImage}
                        alt="原始上色线稿"
                        className="h-24 w-auto rounded border border-gray-200"
                      />
                    </div>
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
                        className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 transition-transform duration-200 group-hover:scale-105 bg-gray-50"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjNmNGY2Ci8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzZiNzI4MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPuWbvueJh+WKoOi9veWksei0pTwvdGV4dD48L3N2Zz4=';
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
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <Upload className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">上传上色线稿开始创作</p>
              <p className="text-sm">上传已上色的服装线稿图并添加描述</p>
            </div>
          </div>
        )}
      </div>

      {/* 图片放大查看 */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-[90vw] max-h-[90vh] flex items-center justify-center">
            <img
              src={selectedImage}
              alt="放大查看"
              className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '90vw', maxHeight: '90vh' }}
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