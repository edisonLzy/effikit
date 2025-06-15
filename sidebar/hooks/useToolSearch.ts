import { useState, useMemo, useCallback } from 'react';
import type { Tool } from '@/sidebar/types';

export const useToolSearch = (tools: Tool[]) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // 模糊搜索逻辑
  const filteredTools = useMemo(() => {
    if (!searchTerm.trim()) return tools;
    
    const normalizedTerm = searchTerm.toLowerCase();
    
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
  }, [tools, searchTerm]);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
    if (term.trim() && !searchHistory.includes(term)) {
      setSearchHistory(prev => [term, ...prev.slice(0, 4)]);
    }
  }, [searchHistory]);

  const clearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const selectSearchHistory = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  return {
    searchTerm,
    searchHistory,
    filteredTools,
    handleSearch,
    clearSearch,
    selectSearchHistory
  };
}; 