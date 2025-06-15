import React from 'react';
import { Plus } from 'lucide-react';
import { ToolTab } from './ToolTab';
import type { Tool } from '@/sidebar/types';
import { Button } from '@/components/ui/button';

interface ToolTabBarProps {
  tools: Tool[];
  enabledTools: Record<string, boolean>;
  currentToolId?: string;
  onToolSelect: (toolId: string) => void;
  onToolToggle?: (toolId: string) => void;
  showAddButton?: boolean;
  onAddTool?: () => void;
  showToggle?: boolean;
}

export const ToolTabBar: React.FC<ToolTabBarProps> = ({
  tools,
  enabledTools,
  currentToolId,
  onToolSelect,
  onToolToggle,
  showAddButton = false,
  onAddTool,
  showToggle = false
}) => {
  // 只显示启用的工具标签
  const enabledToolsList = tools.filter(tool => enabledTools[tool.id]);

  if (enabledToolsList.length === 0) {
    return (
      <div className="flex items-center justify-center h-10 text-muted-foreground text-sm">
        没有启用的工具
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 h-10 overflow-x-auto scrollbar-none">
      {/* 工具标签列表 */}
      <div className="flex gap-1 flex-shrink-0">
        {enabledToolsList.map((tool) => (
          <ToolTab
            key={tool.id}
            tool={tool}
            isActive={currentToolId === tool.id}
            isEnabled={enabledTools[tool.id]}
            onClick={() => onToolSelect(tool.id)}
            onToggle={onToolToggle ? () => onToolToggle(tool.id) : undefined}
            showToggle={showToggle}
          />
        ))}
      </div>

      {/* 添加工具按钮 */}
      {showAddButton && onAddTool && (
        <Button
          variant="outline"
          size="sm"
          onClick={onAddTool}
          className="flex-shrink-0 ml-2"
          title="添加工具"
        >
          <Plus className="w-4 h-4" />
        </Button>
      )}
    </div>
  );
}; 