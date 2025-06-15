import React from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import type { Tool } from '@/sidebar/types';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToolSelect: (toolId: string) => void;
  filteredTools: Tool[];
  placeholder?: string;
  showResults?: boolean;
  isSearching?: boolean;
}

export function SearchBar(props: SearchBarProps) {
  const {
    searchTerm,
    onSearchChange,
    onToolSelect,
    filteredTools,
    placeholder = '搜索工具...',
    showResults = false,
    isSearching = false
  } = props;

  const handleClear = () => {
    onSearchChange('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && filteredTools.length > 0) {
      onToolSelect(filteredTools[0].id);
    }
  };

  return (
    <div className="relative">
      <div className="relative">
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center">
          {isSearching ? (
            <Loader2 className="w-5 h-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <input
          type="text"
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className={`
            w-full h-12 pl-12 pr-12 
            bg-white border border-gray-200/60 rounded-2xl
            text-gray-800 placeholder-gray-400
            transition-all duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300
            hover:border-gray-300/80 hover:shadow-sm
          `}
        />
        {searchTerm && (
          <button
            onClick={handleClear}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 w-7 h-7 
                       flex items-center justify-center rounded-full
                       hover:bg-gray-100 transition-colors duration-150"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        )}
      </div>
      
      {/* 搜索结果下拉 */}
      {showResults && searchTerm && !isSearching && filteredTools.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200/60 rounded-2xl shadow-lg z-50 max-h-64 overflow-y-auto backdrop-blur-sm">
          {filteredTools.slice(0, 5).map((tool, index) => {
            const IconComponent = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onToolSelect(tool.id)}
                className={`
                  w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors duration-150 
                  flex items-center space-x-3 group
                  ${index === 0 ? 'rounded-t-2xl' : ''}
                  ${index === Math.min(filteredTools.length - 1, 4) ? 'rounded-b-2xl' : ''}
                `}
              >
                <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                  <IconComponent className="w-5 h-5 text-gray-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm text-gray-800 truncate">{tool.name}</div>
                  <div className="text-xs text-gray-500 truncate mt-0.5">
                    {tool.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
      
      {/* 无结果提示 */}
      {showResults && searchTerm && !isSearching && filteredTools.length === 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200/60 rounded-2xl shadow-lg z-50 p-4 text-center backdrop-blur-sm">
          <div className="text-gray-500 space-y-1">
            <Search className="w-8 h-8 mx-auto opacity-40" />
            <p className="text-sm font-medium">未找到相关工具</p>
            <p className="text-xs">尝试使用其他关键词搜索</p>
          </div>
        </div>
      )}
    </div>
  );
} 