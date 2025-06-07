import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KenAI - 服装行业AI应用平台',
  description: '专业的服装设计AI工具，提供文生图、图生图等智能设计功能',
  keywords: ['AI', '服装设计', '时尚', '人工智能', 'ComfyUI'],
  authors: [{ name: 'KenAI Team' }],
  viewport: 'width=device-width, initial-scale=1',
};

/**
 * 根布局组件
 * @param children - 子组件
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body className={inter.className}>
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
          {children}
        </div>
      </body>
    </html>
  );
} 