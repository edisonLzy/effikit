# Project Rules

## important rules

- 不要在完成代码编写之后,自行运行脚本. 比如 `pnpm run lint` 或者 `pnpm run dev` 等等

## Chrome Extension Guide

```
---
description: 
globs: 
alwaysApply: true
---
You are an expert Chrome extension developer, proficient in JavaScript/TypeScript, browser extension APIs, and web development.

Code Style and Structure
- Write clear, modular TypeScript code with proper type definitions
- Follow functional programming patterns; avoid classes
- Use descriptive variable names (e.g., isLoading, hasPermission)
- Structure files logically: popup, background, content scripts, utils
- Implement proper error handling and logging
- Document code with JSDoc comments

Architecture and Best Practices
- Strictly follow Manifest V3 specifications
- Divide responsibilities between background, content scripts and popup
- Configure permissions following the principle of least privilege
- Use modern build tools (webpack/vite) for development
- Implement proper version control and change management

Chrome API Usage
- Use chrome.* APIs correctly (storage, tabs, runtime, etc.)
- Handle asynchronous operations with Promises
- Use Service Worker for background scripts (MV3 requirement)
- Implement chrome.alarms for scheduled tasks
- Use chrome.action API for browser actions
- Handle offline functionality gracefully

Security and Privacy
- Implement Content Security Policy (CSP)
- Handle user data securely
- Prevent XSS and injection attacks
- Use secure messaging between components
- Handle cross-origin requests safely
- Implement secure data encryption
- Follow web_accessible_resources best practices

Performance and Optimization
- Minimize resource usage and avoid memory leaks
- Optimize background script performance
- Implement proper caching mechanisms
- Handle asynchronous operations efficiently
- Monitor and optimize CPU/memory usage

UI and User Experience
- Follow Apple Design guidelines
- Implement responsive popup windows
- Provide clear user feedback
- Support keyboard navigation
- Ensure proper loading states
- Add appropriate animations

Internationalization
- Use chrome.i18n API for translations
- Follow _locales structure
- Support RTL languages
- Handle regional formats

Accessibility
- Implement ARIA labels
- Ensure sufficient color contrast
- Support screen readers
- Add keyboard shortcuts

Testing and Debugging
- Use Chrome DevTools effectively
- Write unit and integration tests
- Test cross-browser compatibility
- Monitor performance metrics
- Handle error scenarios

Publishing and Maintenance
- Prepare store listings and screenshots
- Write clear privacy policies
- Implement update mechanisms
- Handle user feedback
- Maintain documentation

Follow Official Documentation
- Refer to Chrome Extension documentation
- Stay updated with Manifest V3 changes
- Follow Chrome Web Store guidelines
- Monitor Chrome platform updates

Output Expectations
- Provide clear, working code examples
- Include necessary error handling
- Follow security best practices
- Ensure cross-browser compatibility
- Write maintainable and scalable code
```

## Code Style Guide

```
---
description: 
globs: 
alwaysApply: true
---
---
description: 代码风格约束规则 - 强制使用命名导出提升代码可维护性
globs: "**/*.{ts,tsx,js,jsx}"
alwaysApply: true
---

# 代码风格约束规则

## Goal

建立一致的代码风格标准，确保代码的可读性、可维护性和团队协作效率。重点规范模块导入导出方式，提升代码质量。

## Critical Rules

### **模块导出规范**
- **强制使用 Named Export**：所有组件、函数、类型都必须使用命名导出
- **禁止 Default Export**：避免使用默认导出，防止命名不一致和重构困难
- **统一导出方式**：保持代码库中导出方式的一致性
- **提升可重构性**：命名导出支持更好的IDE重构和静态分析

### **导出格式标准**
- **组件导出**：React组件必须使用命名导出
- **工具函数导出**：所有工具函数使用命名导出
- **类型定义导出**：TypeScript类型和接口使用命名导出
- **常量导出**：配置常量和枚举使用命名导出

### **导入格式标准**
- **结构化导入**：使用解构导入获取具体的命名导出
- **明确依赖**：导入语句清晰表明具体使用的模块内容
- **避免通配符**：不使用 `import *` 的方式导入
- **类型导入分离**：使用 `import type` 导入仅类型定义

## Examples

<example>

**✅ 正确示例：组件命名导出**

```tsx
// components/Button.tsx
interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
}

export function Button(props: ButtonProps) {
  const { children, onClick, variant = 'primary' } = props;
  return (
    <button 
      className={`btn btn-${variant}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export type { ButtonProps };
```

**✅ 正确示例：Hook命名导出**

```tsx
// hooks/useCounter.ts
interface UseCounterReturn {
  count: number;
  increment: () => void;
  decrement: () => void;
  reset: () => void;
}

export function useCounter(initialValue = 0): UseCounterReturn {
  const [count, setCount] = useState(initialValue);

  const increment = useCallback(() => {
    setCount(prev => prev + 1);
  }, []);

  const decrement = useCallback(() => {
    setCount(prev => prev - 1);
  }, []);

  const reset = useCallback(() => {
    setCount(initialValue);
  }, [initialValue]);

  return {
    count,
    increment,
    decrement,
    reset
  };
}

export type { UseCounterReturn };
```

**✅ 正确示例：工具函数命名导出**

```tsx
// utils/formatters.ts
export function formatCurrency(amount: number, currency = 'CNY'): string {
  return new Intl.NumberFormat('zh-CN', {
    style: 'currency',
    currency
  }).format(amount);
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('zh-CN');
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}
```

**✅ 正确示例：类型定义命名导出**

```tsx
// types/user.ts
export interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
}

export interface UserSettings {
  theme: 'light' | 'dark';
  language: string;
  notifications: boolean;
}

export type UserRole = 'admin' | 'user' | 'guest';

export enum UserStatus {
  Active = 'active',
  Inactive = 'inactive',
  Banned = 'banned'
}
```

**✅ 正确示例：导入使用**

```tsx
// pages/UserProfile.tsx
import React from 'react';
import { Button } from '@/components/Button';
import { useCounter } from '@/hooks/useCounter';
import { formatDate, truncateText } from '@/utils/formatters';
import type { User, UserSettings } from '@/types/user';

interface UserProfileProps {
  user: User;
  settings: UserSettings;
}

export function UserProfile(props: UserProfileProps) {
  const { user, settings } = props;
  const { count, increment } = useCounter();

  return (
    <div className="user-profile">
      <h1>{truncateText(user.username, 20)}</h1>
      <p>加入时间: {formatDate(new Date())}</p>
      <p>访问次数: {count}</p>
      <Button onClick={increment}>
        增加访问
      </Button>
    </div>
  );
}
```

</example>

<example type="invalid">

**❌ 错误：使用默认导出**

```tsx
// ❌ 错误：组件默认导出
import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
}

const Button = (props: ButtonProps) => {
  return <button>{props.children}</button>;
};

export default Button; // ❌ 应该使用: export { Button };
```

**❌ 错误：Hook默认导出**

```tsx
// ❌ 错误：Hook默认导出
import { useState } from 'react';

const useCounter = (initialValue = 0) => {
  const [count, setCount] = useState(initialValue);
  return { count, setCount };
};

export default useCounter; // ❌ 应该使用: export { useCounter };
```

**❌ 错误：混合导出方式**

```tsx
// ❌ 错误：同时使用默认导出和命名导出
export function formatDate(date: Date): string {
  return date.toLocaleDateString();
}

const formatCurrency = (amount: number) => {
  return `¥${amount}`;
};

export default formatCurrency; // ❌ 应该统一使用命名导出
export { formatDate }; // ❌ 风格不一致
```

**❌ 错误：导入时重命名导致混乱**

```tsx
// ❌ 错误：默认导出导致导入时命名不一致
import MyButton from '@/components/Button'; // ❌ 不同文件可能使用不同名称
import CustomButton from '@/components/Button'; // ❌ 命名混乱
import Btn from '@/components/Button'; // ❌ 无法保证命名一致性

// ✅ 正确：命名导出确保一致性
import { Button } from '@/components/Button'; // ✅ 名称固定，易于搜索和重构
```

**❌ 错误：类型默认导出**

```tsx
// ❌ 错误：类型默认导出
interface User {
  id: string;
  name: string;
}

export default User; // ❌ 应该使用: export type { User };

// ❌ 错误：导入类型时命名不一致
import UserType from '@/types/user'; // ❌ 可能被命名为不同名称
import UserData from '@/types/user'; // ❌ 命名混乱
```

</example>

## Benefits

### **代码质量提升**
- **一致性**：整个代码库使用统一的导出方式
- **可搜索性**：IDE可以准确搜索和定位具体的导出项
- **重构友好**：支持安全的重命名和移动操作

### **团队协作效率**
- **减少混淆**：避免因默认导出导致的命名不一致
- **代码审查**：更容易发现导入导出相关的问题
- **新人友好**：统一的代码风格降低学习成本

### **工具支持**
- **Tree Shaking**：打包工具能更好地进行死代码消除
- **静态分析**：linter和类型检查器能提供更准确的提示
- **自动补全**：IDE能提供更精确的导入建议
```

## Project Structure Guide

```
---
description: 
globs: 
alwaysApply: true
---
# 项目结构规则

## Goal

为Chrome扩展项目建立清晰的目录结构职责规范，确保代码组织的一致性和可维护性。

## Critical Rules

### 核心目录职责

- **`lib/`** - 通用工具库
  - 存放跨项目可复用的工具函数、类型定义和核心逻辑
  - 不依赖于特定业务场景的通用功能

- **`sidebar/`** - 侧边栏应用
  - 扩展的主要用户界面和业务逻辑
  - 包含侧边栏特定的组件、样式和脚本

- **`sidebar/components/`** - 侧边栏专用组件
  - 与侧边栏业务逻辑紧密相关的组件
  - 不适合其他项目复用的业务组件

- **`sidebar/hooks/`** - 侧边栏专用 React Hooks
  - 处理侧边栏特定的状态管理和业务逻辑
  - 与侧边栏功能紧密相关的自定义 hooks

- **`hooks/`** - 全局 React Hooks
  - 存放可在多个组件间复用的 React hooks
  - 与侧边栏无关的通用 hooks

- **`components/`** - 全局可复用组件
  - 存放项目内可复用的UI组件
  - 不依赖特定业务场景的通用组件

- **`components/ui/`** - 基础UI组件
  - 基于 shadcn/ui 的原子级UI组件
  - 高度可复用的基础组件如按钮、输入框等

### 静态资源目录

- **`public/`** - 公共静态资源
  - 存放需要直接访问的静态文件
  - 如logo、图标等公共资源

- **`images/`** - 扩展图片资源
  - 存放扩展专用的图标和图片
  - 如扩展图标、背景图等

### 配置和元数据目录

- **`.cursor/`** - Cursor IDE 配置
  - 存放 Cursor 编辑器的配置文件
  - 包含 MCP 配置和项目规则

- **`.cursor/rules/`** - 项目规则文件
  - 存放项目开发规范和最佳实践
  - 按功能模块分类的规则文件

- **`.cursor/rules/frontend/`** - 前端开发规则
  - 前端代码规范和组件开发规则

- **`.cursor/rules/taskmaster/`** - 任务管理规则
  - TaskMaster 任务管理相关规则

- **`.cursor/rules/workflows/`** - 工作流程规则
  - 开发工作流程和最佳实践

- **`.taskmaster/`** - TaskMaster 配置
  - 任务管理工具的配置和数据存储

- **`.taskmaster/docs/`** - 项目文档
  - 项目需求文档和设计文档

- **`.taskmaster/tasks/`** - 任务文件
  - 任务定义和跟踪文件

- **`.taskmaster/reports/`** - 任务报告
  - 任务复杂度分析和进度报告

- **`.taskmaster/templates/`** - 模板文件
  - 项目模板和示例文件


## Examples

<example>
创建工具管理组件:
- 路径: `sidebar/components/ToolSettingsPanel.tsx`

创建可复用按钮:
- 路径: `components/ui/icon-button.tsx`

创建数据处理Hook:
- 路径: `sidebar/hooks/useToolConfig.ts`

创建通用Hook:
- 路径: `hooks/useLocalStorage.ts`

创建项目规则:
- 路径: `.cursor/rules/frontend/component_naming.mdc`
</example>

<example type="invalid">
❌ 在根目录创建组件: `ToolPanel.tsx`
✅ 正确路径: `sidebar/components/ToolPanel.tsx`

❌ Hook放错位置: `sidebar/useToolData.ts`
✅ 正确路径: `sidebar/hooks/useToolData.ts`

❌ 业务组件放UI目录: `components/ui/ToolManager.tsx`
✅ 正确路径: `sidebar/components/ToolManager.tsx`

❌ 通用Hook放错位置: `sidebar/hooks/useDebounce.ts`
✅ 正确路径: `hooks/useDebounce.ts`

❌ 静态资源放错位置: `sidebar/images/logo.png`
✅ 正确路径: `public/logo.png` 或 `images/logo.png`
</example>
```

## React Coding Guide

```
---
description: 
globs: 
alwaysApply: true
---
# React 组件编写规范

## Goal

建立基于 Hook First 原则的 React 组件开发标准，实现视图与逻辑的严格分离，确保代码的可维护性、可测试性和可复用性。

## Critical Rules

### **视图与逻辑严格分离**
- **视图层**：组件只负责 UI 渲染和用户交互事件绑定
- **逻辑层**：所有业务逻辑、状态管理、副作用必须封装在自定义 Hook 中
- **数据层**：数据获取、缓存、同步通过专门的 Hook 管理

### **Hook First 原则**
- **优先使用自定义 Hook** 封装所有业务逻辑
- **组件内部禁止直接写业务逻辑**
- **每个 Hook 职责单一且可复用**
- **使用 use 前缀命名** 所有自定义 Hook

### **UI组件和图标选择标准**
- **优先使用shadcn/ui组件**：所有基础UI组件必须使用shadcn/ui组件库，不允许自行实现重复功能
- **使用Lucide图标库**：所有图标必须从Lucide React图标库导入，保持图标风格统一
- **组件定制而非重建**：需要特殊UI时，应基于shadcn/ui组件进行样式扩展，而非从零实现
- **保持视觉一致性**：严格遵循项目设计系统，不引入与shadcn/ui和Lucide风格不一致的组件

### **组件结构标准**

- **组件和hook格式**：不要使用const以及FC定义组件和hook.
- **Props 接口定义**：每个组件必须定义清晰的 Props 接口
- **错误边界处理**：在 Hook 中统一处理错误，组件只负责展示错误状态

### **Hook 设计规范**
- **职责分离**：数据管理、搜索逻辑、UI 状态分别用不同 Hook 处理
- **Hook 组合**：通过组合多个简单 Hook 创建复杂功能
- **返回值统一**：Hook 返回对象包含状态、操作函数和错误处理
- **副作用封装**：所有 useEffect 逻辑封装在 Hook 内部

### **状态管理原则**
- **本地状态优先**：组件内部状态使用 useState
- **全局状态谨慎**：只有真正需要跨组件共享的状态才使用 Context
- **状态提升**：在合适的层级管理状态，避免过度提升
- **不可变更新**：状态更新遵循不可变原则

### **组件拆分策略**
- **容器组件与展示组件分离**：逻辑组件负责数据，展示组件负责渲染
- **单一职责原则**：每个组件只负责一个明确的功能
- **组件粒度合理**：避免过度拆分或巨型组件
- **可复用性考虑**：通用组件抽取到 components 目录

## Examples

<example>

**正确示例：组件结构**

```tsx
interface ToolbarProps {

}
function Toolbar(props: ToolbarProps){
    const { } = props;
}
```

**正确示例：Hook结构**

```tsx
interface UseToolbarOptions {

}
function useToolbar(options: UseToolbarOptions){
    const { } = options;
}
```

**正确示例：视图与逻辑分离**

```tsx
// ✅ 正确：视图与逻辑分离
import React from 'react';
import { useToolManagement } from '@/hooks/useToolManagement';
import { useToolSearch } from '@/hooks/useToolSearch';
import { ToolList } from './ToolList';
import { SearchBar } from './SearchBar';

interface ToolManagerProps {
  initialTools?: Tool[];
}

export function ToolManager(props: ToolManagerProps){

  const { initialTools } = props;

  // 🎯 所有逻辑通过 Hook 处理
  const {
    tools,
    enabledTools,
    isLoading,
    error,
    toggleTool,
    refreshTools
  } = useToolManagement(initialTools);

  const {
    searchTerm,
    filteredTools,
    handleSearch,
    clearSearch
  } = useToolSearch(tools);

  // 🎯 组件只负责渲染和事件绑定
  if (isLoading) {
    return <div className="loading">加载中...</div>;
  }

  if (error) {
    return <div className="error">错误: {error}</div>;
  }

  return (
    <div className="tool-manager">
      <SearchBar
        value={searchTerm}
        onChange={handleSearch}
        onClear={clearSearch}
        placeholder="搜索工具..."
      />
      <ToolList
        tools={filteredTools}
        enabledTools={enabledTools}
        onToggle={toggleTool}
        onRefresh={refreshTools}
      />
    </div>
  );
};
```

**正确示例：自定义 Hook 设计**
```tsx
// ✅ 数据管理 Hook
function useToolData(initialTools: Tool[]) {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTool = useCallback((tool: Tool) => {
    setTools(prev => [...prev, tool]);
  }, []);

  const removeTool = useCallback((toolId: string) => {
    setTools(prev => prev.filter(t => t.id !== toolId));
  }, []);

  return {
    tools,
    isLoading,
    error,
    addTool,
    removeTool
  };
}

```

</example>

<example type="invalid">

**❌ 错误：组件内直接写业务逻辑**
```tsx
// ❌ 错误：不要在组件内直接写业务逻辑
export const ToolManager: React.FC<ToolManagerProps> = ({ initialTools }) => {
  const [tools, setTools] = useState(initialTools);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // ❌ 不要在组件内直接写复杂逻辑
  const handleToggleTool = async (toolId: string) => {
    setIsLoading(true);
    try {
      const updatedTool = await api.toggleTool(toolId);
      setTools(prev => prev.map(tool => 
        tool.id === toolId ? updatedTool : tool
      ));
      await chrome.storage.local.set({ tools });
    } catch (error) {
      console.error('Toggle failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // ❌ 不要在组件内直接写搜索逻辑
  const filteredTools = useMemo(() => {
    return tools.filter(tool => 
      tool.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [tools, searchTerm]);

  return <div>{/* JSX */}</div>;
};
```

**❌ 错误：混合多种职责和使用 const 定义 Hook**
```tsx
// ❌ 错误：一个 Hook 处理多种不相关的逻辑，且使用 const 定义
const useEverything = () => {
  const [tools, setTools] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [apiData, setApiData] = useState(null);
  
  // 太多不相关的逻辑混合在一起
  // 应该拆分成独立的 Hook
  // 且应该使用 function 而不是 const
};
```

**❌ 错误：在组件内直接调用 API 和使用 const 定义组件**
```tsx
// ❌ 错误：组件内直接处理 API 调用，且使用 const 定义组件
const ToolManager = () => {
  const [tools, setTools] = useState([]);
  
  // ❌ 不要在组件内直接写 API 调用
  const handleSave = async () => {
    const response = await fetch('/api/tools', {
      method: 'POST',
      body: JSON.stringify(tools)
    });
    // API 处理逻辑应该在 Hook 中
  };

  return <div>{/* JSX */}</div>;
  // ❌ 应该使用 function 而不是 const 定义组件
};
```

**❌ 错误：忽略错误处理和使用 const 定义 Hook**
```tsx
// ❌ 错误：没有错误处理的 Hook，且使用 const 定义
const useToolData = () => {
  const [tools, setTools] = useState([]);
  
  // ❌ 缺少错误处理
  const fetchTools = async () => {
    const data = await api.getTools(); // 可能失败
    setTools(data);
  };

  return { tools, fetchTools };
  // ❌ 应该使用 function 而不是 const 定义 Hook
};
  ```
</example>
```

## Tech Stack Guide

```
---
description: 
globs: 
alwaysApply: true
---
# Frontend Tech Stack

## Goal

定义EffiKit Chrome扩展项目的前端技术栈标准，确保所有代码生成严格遵循指定的技术选型和最佳实践。

## Critical Rules

### **Chrome扩展开发**
- **Framework**: 使用Extension.js作为构建工具
- **Manifest**: 严格遵循Manifest V3规范
- **Browser Support**: 同时支持Chromium和Firefox
- **Side Panel**: 使用Side Panel API实现侧边栏功能
- **Permissions**: 使用最小权限原则，仅申请必要权限
- **Background**: 使用Service Worker替代背景页面

### **React生态系统**
- **版本**: React 18.3.1及以上
- **渲染**: 使用ReactDOM.createRoot进行根渲染
- **模式**: 开发中使用React.StrictMode
- **JSX**: 使用JSX语法，文件扩展名为.tsx
- **路由**: 使用React Router DOM 7.6.2进行路由管理
- **状态管理**: 优先使用React内置hooks（useState、useReducer等）

### **TypeScript配置**
- **版本**: TypeScript 5.3.3
- **配置**: 严格模式开启，包含所有严格类型检查
- **模块系统**: ESNext模块系统
- **JSX处理**: preserve模式
- **类型定义**: 包含Chrome API类型定义
- **路径映射**: 支持@/*路径别名

### **样式系统**
- **框架**: Tailwind CSS 4.1.10作为主要样式框架
- **配置**: 使用CSS变量实现主题系统
- **组件样式**: 结合shadcn/ui的设计系统
- **预处理**: 使用PostCSS进行样式处理
- **响应式**: 移动优先的响应式设计原则

### **UI组件库**
- **主库**: shadcn/ui (New York风格)
- **基础组件**: Radix UI作为无样式基础组件
- **图标**: Lucide React作为图标库
- **工具**: 使用class-variance-authority管理条件样式
- **合并工具**: tailwind-merge和clsx用于类名处理

### **开发工具**
- **包管理**: 强制使用pnpm 10.7.0+

### **项目结构**
- **组件**: /components用于通用组件
- **样式**: /sidebar/styles.css作为主样式文件
- **类型**: TypeScript类型定义分布在各模块
- **路径别名**: @/*指向项目根目录

### **API文档获取**
- **文档源**: 当遇到API使用错误或需要最新API文档时，必须使用 `Context7 MCP` 获取最新的官方文档
- **获取方式**: 先使用`resolve-library-id`工具解析库名，再使用`get-library-docs`获取具体文档
- **适用场景**: Chrome Extension API、React API、TypeScript API、Tailwind CSS API等所有第三方库API
- **优先级**: Context7 MCP文档 > 本地缓存 > 网络搜索
- **使用原则**: 确保使用最新版本的API语法和最佳实践

## Examples

<example>

**正确的Chrome API使用**:
```typescript
// background.ts
chrome.runtime.onInstalled.addListener(() => {
  chrome.sidePanel.setPanelBehavior({
    openPanelOnActionClick: true
  });
});

// 内容脚本
if (typeof chrome !== 'undefined' && chrome.runtime) {
  chrome.runtime.sendMessage({ 
    type: 'DATA_UPDATE',
    payload: data 
  });
}
```

**正确的样式组织**:
```tsx
<div className='w-10 h-10'></div>
```

**正确的API文档获取流程**:
```typescript
// 当遇到Chrome Extension API错误时
// 1. 使用Context7 MCP获取最新文档
// 使用 resolve-library-id 工具: 库名 "chrome-extension"
// 使用 get-library-docs 工具: 获取具体API文档

// 2. 根据最新文档修正API使用
chrome.sidePanel.setPanelBehavior({
  openPanelOnActionClick: true
});
```
</example>

<example type="invalid">

**❌ 错误：不合规的Manifest V2语法**:
```json
{
  "manifest_version": 2,
  "background": {
    "scripts": ["background.js"]
  }
}
```

**❌ 错误：直接使用内联样式而非Tailwind**:

```tsx
<div style={{display: 'flex', alignItems: 'center'}}>
  {/* 应该使用: className="flex items-center" */}
</div>
```

**❌ 错误：直接使用外联样式而非Tailwind**:

```tsx
<div className="main">
  {/* 应该使用: className="flex items-center" */}
</div>
```

```css
.main {
    
}
```

**❌ 错误：未使用TypeScript类型定义**:
```javascript
// .js文件应该是.tsx
function Component(props) {
  return <div>{props.children}</div>;
}
```

**❌ 错误：不使用shadcn/ui组件而自建基础组件**:
```tsx
const Button = ({ children, onClick }) => (
  <button className="btn" onClick={onClick}>
    {children}
  </button>
);
// 应该使用: import { Button } from '@/components/ui/button';
```

**❌ 错误：API使用错误时不查询最新文档**:
```typescript
// 错误：直接猜测API用法或使用过时的API
chrome.browserAction.setPopup(); // 过时的API

// 正确：使用Context7 MCP查询chrome-extension最新文档
// 然后使用正确的API: chrome.action.setPopup()
```
</example>
```