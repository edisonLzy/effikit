import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  message?: string;
}

export function LoadingSpinner(props: LoadingSpinnerProps) {
  const { 
    size = 'md', 
    className, 
    message = '加载中...' 
  } = props;
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };
  
  return (
    <div className="flex flex-col items-center justify-center space-y-3">
      <div className={cn(sizeClasses[size], 'animate-spin', className)}>
        <Loader2 className="w-full h-full text-blue-400" />
      </div>
      {message && <p className="text-sm text-gray-400">{message}</p>}
    </div>
  );
} 