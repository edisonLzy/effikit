import React from 'react';
import { createRoot } from 'react-dom/client';
import { HighlightPopover } from '@/components/ui/HighlightPopover';
import { highlightManager } from '@/highlighter';
import type { HighlightColor } from '@/highlighter';

console.log('EffiKit content script loaded');

// 高亮功能相关变量
let isHighlightEnabled = true;
let popoverRoot: any = null;
let popoverContainer: HTMLElement | null = null;

// 初始化高亮管理器
async function initializeHighlighter() {
  try {
    await highlightManager.initialize();
    isHighlightEnabled = highlightManager.isHighlightEnabled();
    
    // 注入高亮样式
    injectHighlightStyles();
    
    // 监听文本选择事件
    document.addEventListener('mouseup', handleTextSelection);
    document.addEventListener('keyup', handleTextSelection);
    
    console.log('Highlighter initialized');
  } catch (error) {
    console.error('Failed to initialize highlighter:', error);
  }
}

// 注入高亮样式
function injectHighlightStyles() {
  const existingStyles = document.getElementById('effikit-highlight-styles');
  if (existingStyles) {
    return;
  }

  const style = document.createElement('style');
  style.id = 'effikit-highlight-styles';
  style.textContent = `
    .effikit-highlight {
      cursor: pointer;
      padding: 1px 2px;
      border-radius: 2px;
      transition: all 0.2s ease;
    }
    
    .effikit-highlight:hover {
      opacity: 0.8;
    }
    
    .effikit-highlight-yellow {
      background-color: rgba(255, 255, 0, 0.3);
    }
    
    .effikit-highlight-red {
      background-color: rgba(255, 0, 0, 0.3);
    }
    
    .effikit-highlight-blue {
      background-color: rgba(0, 0, 255, 0.3);
    }
    
    .effikit-highlight-green {
      background-color: rgba(0, 255, 0, 0.3);
    }
    
    .effikit-highlight-purple {
      background-color: rgba(128, 0, 128, 0.3);
    }
    
    .effikit-highlight-orange {
      background-color: rgba(255, 165, 0, 0.3);
    }
  `;
  
  document.head.appendChild(style);
}

// 处理文本选择事件
function handleTextSelection(event: Event) {
  if (!isHighlightEnabled) {
    return;
  }

  // 延迟处理，确保选择已完成
  setTimeout(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      hidePopover();
      return;
    }

    const selectedText = selection.toString().trim();
    if (!selectedText) {
      hidePopover();
      return;
    }

    // 检查是否点击了高亮元素
    const target = event.target as Element;
    if (target && target.closest('.effikit-highlight')) {
      hidePopover();
      return;
    }

    // 显示颜色选择弹窗
    showHighlightPopover(selection, selectedText);
  }, 10);
}

// 显示高亮弹窗
function showHighlightPopover(selection: Selection, selectedText: string) {
  if (selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  const rect = range.getBoundingClientRect();
  
  // 计算弹窗位置
  const position = {
    x: rect.left + rect.width / 2,
    y: rect.top + window.scrollY
  };

  // 创建弹窗容器
  if (!popoverContainer) {
    popoverContainer = document.createElement('div');
    popoverContainer.id = 'effikit-highlight-popover';
    document.body.appendChild(popoverContainer);
  }

  // 创建 React 根节点
  if (!popoverRoot) {
    popoverRoot = createRoot(popoverContainer);
  }

  // 渲染弹窗
  popoverRoot.render(
    React.createElement(HighlightPopover, {
      position,
      selectedText,
      onColorSelect: handleColorSelect,
      onClose: hidePopover
    })
  );
}

// 处理颜色选择
async function handleColorSelect(color: HighlightColor) {
  try {
    const highlight = await highlightManager.createHighlight(color);
    if (highlight) {
      console.log('Highlight created:', highlight);
      
      // 通知背景脚本更新图标
      chrome.runtime.sendMessage({
        type: 'HIGHLIGHT_CREATED',
        payload: { url: window.location.href }
      });
    }
  } catch (error) {
    console.error('Failed to create highlight:', error);
  }
  
  hidePopover();
}

// 隐藏弹窗
function hidePopover() {
  if (popoverRoot && popoverContainer) {
    popoverRoot.unmount();
    popoverRoot = null;
  }
  
  if (popoverContainer) {
    popoverContainer.remove();
    popoverContainer = null;
  }
}

// 监听来自背景脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'TOGGLE_HIGHLIGHT':
      toggleHighlight(message.payload.enabled);
      sendResponse({ success: true });
      break;
      
    case 'GET_HIGHLIGHT_STATUS':
      sendResponse({ 
        enabled: isHighlightEnabled,
        hasHighlights: highlightManager.hasHighlights()
      });
      break;
      
    default:
      break;
  }
});

// 切换高亮功能
async function toggleHighlight(enabled: boolean) {
  try {
    isHighlightEnabled = enabled;
    await highlightManager.setEnabled(enabled);
    
    if (!enabled) {
      hidePopover();
    }
    
    console.log('Highlight toggled:', enabled);
  } catch (error) {
    console.error('Failed to toggle highlight:', error);
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeHighlighter);
} else {
  initializeHighlighter();
}