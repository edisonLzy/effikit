// EffiKit 扩展的内容脚本

// 导入 Custom Elements polyfill 以支持 isolated world
import '@webcomponents/custom-elements';
import { createLogger } from './utils/logger';
import { applyHighlight, createTextRangeFromSelection, restoreHighlights, registerHighlightElements, removeHighlight, getHighlightIdFromSelection, showGlobalToolbar, hideGlobalToolbar } from './highlighter/dom';
import { HighlightTagPanelElement } from './highlighter/ui/HighlightTagPanel';
import { saveHighlight, getHighlights, getHighlightSettings, deleteHighlightFromStorage, updateHighlightFromStore } from './storage';
import { generateHighlightId, normalizeUrl } from './utils';
import type { Highlight, HighlightTag, AnnotationTagContent } from '@/types';

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
    
    // 发送初始化完成消息给background
    chrome.runtime.sendMessage({
      type: 'CONTENT_SCRIPT_READY'
    });
    
    logger.info('Highlighter initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize highlighter:', error);
  }
}

// 监听来自background的消息
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'TOGGLE_HIGHLIGHT':
      toggleHighlight(message.payload.enabled);
      break;
      
    case 'CLEAR_HIGHLIGHTS':
      clearAllHighlights();
      break;
      
    case 'GET_HIGHLIGHT_STATUS':
      sendResponse(getHighlightStatus());
      return true;
      
    case 'HIGHLIGHT_SELECTION':
      highlightCurrentSelection(message.payload.text);
      break;
      
    case 'DEBUG_INFO':
      sendResponse(getDebugInfo());
      return true;
      
    default:
      break;
  }
});

// 切换高亮功能
function toggleHighlight(enabled: boolean) {
  isHighlighterEnabled = enabled;
  if (!enabled) {
    hideGlobalToolbar();
  }
  logger.info(`Highlighter ${enabled ? 'enabled' : 'disabled'}`);
}

// 清除所有高亮
async function clearAllHighlights() {
  try {
    const currentUrl = normalizeUrl(window.location.href);
    const highlights = await getHighlights(currentUrl);
    
    for (const highlight of highlights) {
      removeHighlight(highlight.id);
      await deleteHighlightFromStorage(highlight.id);
    }
    
    logger.info('All highlights cleared');
  } catch (error) {
    logger.error('Failed to clear highlights:', error);
  }
}

// 获取高亮状态
function getHighlightStatus() {
  const highlightElements = document.querySelectorAll('[data-effikit-highlight-id]');
  return {
    hasHighlights: highlightElements.length > 0,
    highlightCount: highlightElements.length,
    enabled: isHighlighterEnabled
  };
}

// 高亮当前选中的文本
function highlightCurrentSelection(text: string) {
  const selection = window.getSelection();
  if (selection && selection.toString().includes(text)) {
    handleHighlightCreate();
  }
}

// 获取调试信息
function getDebugInfo() {
  return {
    enabled: isHighlighterEnabled,
    url: window.location.href,
    highlightCount: document.querySelectorAll('[data-effikit-highlight-id]').length,
    hasSelection: !!window.getSelection()?.toString()
  };
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

  // 监听标签操作事件
  document.addEventListener('effikit:tag:add', handleTagAdd as unknown as EventListener);
  document.addEventListener('effikit:tag:delete', handleTagDelete as unknown as EventListener);
  document.addEventListener('effikit:tag:edit', handleTagEdit as unknown as EventListener);
  document.addEventListener('effikit:tag-panel:close', handleTagPanelClose as unknown as EventListener);

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

    // 隐藏工具栏（如果显示的话）
    hideGlobalToolbar();

    // 显示标签面板
    await showHighlightTagPanel(highlightId, element);

    logger.debug('Highlight element clicked:', highlightId);
  } catch (error) {
    logger.error('Failed to handle highlight element click:', error);
  }
}

/**
 * 显示高亮标签面板
 */
async function showHighlightTagPanel(highlightId: string, element: HTMLElement) {
  try {
    // 获取高亮数据
    const currentUrl = normalizeUrl(window.location.href);
    const highlights = await getHighlights(currentUrl);
    const highlight = highlights.find(h => h.id === highlightId);

    if (!highlight) {
      logger.warn('Highlight not found:', highlightId);
      return;
    }

    // 获取元素位置
    const rect = element.getBoundingClientRect();

    // 获取标签面板实例
    const tagPanel = HighlightTagPanelElement.getInstance();

    // 显示面板
    tagPanel.showPanel({
      highlightId,
      tags: highlight.tags || [],
      position: rect,
    });

    logger.debug('Tag panel shown for highlight:', highlightId);
  } catch (error) {
    logger.error('Failed to show tag panel:', error);
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
    
    // 发送高亮创建消息给background
    chrome.runtime.sendMessage({
      type: 'HIGHLIGHT_CREATED',
      payload: { id: highlight.id }
    });
    
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
    
    // 首先从选择范围中获取高亮ID
    const highlightId = getHighlightIdFromSelection(selection);
    if (!highlightId) {
      logger.warn('No highlight ID found in current selection');
      return;
    }
    
    // 从存储中获取高亮数据（用于日志记录）
    const currentUrl = normalizeUrl(window.location.href);
    const highlights = await getHighlights(currentUrl);
    const targetHighlight = highlights.find(h => h.id === highlightId);
    
    // 移除DOM中所有具有相同ID的高亮元素
    const success = removeHighlight(highlightId);
    if (success) {
      // 删除存储中的高亮数据
      await deleteHighlightFromStorage(highlightId);
      
      // 发送高亮移除消息给background
      chrome.runtime.sendMessage({
        type: 'HIGHLIGHT_REMOVED',
        payload: { id: highlightId }
      });
      
      logger.info('All highlight elements removed successfully:', highlightId);
      
      if (targetHighlight) {
        logger.info('Removed highlight text:', targetHighlight.text);
      }
    } else {
      logger.warn('Failed to remove highlight elements from DOM');
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

/**
 * 处理添加标签事件
 */
async function handleTagAdd(event: CustomEvent) {
  try {
    const { highlightId, type } = event.detail;

    if (!highlightId || !type) {
      logger.warn('Invalid tag add event data');
      return;
    }

    // 获取高亮数据
    const currentUrl = normalizeUrl(window.location.href);
    const highlights = await getHighlights(currentUrl);
    const highlight = highlights.find(h => h.id === highlightId);

    if (!highlight) {
      logger.warn('Highlight not found for tag add:', highlightId);
      return;
    }

    // 检查是否已存在该类型的标签
    const existingTag = highlight.tags?.find(tag => tag.type === type);
    if (existingTag) {
      logger.warn('Tag of this type already exists:', type);
      return;
    }

    // 创建新标签
    const newTag: HighlightTag = {
      id: generateHighlightId(), // 生成唯一标签ID
      type,
      title: type === 'annotation' ? '注释' : '词汇',
      content: type === 'annotation'
        ? { note: '', createdAt: Date.now(), updatedAt: Date.now() } as AnnotationTagContent
        : { note: '', createdAt: Date.now(), updatedAt: Date.now() } as AnnotationTagContent, // 暂时都使用 annotation 类型
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    // 更新高亮数据
    const updatedTags = [...(highlight.tags || []), newTag];

    // 保存到存储
    await updateHighlightFromStore(highlightId, {
      tags: updatedTags,
      lastModified: Date.now(),
    });

    // 更新标签面板显示
    const tagPanel = HighlightTagPanelElement.getInstance();
    const element = document.querySelector(`[data-highlight-id="${highlightId}"]`) as HTMLElement;
    if (element) {
      const rect = element.getBoundingClientRect();
      tagPanel.showPanel({
        highlightId,
        tags: updatedTags,
        position: rect,
      });
    }

    logger.debug('Tag added:', newTag);
  } catch (error) {
    logger.error('Failed to add tag:', error);
  }
}

/**
 * 处理删除标签事件
 */
async function handleTagDelete(event: CustomEvent) {
  try {
    const { highlightId, tagId } = event.detail;

    if (!highlightId || !tagId) {
      logger.warn('Invalid tag delete event data');
      return;
    }

    // 获取高亮数据
    const currentUrl = normalizeUrl(window.location.href);
    const highlights = await getHighlights(currentUrl);
    const highlight = highlights.find(h => h.id === highlightId);

    if (!highlight) {
      logger.warn('Highlight not found for tag delete:', highlightId);
      return;
    }

    // 删除标签
    const updatedTags = highlight.tags?.filter(tag => tag.id !== tagId) || [];

    // 保存到存储
    await updateHighlightFromStore(highlightId, {
      tags: updatedTags,
      lastModified: Date.now(),
    });

    // 更新标签面板显示
    const tagPanel = HighlightTagPanelElement.getInstance();
    const element = document.querySelector(`[data-highlight-id="${highlightId}"]`) as HTMLElement;
    if (element) {
      const rect = element.getBoundingClientRect();
      tagPanel.showPanel({
        highlightId,
        tags: updatedTags,
        position: rect,
      });
    }

    logger.debug('Tag deleted:', tagId);
  } catch (error) {
    logger.error('Failed to delete tag:', error);
  }
}

/**
 * 处理编辑标签事件
 */
async function handleTagEdit(event: CustomEvent) {
  try {
    const { highlightId, tagId, content } = event.detail;

    if (!highlightId || !tagId || !content) {
      logger.warn('Invalid tag edit event data');
      return;
    }

    // 获取高亮数据
    const currentUrl = normalizeUrl(window.location.href);
    const highlights = await getHighlights(currentUrl);
    const highlight = highlights.find(h => h.id === highlightId);

    if (!highlight) {
      logger.warn('Highlight not found for tag edit:', highlightId);
      return;
    }

    // 更新标签内容
    const updatedTags = highlight.tags?.map(tag =>
      tag.id === tagId
        ? { ...tag, content, updatedAt: Date.now() }
        : tag
    ) || [];

    // 保存到存储
    await updateHighlightFromStore(highlightId, {
      tags: updatedTags,
      lastModified: Date.now(),
    });

    // 更新标签面板显示
    const tagPanel = HighlightTagPanelElement.getInstance();
    const element = document.querySelector(`[data-highlight-id="${highlightId}"]`) as HTMLElement;
    if (element) {
      const rect = element.getBoundingClientRect();
      tagPanel.showPanel({
        highlightId,
        tags: updatedTags,
        position: rect,
      });
    }

    logger.debug('Tag edited:', tagId);
  } catch (error) {
    logger.error('Failed to edit tag:', error);
  }
}

/**
 * 处理标签面板关闭事件
 */
function handleTagPanelClose(event: CustomEvent) {
  try {
    const tagPanel = HighlightTagPanelElement.getInstance();
    tagPanel.hidePanel();

    logger.debug('Tag panel closed');
  } catch (error) {
    logger.error('Failed to close tag panel:', error);
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