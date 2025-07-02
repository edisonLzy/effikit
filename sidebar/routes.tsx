import { createMemoryRouter } from 'react-router';
import {
  AlertTriangle,
  BookOpen,
  FileText,
  Globe,
  Key,
  Link,
  Palette,
  Clipboard,
} from 'lucide-react';
import { Layout } from './layout';
import { Home } from './Home';
import { NotebookLLM } from './tools/NotebookLLM';
import { URLEncoder } from './tools/URLEncoder';
import { JSONViewer } from './tools/JSONViewer';
import { Base64Encoder } from './tools/Base64Encoder';
import { ColorPicker } from './tools/ColorPicker';
import { RequestInterceptor } from './tools/RequestInterceptor';
import { ClipboardViewer } from './tools/ClipboardViewer';
import { NotFoundPage } from './404';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorTestComponent } from './components/ErrorTestComponent';
import type { RouteObject } from 'react-router';
import type { ReactNode } from 'react';

type RouteHandle = {
  label: string;
  icon: ReactNode;
  description: string;
};

export const toolRoutes: RouteObject[] = [
  {
    path:'NotebookLLM',
    element: <NotebookLLM />,
    handle: {
      label: 'NotebookLLM',
      description: '智能笔记助手，帮助您创建和管理知识库',
      icon: <BookOpen className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'ErrorTest',
    element: <ErrorTestComponent />,
    handle: {
      label: '错误测试',
      description: '测试错误边界组件的功能',
      icon: <AlertTriangle className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'ColorPalette',
    element: <ColorPicker />,
    handle: {
      label: '颜色选择器',
      description: '颜色格式转换、调色板生成和设计配色工具',
      icon: <Palette className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'RequestInterceptor',
    element: <RequestInterceptor />,
    handle: {
      label: 'HTTP拦截器',
      description: 'HTTP请求拦截和Mock响应工具',
      icon: <Globe className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'URLEncoder',
    element: <URLEncoder />,
    handle: {
      label: 'URL编码',
      description: '对URL进行编码和解码处理，支持中文字符和特殊符号',
      icon: <Link className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'JSONViewer',
    element: <JSONViewer />,
    handle: {
      label: 'JSON查看器',
      description: 'JSON格式化、验证、压缩和美化工具',
      icon: <FileText className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'Base64Encoder',
    element: <Base64Encoder />,
    handle: {
      label: 'Base64编码',
      description: '支持文本和图片的Base64编码解码转换',
      icon: <Key className="w-4 h-4" />,
    } satisfies RouteHandle
  },
  {
    path:'ClipboardViewer',
    element: <ClipboardViewer />,
    handle: {
      label: '剪切板查看器',
      description: '查看剪切板内容, 支持多种MIME类型',
      icon: <Clipboard className="w-4 h-4" />,
    } satisfies RouteHandle
  }
];

export const router = createMemoryRouter([
  {
    path: '/',
    element: <Layout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <Home />
      },
      {
        path: 'tool',
        children: toolRoutes
      },
      {
        path: '*',
        element: <NotFoundPage />
      }
    ]
  }
]);