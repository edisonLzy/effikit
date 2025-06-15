import React, { useCallback } from 'react';
import { Plus, Search } from 'lucide-react';
import { ToolItem } from '../components/ToolItem';
import { ErrorDisplay } from '../components/ErrorDisplay';
import { useToolSearch } from '@/sidebar/hooks/useToolSearch';
import { useToolManagement } from '@/sidebar/hooks/useToolManagement';
import { useToolNavigation } from '@/sidebar/hooks/useToolNavigation';
import { Input } from '@/components/ui/input';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export function ToolManagerPage() {
  // 🎯 所有逻辑通过 Hook 处理
  const {
    tools,
    enabledTools,
    isLoading,
    error,
    setActiveToolId
  } = useToolManagement();

  const {
    searchTerm,
    filteredTools,
    handleSearch
  } = useToolSearch(tools);

  const {
    navigateToTool,
    isToolRoute
  } = useToolNavigation();

  // 🎯 组件只负责事件绑定
  const handleToolSelect = useCallback(async (toolId: string) => {
    await setActiveToolId(toolId);
    navigateToTool(toolId);
  }, [setActiveToolId, navigateToTool]);

  // 检查是否应该显示详情视图（基于路由）
  const shouldShowDetail = isToolRoute();

  // 🎯 组件只负责渲染
  if (error) {
    return (
      <div className="h-screen w-full bg-gray-800 flex items-center justify-center">
        <ErrorDisplay 
          message={error}
          onRetry={() => window.location.reload()}
        />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-screen w-full bg-gray-800 flex items-center justify-center">
        <LoadingSpinner size="md" />
      </div>
    );
  }

  // 如果路由指向工具详情页面，则不显示这个组件
  if (shouldShowDetail) {
    return null;
  }

  // 要显示的工具列表
  const displayTools = searchTerm ? filteredTools : tools.filter(tool => enabledTools[tool.id]);

  return (
    <div className="h-screen w-full bg-gray-800 flex flex-col p-4">
      {/* 页面标题 */}
      <div className="flex-shrink-0 px-4 mb-4">
        <div className="flex items-center justify-between">
          <h2 className="text-white font-semibold text-lg">工具管理</h2>
          <button className="p-2 rounded-lg hover:bg-gray-700/70 transition-colors">
            <Plus className="w-5 h-5 text-gray-400" />
          </button>
        </div>
      </div>

      {/* 工具列表 */}
      <div className="flex-shrink-0 space-y-2 mb-4 flex-1 overflow-y-auto">
        {displayTools.length > 0 ? (
          displayTools.map((tool) => (
            <ToolItem
              key={tool.id}
              tool={tool}
              onClick={() => handleToolSelect(tool.id)}
            />
          ))
        ) : (
          <div className="flex items-center justify-center h-40 text-gray-500">
            <p className="text-sm">未找到工具</p>
          </div>
        )}
      </div>

      {/* 搜索栏 */}
      <div className="flex-shrink-0 p-4 pt-6 mt-auto">
        <div className="relative">
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <Search className="w-5 h-5 text-gray-400" />
          </div>
          <Input
            type="text"
            placeholder="搜索工具..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full h-12 pl-10 pr-4 bg-gray-700 border-gray-600 text-white placeholder:text-gray-400 focus-visible:ring-blue-500/50 focus-visible:border-blue-500/50"
          />
        </div>
      </div>
    </div>
  );
} 