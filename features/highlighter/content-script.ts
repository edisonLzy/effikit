// 导入 Custom Elements polyfill 以支持 isolated world
import '@webcomponents/custom-elements';
import { createLogger } from '../../lib/logger';
import { applyHighlight, createTextRangeFromSelection, restoreHighlights, registerHighlightElements, removeHighlightFromSelection, showGlobalToolbar, showGlobalToolbarWithId, hideGlobalToolbar } from './dom';
import { saveHighlight, getHighlights, getHighlightSettings, deleteHighlightFromStorage, updateHighlightFromStore } from './storage';
import { generateHighlightId, normalizeUrl } from './utils';
import type { Highlight } from './types';

const logger = createLogger('highlighter');

let isHighlighterEnabled = true;

// 改进的初始化函数
async function initializeHighlighter() {
  try {
    logger.info('Initializing highlighter...');
    
    // 加载设置
    const settings = await getHighlightSettings();
    isHighlighterEnabled = settings.enabled;
    
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
    
    // 注册自定义事件监听器
    setupCustomEventListeners();
    
    logger.info('Highlighter initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize highlighter:', error);
  }
}

/**
 * 设置自定义事件监听器
 */
function setupCustomEventListeners() {
  // 监听工具栏按钮点击事件
  document.addEventListener('effikit-highlight-create', handleHighlightCreate as unknown as EventListener);
  document.addEventListener('effikit-highlight-remove', handleHighlightRemove as unknown as EventListener);
  document.addEventListener('effikit-highlight-color-change', handleHighlightColorChange as unknown as EventListener);
  
  // 监听高亮元素点击事件
  document.addEventListener('effikit:highlight:click', handleHighlightElementClick as unknown as EventListener);
  
  logger.debug('Custom event listeners set up');
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
        // 隐藏工具栏如果没有选择
        hideGlobalToolbar();
        return;
      }
      
      const range = selection.getRangeAt(0);
      if (range.collapsed) {
        // 隐藏工具栏如果选择已折叠
        hideGlobalToolbar();
        return;
      }
      
      const selectedText = selection.toString().trim();
      if (!selectedText || selectedText.length < 2) {
        // 隐藏工具栏如果选择文本太短
        hideGlobalToolbar();
        return;
      }
      
      logger.debug('Text selected:', selectedText);
      
      // 显示工具栏并更新状态
      showGlobalToolbar(selection);
    }, 100);
  } catch (error) {
    logger.error('Failed to handle text selection:', error);
  }
}

/**
 * 处理高亮元素点击事件
 */
async function handleHighlightElementClick(event: CustomEvent) {
  try {
    const { id: highlightId, element } = event.detail;
    
    if (!highlightId || !element) {
      logger.warn('Invalid highlight click event data');
      return;
    }
    
    // 创建一个选择范围覆盖点击的高亮元素
    const range = document.createRange();
    range.selectNode(element);  // 选择整个元素，而不仅仅是内容
    
    const selection = window.getSelection();
    if (selection) {
      selection.removeAllRanges();
      selection.addRange(range);
      
      // 直接传递高亮ID给工具栏显示函数
      showGlobalToolbarWithId(selection, highlightId);
    }
    
    logger.debug('Highlight element clicked:', highlightId);
  } catch (error) {
    logger.error('Failed to handle highlight element click:', error);
  }
}

/**
 * 处理创建高亮事件
 */
async function handleHighlightCreate() {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      logger.warn('No current selection for highlight creation');
      return;
    }
    
    const selectedText = selection.toString().trim();
    
    const textRange = createTextRangeFromSelection(selection);
    if (!textRange) {
      logger.warn('Failed to create text range from selection');
      return;
    }
    
    const highlight: Highlight = {
      id: generateHighlightId(),
      text: selectedText,
      url: normalizeUrl(window.location.href),
      color: 'green',
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
    
    // 清除选择并隐藏工具栏
    selection.removeAllRanges();
    hideGlobalToolbar();
    
    logger.info('Highlight created successfully:', highlight.id);
  } catch (error) {
    logger.error('Failed to create highlight:', error);
  }
}

/**
 * 处理移除高亮事件
 */
async function handleHighlightRemove() {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      logger.warn('No current selection for highlight removal');
      return;
    }
    
    // 移除DOM中的高亮
    const removed = removeHighlightFromSelection(selection);
    if (removed && removed.length > 0) {
      // 删除存储中的高亮数据
      for (const highlight of removed) {
        await deleteHighlightFromStorage(highlight.id);
        logger.info('Highlight removed successfully:', highlight.id);
      }
    }
    
    // 清除选择并隐藏工具栏
    selection.removeAllRanges();
    hideGlobalToolbar();
  } catch (error) {
    logger.error('Failed to remove highlight:', error);
  }
}

/**
 * 处理高亮颜色变更事件
 */
async function handleHighlightColorChange(event: CustomEvent) {
  try {
    const { color, highlightId } = event.detail;

    // 更新高亮颜色
    const success = updateHighlightFromStore(highlightId, { color });
    if (!success) {
      logger.warn('Failed to update highlight color in storage');
      return;
    }

    logger.info('Highlight color changed to:', color);
  } catch (error) {
    logger.error('Failed to change highlight color:', error);
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