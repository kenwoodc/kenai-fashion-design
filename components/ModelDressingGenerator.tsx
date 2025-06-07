'use client'

import { useState, useRef } from 'react'
import { Upload, X, Download, ZoomIn, Sparkles, Send, RefreshCw, ImageIcon, User } from 'lucide-react'

/**
 * 模特换装生成器组件
 * 支持上传服装平铺图、上传模特图和描述服装类型三个输入项，采用统一的UI设计风格
 */
export default function ModelDressingGenerator() {
  // 状态管理
  const [clothingImage, setClothingImage] = useState<File | null>(null)
  const [clothingImagePreview, setClothingImagePreview] = useState<string>('')
  const [modelImage, setModelImage] = useState<File | null>(null)
  const [modelImagePreview, setModelImagePreview] = useState<string>('')
  const [description, setDescription] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [results, setResults] = useState<string[]>([])
  const [error, setError] = useState('')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  // 添加状态来存储当前生成的信息
  const [currentGeneration, setCurrentGeneration] = useState<{
    description: string;
    timestamp: number;
    clothingImage: string;
    modelImage: string;
  } | null>(null);

  // 文件输入引用
  const clothingFileInputRef = useRef<HTMLInputElement>(null)
  const modelFileInputRef = useRef<HTMLInputElement>(null)

  /**
   * 处理服装平铺图上传
   */
  const handleClothingImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setClothingImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setClothingImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  /**
   * 处理模特图上传
   */
  const handleModelImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setModelImage(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setModelImagePreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
      setError('')
    }
  }

  /**
   * 生成模特换装图像
   */
  const generateImage = async () => {
    if (!clothingImage || !modelImage || !description.trim()) {
      setError('请上传服装平铺图、模特图并输入服装类型描述')
      return
    }

    setIsGenerating(true)
    setError('')
    
    // 设置当前生成信息
    setCurrentGeneration({
      description,
      timestamp: Date.now(),
      clothingImage: clothingImagePreview,
      modelImage: modelImagePreview
    });

    try {
      // 上传服装平铺图到ComfyUI (节点17)
      const clothingFormData = new FormData()
      clothingFormData.append('image', clothingImage)
      clothingFormData.append('type', 'input')
      clothingFormData.append('subfolder', '')

      const clothingUploadResponse = await fetch('/api/comfyui/upload', {
        method: 'POST',
        body: clothingFormData,
      })

      if (!clothingUploadResponse.ok) {
        throw new Error('服装平铺图上传失败')
      }

      const clothingUploadResult = await clothingUploadResponse.json()

      // 上传模特图到ComfyUI (节点18)
      const modelFormData = new FormData()
      modelFormData.append('image', modelImage)
      modelFormData.append('type', 'input')
      modelFormData.append('subfolder', '')

      const modelUploadResponse = await fetch('/api/comfyui/upload', {
        method: 'POST',
        body: modelFormData,
      })

      if (!modelUploadResponse.ok) {
        throw new Error('模特图上传失败')
      }

      const modelUploadResult = await modelUploadResponse.json()

      // 加载工作流
      const workflowResponse = await fetch('/workflow/模特换装.json')
      if (!workflowResponse.ok) {
        throw new Error(`工作流加载失败: ${workflowResponse.status} ${workflowResponse.statusText}`)
      }

      const workflow = await workflowResponse.json()

      // 更新工作流参数
      // 节点17: 服装平铺图
      workflow['17'].inputs.image = clothingUploadResult.name
      
      // 节点18: 模特图  
      workflow['18'].inputs.image = modelUploadResult.name
      
      // 节点557: 服装类型描述
      workflow['557'].inputs.text = description

      // 发送生成请求
      const generateResponse = await fetch('/api/comfyui/prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: workflow,
          client_id: 'kenai-web-client'
        }),
      })

      if (!generateResponse.ok) {
        throw new Error('图像生成失败')
      }

      const result = await generateResponse.json()
      
      if (result && result.prompt_id) {
        // 轮询检查生成状态
        await pollForResults(result.prompt_id)
      } else {
        throw new Error('生成请求失败')
      }
    } catch (error) {
      console.error('生成失败:', error)
      setError(error instanceof Error ? error.message : '生成失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  /**
   * 轮询检查生成结果
   */
  const pollForResults = async (promptId: string) => {
    return new Promise<void>((resolve, reject) => {
      let attempts = 0
      const maxAttempts = 60 // 最多等待5分钟

      const checkStatus = async () => {
        try {
          const response = await fetch(`/api/comfyui/history/${promptId}`)
          const history = await response.json()

          if (history[promptId] && history[promptId].status?.completed) {
            // 生成完成，获取图片
            const outputs = history[promptId].outputs
            const images: string[] = []

            // 查找预览图像节点的输出
            for (const nodeId in outputs) {
              const output = outputs[nodeId]
              if (output.images) {
                for (const image of output.images) {
                  images.push(`/api/comfyui/view?filename=${image.filename}&subfolder=${image.subfolder || ''}&type=${image.type || 'output'}`)
                }
              }
            }

            if (images.length > 0) {
              setResults(images)
              
              // 优化存储：只保存必要信息，避免存储大图片数据
              try {
                const savedWorks = JSON.parse(localStorage.getItem('kenai-works') || '[]')
                const newWork = {
                  id: Date.now().toString(),
                  type: 'model-dressing',
                  description: description,
                  resultCount: images.length,
                  images: images,
                  timestamp: Date.now(),
                  createdAt: new Date().toISOString(),
                }
                
                // 限制保存的作品数量，避免存储溢出
                savedWorks.unshift(newWork)
                if (savedWorks.length > 50) {
                  savedWorks.splice(50) // 只保留最新的50个作品
                }
                
                localStorage.setItem('kenai-works', JSON.stringify(savedWorks))
              } catch (storageError) {
                console.warn('存储作品到本地失败，但生成成功:', storageError)
                // 存储失败不影响图片生成结果
              }
              
              resolve()
            } else {
              reject(new Error('未找到生成的图片'))
            }
          } else if (attempts < maxAttempts) {
            // 继续等待
            attempts++
            setTimeout(checkStatus, 5000) // 5秒后再次检查
          } else {
            reject(new Error('生成超时，请重试'))
          }
        } catch (error) {
          reject(error)
        }
      }

      checkStatus()
    })
  }

  /**
   * 清除所有结果和输入
   */
  const clearResults = () => {
    setResults([])
    setCurrentGeneration(null)
    setClothingImage(null)
    setClothingImagePreview('')
    setModelImage(null)
    setModelImagePreview('')
    setDescription('')
    setError('')
    if (clothingFileInputRef.current) clothingFileInputRef.current.value = ''
    if (modelFileInputRef.current) modelFileInputRef.current.value = ''
  }

  /**
   * 下载图片
   */
  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `kenai-model-dressing-${Date.now()}-${index + 1}.png`
      document.body.appendChild(link)
      link.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(link)
    } catch (err) {
      console.error('下载失败:', err)
    }
  }

  return (
    <div className="flex h-full gap-6">
      {/* 左侧：参数设置 */}
      <div className="w-96 flex-shrink-0 space-y-6">
        {/* 服装平铺图上传 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <Upload className="inline h-4 w-4 mr-1" />
            上传服装平铺图
          </label>
          <div className="space-y-4">
            <div
              onClick={() => clothingFileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
                ${clothingImagePreview 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                }
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {clothingImagePreview ? (
                <div className="space-y-3">
                  <img
                    src={clothingImagePreview}
                    alt="服装平铺图预览"
                    className="max-h-48 mx-auto rounded-lg border border-gray-200"
                  />
                  <p className="text-sm text-blue-600">点击重新上传</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <ImageIcon className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600">点击上传服装平铺图</p>
                    <p className="text-sm text-gray-400">支持 JPG、PNG 格式</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={clothingFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleClothingImageUpload}
              className="hidden"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* 模特图上传 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            <User className="inline h-4 w-4 mr-1" />
            上传模特图
          </label>
          <div className="space-y-4">
            <div
              onClick={() => modelFileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all duration-200
                ${modelImagePreview 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-300 hover:border-gray-400 bg-gray-50 hover:bg-gray-100'
                }
                ${isGenerating ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {modelImagePreview ? (
                <div className="space-y-3">
                  <img
                    src={modelImagePreview}
                    alt="模特图预览"
                    className="max-h-48 mx-auto rounded-lg border border-gray-200"
                  />
                  <p className="text-sm text-blue-600">点击重新上传</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <User className="h-12 w-12 text-gray-400 mx-auto" />
                  <div>
                    <p className="text-gray-600">点击上传模特图</p>
                    <p className="text-sm text-gray-400">支持 JPG、PNG 格式</p>
                  </div>
                </div>
              )}
            </div>
            <input
              ref={modelFileInputRef}
              type="file"
              accept="image/*"
              onChange={handleModelImageUpload}
              className="hidden"
              disabled={isGenerating}
            />
          </div>
        </div>

        {/* 服装类型描述 */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
            仅描述服装类型
          </label>
          <div className="relative">
            <textarea
              id="description"
              placeholder="请仅描述服装类型，例如：T恤、连衣裙、西装等..."
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
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
            onClick={generateImage}
            disabled={isGenerating || !clothingImage || !modelImage || !description.trim()}
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
                <span>生成图像</span>
              </>
            )}
          </button>

          {results.length > 0 && (
            <button
              onClick={clearResults}
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
        {results.length > 0 && currentGeneration ? (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-gray-900">生成结果</h3>
            
            <div className="border border-gray-200 rounded-xl p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-2">
                    <p className="text-sm text-gray-600">
                      {new Date(currentGeneration.timestamp).toLocaleString('zh-CN')}
                    </p>
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                      模特换装
                    </span>
                  </div>
                  <p className="text-gray-800 bg-gray-50 rounded-lg p-3 text-sm">
                    {currentGeneration.description}
                  </p>
                  <div className="mt-3 flex gap-4">
                    <div>
                      <p className="text-sm text-gray-600 mb-2">服装平铺图：</p>
                      <img
                        src={currentGeneration.clothingImage}
                        alt="服装平铺图"
                        className="h-24 w-auto rounded border border-gray-200"
                      />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 mb-2">模特图：</p>
                      <img
                        src={currentGeneration.modelImage}
                        alt="模特图"
                        className="h-24 w-auto rounded border border-gray-200"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className={`grid gap-4 ${
                results.length === 1 ? 'grid-cols-1 max-w-md mx-auto' :
                results.length === 2 ? 'grid-cols-1 md:grid-cols-2' :
                'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
              }`}>
                {results.map((imageUrl, index) => (
                  <div key={index} className="relative group cursor-pointer">
                    <img
                      src={imageUrl}
                      alt={`模特换装结果 ${index + 1}`}
                      className="w-full h-auto max-h-96 object-contain rounded-lg border border-gray-200 transition-transform duration-200 group-hover:scale-105 bg-gray-50"
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
                          handleDownload(imageUrl, index);
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
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center text-gray-500">
              <User className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium mb-2">开始您的模特换装创作</p>
              <p className="text-sm">上传服装平铺图和模特图，描述服装类型，即可生成模特换装效果</p>
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
                handleDownload(selectedImage, 0);
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
  )
} 