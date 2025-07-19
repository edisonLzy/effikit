// EffiKit 扩展的主要background脚本
// 作为各个features的background逻辑的入口点

// 导入各个features的background逻辑
import { 
  initializeHighlighterBackground
} from './features/highlighter/background';
import { 
  initializeSidebarBackground
} from './features/sidebar/background';

// 处理扩展图标点击事件
chrome.action.onClicked.addListener(async (tab) => {
  // 只打开侧边栏
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

// 初始化扩展
chrome.runtime.onStartup.addListener(() => {
  initializeExtension();
});

// 初始化所有功能
function initializeExtension() {
  console.log('Initializing EffiKit extension...');
  
  // 初始化高亮功能
  initializeHighlighterBackground();
  
  // 初始化sidebar功能
  initializeSidebarBackground();
  
  console.log('EffiKit extension initialized');
}

// 在扩展加载时也进行初始化
initializeExtension();
