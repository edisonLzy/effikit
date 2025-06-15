import React from 'react';
import type { Tool } from '@/sidebar/types';

interface ToolGridProps {
  tools: Tool[];
  enabledTools: Record<string, boolean>;
  onToolSelect: (toolId: string) => void;
  onToolToggle?: (toolId: string) => void;
  showOnlyEnabled?: boolean;
}

interface ToolIconProps {
  tool: Tool;
  isEnabled: boolean;
  onClick: () => void;
  onToggle?: () => void;
}

function ToolIcon(props: ToolIconProps) {
  const { tool, isEnabled, onClick, onToggle } = props;
  const IconComponent = tool.icon;

  return (
    <div className="group relative">
      {/* 工具图标按钮 */}
      <button
        onClick={onClick}
        className={`
          relative w-20 h-20 rounded-2xl flex items-center justify-center
          transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]
          border border-gray-200/60 backdrop-blur-sm
          ${isEnabled 
      ? 'bg-white shadow-sm hover:shadow-md hover:border-gray-300/80' 
      : 'bg-gray-50/50 hover:bg-gray-100/50 opacity-60'
    }
        `}
        title={tool.description}
      >
        <IconComponent 
          className={`w-9 h-9 ${isEnabled ? 'text-gray-700' : 'text-gray-400'}`} 
        />
        
        {/* 简约状态指示器 */}
        {isEnabled && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white shadow-sm" />
        )}
      </button>

      {/* 工具名称 */}
      <div className="mt-3 text-center px-1">
        <p className={`text-sm font-medium truncate ${isEnabled ? 'text-gray-800' : 'text-gray-500'}`}>
          {tool.name}
        </p>
        {tool.category && (
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {tool.category}
          </p>
        )}
      </div>

      {/* 悬停时的操作按钮 */}
      {onToggle && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggle();
          }}
          className={`
            absolute top-1 right-1 w-6 h-6 rounded-full
            opacity-0 group-hover:opacity-100 transition-all duration-200
            flex items-center justify-center text-xs font-semibold
            backdrop-blur-sm border border-white/50 shadow-sm
            ${isEnabled 
          ? 'bg-red-500/90 hover:bg-red-600 text-white' 
          : 'bg-green-500/90 hover:bg-green-600 text-white'
        }
          `}
          title={isEnabled ? '禁用工具' : '启用工具'}
        >
          {isEnabled ? '−' : '+'}
        </button>
      )}
    </div>
  );
}

export function ToolGrid(props: ToolGridProps) {
  const { 
    tools, 
    enabledTools, 
    onToolSelect, 
    onToolToggle,
    showOnlyEnabled = false 
  } = props;

  // 根据配置过滤工具
  const displayTools = showOnlyEnabled 
    ? tools.filter(tool => enabledTools[tool.id])
    : tools;

  if (displayTools.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto">
            <div className="w-8 h-8 border-2 border-gray-300 rounded-lg"></div>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">暂无工具</p>
            <p className="text-xs text-gray-400 mt-1">请启用一些工具开始使用</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto">
      <div className="p-6 pb-20">
        {/* 现代简约网格容器 */}
        <div className={`
          grid gap-8 justify-items-center
          grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6
          max-w-5xl mx-auto
        `}>
          {displayTools.map((tool) => (
            <ToolIcon
              key={tool.id}
              tool={tool}
              isEnabled={enabledTools[tool.id]}
              onClick={() => onToolSelect(tool.id)}
              onToggle={onToolToggle ? () => onToolToggle(tool.id) : undefined}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 