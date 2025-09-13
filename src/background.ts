// EffiKit 扩展的主要 background 脚本

// 高亮功能状态管理
const highlightEnabled = true;
const tabHighlightStatus = new Map<number, boolean>();

// 创建高亮相关的右键菜单
function createHighlightContextMenus() {
  // 创建高亮相关菜单
  chrome.contextMenus.create({
    id: 'effikit-highlight-toggle',
    title: '切换高亮功能',
    contexts: ['action']
  });
  
  chrome.contextMenus.create({
    id: 'effikit-highlight-clear',
    title: '清除当前页面高亮',
    contexts: ['action']
  });
  
  chrome.contextMenus.create({
    id: 'effikit-separator',
    type: 'separator',
    contexts: ['action']
  });
  
  chrome.contextMenus.create({
    id: 'effikit-open-manager',
    title: '打开高亮管理',
    contexts: ['action']
  });

  // 添加选中文本右键菜单
  chrome.contextMenus.create({
    id: 'effikit-highlight-selection',
    title: '高亮选中文本',
    contexts: ['selection']
  });
}

// 处理高亮相关的右键菜单点击
async function handleHighlightContextMenuClick(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
  if (!tab?.id) return false;
  
  switch (info.menuItemId) {
    case 'effikit-highlight-toggle':
      await toggleHighlightForTab(tab.id);
      await updateHighlightContextMenus(tab.id);
      return true;
      
    case 'effikit-highlight-clear':
      await clearHighlightsForTab(tab.id);
      return true;
      
    case 'effikit-open-manager':
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      return true;

    case 'effikit-highlight-selection':
      // 高亮选中的文本
      await highlightSelectedText(tab.id, info.selectionText || '');
      return true;
  }
  
  return false;
}

// 高亮选中的文本
async function highlightSelectedText(tabId: number, text: string) {
  try {
    chrome.tabs.sendMessage(tabId, {
      type: 'HIGHLIGHT_SELECTION',
      payload: { text }
    });
  } catch (error) {
    console.error('Failed to highlight selected text:', error);
  }
}

// 更新高亮相关的右键菜单状态
async function updateHighlightContextMenus(tabId: number) {
  try {
    const enabled = tabHighlightStatus.get(tabId) ?? highlightEnabled;
    const title = enabled ? '禁用高亮功能' : '启用高亮功能';
    
    chrome.contextMenus.update('effikit-highlight-toggle', {
      title
    });
  } catch (error) {
    console.error('Failed to update highlight context menus:', error);
  }
}

// 切换标签页的高亮功能
async function toggleHighlightForTab(tabId: number) {
  try {
    const currentEnabled = tabHighlightStatus.get(tabId) ?? highlightEnabled;
    const newEnabled = !currentEnabled;
    
    tabHighlightStatus.set(tabId, newEnabled);
    
    chrome.tabs.sendMessage(tabId, {
      type: 'TOGGLE_HIGHLIGHT',
      payload: { enabled: newEnabled }
    });
    
    await updateActionIcon(tabId, newEnabled, false);
    
    console.log(`Highlight toggled for tab ${tabId}: ${newEnabled}`);
  } catch (error) {
    console.error('Failed to toggle highlight for tab:', error);
  }
}

// 清除标签页的高亮内容
async function clearHighlightsForTab(tabId: number) {
  try {
    chrome.tabs.sendMessage(tabId, {
      type: 'CLEAR_HIGHLIGHTS'
    });
    
    const enabled = tabHighlightStatus.get(tabId) ?? highlightEnabled;
    await updateActionIcon(tabId, enabled, false);
    
    console.log(`Highlights cleared for tab ${tabId}`);
  } catch (error) {
    console.error('Failed to clear highlights for tab:', error);
  }
}

// 更新扩展图标
async function updateActionIcon(tabId: number, enabled: boolean, hasHighlights: boolean = false) {
  try {
    let title = 'EffiKit - 开发工具集成平台';
    let badgeText = '';
    let badgeColor = '#4CAF50';
    
    if (hasHighlights) {
      if (enabled) {
        title += ' (高亮已启用，当前页面有高亮内容)';
        badgeText = '●';
        badgeColor = '#FF9800';
      } else {
        title += ' (高亮已禁用，当前页面有高亮内容)';
        badgeText = '●';
        badgeColor = '#757575';
      }
    } else {
      if (enabled) {
        title += ' (高亮已启用)';
        badgeText = '';
      } else {
        title += ' (高亮已禁用)';
        badgeText = '';
      }
    }
    
    await chrome.action.setTitle({ 
      tabId, 
      title 
    });
    
    await chrome.action.setBadgeText({
      tabId,
      text: badgeText
    });
    
    await chrome.action.setBadgeBackgroundColor({
      tabId,
      color: badgeColor
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
    
    if (response) {
      const enabled = tabHighlightStatus.get(tabId) ?? highlightEnabled;
      await updateActionIcon(tabId, enabled, response.hasHighlights);
    }
  } catch {
    const enabled = tabHighlightStatus.get(tabId) ?? highlightEnabled;
    await updateActionIcon(tabId, enabled, false);
  }
}

// 处理高亮相关的运行时消息
function handleHighlightMessage(
  message: any, 
  sender: chrome.runtime.MessageSender, 
): boolean {
  switch (message.type) {
    case 'HIGHLIGHT_CREATED':
      if (sender.tab?.id) {
        updateActionIcon(sender.tab.id, true, true);
      }
      return false;
      
    case 'HIGHLIGHT_REMOVED':
      if (sender.tab?.id) {
        checkTabHighlights(sender.tab.id);
      }
      return false;
      
    case 'CONTENT_SCRIPT_READY':
      console.log('Content script ready for tab:', sender.tab?.id);
      if (sender.tab?.id) {
        checkTabHighlights(sender.tab.id);
      }
      return false;
      
    case 'DEBUG_REQUEST':
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, {
          type: 'DEBUG_INFO'
        }).then(response => {
          console.log('Debug info for tab:', sender.tab?.id, response);
        }).catch(error => {
          console.log('Failed to get debug info:', error);
        });
      }
      return false;
      
    default:
      return false;
  }
}

// 处理标签页更新事件
async function handleTabUpdate(
  tabId: number, 
  changeInfo: chrome.tabs.TabChangeInfo, 
  tab: chrome.tabs.Tab
) {
  if (changeInfo.status === 'complete' && tab.url) {
    setTimeout(() => {
      checkTabHighlights(tabId);
    }, 1000);
  }
}

// 处理标签页激活事件
async function handleTabActivate(activeInfo: chrome.tabs.TabActiveInfo) {
  setTimeout(() => {
    checkTabHighlights(activeInfo.tabId);
    updateHighlightContextMenus(activeInfo.tabId);
  }, 500);
}

// 初始化存储设置
function initializeStorage() {
  chrome.storage.local.get(['effikit_settings'], (result) => {
    if (!result.effikit_settings) {
      chrome.storage.local.set({
        effikit_settings: {
          highlightEnabled: true
        }
      });
    } else if (result.effikit_settings.highlightEnabled === undefined) {
      chrome.storage.local.set({
        effikit_settings: {
          ...result.effikit_settings,
          highlightEnabled: true
        }
      });
    }
  });
}

// 处理扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  if (tab.id) {
    // 切换当前页面的高亮功能启用/禁用
    await toggleHighlightForTab(tab.id);
  }
});

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('EffiKit 扩展已安装');
  } else if (details.reason === 'update') {
    console.log('EffiKit 扩展已更新');
  }
});

// 初始化扩展
function initializeExtension() {
  console.log('Initializing EffiKit extension...');
  
  // 初始化存储设置
  initializeStorage();
  
  // 创建右键菜单
  chrome.contextMenus.removeAll(() => {
    createHighlightContextMenus();
  });
  
  // 处理右键菜单点击
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    await handleHighlightContextMenuClick(info, tab);
  });
  
  // 处理运行时消息
  chrome.runtime.onMessage.addListener(handleHighlightMessage);
  
  // 处理标签页更新
  chrome.tabs.onUpdated.addListener(handleTabUpdate);
  
  // 处理标签页激活
  chrome.tabs.onActivated.addListener(handleTabActivate);
  
  console.log('EffiKit extension initialized');
}

// 初始化扩展
chrome.runtime.onStartup.addListener(() => {
  initializeExtension();
});

// 在扩展加载时也进行初始化
initializeExtension();