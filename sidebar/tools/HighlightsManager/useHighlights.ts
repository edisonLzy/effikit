import { useState, useEffect, useCallback } from 'react';
import type { Highlight } from '@/highlighter';
import { getHighlightsByUrl, removeHighlight as removeHighlightFromStorage, clearHighlights as clearHighlightsFromStorage } from '@/highlighter';
import { useToast } from '@/hooks/useToast';

export function useHighlights() {
  const [highlightsByUrl, setHighlightsByUrl] = useState<Record<string, Highlight[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const loadHighlights = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const highlights = await getHighlightsByUrl();
      setHighlightsByUrl(highlights);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '加载高亮失败';
      setError(errorMessage);
      console.error('Failed to load highlights:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const removeHighlight = useCallback(async (highlightId: string, url: string) => {
    try {
      await removeHighlightFromStorage(highlightId, url);
      
      // 更新本地状态
      setHighlightsByUrl(prev => {
        const updated = { ...prev };
        if (updated[url]) {
          updated[url] = updated[url].filter(h => h.id !== highlightId);
          if (updated[url].length === 0) {
            delete updated[url];
          }
        }
        return updated;
      });

      toast({
        title: '删除成功',
        description: '高亮已删除',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '删除高亮失败';
      toast({
        title: '删除失败',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Failed to remove highlight:', err);
    }
  }, [toast]);

  const clearHighlights = useCallback(async (url: string) => {
    try {
      await clearHighlightsFromStorage(url);
      
      // 更新本地状态
      setHighlightsByUrl(prev => {
        const updated = { ...prev };
        delete updated[url];
        return updated;
      });

      toast({
        title: '清除成功',
        description: '该页面的所有高亮已清除',
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : '清除高亮失败';
      toast({
        title: '清除失败',
        description: errorMessage,
        variant: 'destructive',
      });
      console.error('Failed to clear highlights:', err);
    }
  }, [toast]);

  const copyHighlight = useCallback(async (highlight: Highlight) => {
    try {
      await navigator.clipboard.writeText(highlight.text);
      toast({
        title: '复制成功',
        description: '高亮内容已复制到剪贴板',
      });
    } catch (err) {
      toast({
        title: '复制失败',
        description: '无法复制到剪贴板',
        variant: 'destructive',
      });
      console.error('Failed to copy highlight:', err);
    }
  }, [toast]);

  const openUrl = useCallback(async (url: string) => {
    try {
      await chrome.tabs.create({ url });
    } catch (err) {
      toast({
        title: '打开失败',
        description: '无法打开页面',
        variant: 'destructive',
      });
      console.error('Failed to open URL:', err);
    }
  }, [toast]);

  useEffect(() => {
    loadHighlights();
  }, [loadHighlights]);

  return {
    highlightsByUrl,
    isLoading,
    error,
    removeHighlight,
    clearHighlights,
    copyHighlight,
    openUrl,
    refreshHighlights: loadHighlights
  };
} 