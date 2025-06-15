import { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Calculator,
  Database,
  FileText
} from 'lucide-react';

// 模拟工具数据
const MOCK_TOOLS = [
  {
    id: 'calculator',
    name: '计算器',
    description: '快速数学计算工具',
    icon: Calculator,
    enabled: true,
    category: '工具',
    version: '1.0.0',
    route: '/tool/calculator'
  },
  {
    id: 'database',
    name: '数据库',
    description: '数据库管理和查询',
    icon: Database,
    enabled: false,
    category: '开发',
    version: '2.1.0',
    route: '/tool/database'
  },
  {
    id: 'notes',
    name: '笔记',
    description: '快速记录和管理笔记',
    icon: FileText,
    enabled: true,
    category: '效率',
    version: '1.2.0',
    route: '/tool/notes'
  }
];

export function useToolData() {
  const [tools, setTools] = useState(MOCK_TOOLS);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 模拟异步加载工具数据
  useEffect(() => {
    const loadTools = async () => {
      setIsLoading(true);
      try {
        // 模拟API调用延迟
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // 这里可以从API或存储中加载真实数据
        setTools(MOCK_TOOLS);
        setError(null);
      } catch (err) {
        console.error('加载工具数据失败:', err);
        setError('加载工具数据失败');
      } finally {
        setIsLoading(false);
      }
    };

    loadTools();
  }, []);

  // 更新单个工具
  const updateTool = useCallback((toolId: string, updates: Partial<typeof MOCK_TOOLS[0]>) => {
    setTools(prevTools => 
      prevTools.map(tool => 
        tool.id === toolId ? { ...tool, ...updates } : tool
      )
    );
  }, []);

  // 添加工具
  const addTool = useCallback((newTool: typeof MOCK_TOOLS[0]) => {
    setTools(prevTools => [...prevTools, newTool]);
  }, []);

  // 删除工具
  const removeTool = useCallback((toolId: string) => {
    setTools(prevTools => prevTools.filter(tool => tool.id !== toolId));
  }, []);

  // 根据ID获取工具
  const getToolById = useCallback((toolId: string) => {
    return tools.find(tool => tool.id === toolId);
  }, [tools]);

  // 获取启用的工具
  const enabledTools = useMemo(() => {
    return tools.filter(tool => tool.enabled);
  }, [tools]);

  return {
    tools,
    isLoading,
    error,
    enabledTools,
    updateTool,
    addTool,
    removeTool,
    getToolById,
    setIsLoading,
    setError
  };
} 