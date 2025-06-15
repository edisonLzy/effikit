import React from 'react';
import type { Tool } from '@/sidebar/types';

interface ToolItemProps {
  tool: Tool;
  onClick: () => void;
}

export function ToolItem(props: ToolItemProps) {
  const { tool, onClick } = props;
  const IconComponent = tool.icon;

  return (
    <button
      onClick={onClick}
      className="flex items-center space-x-3 w-full px-4 py-3 rounded-xl hover:bg-gray-700/50 transition-colors duration-200 group"
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
        tool.name === 'Figma' ? 'bg-purple-600' :
          tool.name === 'Miro' ? 'bg-yellow-500' :
            tool.name === 'Adobe' ? 'bg-red-600' :
              tool.name === 'Canva' ? 'bg-blue-500' :
                'bg-gray-600'
      }`}>
        <IconComponent className="w-6 h-6 text-white" />
      </div>
      <span className="text-white font-medium text-sm">{tool.name}</span>
    </button>
  );
} 