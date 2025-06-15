import { useState, useEffect, useCallback } from 'react';
import { useToolData } from './useToolData';
import { useToolStorage } from './useToolStorage';

export function useToolManagement() {
  const { 
    tools, 
    isLoading: dataLoading, 
    error, 
    updateTool, 
    getToolById,
    setIsLoading,
    setError
  } = useToolData();
  
  const { 
    saveToolSettings, 
    loadToolSettings, 
    saveLastActiveToolId, 
    loadLastActiveToolId 
  } = useToolStorage();

  const [enabledTools, setEnabledTools] = useState<Record<string, boolean>>({});
  const [isInitialized, setIsInitialized] = useState(false);

  // 初始化加载工具设置
  useEffect(() => {
    const initializeSettings = async () => {
      try {
        setIsLoading(true);
        
        // 加载工具设置
        const savedSettings = await loadToolSettings();
        
        // 生成默认设置
        const defaultSettings: Record<string, boolean> = {};
        tools.forEach(tool => {
          defaultSettings[tool.id] = savedSettings[tool.id] ?? tool.enabled;
        });
        
        setEnabledTools(defaultSettings);
        
        // 同步工具状态
        tools.forEach(tool => {
          const enabled = defaultSettings[tool.id];
          if (tool.enabled !== enabled) {
            updateTool(tool.id, { enabled });
          }
        });
        
        setIsInitialized(true);
      } catch (error) {
        console.error('初始化工具设置失败:', error);
        setError('加载工具设置失败');
        
        // 使用默认设置
        const defaultSettings: Record<string, boolean> = {};
        tools.forEach(tool => {
          defaultSettings[tool.id] = tool.enabled;
        });
        setEnabledTools(defaultSettings);
        setIsInitialized(true);
      } finally {
        setIsLoading(false);
      }
    };

    if (!isInitialized) {
      initializeSettings();
    }
  }, [tools, isInitialized, loadToolSettings, updateTool, setIsLoading, setError]);

  // 切换工具状态
  const toggleTool = useCallback(async (toolId: string) => {
    const newState = !enabledTools[toolId];
    
    try {
      // 更新本地状态
      setEnabledTools(prev => ({ ...prev, [toolId]: newState }));
      
      // 更新工具数据
      updateTool(toolId, { enabled: newState });
      
      // 保存到存储
      const newSettings = { ...enabledTools, [toolId]: newState };
      await saveToolSettings(newSettings);
      
    } catch (error) {
      // 回滚状态
      setEnabledTools(prev => ({ ...prev, [toolId]: !newState }));
      updateTool(toolId, { enabled: !newState });
      
      console.error('切换工具状态失败:', error);
      setError('保存工具设置失败');
      throw error;
    }
  }, [enabledTools, updateTool, saveToolSettings, setError]);

  // 批量切换工具
  const toggleMultipleTools = useCallback(async (toolIds: string[], enabled: boolean) => {
    const newEnabledTools = { ...enabledTools };
    const originalStates: Record<string, boolean> = {};
    
    try {
      // 记录原始状态并更新
      toolIds.forEach(toolId => {
        originalStates[toolId] = enabledTools[toolId];
        newEnabledTools[toolId] = enabled;
        updateTool(toolId, { enabled });
      });
      
      setEnabledTools(newEnabledTools);
      await saveToolSettings(newEnabledTools);
      
    } catch (error) {
      // 回滚所有状态
      toolIds.forEach(toolId => {
        updateTool(toolId, { enabled: originalStates[toolId] });
      });
      setEnabledTools(enabledTools);
      
      console.error('批量切换工具状态失败:', error);
      setError('保存工具设置失败');
      throw error;
    }
  }, [enabledTools, updateTool, saveToolSettings, setError]);

  // 重置工具设置
  const resetToolSettings = useCallback(async () => {
    try {
      const defaultSettings: Record<string, boolean> = {};
      tools.forEach(tool => {
        defaultSettings[tool.id] = tool.enabled;
        updateTool(tool.id, { enabled: tool.enabled });
      });
      
      setEnabledTools(defaultSettings);
      await saveToolSettings(defaultSettings);
      
    } catch (error) {
      console.error('重置工具设置失败:', error);
      setError('重置工具设置失败');
      throw error;
    }
  }, [tools, updateTool, saveToolSettings, setError]);

  // 设置活跃工具
  const setActiveToolId = useCallback(async (toolId: string) => {
    try {
      await saveLastActiveToolId(toolId);
    } catch (error) {
      console.error('保存活跃工具ID失败:', error);
    }
  }, [saveLastActiveToolId]);

  // 获取活跃工具
  const getActiveToolId = useCallback(async (): Promise<string | null> => {
    try {
      return await loadLastActiveToolId();
    } catch (error) {
      console.error('加载活跃工具ID失败:', error);
      return null;
    }
  }, [loadLastActiveToolId]);

  return {
    tools,
    enabledTools,
    isLoading: dataLoading || !isInitialized,
    error,
    toggleTool,
    toggleMultipleTools,
    resetToolSettings,
    setActiveToolId,
    getActiveToolId,
    getToolById,
    getEnabledTools: useCallback(() => {
      return tools.filter(tool => enabledTools[tool.id]);
    }, [tools, enabledTools])
  };
} 