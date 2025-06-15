import { useState, useMemo, useCallback } from 'react';
import type { Tool } from '@/sidebar/types';
import { useDebounce } from '@/hooks/useDebounce';

export function useToolSearch(tools: Tool[]) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  
  // 防抖搜索词 - 300ms延迟
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 模糊搜索逻辑 - 使用防抖后的搜索词
  const filteredTools = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return tools;
    
    const normalizedTerm = debouncedSearchTerm.toLowerCase();
    
    return tools.filter(tool => {
      const nameMatch = tool.name.toLowerCase().includes(normalizedTerm);
      const descMatch = tool.description.toLowerCase().includes(normalizedTerm);
      const categoryMatch = tool.category?.toLowerCase().includes(normalizedTerm);
      
      return nameMatch || descMatch || categoryMatch;
    }).sort((a, b) => {
      // 优先显示名称匹配的结果
      const aNameMatch = a.name.toLowerCase().includes(normalizedTerm);
      const bNameMatch = b.name.toLowerCase().includes(normalizedTerm);
      
      if (aNameMatch && !bNameMatch) return -1;
      if (!aNameMatch && bNameMatch) return 1;
      return 0;
    });
  }, [tools, debouncedSearchTerm]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    // 只有在防抖后且搜索词不为空时才添加到历史记录
    if (term.trim() && !searchHistory.includes(term)) {
      // 延迟添加到历史记录，避免每次按键都添加
      setTimeout(() => {
        if (term === searchTerm) { // 确保是最新的搜索词
          setSearchHistory(prev => [term, ...prev.slice(0, 4)]);
        }
      }, 300);
    }
  }, [searchHistory, searchTerm]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const selectSearchHistory = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    searchTerm, // 返回即时搜索词（用于输入框显示）
    debouncedSearchTerm, // 返回防抖后的搜索词（用于检查搜索状态）
    searchHistory,
    filteredTools,
    handleSearch,
    clearSearch,
    selectSearchHistory,
    isSearching: searchTerm !== debouncedSearchTerm // 判断是否正在搜索中
  };
} 