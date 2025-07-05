import { CONSTANTS } from './lib/constants';
import { initialRequestInterceptorBackground } from './sidebar/tools/RequestInterceptor/_background';

// 高亮功能状态管理
let highlightEnabled = true;
const tabHighlightStatus = new Map<number, boolean>();

// 处理扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    // 切换高亮功能
    await toggleHighlightForTab(tab.id);
  }
  
  // 打开侧边栏
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('EffiKit 扩展已安装');
  } else if (details.reason === 'update') {
    console.log('EffiKit 扩展已更新');
  }
});

// 切换标签页的高亮功能
async function toggleHighlightForTab(tabId: number) {
  try {
    // 获取当前标签页的高亮状态
    const currentEnabled = tabHighlightStatus.get(tabId) ?? highlightEnabled;
    const newEnabled = !currentEnabled;
    
    // 更新状态
    tabHighlightStatus.set(tabId, newEnabled);
    
    // 发送消息给 content script
    chrome.tabs.sendMessage(tabId, {
      type: 'TOGGLE_HIGHLIGHT',
      payload: { enabled: newEnabled }
    });
    
    // 更新图标
    await updateActionIcon(tabId, newEnabled);
    
    console.log(`Highlight toggled for tab ${tabId}: ${newEnabled}`);
  } catch (error) {
    console.error('Failed to toggle highlight for tab:', error);
  }
}

// 更新扩展图标
async function updateActionIcon(tabId: number, enabled: boolean) {
  try {
    const iconPath = enabled ? 'images/icon-16.png' : 'images/icon-16-disabled.png';
    const title = enabled ? 'EffiKit - 高亮已启用' : 'EffiKit - 高亮已禁用';
    
    await chrome.action.setIcon({ 
      tabId, 
      path: { '16': iconPath } 
    });
    
    await chrome.action.setTitle({ 
      tabId, 
      title 
    });
  } catch (error) {
    console.error('Failed to update action icon:', error);
  }
}

// 检查标签页是否有高亮内容
async function checkTabHighlights(tabId: number) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: 'GET_HIGHLIGHT_STATUS'
    });
    
    if (response && response.hasHighlights) {
      // 如果有高亮内容，更新图标显示
      await updateActionIcon(tabId, response.enabled);
    }
  } catch (error) {
    // 忽略错误，可能是页面还没有加载 content script
  }
}

// 监听来自侧边栏和 content script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // 处理高亮相关消息
  if (request.type === 'HIGHLIGHT_CREATED') {
    if (sender.tab?.id) {
      // 更新图标，显示该页面有高亮内容
      updateActionIcon(sender.tab.id, true);
    }
    return;
  }
  
  if (request.action === CONSTANTS.COMMON.MESSAGE_TYPES.GET_STORAGE_DATA) {
    chrome.storage.local.get(null, (data) => {
      sendResponse(data);
    });
    return true; // 保持消息通道开放
  }

  if (request.action === CONSTANTS.COMMON.MESSAGE_TYPES.SET_STORAGE_DATA) {
    chrome.storage.local.set(request.data, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    // 页面加载完成后检查高亮状态
    setTimeout(() => {
      checkTabHighlights(tabId);
    }, 1000);
  }
});

// 监听标签页激活事件
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // 切换到新标签页时检查高亮状态
  setTimeout(() => {
    checkTabHighlights(activeInfo.tabId);
  }, 500);
});

// 初始化扩展存储
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['effikit_settings'], (result) => {
    if (!result.effikit_settings) {
      // 设置默认配置
      chrome.storage.local.set({
        effikit_settings: {
          networkMonitorEnabled: true,
          responseEditingEnabled: false,
          performanceMonitorEnabled: true,
          automationEnabled: false,
          highlightEnabled: true
        }
      });
    }
  });
});

initialRequestInterceptorBackground();
