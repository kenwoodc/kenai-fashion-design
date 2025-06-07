'use client'

import { useState, useEffect } from 'react'
import { Trash2, Database, AlertTriangle } from 'lucide-react'

/**
 * localStorage存储管理组件
 * 提供存储空间查看和清理功能
 */
export default function StorageManager() {
  const [storageInfo, setStorageInfo] = useState<{
    used: number;
    total: number;
    percentage: number;
  } | null>(null)
  const [isClearing, setIsClearing] = useState(false)

  /**
   * 获取localStorage使用情况
   */
  const getStorageInfo = () => {
    try {
      let totalSize = 0
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          totalSize += localStorage[key].length + key.length
        }
      }
      
      // 估算总容量（通常为5-10MB，这里使用5MB作为保守估计）
      const estimatedTotal = 5 * 1024 * 1024 // 5MB in bytes
      const percentage = (totalSize / estimatedTotal) * 100
      
      setStorageInfo({
        used: totalSize,
        total: estimatedTotal,
        percentage: Math.min(percentage, 100)
      })
    } catch (error) {
      console.error('获取存储信息失败:', error)
    }
  }

  /**
   * 清理localStorage
   */
  const clearStorage = async () => {
    setIsClearing(true)
    try {
      // 保留重要的设置，只清理作品数据
      const importantKeys = ['theme', 'language', 'user-preferences']
      const backup: Record<string, string> = {}
      
      // 备份重要数据
      importantKeys.forEach(key => {
        const value = localStorage.getItem(key)
        if (value) {
          backup[key] = value
        }
      })
      
      // 清空localStorage
      localStorage.clear()
      
      // 恢复重要数据
      Object.entries(backup).forEach(([key, value]) => {
        localStorage.setItem(key, value)
      })
      
      // 重新获取存储信息
      setTimeout(() => {
        getStorageInfo()
        setIsClearing(false)
      }, 500)
    } catch (error) {
      console.error('清理存储失败:', error)
      setIsClearing(false)
    }
  }

  /**
   * 格式化字节大小
   */
  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B'
    const k = 1024
    const sizes = ['B', 'KB', 'MB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  useEffect(() => {
    getStorageInfo()
  }, [])

  if (!storageInfo) {
    return null
  }

  const isNearLimit = storageInfo.percentage > 80

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <Database className="h-5 w-5 text-gray-600" />
        <h3 className="font-medium text-gray-900">存储空间管理</h3>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-gray-600">已使用</span>
          <span className="font-medium">
            {formatBytes(storageInfo.used)} / {formatBytes(storageInfo.total)}
          </span>
        </div>

        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              isNearLimit ? 'bg-red-500' : 'bg-blue-500'
            }`}
            style={{ width: `${storageInfo.percentage}%` }}
          />
        </div>

        <div className="flex justify-between text-xs text-gray-500">
          <span>{storageInfo.percentage.toFixed(1)}% 已使用</span>
          {isNearLimit && (
            <span className="flex items-center gap-1 text-red-600">
              <AlertTriangle className="h-3 w-3" />
              存储空间不足
            </span>
          )}
        </div>
      </div>

      {isNearLimit && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <p className="text-sm text-yellow-800">
            存储空间即将用完，建议清理旧的作品数据以释放空间。
          </p>
        </div>
      )}

      <button
        onClick={clearStorage}
        disabled={isClearing}
        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isClearing ? (
          <>
            <div className="loading-spinner w-4 h-4" />
            <span>清理中...</span>
          </>
        ) : (
          <>
            <Trash2 className="h-4 w-4" />
            <span>清理存储空间</span>
          </>
        )}
      </button>

      <p className="text-xs text-gray-500">
        清理操作将删除所有保存的作品数据，但不会影响应用设置。
      </p>
    </div>
  )
} 