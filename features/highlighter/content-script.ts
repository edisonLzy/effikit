// 导入 Custom Elements polyfill 以支持 isolated world
import '@webcomponents/custom-elements';
import { createLogger } from '../../lib/logger';
import { applyHighlight, createTextRangeFromSelection, restoreHighlights, registerHighlightElements } from './dom';
import { saveHighlight, getHighlights, getHighlightSettings } from './storage';
import { generateHighlightId, normalizeUrl } from './utils';
import type { Highlight } from './types';

const logger = createLogger('highlighter');

let isHighlighterEnabled = true;
let defaultColor: string = 'yellow';

// 改进的初始化函数
async function initializeHighlighter() {
  try {
    logger.info('Initializing highlighter...');
    
    // 加载设置
    const settings = await getHighlightSettings();
    isHighlighterEnabled = settings.enabled;
    defaultColor = settings.defaultColor;
    
    if (!isHighlighterEnabled) {
      logger.info('Highlighter is disabled');
      return;
    }
    
    // 注册自定义元素
    registerHighlightElements();
    // 恢复页面高亮
    await restorePageHighlights();
    
    // 设置事件监听器
    setupEventListeners();
    
    logger.info('Highlighter initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize highlighter:', error);
  }
}

/**
 * 恢复页面高亮
 */
async function restorePageHighlights() {
  try {
    const currentUrl = normalizeUrl(window.location.href);
    const highlights = await getHighlights(currentUrl);
    
    if (highlights.length > 0) {
      logger.debug(`Restoring ${highlights.length} highlights for current page`);
      restoreHighlights(highlights);
    }
  } catch (error) {
    logger.error('Failed to restore page highlights:', error);
  }
}

/**
 * 设置事件监听器
 */
function setupEventListeners() {
  // 监听鼠标抬起事件（文本选择完成）
  document.addEventListener('mouseup', handleTextSelection);
  
  // 监听键盘事件（支持键盘选择文本）
  document.addEventListener('keyup', handleTextSelection);
  
  logger.debug('Event listeners set up');
}

/**
 * 处理文本选择事件
 */
async function handleTextSelection() {
  try {
    if (!isHighlighterEnabled) {
      return;
    }
    
    // 延迟处理，确保选择状态稳定
    setTimeout(async () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }
      
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        return;
      }
      
      const selectedText = selection.toString().trim();
      if (!selectedText || selectedText.length < 2) {
        return;
      }
      
      logger.debug('Text selected:', selectedText);
      
      createHighlightFromSelection(selection, selectedText);
    }, 100);
  } catch (error) {
    logger.error('Failed to handle text selection:', error);
  }
}

/**
 * 从选择创建高亮
 */
async function createHighlightFromSelection(selection: Selection, text: string) {
  try {
    const textRange = createTextRangeFromSelection(selection);
    if (!textRange) {
      logger.warn('Failed to create text range from selection');
      return;
    }
    
    const highlight: Highlight = {
      id: generateHighlightId(),
      text,
      url: normalizeUrl(window.location.href),
      color: defaultColor as any,
      range: textRange,
      tags: [],
      timestamp: Date.now(),
      lastModified: Date.now()
    };
    
    // 应用高亮到DOM
    const success = applyHighlight(selection, highlight);
    if (!success) {
      logger.warn('Failed to apply highlight to DOM');
      return;
    }
    
    // 保存高亮数据
    await saveHighlight(highlight);
    
    logger.info('Highlight created successfully:', highlight.id);
  } catch (error) {
    logger.error('Failed to create highlight from selection:', error);
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