import React from 'react';
import type { HighlightColor } from '@/features/highlighter';
import { getHighlightColors, getHighlightColorName } from '@/features/highlighter';

interface HighlightPopoverProps {
  position: { x: number; y: number };
  selectedText: string;
  onColorSelect: (color: HighlightColor) => void;
  onClose: () => void;
}

export function HighlightPopover(props: HighlightPopoverProps) {
  const { position, selectedText, onColorSelect, onClose } = props;
  const colors = getHighlightColors();

  const getColorClasses = (color: HighlightColor) => {
    const colorMap: Record<HighlightColor, string> = {
      yellow: 'bg-yellow-200 hover:bg-yellow-300 border-yellow-400',
      red: 'bg-red-200 hover:bg-red-300 border-red-400',
      blue: 'bg-blue-200 hover:bg-blue-300 border-blue-400',
      green: 'bg-green-200 hover:bg-green-300 border-green-400',
      purple: 'bg-purple-200 hover:bg-purple-300 border-purple-400',
      orange: 'bg-orange-200 hover:bg-orange-300 border-orange-400'
    };
    return colorMap[color];
  };

  return (
    <>
      {/* 主弹窗 */}
      <div 
        className="fixed z-[10000] p-2 shadow-lg border bg-white rounded-lg"
        style={{ 
          left: position.x, 
          top: position.y - 10,
          transform: 'translateY(-100%)'
        }}
      >
        <div className="flex flex-col gap-2">
          <div className="text-xs text-gray-600 max-w-48 truncate">
            "{selectedText}"
          </div>
          <div className="flex gap-1">
            {colors.map(color => (
              <button
                key={color}
                className={`inline-flex items-center justify-center w-8 h-8 p-0 rounded-md text-sm font-medium transition-colors border ${getColorClasses(color)}`}
                title={getHighlightColorName(color)}
                onClick={() => onColorSelect(color)}
              >
                <div className="w-4 h-4 rounded-full border border-gray-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* 点击外部关闭的覆盖层 */}
      <div 
        className="fixed inset-0 z-[-1]" 
        onClick={onClose}
      />
    </>
  );
} 