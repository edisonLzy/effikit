import { useNavigate } from "react-router";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useState, useEffect, useCallback, useMemo } from "react";
import { Search } from "lucide-react";
import { generateColorVariants, getRandomHexColor } from "./utils";
import { useToolsData, type Tool } from "./hooks/useToolsData";

export function Home() {
  
  const navigate = useNavigate();
  
  // 获取工具数据
  const { tools } = useToolsData();
  
  // 使用搜索 Hook
  const {
    searchTerm,
    setSearchTerm,
    filteredTools,
    isSearching,
  } = useSearchTool(tools);
  
  // 使用导航 Hook
  const {
    selectedIndex,
    selectedTool,
    handleKeyDown,
  } = useNavigation(filteredTools);
  
  // 滚动到选中的工具
  useEffect(() => {
    if (selectedTool && isSearching) {
      const toolId = `tool-${selectedTool.path}`;
      const selectedElement = document.getElementById(toolId);
      if (selectedElement) {
        selectedElement.scrollIntoView({
          behavior: 'smooth',
          block: 'center',
          inline: 'center'
        });
      }
    }
  }, [selectedTool, isSearching]);

  // 生成所有工具的随机属性
  const allToolsWithProps = useMemo(() => {
    return tools.map((tool) => {
      // 随机生成大小 (1-2列，1-2行)
      const cols = Math.floor(Math.random() * 2) + 1;
      const rows = Math.floor(Math.random() * 2) + 1;
      
      // 随机生成颜色
      const baseColor = getRandomHexColor();
      const colorStyle = generateColorVariants(baseColor);
      
      return {
        tool,
        cols,
        rows,
        colorStyle,
      };
    });
  }, [tools]);

  // 显示所有工具，不进行筛选
  const displayToolsWithProps = allToolsWithProps;

  const handleToolClick = (toolPath: string | undefined) => {
    if (toolPath) {
      navigate(toolPath);
    }
  };

  const handleSearchKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' && selectedTool) {
      handleToolClick(selectedTool.path);
      return;
    }
    handleKeyDown(event);
  };

  return (
    <div className="h-full flex flex-col">
      {/* 工具网格 - 可滚动区域 */}
      <div 
        className="flex-1 overflow-y-auto p-4 transition-all duration-300"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridAutoRows: '100px',
          gap: '12px',
          gridAutoFlow: 'row dense',
        }}
      >
        {displayToolsWithProps.map((item) => {
          const isSelected = isSearching && filteredTools[selectedIndex]?.path === item.tool.path;
          const isMatched = !isSearching || filteredTools.some((filteredTool: Tool) => filteredTool.path === item.tool.path);
          const shouldBlur = isSearching && !isMatched;
          
          return (
            <ToolCard
              key={item.tool.path}
              id={`tool-${item.tool.path}`}
              tool={item.tool}
              cols={item.cols}
              rows={item.rows}
              colorStyle={item.colorStyle}
              isSelected={isSelected}
              shouldBlur={shouldBlur}
              onClick={() => handleToolClick(item.tool.path)}
            />
          );
        })}
      </div>

      {/* 搜索框组件 - 固定在底部 */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50">
        <SearchBox
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          isSearching={isSearching}
          selectedTool={selectedTool}
          onKeyDown={handleSearchKeyDown}
        />
      </div>
    </div>
  );
}

interface ToolCardProps {
  id: string;
  tool: Tool;
  cols: number;
  rows: number;
  colorStyle: {
    background: string;
    boxShadow: string;
    borderColor: string;
  };
  isSelected: boolean;
  shouldBlur: boolean;
  onClick: () => void;
}

function ToolCard(props: ToolCardProps) {

  const { id, tool, cols, rows, colorStyle, isSelected, shouldBlur, onClick } = props;
  
  return (
    <Card
      id={id}
      className={`
        border-0 cursor-pointer transition-all duration-200 
        hover:scale-105 hover:shadow-xl
        flex flex-col items-center justify-center
        p-3 text-center
        ${isSelected ? 'ring-2 ring-blue-500 scale-105 shadow-2xl' : 'shadow-lg'}
        ${shouldBlur ? 'blur-sm opacity-50' : ''}
      `}
      style={{
        background: colorStyle.background,
        boxShadow: isSelected 
          ? '0 0 0 2px #3b82f6, 0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 10px 15px -3px rgba(0, 0, 0, 0.1)'
          : '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
        gridColumn: `span ${cols}`,
        gridRow: `span ${rows}`,
      }}
      onClick={onClick}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="text-xl flex items-center justify-center">
          {tool.icon}
        </div>
        <div className="font-medium text-gray-700 text-xs leading-tight">
          {tool.label}
        </div>
      </div>
    </Card>
  );
}

interface SearchBoxProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isSearching: boolean;
  selectedTool: Tool | null;
  onKeyDown: (event: React.KeyboardEvent) => void;
}
function SearchBox(props: SearchBoxProps) {

  const { searchTerm, setSearchTerm, isSearching, selectedTool, onKeyDown } = props;

  return (
    <div className="w-72 relative overflow-hidden rounded-2xl animate-glow-pulse">
      {/* 旋转的边框效果 */}
      <div className="absolute -inset-1 rounded-2xl opacity-75 p-[2px] animate-spin-smooth">
        <div
          className="w-full h-full rounded-2xl"
          style={{
            background: 'conic-gradient(from 0deg, #8b5cf6, #10b981, #a855f7, #059669, #8b5cf6)',
            filter: 'blur(0.5px)',
          }}
        />
      </div>
      
      {/* 内容容器 - 静止不动 */}
      <div 
        className="
          relative z-10
          bg-gray-800/95 backdrop-blur-xl
          rounded-2xl shadow-2xl p-4 m-[2px]
          transition-all duration-300
        "
        style={{
          backdropFilter: 'blur(40px)',
          WebkitBackdropFilter: 'blur(40px)',
          background: 'linear-gradient(135deg, rgba(31,41,55,0.95), rgba(17,24,39,0.98))',
        }}
      >
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            type="text"
            placeholder="搜索工具..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={onKeyDown}
            className="
              pl-10 pr-4 py-2 w-full
              bg-transparent border-none
              focus:ring-0 focus:outline-none focus-visible:outline-none
              text-gray-100 placeholder-gray-500
              selection:bg-blue-500/30
            "
            style={{
              outline: 'none',
              boxShadow: 'none',
            }}
          />
        </div>
        
        {/* 搜索提示 */}
        {isSearching && (
          <div className="mt-2 text-xs text-gray-400 text-center">
            使用方向键选择，Enter确认
            {selectedTool && (
              <span className="ml-2 text-blue-400 font-medium">
                已选择: {selectedTool.label}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


// 搜索工具 Hook
function useSearchTool(tools: Tool[]) {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 搜索逻辑 - 过滤工具
  const filteredTools = useMemo(() => {
    if (!searchTerm.trim()) {
      return tools;
    }
    return tools.filter(tool => 
      tool.label?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [searchTerm, tools]);
  
  // 是否正在搜索
  const isSearching = searchTerm.trim().length > 0;
  
  return {
    searchTerm,
    setSearchTerm,
    filteredTools,
    isSearching,
  };
}

// 导航 Hook
function useNavigation(filteredTools: Tool[]) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  // 当前选中的工具
  const selectedTool = useMemo(() => {
    return filteredTools[selectedIndex] || null;
  }, [filteredTools, selectedIndex]);
  
  // 重置选中索引当过滤结果改变时
  useEffect(() => {
    setSelectedIndex(0);
  }, [filteredTools]);
  
  // 键盘导航逻辑
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (filteredTools.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < filteredTools.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : filteredTools.length - 1
        );
        break;
      case 'ArrowRight':
        event.preventDefault();
        setSelectedIndex(prev => {
          const nextIndex = prev + 1;
          return nextIndex < filteredTools.length ? nextIndex : 0;
        });
        break;
      case 'ArrowLeft':
        event.preventDefault();
        setSelectedIndex(prev => {
          const prevIndex = prev - 1;
          return prevIndex >= 0 ? prevIndex : filteredTools.length - 1;
        });
        break;
    }
  }, [filteredTools]);
  
  return {
    selectedIndex,
    selectedTool,
    handleKeyDown,
  };
}