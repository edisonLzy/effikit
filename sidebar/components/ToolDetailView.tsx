import React from 'react';
import { Settings, AlertCircle } from 'lucide-react';
import type { Tool } from '@/lib/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

interface ToolDetailViewProps {
  currentTool?: Tool;
  isEnabled?: boolean;
  isLoading?: boolean;
  onToggleTool?: (toolId: string) => void;
  onConfigureTool?: (toolId: string) => void;
}

export const ToolDetailView: React.FC<ToolDetailViewProps> = ({
  currentTool,
  isEnabled = false,
  isLoading = false,
  onToggleTool,
  onConfigureTool
}) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <Settings className="w-8 h-8 mx-auto mb-2 animate-spin text-muted-foreground" />
            <p className="text-muted-foreground">加载中...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!currentTool) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-full">
          <div className="text-center">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
            <p className="text-muted-foreground">请选择一个工具</p>
            <p className="text-xs text-muted-foreground mt-1">
              点击下方标签栏中的工具标签查看详细信息
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const IconComponent = currentTool.icon;

  const handleToggle = () => {
    if (onToggleTool) {
      onToggleTool(currentTool.id);
    }
  };

  const handleConfigure = () => {
    if (onConfigureTool) {
      onConfigureTool(currentTool.id);
    }
  };

  return (
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-lg bg-muted">
              <IconComponent className="w-6 h-6 text-primary" />
            </div>
            <div>
              <CardTitle className="flex items-center space-x-2">
                <span>{currentTool.name}</span>
                <Badge variant={isEnabled ? 'default' : 'secondary'}>
                  {isEnabled ? '已启用' : '已禁用'}
                </Badge>
              </CardTitle>
              <CardDescription className="mt-1">
                {currentTool.description}
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 工具基本信息 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">工具信息</h3>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-muted-foreground">类别：</span>
              <span className="ml-1">{currentTool.category || '未分类'}</span>
            </div>
            <div>
              <span className="text-muted-foreground">版本：</span>
              <span className="ml-1">{currentTool.version || '1.0.0'}</span>
            </div>
          </div>
        </div>

        {/* 工具控制 */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">工具控制</h3>
          
          {/* 启用/禁用开关 */}
          <div className="flex items-center justify-between space-x-4">
            <Label htmlFor={`tool-enable-${currentTool.id}`} className="flex flex-col space-y-1">
              <span>启用工具</span>
              <span className="text-xs font-normal leading-snug text-muted-foreground">
                启用此工具以在标签栏中显示并使用其功能
              </span>
            </Label>
            <Switch
              id={`tool-enable-${currentTool.id}`}
              checked={isEnabled}
              onCheckedChange={handleToggle}
            />
          </div>

          {/* 配置按钮 */}
          {isEnabled && (
            <Button
              variant="outline"
              className="w-full"
              onClick={handleConfigure}
            >
              <Settings className="w-4 h-4 mr-2" />
              配置工具
            </Button>
          )}
        </div>

        {/* 工具描述 */}
        <div className="space-y-3">
          <h3 className="text-sm font-medium">详细说明</h3>
          <div className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg">
            <p>{currentTool.description}</p>
            <p className="mt-2">
              此工具可以帮助您提高开发效率。启用后，您可以在扩展的其他界面中使用此工具的功能。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 