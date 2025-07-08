// EffiKit 扩展的主要background脚本
// 作为各个features的background逻辑的入口点

// 导入各个features的background逻辑
import { 
  createHighlightContextMenus,
  handleHighlightContextMenuClick,
  updateHighlightContextMenus,
  checkTabHighlights,
  handleHighlightMessage,
  handleHighlightTabUpdate,
  handleHighlightTabActivate,
  initializeHighlightStorage
} from './features/highlighter/background';

import { 
  handleSidebarMessage,
  initializeSidebarBackground
} from './features/sidebar/background';

// 处理扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  // 只打开侧边栏，不切换高亮功能
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('EffiKit 扩展已安装');
  } else if (details.reason === 'update') {
    console.log('EffiKit 扩展已更新');
  }
  
  // 创建右键菜单
  createContextMenus();
});

// 创建右键菜单
function createContextMenus() {
  // 清除现有菜单
  chrome.contextMenus.removeAll(() => {
    // 创建高亮相关菜单
    createHighlightContextMenus();
  });
}

// 处理右键菜单点击
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  // 处理高亮相关的菜单点击
  const highlightHandled = await handleHighlightContextMenuClick(info, tab);
  
  if (!highlightHandled) {
    // 如果高亮功能没有处理这个菜单项，可以在这里处理其他功能的菜单
    console.log('Unhandled context menu item:', info.menuItemId);
  }
});

// 监听来自各个features的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // 处理高亮相关的消息
  const highlightHandled = handleHighlightMessage(message, sender, sendResponse);
  if (highlightHandled) {
    return true;
  }
  
  // 处理sidebar相关的消息
  const sidebarHandled = handleSidebarMessage(message, sender, sendResponse);
  if (sidebarHandled) {
    return true;
  }
  
  // 如果没有任何feature处理这个消息，记录未处理的消息
  console.log('Unhandled message:', message.type || message.action);
  return false;
});

// 监听标签页更新事件
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // 处理高亮相关的标签页更新
  await handleHighlightTabUpdate(tabId, changeInfo, tab);
});

// 监听标签页激活事件
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // 处理高亮相关的标签页激活
  await handleHighlightTabActivate(activeInfo);
});

// 初始化扩展
chrome.runtime.onStartup.addListener(() => {
  initializeExtension();
});

// 初始化所有功能
function initializeExtension() {
  console.log('Initializing EffiKit extension...');
  
  // 初始化高亮功能存储
  initializeHighlightStorage();
  
  // 初始化sidebar功能
  initializeSidebarBackground();
  
  console.log('EffiKit extension initialized');
}

// 在扩展加载时也进行初始化
initializeExtension();
