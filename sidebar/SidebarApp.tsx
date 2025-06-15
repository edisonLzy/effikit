import React from 'react';
import { MemoryRouter, Routes, Route } from 'react-router';
import { ToolManagerPage } from './components/ToolManagerPage';

// 工具详情页面组件（占位符）
function ToolDetailPage() {
  return (
    <div className="h-full bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">工具详情页面</h2>
        <p className="text-muted-foreground">此页面将显示具体工具的详细配置</p>
      </div>
    </div>
  );
}

// 404页面组件
function NotFoundPage() {
  return (
    <div className="h-full bg-background flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold mb-2">页面未找到</h2>
        <p className="text-muted-foreground">您访问的页面不存在</p>
      </div>
    </div>
  );
}

export default function SidebarApp() {
  return (
    <div className="h-full bg-background">
      <MemoryRouter initialEntries={['/']}>
        <Routes>
          {/* 主页面 - 工具管理页面 */}
          <Route path="/" element={<ToolManagerPage />} />
          
          {/* 工具详情页面 */}
          <Route path="/tool/:toolId" element={<ToolDetailPage />} />
          
          {/* 404页面 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </MemoryRouter>
    </div>
  );
} 