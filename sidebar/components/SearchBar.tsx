import React from 'react';
import { Search, X } from 'lucide-react';
import type { Tool } from '@/sidebar/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onToolSelect: (toolId: string) => void;
  filteredTools: Tool[];
  placeholder?: string;
  showResults?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  searchTerm,
  onSearchChange,
  onToolSelect,
  filteredTools,
  placeholder = '搜索工具...',
  showResults = false
}) => {
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
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder={placeholder}
          value={searchTerm}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => onSearchChange(e.target.value)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
            onClick={handleClear}
          >
            <X className="w-3 h-3" />
          </Button>
        )}
      </div>
      
      {/* 搜索结果下拉（可选） */}
      {showResults && searchTerm && filteredTools.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-background border border-border rounded-md shadow-md z-50 max-h-48 overflow-y-auto">
          {filteredTools.slice(0, 5).map((tool) => {
            const IconComponent = tool.icon;
            return (
              <button
                key={tool.id}
                onClick={() => onToolSelect(tool.id)}
                className="w-full px-3 py-2 text-left hover:bg-muted transition-colors duration-150 flex items-center space-x-2"
              >
                <IconComponent className="w-4 h-4 text-muted-foreground" />
                <div>
                  <div className="font-medium text-sm">{tool.name}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {tool.description}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}; 