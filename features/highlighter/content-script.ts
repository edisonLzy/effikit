// 导入 Custom Elements polyfill 以支持 isolated world
import '@webcomponents/custom-elements';

// 添加调试函数
function debugLog(message: string, data?: any) {
  console.log(`[EffiKit Debug] ${message}`, data || '');
}

// 改进的初始化函数
async function initializeHighlighter() {
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  debugLog('Document still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', initializeHighlighter);
} else {
  debugLog('Document already loaded, initializing immediately');
  initializeHighlighter();
}