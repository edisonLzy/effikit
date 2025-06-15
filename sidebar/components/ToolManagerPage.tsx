import React, { useState, useCallback } from 'react';
import { ToolDetailView } from './ToolDetailView';
import { ToolTabBar } from './ToolTabBar';
import { SearchBar } from './SearchBar';
import { useToolSearch } from '@/sidebar/hooks/useToolSearch';
import { useToolManagement } from '@/sidebar/hooks/useToolManagement';

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
    clearSearch
  } = useToolSearch(tools);

  // 临时注释路由功能，等解决导入问题
  // const {
  //   navigateToTool,
  //   getCurrentToolId,
  //   isToolRoute
  // } = useToolNavigation();

  // 本地状态管理当前选中的工具
  const [currentToolId, setCurrentToolId] = useState<string | null>(null);

  // 如果没有选中工具且有工具可用，选择第一个启用的工具
  if (!currentToolId && tools.length > 0 && !isLoading) {
    const firstEnabledTool = tools.find(t => enabledTools[t.id]);
    if (firstEnabledTool) {
      setCurrentToolId(firstEnabledTool.id);
    }
  }

  // 🎯 组件只负责事件绑定
  const handleToolSelect = useCallback(async (toolId: string) => {
    setCurrentToolId(toolId);
    await setActiveToolId(toolId);
  }, [setActiveToolId]);

  const handleToolToggle = useCallback(async (toolId: string) => {
    try {
      await toggleTool(toolId);
    } catch (error) {
      console.error('切换工具失败:', error);
    }
  }, [toggleTool]);

  const handleToolConfigure = useCallback((toolId: string) => {
    console.log('配置工具:', toolId);
    // TODO: 实现工具配置逻辑
  }, []);

  const handleSearchAndSelect = useCallback((toolId: string) => {
    handleToolSelect(toolId);
    clearSearch();
  }, [handleToolSelect, clearSearch]);

  // 获取当前工具信息
  const currentTool = currentToolId ? tools.find(t => t.id === currentToolId) : undefined;
  const isCurrentToolEnabled = currentToolId ? enabledTools[currentToolId] : false;

  // 🎯 组件只负责渲染
  if (error) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">错误: {error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            点击重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      {/* 整体布局容器 - 16px padding, 8px gap */}
      <div className="flex flex-col h-full p-4 space-y-2">
        
        {/* 工具详情展示区 - 占据主要空间 */}
        <div className="flex-1 min-h-0 overflow-y-auto">
          <ToolDetailView
            currentTool={currentTool}
            isEnabled={isCurrentToolEnabled}
            isLoading={isLoading}
            onToggleTool={handleToolToggle}
            onConfigureTool={handleToolConfigure}
          />
        </div>

        {/* 工具标签栏 */}
        <div className="h-10">
          <ToolTabBar
            tools={tools}
            enabledTools={enabledTools}
            currentToolId={currentToolId || undefined}
            onToolSelect={handleToolSelect}
            onToolToggle={handleToolToggle}
          />
        </div>

        {/* 搜索框 */}
        <div className="h-10">
          <SearchBar
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            onToolSelect={handleSearchAndSelect}
            filteredTools={filteredTools}
            showResults={true}
          />
        </div>
      </div>
    </div>
  );
} 