import { v4 as uuidv4 } from 'uuid';
import type { HighlightColor, Highlight } from '@/types';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function generateHighlightId(): string {
  return uuidv4();
}
  
  export function getHighlightColorClass(color: HighlightColor): string {
    return `effikit-highlight-${color}`;
  }
  
  export function getHighlightColors(): HighlightColor[] {
    return ['yellow', 'red', 'blue', 'green', 'purple', 'orange'];
  }
  
  export function getHighlightColorName(color: HighlightColor): string {
    const colorNames: Record<HighlightColor, string> = {
      yellow: '黄色',
      red: '红色',
      blue: '蓝色',
      green: '绿色',
      purple: '紫色',
      orange: '橙色',
      pink: '粉色',
      gray: '灰色'
    };
    return colorNames[color];
  }
  
  export function normalizeUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return `${urlObj.protocol}//${urlObj.host}${urlObj.pathname}`;
    } catch {
      return url;
    }
  }
  
  export function createRangeFromHighlight(highlight: Highlight): Range | null {
    try {
      const range = document.createRange();
      
      // 这里需要根据存储的范围信息重新创建选择范围
      // 实际实现中需要更复杂的逻辑来精确定位文本位置
      const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT,
        null
      );
      
      let currentOffset = 0;
      let startNode: Node | null = null;
      let endNode: Node | null = null;
      let startOffset = 0;
      let endOffset = 0;
      
      while (walker.nextNode()) {
        const node = walker.currentNode;
        const nodeLength = node.textContent?.length || 0;
        
        if (!startNode && currentOffset + nodeLength > highlight.range.startOffset) {
          startNode = node;
          startOffset = highlight.range.startOffset - currentOffset;
        }
        
        if (!endNode && currentOffset + nodeLength >= highlight.range.endOffset) {
          endNode = node;
          endOffset = highlight.range.endOffset - currentOffset;
          break;
        }
        
        currentOffset += nodeLength;
      }
      
      if (startNode && endNode) {
        range.setStart(startNode, startOffset);
        range.setEnd(endNode, endOffset);
        return range;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to create range from highlight:', error);
      return null;
    }
  }
  
  // 检查运行环境
  export function checkEnvironment() {
    console.log('Checking environment...');
    
    // 检查 Chrome APIs
    if (typeof chrome === 'undefined') {
      console.log('❌ Chrome APIs not available');
      return false;
    }
    
    if (!chrome.runtime) {
      console.log('❌ chrome.runtime not available');
      return false;
    }
    
    if (!chrome.storage) {
      console.log('❌ chrome.storage not available');
      return false;
    }
    
    console.log('✅ Chrome APIs available');
    return true;
  }


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}