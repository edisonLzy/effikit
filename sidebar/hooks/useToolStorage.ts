import { useCallback } from 'react';
import type { EffikitSettings } from '@/sidebar/types';

export function useToolStorage() {
  // 保存工具设置到 chrome.storage
  const saveToolSettings = useCallback(async (settings: Record<string, boolean>) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ toolSettings: settings });
      } else {
        // 开发环境下使用 localStorage
        localStorage.setItem('toolSettings', JSON.stringify(settings));
      }
    } catch (error) {
      console.error('保存工具设置失败:', error);
      throw error;
    }
  }, []);

  // 从 chrome.storage 加载工具设置
  const loadToolSettings = useCallback(async (): Promise<Record<string, boolean>> => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get('toolSettings');
        return result.toolSettings || {};
      } else {
        // 开发环境下使用 localStorage
        const saved = localStorage.getItem('toolSettings');
        return saved ? JSON.parse(saved) : {};
      }
    } catch (error) {
      console.error('加载工具设置失败:', error);
      return {};
    }
  }, []);

  const saveNavigationHistory = useCallback(async (history: string[]) => {
    try {
      await chrome.storage.local.set({ navigationHistory: history });
    } catch (error) {
      console.error('保存导航历史失败:', error);
      throw error;
    }
  }, []);

  const loadNavigationHistory = useCallback(async (): Promise<string[]> => {
    try {
      const result = await chrome.storage.local.get('navigationHistory');
      return result.navigationHistory || [];
    } catch (error) {
      console.error('加载导航历史失败:', error);
      return [];
    }
  }, []);

  // 保存最后活跃的工具ID
  const saveLastActiveToolId = useCallback(async (toolId: string) => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ lastActiveToolId: toolId });
      } else {
        localStorage.setItem('lastActiveToolId', toolId);
      }
    } catch (error) {
      console.error('保存最后活跃工具ID失败:', error);
      throw error;
    }
  }, []);

  // 加载最后活跃的工具ID
  const loadLastActiveToolId = useCallback(async (): Promise<string | null> => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get('lastActiveToolId');
        return result.lastActiveToolId || null;
      } else {
        return localStorage.getItem('lastActiveToolId');
      }
    } catch (error) {
      console.error('加载最后活跃工具ID失败:', error);
      return null;
    }
  }, []);

  const saveAllSettings = useCallback(async (settings: EffikitSettings) => {
    try {
      await chrome.storage.local.set(settings);
    } catch (error) {
      console.error('保存所有设置失败:', error);
      throw error;
    }
  }, []);

  const loadAllSettings = useCallback(async (): Promise<EffikitSettings> => {
    try {
      const result = await chrome.storage.local.get(['toolSettings', 'navigationHistory', 'lastActiveToolId']);
      return {
        toolSettings: result.toolSettings || {},
        navigationHistory: result.navigationHistory || [],
        lastActiveToolId: result.lastActiveToolId || undefined
      };
    } catch (error) {
      console.error('加载所有设置失败:', error);
      return {
        toolSettings: {},
        navigationHistory: []
      };
    }
  }, []);

  // 清除存储数据
  const clearStorage = useCallback(async () => {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.clear();
      } else {
        localStorage.removeItem('toolSettings');
        localStorage.removeItem('lastActiveToolId');
      }
    } catch (error) {
      console.error('清除存储失败:', error);
      throw error;
    }
  }, []);

  // 保存工具配置
  const saveToolConfig = useCallback(async (toolId: string, config: any) => {
    try {
      const key = `toolConfig_${toolId}`;
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ [key]: config });
      } else {
        localStorage.setItem(key, JSON.stringify(config));
      }
    } catch (error) {
      console.error('保存工具配置失败:', error);
      throw error;
    }
  }, []);

  // 加载工具配置
  const loadToolConfig = useCallback(async (toolId: string): Promise<any> => {
    try {
      const key = `toolConfig_${toolId}`;
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(key);
        return result[key] || null;
      } else {
        const saved = localStorage.getItem(key);
        return saved ? JSON.parse(saved) : null;
      }
    } catch (error) {
      console.error('加载工具配置失败:', error);
      return null;
    }
  }, []);

  return {
    saveToolSettings,
    loadToolSettings,
    saveNavigationHistory,
    loadNavigationHistory,
    saveLastActiveToolId,
    loadLastActiveToolId,
    saveAllSettings,
    loadAllSettings,
    clearStorage,
    saveToolConfig,
    loadToolConfig
  };
} 