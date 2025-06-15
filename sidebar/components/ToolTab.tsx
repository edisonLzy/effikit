import React from 'react';
import type { Tool } from '@/sidebar/types';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ToolTabProps {
  tool: Tool;
  isActive: boolean;
  isEnabled: boolean;
  onClick: () => void;
  onToggle?: () => void;
  showToggle?: boolean;
}

export const ToolTab: React.FC<ToolTabProps> = React.memo(({
  tool,
  isActive,
  isEnabled,
  onClick,
  onToggle,
  showToggle = false
}) => {
  const IconComponent = tool.icon;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle?.();
  };

  return (
    <Button
      variant={isActive ? 'default' : 'outline'}
      size="sm"
      onClick={onClick}
      className={cn(
        'flex items-center space-x-2 min-w-0 flex-shrink-0 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md whitespace-nowrap',
        isActive && 'bg-primary text-primary-foreground',
        !isEnabled && 'opacity-50'
      )}
      title={`${tool.name} - ${tool.description}`}
    >
      <IconComponent className="w-4 h-4 flex-shrink-0" />
      <span className="truncate text-sm max-w-20">{tool.name}</span>
      
      {isEnabled && (
        <Badge variant="secondary" className="text-xs px-1 py-0 h-4">
          启用
        </Badge>
      )}
      
      {showToggle && onToggle && (
        <button
          onClick={handleToggle}
          className="ml-1 text-xs opacity-70 hover:opacity-100"
          title={isEnabled ? '禁用工具' : '启用工具'}
        >
          {isEnabled ? '✓' : '○'}
        </button>
      )}
    </Button>
  );
});

ToolTab.displayName = 'ToolTab'; 