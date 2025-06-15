import React, { useCallback } from 'react';
import { ToolGrid } from './ToolGrid';
import { SearchBar } from './SearchBar';
import { useToolSearch } from '@/sidebar/hooks/useToolSearch';
import { useToolManagement } from '@/sidebar/hooks/useToolManagement';
import { useToolNavigation } from '@/sidebar/hooks/useToolNavigation';

export function ToolManagerPage() {
  // 🎯 所有逻辑通过 Hook 处理
  const {
    tools,
    enabledTools,
    isLoading,
    error,
    toggleTool,
    setActiveToolId
  } = useToolManagement();

  const {
    searchTerm,
    filteredTools,
    handleSearch,
    clearSearch,
    isSearching
  } = useToolSearch(tools);

  const {
    navigateToTool,
    isToolRoute
  } = useToolNavigation();

  // 视图模式状态：'grid' 或 'detail'

  // 🎯 组件只负责事件绑定
  const handleToolSelect = useCallback(async (toolId: string) => {
    await setActiveToolId(toolId);
    
    // 使用路由导航到工具详情页面
    navigateToTool(toolId);
  }, [setActiveToolId, navigateToTool]);

  const handleToolToggle = useCallback(async (toolId: string) => {
    try {
      await toggleTool(toolId);
    } catch (error) {
      console.error('切换工具失败:', error);
    }
  }, [toggleTool]);

  const handleSearchAndSelect = useCallback((toolId: string) => {
    handleToolSelect(toolId);
    clearSearch();
  }, [handleToolSelect, clearSearch]);

  // 检查是否应该显示详情视图（基于路由）
  const shouldShowDetail = isToolRoute();

  // 🎯 组件只负责渲染
  if (error) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto">
            <div className="w-6 h-6 bg-red-500 rounded-full"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-foreground mb-1">加载失败</p>
            <p className="text-xs text-muted-foreground mb-3">{error}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              重新加载
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-8 h-8 mx-auto">
            <div className="w-full h-full border-2 border-gray-200 border-t-blue-600 rounded-full animate-spin"></div>
          </div>
          <p className="text-sm text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  // 如果路由指向工具详情页面，则不显示这个组件（让ToolDetailPage处理）
  if (shouldShowDetail) {
    return null;
  }

  return (
    <div className="h-full bg-gray-50/30">
      {/* 简约布局容器 */}
      <div className="h-full flex flex-col">
        {/* 工具网格区域 - 占据主要空间 */}
        <div className="flex-1 overflow-hidden">
          <ToolGrid
            tools={searchTerm ? filteredTools : tools}
            enabledTools={enabledTools}
            onToolSelect={handleToolSelect}
            onToolToggle={handleToolToggle}
            showOnlyEnabled={false}
          />
        </div>

        {/* 底部搜索栏 - 固定在底部 */}
        <div className="flex-shrink-0 p-4 bg-white/80 backdrop-blur-sm border-t border-gray-200/50">
          <div className="max-w-md mx-auto">
            <SearchBar
              searchTerm={searchTerm}
              onSearchChange={handleSearch}
              onToolSelect={handleSearchAndSelect}
              filteredTools={filteredTools}
              placeholder="搜索工具..."
              showResults={true}
              isSearching={isSearching}
            />
          </div>
        </div>
      </div>
    </div>
  );
} 