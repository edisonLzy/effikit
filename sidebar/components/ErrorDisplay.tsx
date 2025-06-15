import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  className?: string;
}

export function ErrorDisplay(props: ErrorDisplayProps) {
  const { 
    title = '加载失败', 
    message, 
    onRetry, 
    className 
  } = props;
  
  return (
    <div className={cn('flex flex-col items-center justify-center space-y-3', className)}>
      <div className="w-12 h-12 bg-red-600/20 rounded-full flex items-center justify-center">
        <AlertCircle className="w-6 h-6 text-red-500" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-white mb-1">{title}</p>
        <p className="text-xs text-gray-400 mb-3">{message}</p>
        {onRetry && (
          <button 
            onClick={onRetry} 
            className="text-xs text-blue-400 hover:text-blue-300 font-medium"
          >
            重新加载
          </button>
        )}
      </div>
    </div>
  );
} 