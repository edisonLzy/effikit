# Highlighter 功能开发文档

## 项目概述

Highlighter 是 EffiKit Chrome 扩展的核心功能之一，提供网页文本高亮、标注和管理功能。该功能采用现代化的架构设计，结合 React 组件和 Custom Element 技术，实现了样式隔离和组件化开发。

## 目录结构分析

```
features/highlighter/
├── background.ts          # Background Script - 后台服务逻辑
├── content-script.ts      # Content Script - 页面注入脚本
├── dom.ts                 # 用于操作 ui 组件的工具函数
├── storage.ts             # 数据存储管理
├── types.ts               # TypeScript 类型定义
├── utils.ts               # 通用工具函数
├── ui/                    # UI 组件目录
│   └── ReactCustomElement.ts  # React Custom Element 基类
└── docs/                  # 文档目录
    ├── DEVELOP.md         # 开发文档 (本文件)
    └── README.md          # 功能重构方案
```

## 文件职责详解

### 核心文件

#### 1. `types.ts` - 类型定义中心
**职责**: 定义整个 Highlighter 功能的数据结构和类型接口

**核心类型**:
- `TagType`: 标签类型枚举 ('word' | 'annotation' | 'sentence')
- `HighlightColor`: 高亮颜色类型
- `TextRange`: 文本位置范围信息
- `HighlightTag`: 标签定义 (包含单词、批注、句子三种类型的内容)
- `Highlight`: 高亮数据结构 (包含文本、位置、颜色、标签等)
- `HighlightStorage`: 存储结构 (按 URL 组织的高亮数据)
- `HighlightSettings`: 功能设置

**设计特点**:
- 支持多种标签类型，满足不同使用场景
- 完整的位置信息记录，支持精确的文本定位
- 灵活的标签系统，一个高亮可以关联多个标签

#### 2. `background.ts` - 后台服务管理
**职责**: 处理扩展的后台逻辑，包括右键菜单、标签页状态管理和消息通信

**核心功能**:
- 创建和管理高亮相关的右键菜单
- 跟踪每个标签页的高亮启用状态
- 处理菜单点击事件 (切换功能、清除高亮、打开管理界面)
- 更新扩展图标和徽章状态
- 处理来自 content script 的消息

**状态管理**:
- `tabHighlightStatus`: Map 结构存储每个标签页的启用状态
- 动态更新图标显示当前页面是否有高亮内容

#### 3. `content-script.ts` - 页面注入脚本
**职责**: 在网页中注入高亮功能，处理用户交互

**当前状态**: 基础框架已搭建，主要功能待实现
- 导入了 Custom Elements polyfill
- 提供了调试日志功能
- 设置了初始化流程

#### 4. `storage.ts` - 数据存储管理
**职责**: 管理高亮数据和设置的持久化存储

**核心功能**:
- `saveHighlight()`: 保存单个高亮到 Chrome Storage
- `getHighlights()`: 获取指定 URL 或所有高亮数据
- `removeHighlight()`: 删除指定高亮
- `clearHighlights()`: 清除指定 URL 或所有高亮
- `getHighlightSettings()` / `saveHighlightSettings()`: 设置管理

**存储策略**:
- 使用 `chrome.storage.local` 进行本地存储
- 按 URL 组织高亮数据，便于页面级别的操作
- 自动清理空的 URL 条目

#### 5. `utils.ts` - 工具函数库
**职责**: 提供通用的工具函数和辅助方法

**核心功能**:
- `generateHighlightId()`: 生成唯一的高亮 ID
- `getHighlightColorClass()`: 获取颜色对应的 CSS 类名
- `normalizeUrl()`: URL 标准化处理
- `createRangeFromHighlight()`: 从高亮数据重建 Range 对象
- `checkEnvironment()`: 检查 Chrome API 可用性

#### 6. `dom.ts` - DOM 操作工具
**当前状态**: 文件为空，待实现
**预期职责**: 提供 DOM 操作相关的工具函数，如文本选择、高亮渲染等

### UI 组件

#### 7. `ui/ReactCustomElement.ts` - React Custom Element 基类
**职责**: 提供 React 组件在 Custom Element 中的通用容器功能

**核心特性**:
- **Shadow DOM 隔离**: 避免样式冲突
- **React 集成**: 在 Custom Element 中渲染 React 组件
- **生命周期管理**: 处理组件的挂载和卸载
- **样式管理**: 支持 Constructable Stylesheets 和降级方案
- **事件系统**: 提供自定义事件派发机制
- **属性监听**: 支持属性变化的响应式更新

**设计模式**:
- 抽象基类设计，子类需要实现 `createReactComponent()` 和 `createStyleSheet()`
- 错误处理和降级机制
- 类型安全的属性解析

## 架构设计理念

### 1. 分层架构
- **数据层**: `storage.ts` 负责数据持久化
- **逻辑层**: `background.ts` 处理业务逻辑和状态管理
- **表现层**: `content-script.ts` + UI 组件处理用户交互
- **工具层**: `utils.ts` 提供通用功能支持

### 2. 模块化设计
- 每个文件职责单一，便于维护和测试
- 通过 TypeScript 接口确保模块间的类型安全
- 使用事件驱动模式实现模块间解耦

### 3. 现代化技术栈
- **React 18**: 利用最新的 React 特性
- **Custom Elements**: 实现样式隔离和组件封装
- **TypeScript**: 提供类型安全和更好的开发体验
- **Chrome Extension Manifest V3**: 遵循最新的扩展开发标准

### 4. 扩展性考虑
- 灵活的标签系统支持未来功能扩展
- 抽象的 Custom Element 基类便于创建新的 UI 组件
- 模块化的存储接口支持不同的存储策略

## 开发状态

### 已完成
- ✅ 完整的类型定义系统
- ✅ 数据存储管理功能
- ✅ 后台服务和菜单管理
- ✅ 工具函数库
- ✅ React Custom Element 基类
- ✅ 基础的 content script 框架

### 待实现
- ⏳ DOM 操作工具 (`dom.ts`)
- ⏳ Content Script 的核心功能
- ⏳ 具体的 UI 组件 (颜色选择器、内容弹窗等)
- ⏳ 文本选择和高亮渲染逻辑
- ⏳ 标签管理功能

### 下一步开发计划
1. 实现 `dom.ts` 中的 DOM 操作工具
2. 完善 `content-script.ts` 的核心功能
3. 基于 `ReactCustomElement` 创建具体的 UI 组件
4. 实现文本选择和高亮渲染功能
5. 添加标签管理和编辑功能

## 开发规范

### 代码风格
- 使用命名导出，避免默认导出
- 遵循 TypeScript 严格模式
- 使用函数式组件和 Hook
- 保持文件职责单一

### 错误处理
- 所有异步操作都要有错误处理
- 提供有意义的错误信息
- 在 UI 层面提供错误状态展示

### 性能考虑
- 避免不必要的 DOM 操作
- 使用事件委托减少事件监听器
- 合理使用 React.memo 和 useMemo 优化渲染

这个架构为 Highlighter 功能提供了坚实的基础，既保证了代码的可维护性，又为未来的功能扩展留下了充足的空间。