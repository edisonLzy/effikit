# EffiKit - 智能高亮插件

专业的网页高亮工具，支持文本标记、多彩高亮、云端同步，提升阅读和学习效率。

## ✨ 功能特色

- 🎨 **多彩高亮** - 支持多种颜色标记重要内容
- ☁️ **云端同步** - 基于 Supabase 的跨设备同步
- 📝 **笔记功能** - 为高亮内容添加个人笔记
- 🛡️ **样式隔离** - Custom Elements + Shadow DOM 确保不干扰原网页
- ⚡ **高性能** - 基于 Manifest V3 的现代扩展架构

## 🚀 快速开始

### 环境要求

- Node.js 18+
- pnpm 9+
- Chrome 88+ (支持 Manifest V3)

### 安装依赖

```bash
pnpm install
```

## 📋 可用脚本

### 开发模式

启动开发服务器，支持热重载：

```bash
pnpm dev
```

### 生产预览

在生产模式下预览扩展：

```bash
pnpm start
```

### 构建生产版本

构建用于发布的优化版本：

```bash
pnpm build
```

### 代码检查

运行 ESLint 检查代码质量：

```bash
pnpm lint
pnpm lint:fix  # 自动修复可修复的问题
```

## 🏗️ 技术架构

### 核心技术栈

- **前端框架**: React 18 + TypeScript
- **扩展平台**: Chrome Manifest V3
- **构建工具**: Extension.js (基于 webpack)
- **云端存储**: Supabase
- **样式方案**: Tailwind CSS + shadcn/ui
- **状态管理**: React Hooks + 自定义存储钩子

### 架构亮点

- **混合架构**: Custom Elements + React 实现样式完全隔离
- **多后端存储**: Supabase (主) + Chrome Storage (备用) 的容错机制
- **事件驱动**: 组件间通过自定义事件通信
- **渐进式加载**: 按需加载组件，优化性能

## 📁 项目结构

```
src/
├── background.ts          # Service Worker 后台脚本
├── content-script.ts      # 内容脚本入口
├── sidebar/              # 侧边栏 React 应用
├── highlighter/          # 高亮功能核心
│   ├── dom.ts           # DOM 操作和渲染
│   └── ui/              # React + Custom Elements UI
├── storage/              # 存储管理
│   ├── StorageManager.ts # 多后端存储管理器
│   └── adapters/        # 存储适配器
├── components/           # 通用 React 组件
├── hooks/               # 自定义 React Hooks
├── types/               # TypeScript 类型定义
└── utils/               # 工具函数
```

## 🔧 开发指南

### 高亮功能开发

当前高亮系统正在重构为 Custom Elements + React 架构，详见 `src/highlighter/docs/README.md`。

开发新的高亮功能时：
- 继承 `ReactCustomElement` 基类
- 使用 Shadow DOM 实现样式隔离
- 遵循事件驱动的通信模式

### 存储操作

- 使用 `StorageManager.getInstance()` 进行存储操作
- 自动处理 Supabase → Chrome Storage 的降级
- 实现适当的错误处理和重试机制

### 扩展 API 使用

- 遵循 Manifest V3 规范
- 使用 Service Worker 替代 background pages
- 通过 `chrome.runtime.sendMessage` 进行组件通信

## 🧪 测试

在进行更改时，请确保测试：

- [ ] 各种网站上的高亮创建和删除
- [ ] Supabase 和本地存储之间的同步
- [ ] 扩展安装和更新场景
- [ ] 样式隔离（高亮不应影响页面样式）

## 📚 了解更多

- [Extension.js 官方文档](https://extension.js.org)
- [Chrome Extensions API](https://developer.chrome.com/docs/extensions/)
- [Supabase 文档](https://supabase.com/docs)

## 📄 许可证

MIT License - 详见 [LICENSE](LICENSE) 文件

---

> 由 EffiKit Team 用 ❤️ 开发
