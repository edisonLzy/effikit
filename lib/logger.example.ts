/**
 * Logger 使用示例
 * 展示如何使用通用 logger 功能
 */

import { createLogger, LogLevel } from './logger';

// 基本使用方式
const logger = createLogger('highlight');

logger.info('这是一条信息日志');
logger.warn('这是一条警告日志');
logger.error('这是一条错误日志');
logger.debug('这是一条调试日志'); // 默认不会显示，因为默认级别是 INFO

// 带参数的日志
const user = { id: 1, name: 'John' };
logger.info('用户登录', user);
logger.error('API 请求失败', { status: 500, message: 'Internal Server Error' });

// 创建不同模块的 logger
const apiLogger = createLogger('api');
const uiLogger = createLogger('ui');
const storageLogger = createLogger('storage');

apiLogger.info('发起 API 请求');
uiLogger.warn('组件渲染警告');
storageLogger.error('存储操作失败');

// 自定义配置的 logger
const debugLogger = createLogger('debug', {
  level: LogLevel.DEBUG, // 显示所有级别的日志
  prefix: 'DEV', // 添加前缀
  colors: true // 启用颜色
});

debugLogger.debug('这条调试日志现在会显示');
debugLogger.info('带前缀的信息日志');

// 自定义配置示例（已在上面展示）

// 动态更新配置
const dynamicLogger = createLogger('dynamic');
dynamicLogger.info('初始配置的日志');

// 更新配置
dynamicLogger.setConfig({ level: LogLevel.WARN });
dynamicLogger.info('这条信息日志不会显示'); // 因为级别现在是 WARN
dynamicLogger.warn('这条警告日志会显示');

// 在不同环境中的使用
if (typeof chrome !== 'undefined' && chrome.runtime) {
  // Chrome 扩展环境
  const extensionLogger = createLogger('extension');
  extensionLogger.info('Chrome 扩展环境中的日志');
} else if (typeof window !== 'undefined') {
  // 浏览器环境
  const webLogger = createLogger('web');
  webLogger.info('Web 页面环境中的日志');
} else {
  // Node.js 环境
  const nodeLogger = createLogger('node');
  nodeLogger.info('Node.js 环境中的日志');
}

// 错误处理示例
try {
  throw new Error('模拟错误');
} catch (error) {
  logger.error('捕获到错误', error);
}

// 异步操作日志
async function fetchData() {
  const fetchLogger = createLogger('fetch');
  
  try {
    fetchLogger.info('开始获取数据');
    // 模拟异步操作
    await new Promise(resolve => setTimeout(resolve, 1000));
    fetchLogger.info('数据获取成功');
  } catch (error) {
    fetchLogger.error('数据获取失败', error);
  }
}

// 条件日志
function conditionalLogging(condition: boolean) {
  const condLogger = createLogger('condition');
  
  if (condition) {
    condLogger.info('条件为真');
  } else {
    condLogger.warn('条件为假');
  }
}

// 性能监控日志
function performanceLogging() {
  const perfLogger = createLogger('performance');
  
  const startTime = performance.now();
  perfLogger.info('开始性能监控');
  
  // 模拟一些操作
  for (let i = 0; i < 1000000; i++) {
    // 空循环
  }
  
  const endTime = performance.now();
  perfLogger.info(`操作完成，耗时: ${endTime - startTime}ms`);
}

// 执行示例函数以避免未使用警告
fetchData();
conditionalLogging(true);
performanceLogging();