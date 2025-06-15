import { useState, useCallback } from 'react';
import { Activity, Globe, Code, Zap } from 'lucide-react';
import type { Tool } from '@/sidebar/types';

// 初始工具数据
const initialTools: Tool[] = [
  {
    id: 'network-monitor',
    name: '网络监控',
    description: '监控和分析网络请求',
    enabled: true,
    icon: Globe,
    category: '网络',
    route: '/tool/network-monitor'
  },
  {
    id: 'response-editor',
    name: '响应编辑',
    description: '编辑和模拟网络响应',
    enabled: false,
    icon: Code,
    category: '网络',
    route: '/tool/response-editor'
  },
  {
    id: 'performance-monitor',
    name: '性能监控',
    description: '监控页面性能指标',
    enabled: true,
    icon: Activity,
    category: '性能',
    route: '/tool/performance-monitor'
  },
  {
    id: 'automation-script',
    name: '自动化脚本',
    description: '运行自定义脚本',
    enabled: false,
    icon: Zap,
    category: '自动化',
    route: '/tool/automation-script'
  }
];

export const useToolData = () => {
  const [tools, setTools] = useState<Tool[]>(initialTools);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const addTool = useCallback((tool: Tool) => {
    setTools(prev => [...prev, tool]);
  }, []);

  const removeTool = useCallback((toolId: string) => {
    setTools(prev => prev.filter(t => t.id !== toolId));
  }, []);

  const updateTool = useCallback((toolId: string, updates: Partial<Tool>) => {
    setTools(prev => prev.map(t => 
      t.id === toolId ? { ...t, ...updates } : t
    ));
  }, []);

  const getToolById = useCallback((toolId: string): Tool | undefined => {
    return tools.find(t => t.id === toolId);
  }, [tools]);

  const getEnabledTools = useCallback((): Tool[] => {
    return tools.filter(t => t.enabled);
  }, [tools]);

  return {
    tools,
    isLoading,
    error,
    addTool,
    removeTool,
    updateTool,
    getToolById,
    getEnabledTools,
    setIsLoading,
    setError
  };
}; 