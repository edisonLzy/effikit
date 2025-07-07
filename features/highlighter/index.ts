// 导出类型
export type { 
  Highlight, 
  HighlightColor, 
  HighlightPayload, 
  HighlightStorage, 
  HighlightSettings 
} from './types';

// 导出工具函数
export {
  generateHighlightId,
  getHighlightColorClass,
  getHighlightColors,
  getHighlightColorName,
  normalizeUrl,
  createRangeFromHighlight
} from './utils';

// 导出存储相关函数
export {
  saveHighlight,
  getHighlights,
  getHighlightsByUrl,
  removeHighlight,
  clearHighlights,
  getHighlightSettings,
  saveHighlightSettings
} from './storage';

// 导出 DOM 操作函数
export {
  wrapSelectionWithHighlight,
  removeHighlightFromDOM,
  renderHighlightInDOM,
  clearAllHighlightsFromDOM,
  getSelectionRange,
  createHighlightContainer
} from './dom';

// 导出管理器
export { HighlightManager, highlightManager } from './manager'; 