import { createElement } from 'react';
import { highlightManager } from '@/features/highlighter';
import type { HighlightColor } from '@/features/highlighter';
import { domRenderer } from './ui/dom-renderer';
import { HighlightColorPopover } from './ui/HighlightColorPopover';

console.log('EffiKit content script loaded');

// 高亮功能相关变量
let isHighlightEnabled = true;
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

// 注入页面高亮样式
function injectHighlightStyles() {
  const existingStyles = document.getElementById('effikit-highlight-styles');
  if (existingStyles) {
    debugLog('Highlight styles already injected');
    return;
  }

  const style = document.createElement('style');
  style.id = 'effikit-highlight-styles';
  style.textContent = `
    .effikit-highlight {
      cursor: pointer;
      padding: 1px 2px;
      border-radius: 3px;
      transition: all 0.2s ease;
    }
    .effikit-highlight:hover {
      opacity: 0.8;
      box-shadow: 0 0 5px rgba(0,0,0,0.3);
    }
    .effikit-highlight-yellow { background-color: rgba(255, 255, 0, 0.4); }
    .effikit-highlight-red { background-color: rgba(255, 0, 0, 0.3); }
    .effikit-highlight-blue { background-color: rgba(0, 0, 255, 0.3); }
    .effikit-highlight-green { background-color: rgba(0, 255, 0, 0.3); }
    .effikit-highlight-purple { background-color: rgba(128, 0, 128, 0.3); }
    .effikit-highlight-orange { background-color: rgba(255, 165, 0, 0.4); }
  `;
  
  document.head.appendChild(style);
  debugLog('Page highlight styles injected');
}

// 处理文本选择事件
function handleTextSelection(event: Event) {
  if (!isInitialized || !isHighlightEnabled) {
    return;
  }
  
  // 如果内容 popover 可见，则不显示颜色选择器
  if (domRenderer.isVisible('content-popover')) {
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
      if (target.closest(`.${'effikit-highlight'}`)) {
        // 先隐藏颜色选择器
        hidePopover();
        // 这里不立即返回，让点击事件继续冒泡到高亮元素的监听器
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
      y: rect.bottom + window.scrollY + 5 // y 轴上增加一点偏移
    };

    // 使用 domRenderer 渲染 React 组件
    domRenderer.render(
      createElement(HighlightColorPopover,{
        position: position,
        selectedText: selectedText,
        onColorSelect: handleColorSelect,
        onClose: hidePopover
      }),
      'color-popover'
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
    domRenderer.unmountAll('color-popover');
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
    domRenderer.unmountAll('content-popover');
  }
}

// 页面卸载处理
function handleBeforeUnload() {
  hidePopover();
  domRenderer.unmountAll();
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