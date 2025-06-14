// 处理扩展图标点击事件
chrome.action.onClicked.addListener(() => {
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

// 监听来自侧边栏的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getStorageData') {
    chrome.storage.local.get(null, (data) => {
      sendResponse(data);
    });
    return true; // 保持消息通道开放
  }
  
  if (request.action === 'setStorageData') {
    chrome.storage.local.set(request.data, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// 基础的网络请求监听器（为后续功能准备）
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // 这里可以添加网络请求监控逻辑
    console.log('网络请求:', details.url);
  },
  { urls: ['<all_urls>'] },
  ['requestBody']
);

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
          automationEnabled: false
        }
      });
    }
  });
});
