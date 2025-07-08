// 高亮功能的background脚本
// 专门处理高亮功能相关的background逻辑

// 高亮功能状态管理
let highlightEnabled = true;
const tabHighlightStatus = new Map<number, boolean>();

// 创建高亮相关的右键菜单
export function createHighlightContextMenus() {
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
}

// 处理高亮相关的右键菜单点击
export async function handleHighlightContextMenuClick(info: chrome.contextMenus.OnClickData, tab?: chrome.tabs.Tab) {
  if (!tab?.id) return false;
  
  switch (info.menuItemId) {
    case 'effikit-highlight-toggle':
      await toggleHighlightForTab(tab.id);
      // 更新菜单标题
      await updateHighlightContextMenus(tab.id);
      return true;
      
    case 'effikit-highlight-clear':
      await clearHighlightsForTab(tab.id);
      return true;
      
    case 'effikit-open-manager':
      // 打开侧边栏并导航到高亮管理
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
      // 可以发送消息给侧边栏来导航到高亮管理工具
      return true;
  }
  
  return false;
}

// 更新高亮相关的右键菜单状态
export async function updateHighlightContextMenus(tabId: number) {
  try {
    const enabled = tabHighlightStatus.get(tabId) ?? highlightEnabled;
    const title = enabled ? '禁用高亮功能' : '启用高亮功能';
    
    chrome.contextMenus.update('effikit-highlight-toggle', {
      title: title
    });
  } catch (error) {
    console.error('Failed to update highlight context menus:', error);
  }
}

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
    
    // 更新图标（需要检查是否有高亮内容）
    await updateActionIcon(tabId, newEnabled, false);
    
    console.log(`Highlight toggled for tab ${tabId}: ${newEnabled}`);
  } catch (error) {
    console.error('Failed to toggle highlight for tab:', error);
  }
}

// 清除标签页的高亮内容
async function clearHighlightsForTab(tabId: number) {
  try {
    // 发送消息给 content script 清除高亮
    chrome.tabs.sendMessage(tabId, {
      type: 'CLEAR_HIGHLIGHTS'
    });
    
    // 更新图标状态
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
    // 根据状态设置不同的图标和标题
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
    
    // 设置标题
    await chrome.action.setTitle({ 
      tabId, 
      title 
    });
    
    // 设置徽章
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
export async function checkTabHighlights(tabId: number) {
  try {
    const response = await chrome.tabs.sendMessage(tabId, {
      type: 'GET_HIGHLIGHT_STATUS'
    });
    
    if (response) {
      // 更新图标显示
      const enabled = tabHighlightStatus.get(tabId) ?? highlightEnabled;
      await updateActionIcon(tabId, enabled, response.hasHighlights);
    }
  } catch (error) {
    // 忽略错误，可能是页面还没有加载 content script
    // 设置默认状态
    const enabled = tabHighlightStatus.get(tabId) ?? highlightEnabled;
    await updateActionIcon(tabId, enabled, false);
  }
}

// 处理高亮相关的运行时消息
export function handleHighlightMessage(
  message: any, 
  sender: chrome.runtime.MessageSender, 
  sendResponse: (response?: any) => void
): boolean {
  switch (message.type) {
    case 'HIGHLIGHT_CREATED':
      // 更新图标显示有高亮内容
      if (sender.tab?.id) {
        updateActionIcon(sender.tab.id, true, true);
      }
      return false;
      
    case 'HIGHLIGHT_REMOVED':
      // 检查是否还有其他高亮内容
      if (sender.tab?.id) {
        checkTabHighlights(sender.tab.id);
      }
      return false;
      
    case 'CONTENT_SCRIPT_READY':
      // 内容脚本初始化完成
      console.log('Content script ready for tab:', sender.tab?.id);
      if (sender.tab?.id) {
        // 检查该标签页的高亮状态
        checkTabHighlights(sender.tab.id);
      }
      return false;
      
    case 'DEBUG_REQUEST':
      // 调试请求
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

// 处理标签页更新事件（高亮相关）
export async function handleHighlightTabUpdate(
  tabId: number, 
  changeInfo: chrome.tabs.TabChangeInfo, 
  tab: chrome.tabs.Tab
) {
  if (changeInfo.status === 'complete' && tab.url) {
    // 页面加载完成后检查高亮状态
    setTimeout(() => {
      checkTabHighlights(tabId);
    }, 1000);
  }
}

// 处理标签页激活事件（高亮相关）
export async function handleHighlightTabActivate(activeInfo: chrome.tabs.TabActiveInfo) {
  // 切换到新标签页时检查高亮状态
  setTimeout(() => {
    checkTabHighlights(activeInfo.tabId);
    updateHighlightContextMenus(activeInfo.tabId);
  }, 500);
}

// 初始化高亮功能的存储设置
export function initializeHighlightStorage() {
  chrome.storage.local.get(['effikit_settings'], (result) => {
    if (!result.effikit_settings) {
      // 设置默认配置
      chrome.storage.local.set({
        effikit_settings: {
          highlightEnabled: true
        }
      });
    } else if (result.effikit_settings.highlightEnabled === undefined) {
      // 如果设置存在但没有highlightEnabled，添加默认值
      chrome.storage.local.set({
        effikit_settings: {
          ...result.effikit_settings,
          highlightEnabled: true
        }
      });
    }
  });
} 