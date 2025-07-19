/**
 * Highlighter UI Components
 * 高亮功能的 UI 组件统一入口
 */

// 基础类和工具
export { ReactCustomElement } from './ReactCustomElement';

export { EventBus, TypedEventBus } from './EventBus';

export type { HighlightEvents } from './EventBus';

// 管理器
export { HighlightManager, highlightManager } from './HighlightManager';

export type { HighlightManagerConfig, HighlightElementInfo } from './HighlightManager';

// Custom Elements
export { HighlightContentElement } from './HighlightElement';

export { HighlightPopoverElement } from './HighlightPopoverElement';

export type { HighlightContentProps } from './HighlightElement';

export type { PopoverPosition } from './HighlightPopoverElement';

// 导入类型用于函数签名
import type { HighlightPopoverElement as HighlightPopoverElementType } from './HighlightPopoverElement';

// React 组件
export { HighlightPopover, popoverStyles } from './components/HighlightPopover';

export type { HighlightPopoverProps } from './components/HighlightPopover';

// 工具函数
/**
 * 初始化高亮 UI 系统
 * 注册所有必要的 Custom Elements
 */
export function initializeHighlightUI(): void {
  // Custom Elements 会在各自的模块中自动注册
  // 这里可以添加额外的初始化逻辑
  
  console.log('[HighlightUI] UI system initialized');
}

/**
 * 创建高亮内容元素
 */
export function createHighlightContentElement(params: {
  id: string;
  color: string;
  text: string;
  metadata?: Record<string, any>;
}): HTMLElement {
  const element = document.createElement('effikit-highlight-content');
  element.setAttribute('highlight-id', params.id);
  element.setAttribute('color', params.color);
  element.textContent = params.text;
  
  if (params.metadata) {
    element.setAttribute('metadata', JSON.stringify(params.metadata));
  }
  
  return element;
}

/**
 * 创建高亮弹出框元素
 */
export function createHighlightPopoverElement(): HighlightPopoverElementType {
  return document.createElement('effikit-highlight-popover') as HighlightPopoverElementType;
}

/**
 * 获取或创建全局弹出框实例
 */
let globalPopoverInstance: HighlightPopoverElementType | null = null;

export function getGlobalPopover(): HighlightPopoverElementType {
  if (!globalPopoverInstance) {
    globalPopoverInstance = createHighlightPopoverElement();
    globalPopoverInstance.id = 'effikit-global-highlight-popover';
    document.body.appendChild(globalPopoverInstance);
  }
  
  return globalPopoverInstance;
}

/**
 * 清理全局弹出框实例
 */
export function cleanupGlobalPopover(): void {
  if (globalPopoverInstance && globalPopoverInstance.parentNode) {
    globalPopoverInstance.parentNode.removeChild(globalPopoverInstance);
    globalPopoverInstance = null;
  }
}
