# KenAI 项目开发规则

## 📋 总体原则

### 设计理念
- **极简主义**: 界面简洁、功能明确、用户体验流畅
- **优雅美观**: 注重视觉设计和交互细节
- **渐进增强**: 先实现核心功能，再逐步完善
- **用户导向**: 以用户需求为中心，提供直观的操作体验

### 技术原则
- **类型安全**: 严格使用TypeScript，避免any类型
- **组件化**: 遵循React组件化开发模式
- **响应式**: 确保在各种设备上的良好体验
- **性能优化**: 注重加载速度和运行效率

## 🎨 UI/UX 设计规范

### 色彩规范
```css
/* 主色调 */
--primary-50: #f0f9ff;
--primary-500: #0ea5e9;
--primary-600: #0284c7;
--primary-700: #0369a1;

/* 中性色 */
--gray-50: #f9fafb;
--gray-100: #f3f4f6;
--gray-500: #6b7280;
--gray-900: #111827;
```

### 间距规范
- 基础间距单位: 4px (0.25rem)
- 组件内间距: 12px, 16px, 24px
- 组件间间距: 24px, 32px, 48px
- 页面边距: 16px (移动端), 24px (桌面端)

### 字体规范
- 主字体: Inter, system-ui, sans-serif
- 标题字重: 600-700
- 正文字重: 400-500
- 字号层级: 12px, 14px, 16px, 18px, 20px, 24px, 32px

### 圆角规范
- 小圆角: 6px (按钮、输入框)
- 中圆角: 12px (卡片)
- 大圆角: 16px (容器)

## 💻 代码规范

### 文件命名
- 组件文件: PascalCase (如: `TextToImageGenerator.tsx`)
- 工具文件: camelCase (如: `apiUtils.ts`)
- 页面文件: kebab-case (如: `text-to-image.tsx`)
- 样式文件: kebab-case (如: `global.css`)

### 组件规范
```typescript
/**
 * 组件描述
 * @param props - 组件属性
 */
export default function ComponentName({ prop1, prop2 }: ComponentProps) {
  // 状态定义
  const [state, setState] = useState<StateType>(initialValue);
  
  // 事件处理函数
  const handleEvent = useCallback(() => {
    // 处理逻辑
  }, [dependencies]);
  
  // 渲染
  return (
    <div className="component-container">
      {/* JSX内容 */}
    </div>
  );
}
```

### 注释规范
- 使用JSDoc格式注释
- 组件必须有描述注释
- 复杂函数必须有参数和返回值说明
- 关键业务逻辑必须有行内注释

### 错误处理
- 所有异步操作必须有错误处理
- 用户友好的错误提示
- 记录详细的错误日志
- 优雅降级处理

## 🔧 技术规范

### React开发规范
- 优先使用函数组件和Hooks
- 合理使用useMemo和useCallback优化性能
- 避免在render中创建对象和函数
- 正确使用useEffect的依赖数组

### TypeScript规范
- 严格模式开启
- 避免使用any类型
- 定义清晰的接口和类型
- 使用泛型提高代码复用性

### CSS规范
- 优先使用Tailwind CSS类
- 自定义样式放在globals.css中
- 使用CSS变量定义主题色彩
- 避免内联样式

### API设计规范
- RESTful API设计
- 统一的错误响应格式
- 适当的HTTP状态码
- 请求和响应数据验证

## 📁 项目结构规范

```
KenAI/
├── app/                    # Next.js App Router
│   ├── api/               # API路由
│   ├── (pages)/           # 页面组件
│   ├── globals.css        # 全局样式
│   ├── layout.tsx         # 根布局
│   └── page.tsx          # 首页
├── components/            # 可复用组件
│   ├── ui/               # 基础UI组件
│   ├── forms/            # 表单组件
│   └── features/         # 功能组件
├── lib/                  # 工具库
│   ├── utils.ts          # 通用工具函数
│   ├── api.ts            # API客户端
│   └── constants.ts      # 常量定义
├── types/                # TypeScript类型定义
├── hooks/                # 自定义Hooks
├── workflow/             # ComfyUI工作流
└── public/               # 静态资源
```

## 🚀 开发流程规范

### Git工作流
1. **分支命名**:
   - 功能分支: `feature/功能名称`
   - 修复分支: `fix/问题描述`
   - 热修复: `hotfix/紧急修复`

2. **提交信息**:
   ```
   type(scope): 简短描述
   
   详细描述（可选）
   
   类型:
   - feat: 新功能
   - fix: 修复
   - docs: 文档
   - style: 样式
   - refactor: 重构
   - test: 测试
   - chore: 构建/工具
   ```

### 代码审查
- 所有代码必须经过审查
- 检查代码规范和最佳实践
- 确保测试覆盖率
- 验证功能完整性

### 测试规范
- 单元测试覆盖核心逻辑
- 集成测试验证API接口
- E2E测试覆盖关键用户流程
- 性能测试确保响应速度

## 🔒 安全规范

### 数据安全
- 敏感信息不得硬编码
- 使用环境变量管理配置
- 输入数据验证和清理
- 防止XSS和CSRF攻击

### API安全
- 请求频率限制
- 输入参数验证
- 错误信息不泄露敏感信息
- 适当的CORS配置

## 📊 性能规范

### 前端性能
- 图片懒加载和压缩
- 代码分割和按需加载
- 缓存策略优化
- 首屏加载时间 < 3秒

### 后端性能
- API响应时间 < 500ms
- 数据库查询优化
- 缓存机制使用
- 资源使用监控

## 🧪 质量保证

### 代码质量
- ESLint规则检查
- Prettier代码格式化
- TypeScript类型检查
- 代码复杂度控制

### 用户体验
- 加载状态提示
- 错误状态处理
- 空状态设计
- 响应式适配

## 📈 版本管理

### 版本号规范
- 遵循语义化版本 (Semantic Versioning)
- 格式: MAJOR.MINOR.PATCH
- 主版本: 不兼容的API修改
- 次版本: 向下兼容的功能性新增
- 修订版本: 向下兼容的问题修正

### 发布流程
1. 功能开发完成
2. 代码审查通过
3. 测试验证通过
4. 更新版本号和CHANGELOG
5. 创建发布标签
6. 部署到生产环境

## 📝 文档规范

### 代码文档
- README.md: 项目介绍和使用说明
- API文档: 接口说明和示例
- 组件文档: 属性和使用方法
- 更新日志: 版本变更记录

### 注释要求
- 公共API必须有完整注释
- 复杂算法必须有实现说明
- 配置文件必须有参数说明
- 重要决策必须有设计文档

---

**遵循这些规范，确保KenAI项目的高质量和可维护性** 🎯 