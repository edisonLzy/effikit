// 导入 Custom Elements polyfill 以支持 isolated world
import '@webcomponents/custom-elements';
import { createLogger } from '../../lib/logger';

const logger = createLogger('highlighter');

// 改进的初始化函数
async function initializeHighlighter() {
  try {
    logger.info('Initializing highlighter...');
    // TODO: 实现高亮功能初始化逻辑
    logger.info('Highlighter initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize highlighter:', error);
  }
}

// 页面加载完成后初始化
if (document.readyState === 'loading') {
  logger.debug('Document still loading, waiting for DOMContentLoaded');
  document.addEventListener('DOMContentLoaded', initializeHighlighter);
} else {
  logger.debug('Document already loaded, initializing immediately');
  initializeHighlighter();
}