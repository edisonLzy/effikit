import React, { useState, useEffect } from 'react';
import { Search, Settings, Activity, Globe, Code, Zap } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';

interface Tool {
  id: number;
  name: string;
  description: string;
  enabled: boolean;
  icon: LucideIcon;
}

interface EffikitSettings {
  networkMonitorEnabled: boolean;
  responseEditingEnabled: boolean;
  performanceMonitorEnabled: boolean;
  automationEnabled: boolean;
}

export default function SidebarApp() {
  const [searchTerm, setSearchTerm] = useState('');
  const [tools] = useState<Tool[]>([
    { id: 1, name: '网络监控', description: '监控和分析网络请求', enabled: true, icon: Globe },
    { id: 2, name: '响应编辑', description: '编辑和模拟网络响应', enabled: false, icon: Code },
    { id: 3, name: '性能监控', description: '监控页面性能指标', enabled: true, icon: Activity },
    { id: 4, name: '自动化脚本', description: '运行自定义脚本', enabled: false, icon: Zap },
  ]);

  const [enabledTools, setEnabledTools] = useState<Record<number, boolean>>(
    tools.reduce((acc, tool) => ({ ...acc, [tool.id]: tool.enabled }), {})
  );

  const [isLoading, setIsLoading] = useState(true);

  // 从扩展存储加载设置
  useEffect(() => {
    const loadSettings = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ action: 'getStorageData' });
        if (response?.effikit_settings) {
          const settings: EffikitSettings = response.effikit_settings;
          setEnabledTools({
            1: settings.networkMonitorEnabled,
            2: settings.responseEditingEnabled,
            3: settings.performanceMonitorEnabled,
            4: settings.automationEnabled,
          });
        }
      } catch (error) {
        console.error('加载设置失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadSettings();
  }, []);

  const handleToolToggle = async (toolId: number) => {
    const newEnabledTools = {
      ...enabledTools,
      [toolId]: !enabledTools[toolId]
    };
    
    setEnabledTools(newEnabledTools);

    // 保存到扩展存储
    try {
      const settings: EffikitSettings = {
        networkMonitorEnabled: newEnabledTools[1],
        responseEditingEnabled: newEnabledTools[2],
        performanceMonitorEnabled: newEnabledTools[3],
        automationEnabled: newEnabledTools[4],
      };

      await chrome.runtime.sendMessage({
        action: 'setStorageData',
        data: { effikit_settings: settings }
      });
    } catch (error) {
      console.error('保存设置失败:', error);
    }
  };

  const handleApplySettings = () => {
    // 这里可以添加应用设置的逻辑
    console.log('应用设置:', enabledTools);
  };

  const handleExportConfig = () => {
    // 导出配置的逻辑
    const config = {
      tools: enabledTools,
      timestamp: new Date().toISOString()
    };
    
    const dataStr = JSON.stringify(config, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'effikit-config.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const filteredTools = tools.filter(tool =>
    tool.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="h-full bg-background flex items-center justify-center">
        <div className="text-center">
          <Settings className="w-8 h-8 mx-auto mb-2 animate-spin" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full bg-background">
      <Card className="h-full">
        <CardHeader className="space-y-4">
          <div className="flex items-center space-x-2">
            <Settings className="w-6 h-6 text-primary" />
            <div>
              <CardTitle className="text-lg">EffiKit</CardTitle>
              <CardDescription>开发工具集成平台</CardDescription>
            </div>
          </div>
          
          {/* 搜索框 */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="搜索工具..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 工具列表 */}
          <div className="space-y-3">
            {filteredTools.map((tool) => {
              const IconComponent = tool.icon;
              return (
                <div key={tool.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <IconComponent className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <Label htmlFor={`tool-${tool.id}`} className="font-medium cursor-pointer">
                          {tool.name}
                        </Label>
                        {enabledTools[tool.id] && (
                          <Badge variant="secondary" className="text-xs">
                            启用
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    id={`tool-${tool.id}`}
                    checked={enabledTools[tool.id]}
                    onCheckedChange={() => handleToolToggle(tool.id)}
                  />
                </div>
              );
            })}
          </div>

          {filteredTools.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="w-8 h-8 mx-auto mb-2" />
              <p>未找到匹配的工具</p>
            </div>
          )}

          {/* 操作按钮 */}
          <div className="space-y-2 pt-4 border-t">
            <Button className="w-full" variant="default" onClick={handleApplySettings}>
              应用设置
            </Button>
            <Button className="w-full" variant="outline" onClick={handleExportConfig}>
              导出配置
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
