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

// 导出新的 UI 组件
export * from './ui/HighlightColorPopover';
export * from './ui/HighlightContentPopover';
export * from './ui/dom-renderer';

// 导出样式隔离相关
// export { ShadowStyleManager, shadowStyleManager } from './shadow-style-manager';
// export { ShadowPopover, shadowPopover } from './shadow-popover';
// export type { PopoverPosition, PopoverOptions } from './shadow-popover'; 