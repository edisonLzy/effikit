import React from 'react';
import { createRoot } from 'react-dom/client';
import { HighlightPopover } from '@/components/ui/HighlightPopover';
import { highlightManager } from '@/features/highlighter';
import type { HighlightColor } from '@/features/highlighter';

console.log('EffiKit content script loaded');

// 高亮功能相关变量
let isHighlightEnabled = true;
let popoverRoot: any = null;
let popoverContainer: HTMLElement | null = null;
let isInitialized = false;
let initializationAttempts = 0;
const MAX_INIT_ATTEMPTS = 3;

// 添加调试函数
function debugLog(message: string, data?: any) {
  console.log(`[EffiKit Debug] ${message}`, data || '');
}

// 检查运行环境
function checkEnvironment() {
  debugLog('Checking environment...');
  
  // 检查 Chrome APIs
  if (typeof chrome === 'undefined') {
    debugLog('❌ Chrome APIs not available');
    return false;
  }
  
  if (!chrome.runtime) {
    debugLog('❌ chrome.runtime not available');
    return false;
  }
  
  if (!chrome.storage) {
    debugLog('❌ chrome.storage not available');
    return false;
  }
  
  debugLog('✅ Chrome APIs available');
  return true;
}

// 改进的初始化函数
async function initializeHighlighter() {
  if (isInitialized) {
    debugLog('Highlighter already initialized');
    return;
  }
  
  initializationAttempts++;
  debugLog(`Starting highlighter initialization (attempt ${initializationAttempts}/${MAX_INIT_ATTEMPTS})...`);
  
  try {
    // 检查运行环境
    if (!checkEnvironment()) {
      throw new Error('Environment check failed');
    }
    
    // 检查 highlightManager 是否可用
    if (!highlightManager) {
      throw new Error('highlightManager is not available');
    }
    
    debugLog('highlightManager available, calling initialize...');
    
    // 使用超时处理初始化
    const initPromise = highlightManager.initialize();
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Initialization timeout')), 5000);
    });
    
    await Promise.race([initPromise, timeoutPromise]);
    
    debugLog('highlightManager initialized, getting enabled state...');
    isHighlightEnabled = highlightManager.isHighlightEnabled();
    
    debugLog('Injecting highlight styles...');
    injectHighlightStyles();
    
    debugLog('Adding event listeners...');
    addEventListeners();
    
    isInitialized = true;
    debugLog('✅ Highlighter initialized successfully');
    
    // 通知背景脚本初始化完成
    chrome.runtime.sendMessage({
      type: 'CONTENT_SCRIPT_READY',
      payload: { url: window.location.href }
    }).catch(error => {
      debugLog('Failed to notify background script:', error);
    });
    
  } catch (error) {
    debugLog('❌ Failed to initialize highlighter:', error);
    
    if (initializationAttempts < MAX_INIT_ATTEMPTS) {
      debugLog(`Retrying initialization in 2 seconds...`);
      setTimeout(initializeHighlighter, 2000);
    } else {
      debugLog('Max initialization attempts reached. Highlighter disabled.');
    }
  }
}

// 添加事件监听器
function addEventListeners() {
  // 移除现有监听器（如果有的话）
  document.removeEventListener('mouseup', handleTextSelection);
  document.removeEventListener('keyup', handleTextSelection);
  
  // 添加新的监听器
  document.addEventListener('mouseup', handleTextSelection);
  document.addEventListener('keyup', handleTextSelection);
  
  debugLog('Event listeners added');
}

// 注入高亮样式和 Tailwind CSS
function injectHighlightStyles() {
  const existingStyles = document.getElementById('effikit-highlight-styles');
  if (existingStyles) {
    debugLog('Highlight styles already injected');
    return;
  }

  const style = document.createElement('style');
  style.id = 'effikit-highlight-styles';
  style.textContent = `
    /* CSS 变量定义 */
    .effikit-popover {
      --background: oklch(1 0 0);
      --foreground: oklch(0.145 0 0);
      --card: oklch(1 0 0);
      --card-foreground: oklch(0.145 0 0);
      --popover: oklch(1 0 0);
      --popover-foreground: oklch(0.145 0 0);
      --primary: oklch(0.205 0 0);
      --primary-foreground: oklch(0.985 0 0);
      --secondary: oklch(0.97 0 0);
      --secondary-foreground: oklch(0.205 0 0);
      --muted: oklch(0.97 0 0);
      --muted-foreground: oklch(0.556 0 0);
      --accent: oklch(0.97 0 0);
      --accent-foreground: oklch(0.205 0 0);
      --destructive: oklch(0.577 0.245 27.325);
      --destructive-foreground: oklch(0.577 0.245 27.325);
      --border: oklch(0.922 0 0);
      --input: oklch(0.922 0 0);
      --ring: oklch(0.708 0 0);
      --radius: 0.625rem;
    }

    /* Reset 样式防止网站样式干扰 */
    .effikit-popover * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji";
    }

    /* Tailwind Utilities for Popover */
    .effikit-popover .fixed { position: fixed !important; }
    .effikit-popover .z-\\[10000\\] { z-index: 10000 !important; }
    .effikit-popover .p-2 { padding: 0.5rem !important; }
    .effikit-popover .shadow-lg { 
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1) !important; 
    }
    .effikit-popover .border { 
      border: 1px solid var(--border) !important; 
    }
    .effikit-popover .bg-white { 
      background-color: rgb(255 255 255) !important; 
    }
    .effikit-popover .bg-card { 
      background-color: var(--card) !important; 
    }
    .effikit-popover .text-card-foreground { 
      color: var(--card-foreground) !important; 
    }
    .effikit-popover .rounded-lg { 
      border-radius: 0.5rem !important; 
    }
    .effikit-popover .flex { 
      display: flex !important; 
    }
    .effikit-popover .flex-col { 
      flex-direction: column !important; 
    }
    .effikit-popover .gap-2 { 
      gap: 0.5rem !important; 
    }
    .effikit-popover .gap-1 { 
      gap: 0.25rem !important; 
    }
    .effikit-popover .text-xs { 
      font-size: 0.75rem !important;
      line-height: 1rem !important; 
    }
    .effikit-popover .text-gray-600 { 
      color: rgb(75 85 99) !important; 
    }
    .effikit-popover .max-w-48 { 
      max-width: 12rem !important; 
    }
    .effikit-popover .truncate { 
      overflow: hidden !important;
      text-overflow: ellipsis !important;
      white-space: nowrap !important; 
    }
    .effikit-popover .w-8 { 
      width: 2rem !important; 
    }
    .effikit-popover .h-8 { 
      height: 2rem !important; 
    }
    .effikit-popover .w-4 { 
      width: 1rem !important; 
    }
    .effikit-popover .h-4 { 
      height: 1rem !important; 
    }
    .effikit-popover .p-0 { 
      padding: 0 !important; 
    }
    .effikit-popover .rounded-full { 
      border-radius: 9999px !important; 
    }
    .effikit-popover .border-gray-400 { 
      border-color: rgb(156 163 175) !important; 
    }
    .effikit-popover .inset-0 { 
      inset: 0px !important; 
    }
    .effikit-popover .z-\\[-1\\] { 
      z-index: -1 !important; 
    }

    /* Button 样式 */
    .effikit-popover .inline-flex { 
      display: inline-flex !important; 
    }
    .effikit-popover .items-center { 
      align-items: center !important; 
    }
    .effikit-popover .justify-center { 
      justify-content: center !important; 
    }
    .effikit-popover .whitespace-nowrap { 
      white-space: nowrap !important; 
    }
    .effikit-popover .rounded-md { 
      border-radius: calc(var(--radius) - 2px) !important; 
    }
    .effikit-popover .text-sm { 
      font-size: 0.875rem !important;
      line-height: 1.25rem !important; 
    }
    .effikit-popover .font-medium { 
      font-weight: 500 !important; 
    }
    .effikit-popover .transition-colors { 
      transition-property: color, background-color, border-color, text-decoration-color, fill, stroke !important;
      transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1) !important;
      transition-duration: 150ms !important; 
    }
    .effikit-popover .focus-visible\\:outline-none:focus-visible { 
      outline: 2px solid transparent !important;
      outline-offset: 2px !important; 
    }
    .effikit-popover .disabled\\:pointer-events-none:disabled { 
      pointer-events: none !important; 
    }
    .effikit-popover .disabled\\:opacity-50:disabled { 
      opacity: 0.5 !important; 
    }

    /* Button outline variant */
    .effikit-popover .bg-background { 
      background-color: var(--background) !important; 
    }
    .effikit-popover .border-input { 
      border-color: var(--input) !important; 
    }
    .effikit-popover .hover\\:bg-accent:hover { 
      background-color: var(--accent) !important; 
    }
    .effikit-popover .hover\\:text-accent-foreground:hover { 
      color: var(--accent-foreground) !important; 
    }

    /* Button size sm */
    .effikit-popover .h-9 { 
      height: 2.25rem !important; 
    }
    .effikit-popover .px-3 { 
      padding-left: 0.75rem !important;
      padding-right: 0.75rem !important; 
    }

    /* 颜色变量 */
    .effikit-popover .bg-yellow-200 { 
      background-color: rgb(254 240 138) !important; 
    }
    .effikit-popover .hover\\:bg-yellow-300:hover { 
      background-color: rgb(253 224 71) !important; 
    }
    .effikit-popover .border-yellow-400 { 
      border-color: rgb(250 204 21) !important; 
    }
    .effikit-popover .bg-red-200 { 
      background-color: rgb(254 202 202) !important; 
    }
    .effikit-popover .hover\\:bg-red-300:hover { 
      background-color: rgb(252 165 165) !important; 
    }
    .effikit-popover .border-red-400 { 
      border-color: rgb(248 113 113) !important; 
    }
    .effikit-popover .bg-blue-200 { 
      background-color: rgb(191 219 254) !important; 
    }
    .effikit-popover .hover\\:bg-blue-300:hover { 
      background-color: rgb(147 197 253) !important; 
    }
    .effikit-popover .border-blue-400 { 
      border-color: rgb(96 165 250) !important; 
    }
    .effikit-popover .bg-green-200 { 
      background-color: rgb(187 247 208) !important; 
    }
    .effikit-popover .hover\\:bg-green-300:hover { 
      background-color: rgb(134 239 172) !important; 
    }
    .effikit-popover .border-green-400 { 
      border-color: rgb(74 222 128) !important; 
    }
    .effikit-popover .bg-purple-200 { 
      background-color: rgb(233 213 255) !important; 
    }
    .effikit-popover .hover\\:bg-purple-300:hover { 
      background-color: rgb(196 181 253) !important; 
    }
    .effikit-popover .border-purple-400 { 
      border-color: rgb(167 139 250) !important; 
    }
    .effikit-popover .bg-orange-200 { 
      background-color: rgb(254 215 170) !important; 
    }
    .effikit-popover .hover\\:bg-orange-300:hover { 
      background-color: rgb(253 186 116) !important; 
    }
    .effikit-popover .border-orange-400 { 
      border-color: rgb(251 146 60) !important; 
    }

    /* 高亮标记样式 */
    .effikit-highlight {
      cursor: pointer !important;
      padding: 1px 2px !important;
      border-radius: 2px !important;
      transition: all 0.2s ease !important;
    }
    
    .effikit-highlight:hover {
      opacity: 0.8 !important;
    }
    
    .effikit-highlight-yellow {
      background-color: rgba(255, 255, 0, 0.3) !important;
    }
    
    .effikit-highlight-red {
      background-color: rgba(255, 0, 0, 0.3) !important;
    }
    
    .effikit-highlight-blue {
      background-color: rgba(0, 0, 255, 0.3) !important;
    }
    
    .effikit-highlight-green {
      background-color: rgba(0, 255, 0, 0.3) !important;
    }
    
    .effikit-highlight-purple {
      background-color: rgba(128, 0, 128, 0.3) !important;
    }
    
    .effikit-highlight-orange {
      background-color: rgba(255, 165, 0, 0.3) !important;
    }
  `;
  
  document.head.appendChild(style);
  debugLog('Complete Tailwind styles injected for HighlightPopover');
}

// 处理文本选择事件
function handleTextSelection(event: Event) {
  if (!isInitialized || !isHighlightEnabled) {
    return;
  }

  // 延迟处理，确保选择已完成
  setTimeout(() => {
    try {
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
    } catch (error) {
      debugLog('Error handling text selection:', error);
    }
  }, 10);
}

// 显示高亮弹窗
function showHighlightPopover(selection: Selection, selectedText: string) {
  try {
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
      popoverContainer.className = 'effikit-popover';
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
    
    debugLog('Highlight popover shown');
  } catch (error) {
    debugLog('Error showing highlight popover:', error);
  }
}

// 处理颜色选择
async function handleColorSelect(color: HighlightColor) {
  try {
    debugLog('Creating highlight with color:', color);
    const highlight = await highlightManager.createHighlight(color);
    
    if (highlight) {
      debugLog('✅ Highlight created:', highlight);
      
      // 通知背景脚本更新图标
      chrome.runtime.sendMessage({
        type: 'HIGHLIGHT_CREATED',
        payload: { url: window.location.href }
      }).catch(error => {
        debugLog('Failed to notify background script:', error);
      });
    } else {
      debugLog('❌ Failed to create highlight');
    }
  } catch (error) {
    debugLog('❌ Error creating highlight:', error);
  }
  
  hidePopover();
}

// 隐藏弹窗
function hidePopover() {
  try {
    if (popoverRoot && popoverContainer) {
      popoverRoot.unmount();
      popoverRoot = null;
    }
    
    if (popoverContainer) {
      popoverContainer.remove();
      popoverContainer = null;
    }
    
    debugLog('Highlight popover hidden');
  } catch (error) {
    debugLog('Error hiding popover:', error);
  }
}

// 监听来自背景脚本的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  debugLog('Received message:', message);
  
  try {
    switch (message.type) {
      case 'TOGGLE_HIGHLIGHT':
        toggleHighlight(message.payload.enabled);
        sendResponse({ success: true });
        break;
        
      case 'GET_HIGHLIGHT_STATUS':
        // 异步处理高亮状态检查
        (async () => {
          try {
            if (!isInitialized) {
              sendResponse({ 
                enabled: isHighlightEnabled,
                hasHighlights: false,
                initialized: false
              });
              return;
            }
            
            const hasHighlights = await highlightManager.hasHighlights();
            sendResponse({ 
              enabled: isHighlightEnabled,
              hasHighlights,
              initialized: true
            });
          } catch (error) {
            debugLog('Error getting highlight status:', error);
            sendResponse({ 
              enabled: isHighlightEnabled,
              hasHighlights: false,
              initialized: isInitialized,
              error: error instanceof Error ? error.message : 'Unknown error'
            });
          }
        })();
        return true; // 保持消息通道开放
        
      case 'CLEAR_HIGHLIGHTS':
        clearAllHighlights();
        sendResponse({ success: true });
        break;
        
      case 'DEBUG_INFO':
        sendResponse({
          initialized: isInitialized,
          enabled: isHighlightEnabled,
          attempts: initializationAttempts,
          url: window.location.href
        });
        break;
        
      default:
        debugLog('Unknown message type:', message.type);
        break;
    }
  } catch (error) {
    debugLog('Error handling message:', error);
    sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
  }
});

// 切换高亮功能
async function toggleHighlight(enabled: boolean) {
  try {
    debugLog('Toggling highlight:', enabled);
    isHighlightEnabled = enabled;
    
    if (isInitialized) {
      await highlightManager.setEnabled(enabled);
    }
    
    if (!enabled) {
      hidePopover();
    }
    
    debugLog('✅ Highlight toggled:', enabled);
  } catch (error) {
    debugLog('❌ Failed to toggle highlight:', error);
  }
}

// 清除当前页面的所有高亮
async function clearAllHighlights() {
  try {
    debugLog('Clearing all highlights...');
    
    if (isInitialized) {
      await highlightManager.clearHighlights();
    }
    
    // 通知背景脚本更新图标
    chrome.runtime.sendMessage({
      type: 'HIGHLIGHT_REMOVED',
      payload: { url: window.location.href }
    }).catch(error => {
      debugLog('Failed to notify background script:', error);
    });
    
    debugLog('✅ All highlights cleared');
  } catch (error) {
    debugLog('❌ Failed to clear all highlights:', error);
  }
}

// 页面可见性变化处理
function handleVisibilityChange() {
  if (document.hidden) {
    hidePopover();
  }
}

// 页面卸载处理
function handleBeforeUnload() {
  hidePopover();
}

// 初始化入口
function init() {
  debugLog('Content script init called');
  
  // 添加页面级事件监听器
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('beforeunload', handleBeforeUnload);
  
  // 延迟初始化，确保页面环境准备好
  setTimeout(initializeHighlighter, 100);
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  debugLog('Document still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', init);
} else {
  debugLog('Document already loaded, initializing immediately');
  init();
}