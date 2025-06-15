import { useCallback } from 'react';
import type { ToolSettings, EffikitSettings } from '@/sidebar/types';

export const useToolStorage = () => {
  const saveToolSettings = useCallback(async (settings: ToolSettings) => {
    try {
      await chrome.storage.local.set({ toolSettings: settings });
    } catch (error) {
      console.error('保存工具设置失败:', error);
      throw error;
    }
  }, []);

  const loadToolSettings = useCallback(async (): Promise<ToolSettings> => {
    try {
      const result = await chrome.storage.local.get('toolSettings');
      return result.toolSettings || {};
    } catch (error) {
      console.error('加载工具设置失败:', error);
      throw error;
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

  const saveLastActiveToolId = useCallback(async (toolId: string) => {
    try {
      await chrome.storage.local.set({ lastActiveToolId: toolId });
    } catch (error) {
      console.error('保存最后活跃工具ID失败:', error);
      throw error;
    }
  }, []);

  const loadLastActiveToolId = useCallback(async (): Promise<string | null> => {
    try {
      const result = await chrome.storage.local.get('lastActiveToolId');
      return result.lastActiveToolId || null;
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

  return {
    saveToolSettings,
    loadToolSettings,
    saveNavigationHistory,
    loadNavigationHistory,
    saveLastActiveToolId,
    loadLastActiveToolId,
    saveAllSettings,
    loadAllSettings
  };
}; 