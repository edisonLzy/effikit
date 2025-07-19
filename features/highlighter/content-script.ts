// 导入 Custom Elements polyfill 以支持 isolated world
import '@webcomponents/custom-elements';
import {
  initializeHighlightUI,
  highlightManager,
  getGlobalPopover
} from './ui';

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
    
    debugLog('Skipping browser compatibility check - using polyfill');
    
    // 初始化新的 UI 系统
    initializeHighlightUI();
    
    // 检查新的 highlightManager 是否可用
    if (!highlightManager) {
      throw new Error('New highlightManager is not available');
    }
    
    debugLog('New highlightManager available');
    
    // 获取启用状态（从新的 HighlightManager）
    try {
      isHighlightEnabled = highlightManager.isHighlightEnabled();
    } catch (error) {
      debugLog('Failed to get highlight enabled state, using default:', error);
      isHighlightEnabled = true;
    }
    
    debugLog('Highlight enabled state:', isHighlightEnabled);
    
    debugLog('Adding event listeners...');
    addEventListeners();
    
    // 设置高亮点击事件监听
    setupHighlightEventListeners();
    
    isInitialized = true;
    debugLog('✅ Highlighter initialized successfully with new UI system');
    
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
      debugLog('Retrying initialization in 2 seconds...');
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

// 设置高亮事件监听器
function setupHighlightEventListeners() {
  // 监听高亮点击事件
  document.addEventListener('highlight-click', handleHighlightClick);
  
  // 监听高亮悬停事件
  document.addEventListener('highlight-hover', handleHighlightHover);
  
  // 监听弹出框事件
  document.addEventListener('popover-show', handlePopoverShow);
  
  // 监听高亮删除事件
  document.addEventListener('highlight-delete', handleHighlightDelete);
  
  // 监听高亮颜色变化事件
  document.addEventListener('highlight-color-change', handleHighlightColorChange);
  
  debugLog('Highlight event listeners added');
}

// 处理文本选择事件
function handleTextSelection(event: Event): void {
  if (!isInitialized || !isHighlightEnabled) {
    return;
  }
  
  // 延迟处理，确保选择已完成
  setTimeout(() => {
    try {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        const popover = getGlobalPopover();
        if (popover) {
          popover.hide();
        }
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) {
        const popover = getGlobalPopover();
        if (popover) {
          popover.hide();
        }
        return;
      }

      // 检查是否点击了高亮元素
      const target = event.target as Element;
      if (target.closest(`.${'effikit-highlight'}`)) {
        // 先隐藏颜色选择器
        const popover = getGlobalPopover();
        if (popover) {
          popover.hide();
        }
        // 这里不立即返回，让点击事件继续冒泡到高亮元素的监听器
        return;
      }

      // 显示颜色选择弹窗
      showHighlightPopover(selection);
    } catch (error) {
      debugLog('Error handling text selection:', error);
    }
  }, 10);
}

// 显示高亮弹窗
function showHighlightPopover(selection: Selection): void {
  try {
    if (selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const selectedText = selection.toString().trim();
    
    // 计算弹窗位置
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY + 5 // y 轴上增加一点偏移
    };

    // 使用新的 Custom Element 弹出框系统
    const popover = getGlobalPopover();
    if (popover) {
      popover.show({
        position,
        highlightId: 'temp-' + Date.now(),
        color: 'yellow',
        text: selectedText,
        metadata: undefined
      });
    }
    
    debugLog('Highlight popover shown');
  } catch (error) {
    debugLog('Error showing highlight popover:', error);
  }
}

// 处理高亮点击事件
function handleHighlightClick(event: Event): void {
  const customEvent = event as CustomEvent;
  const { highlightId, position } = customEvent.detail;
  debugLog('Highlight clicked:', highlightId);
  
  const popover = getGlobalPopover();
  if (popover) {
    const highlightData = highlightManager.getHighlight(highlightId);
    if (highlightData) {
      popover.show({
        position,
        highlightId,
        color: highlightData.color,
        text: highlightData.text,
        metadata: undefined
      });
    }
  }
}

// 处理高亮悬停事件
function handleHighlightHover(event: Event): void {
  const customEvent = event as CustomEvent;
  const { highlightId } = customEvent.detail;
  debugLog('Highlight hovered:', highlightId);
  // 可以在这里添加悬停效果
}

// 处理弹出框显示事件
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function handlePopoverShow(_event: Event): void {
  debugLog('Popover shown');
}

// 处理高亮删除事件
function handleHighlightDelete(event: Event): void {
  const customEvent = event as CustomEvent;
  const { highlightId } = customEvent.detail;
  debugLog('Deleting highlight:', highlightId);
  
  try {
    highlightManager.deleteHighlight(highlightId);
    
    // 通知背景脚本
    chrome.runtime.sendMessage({
      action: 'highlightDeleted',
      data: { id: highlightId }
    }).catch(error => {
      debugLog('Failed to notify background script:', error);
    });
    
    // 隐藏弹出框
    const popover = getGlobalPopover();
    if (popover) {
      popover.hide();
    }
  } catch (error) {
    debugLog('Error deleting highlight:', error);
  }
}

// 处理高亮颜色变化事件
function handleHighlightColorChange(event: Event): void {
  const customEvent = event as CustomEvent;
  const { highlightId, color } = customEvent.detail;
  debugLog('Changing highlight color:', { highlightId, color });
  
  try {
    highlightManager.updateHighlight(highlightId, { color });
    
    // 通知背景脚本
    chrome.runtime.sendMessage({
      action: 'highlightUpdated',
      data: { id: highlightId, color }
    }).catch(error => {
      debugLog('Failed to notify background script:', error);
    });
  } catch (error) {
    debugLog('Error updating highlight color:', error);
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
        
      case 'toggleHighlight':
        isHighlightEnabled = message.enabled;
        debugLog('Highlight toggled:', isHighlightEnabled);

        if (isHighlightEnabled) {
          addEventListeners();
          setupHighlightEventListeners();
        } else {
          // 移除事件监听器
          document.removeEventListener('mouseup', handleTextSelection);
          document.removeEventListener('keyup', handleTextSelection);
          
          // 隐藏弹出框
          const popover = getGlobalPopover();
          if (popover) {
            popover.hide();
          }
        }
        
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
            
            const highlights = highlightManager.getAllHighlights();
            const status = {
              enabled: isHighlightEnabled,
              count: highlights ? highlights.length : 0,
              highlights: highlights || [],
              initialized: true
            };
            debugLog('Highlight status:', status);
            sendResponse(status);
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
        debugLog('Clearing all highlights');
        try {
          highlightManager.clearAllHighlights();
          
          // 隐藏弹出框
          const popover = getGlobalPopover();
          if (popover) {
            popover.hide();
          }
          
          sendResponse({ success: true });
        } catch (error) {
          debugLog('Error clearing highlights:', error);
          sendResponse({ success: false, error: error instanceof Error ? error.message : 'Unknown error' });
        }
        break;

      case 'DEBUG_INFO': {
        const debugInfo = {
          initialized: isInitialized,
          enabled: isHighlightEnabled,
          attempts: initializationAttempts,
          url: window.location.href,
          highlightCount: highlightManager ? highlightManager.getAllHighlights().length : 0,
          uiSystemStatus: highlightManager ? 'initialized' : 'not initialized',
          polyfillLoaded: typeof customElements !== 'undefined',
          timestamp: new Date().toISOString()
        };
        debugLog('Debug info requested:', debugInfo);
        sendResponse(debugInfo);
        break;
      }

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
      // highlightManager.setEnabled 方法不存在，使用其他方式处理
    }
    
    if (!enabled) {
      const popover = getGlobalPopover();
      if (popover) {
        popover.hide();
      }
    }
    
    debugLog('✅ Highlight toggled:', enabled);
  } catch (error) {
    debugLog('❌ Failed to toggle highlight:', error);
  }
}

// 页面可见性变化处理
function handleVisibilityChange() {
  if (document.hidden) {
    debugLog('Page hidden, hiding popover');
    const popover = getGlobalPopover();
    if (popover) {
      popover.hide();
    }
  }
}

// 页面卸载前处理
function handleBeforeUnload() {
  debugLog('Page unloading, cleaning up');
  
  // 隐藏弹出框
  const popover = getGlobalPopover();
  if (popover) {
    popover.hide();
  }
  
  // 清理高亮管理器
  if (highlightManager) {
    // highlightManager 会自动清理 Custom Elements
  }
}

// 初始化入口
function init() {
  debugLog('Content script init called');
  
  try {
    // 检查环境
    if (!window || !document) {
      debugLog('Invalid environment');
      return;
    }
    
    // 添加页面级事件监听器
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);
    
    // 延迟初始化，确保页面环境准备好
    setTimeout(initializeHighlighter, 100);
    
    debugLog('Highlighter initialized successfully');
  } catch (error) {
    debugLog('Error initializing highlighter:', error);
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  debugLog('Document still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', init);
} else {
  debugLog('Document already loaded, initializing immediately');
  init();
}