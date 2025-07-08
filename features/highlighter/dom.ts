import { highlightManager } from './manager';
import type { Highlight, HighlightColor } from './types';
import { getHighlightColorClass } from './utils';
import { shadowStyleManager } from './shadow-style-manager';

const HIGHLIGHT_SPAN_CLASS = 'effikit-highlight';
const HIGHLIGHT_CONTAINER_ID = 'effikit-highlight-container';

export function wrapSelectionWithHighlight(
  selection: Selection,
  highlightId: string,
  color: HighlightColor
): boolean {
  try {
    if (selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    const span = document.createElement('span');
    
    span.className = `${HIGHLIGHT_SPAN_CLASS} ${getHighlightColorClass(color)}`;
    span.dataset.highlightId = highlightId;
    span.dataset.highlightColor = color;
    
    // 添加点击事件监听器
    addHighlightClickListener(span);
    
    // 检查是否已经在高亮范围内
    if (isRangeInHighlight(range)) {
      return false;
    }
    
    try {
      range.surroundContents(span);
      selection.removeAllRanges();
      return true;
    } catch (error) {
      // 如果 surroundContents 失败，使用 extractContents 和 insertNode
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      selection.removeAllRanges();
      return true;
    }
  } catch (error) {
    console.error('Failed to wrap selection with highlight:', error);
    return false;
  }
}

export function renderHighlightInDOM(highlight: Highlight): boolean {
  try {
    // 使用新的 Shadow DOM 实现
    createHighlightInDOM(highlight);
    return true;
  } catch (error) {
    console.error('Failed to render highlight in DOM:', error);
    return false;
  }
}

export function clearAllHighlightsFromDOM(): void {
  try {
    const highlights = document.querySelectorAll(`.${HIGHLIGHT_SPAN_CLASS}`);
    highlights.forEach(highlight => {
      const parent = highlight.parentNode;
      if (parent) {
        while (highlight.firstChild) {
          parent.insertBefore(highlight.firstChild, highlight);
        }
        parent.removeChild(highlight as ChildNode);
      }
    });
    
    // 合并相邻的文本节点
    document.normalize();
  } catch (error) {
    console.error('Failed to clear all highlights from DOM:', error);
  }
}

export function getSelectionRange(): {
  startOffset: number;
  endOffset: number;
  startContainer: string;
  endContainer: string;
} | null {
  try {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
      return null;
    }
    
    const range = selection.getRangeAt(0);
    const startContainer = getNodePath(range.startContainer);
    const endContainer = getNodePath(range.endContainer);
    
    return {
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      startContainer,
      endContainer
    };
  } catch (error) {
    console.error('Failed to get selection range:', error);
    return null;
  }
}

export function createHighlightContainer(): HTMLElement {
  let container = document.getElementById(HIGHLIGHT_CONTAINER_ID);
  if (!container) {
    container = document.createElement('div');
    container.id = HIGHLIGHT_CONTAINER_ID;
    document.body.appendChild(container);
  }
  return container;
}

function getTextNodes(element: Node): Text[] {
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );
  
  let node;
  while (node = walker.nextNode()) {
    if (node.textContent && node.textContent.trim()) {
      textNodes.push(node as Text);
    }
  }
  
  return textNodes;
}

function isRangeInHighlight(range: Range): boolean {
  const startContainer = range.startContainer;
  const endContainer = range.endContainer;
  
  // 检查选择范围是否在高亮元素内
  let node: Node | null = startContainer;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.classList && element.classList.contains(HIGHLIGHT_SPAN_CLASS)) {
        return true;
      }
    }
    node = node.parentNode;
  }
  
  node = endContainer;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.classList && element.classList.contains(HIGHLIGHT_SPAN_CLASS)) {
        return true;
      }
    }
    node = node.parentNode;
  }
  
  return false;
}

function getNodePath(node: Node): string {
  const path: number[] = [];
  let current: Node | null = node;
  
  while (current && current !== document.body) {
    const parentNode: Node | null = current.parentNode;
    if (parentNode) {
      const index = Array.from(parentNode.childNodes).indexOf(current as ChildNode);
      path.unshift(index);
    }
    current = parentNode;
  }
  
  return JSON.stringify(path);
}

function addHighlightClickListener(highlightSpan: HTMLElement) {
  highlightSpan.addEventListener('click', (event) => {
    event.stopPropagation();
    
    const highlightId = highlightSpan.dataset.highlightId;
    if (highlightId) {
      // 暂时使用控制台输出，稍后在 manager 中实现 showContentManager 方法
      console.log('Show content manager for highlight:', highlightId);
    }
  });
}

/**
 * 在文档中创建高亮视觉效果
 */
export function createHighlightInDOM(highlight: Highlight): void {
  const range = createRangeFromStoredData(highlight.range);
  if (!range) return;

  // 为高亮创建 Shadow DOM 容器
  const shadowData = shadowStyleManager.createShadowHost(`highlight-${highlight.id}`);
  
  // 注入高亮样式
  injectHighlightStyles(shadowData.shadowRoot, highlight.color);

  // 使用原生 Range API 包装内容
  try {
    const span = document.createElement('span');
    span.className = 'effikit-highlight-wrapper';
    span.setAttribute('data-highlight-id', highlight.id);
    span.setAttribute('data-color', highlight.color);
    
    // 将 Shadow DOM host 插入到 span 中
    span.appendChild(shadowData.host);
    
    // 在 Shadow DOM 中创建高亮背景
    const highlightBg = document.createElement('div');
    highlightBg.className = `highlight-bg color-${highlight.color}`;
    shadowData.shadowRoot.appendChild(highlightBg);
    
    // 包装选中的内容
    range.surroundContents(span);
    
    // 添加点击事件监听器
    span.addEventListener('click', (event) => {
      event.stopPropagation();
      // 暂时使用控制台输出，稍后在 manager 中实现 showContentManager 方法
      console.log('Show content manager for highlight:', highlight.id);
    });
    
    // 确保高亮背景覆盖整个文本区域
    updateHighlightPosition(span, highlightBg);
    
  } catch (error) {
    console.warn('Failed to create highlight in DOM:', error);
    shadowStyleManager.destroyShadowHost(`highlight-${highlight.id}`);
  }
}

/**
 * 更新高亮背景位置以覆盖文本
 */
function updateHighlightPosition(wrapper: HTMLElement, highlightBg: HTMLElement): void {
  const rect = wrapper.getBoundingClientRect();
  const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
  const scrollY = window.pageYOffset || document.documentElement.scrollTop;
  
  // 设置高亮背景的位置和大小
  Object.assign(highlightBg.style, {
    position: 'absolute',
    left: `${rect.left + scrollX}px`,
    top: `${rect.top + scrollY}px`,
    width: `${rect.width}px`,
    height: `${rect.height}px`,
    pointerEvents: 'none',
    zIndex: '-1'
  });
}

/**
 * 向 Shadow DOM 注入高亮样式
 */
function injectHighlightStyles(shadowRoot: ShadowRoot, color: HighlightColor): void {
  const style = document.createElement('style');
  
  style.textContent = `
    :host {
      position: relative;
      display: contents;
    }
    
    .highlight-bg {
      border-radius: 2px;
      transition: opacity 0.2s ease;
      opacity: 0.3;
    }
    
    .highlight-bg:hover {
      opacity: 0.5;
    }
    
    .highlight-bg.color-yellow {
      background-color: #ffd700;
    }
    
    .highlight-bg.color-red {
      background-color: #ff6b6b;
    }
    
    .highlight-bg.color-blue {
      background-color: #4dabf7;
    }
    
    .highlight-bg.color-green {
      background-color: #51cf66;
    }
    
    .highlight-bg.color-purple {
      background-color: #9775fa;
    }
    
    .highlight-bg.color-orange {
      background-color: #ff922b;
    }
  `;
  
  shadowRoot.appendChild(style);
}

/**
 * 从存储的数据重建 Range 对象
 */
function createRangeFromStoredData(rangeData: any): Range | null {
  try {
    const range = document.createRange();
    
    // 查找起始和结束节点
    const startNode = findTextNode(rangeData.startContainer);
    const endNode = findTextNode(rangeData.endContainer);
    
    if (!startNode || !endNode) {
      return null;
    }
    
    range.setStart(startNode, rangeData.startOffset);
    range.setEnd(endNode, rangeData.endOffset);
    
    return range;
  } catch (error) {
    console.warn('Failed to recreate range:', error);
    return null;
  }
}

/**
 * 根据路径查找文本节点
 */
function findTextNode(path: number[]): Node | null {
  let node: Node = document.body;
  
  for (const index of path) {
    if (node.childNodes[index]) {
      node = node.childNodes[index];
    } else {
      return null;
    }
  }
  
  return node.nodeType === Node.TEXT_NODE ? node : null;
}

/**
 * 移除文档中的高亮效果
 */
export function removeHighlightFromDOM(highlightId: string): void {
  const highlightElement = document.querySelector(`[data-highlight-id="${highlightId}"]`);
  if (highlightElement) {
    // 获取高亮元素的文本内容
    const textContent = highlightElement.textContent || '';
    
    // 创建文本节点替换高亮元素
    const textNode = document.createTextNode(textContent);
    highlightElement.parentNode?.replaceChild(textNode, highlightElement);
    
    // 清理 Shadow DOM
    shadowStyleManager.destroyShadowHost(`highlight-${highlightId}`);
    
    // 合并相邻的文本节点
    if (textNode.parentNode) {
      textNode.parentNode.normalize();
    }
  }
}

/**
 * 更新文档中高亮的颜色
 */
export function updateHighlightColor(highlightId: string, newColor: HighlightColor): void {
  const highlightElement = document.querySelector(`[data-highlight-id="${highlightId}"]`) as HTMLElement;
  if (highlightElement) {
    highlightElement.setAttribute('data-color', newColor);
    
    // 更新 Shadow DOM 中的样式
    const shadowHost = highlightElement.querySelector('[id^="effikit-shadow-highlight-"]') as HTMLElement;
    if (shadowHost?.shadowRoot) {
      const highlightBg = shadowHost.shadowRoot.querySelector('.highlight-bg');
      if (highlightBg) {
        // 移除旧颜色类名，添加新颜色类名
        highlightBg.className = `highlight-bg color-${newColor}`;
      }
    }
  }
}

/**
 * 检查指定位置是否已存在高亮
 */
export function hasHighlightAt(range: Range): boolean {
  const container = range.commonAncestorContainer;
  const walker = document.createTreeWalker(
    container,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        return (node as Element).hasAttribute('data-highlight-id') 
          ? NodeFilter.FILTER_ACCEPT 
          : NodeFilter.FILTER_SKIP;
      }
    }
  );

  let node;
  while (node = walker.nextNode()) {
    const element = node as Element;
    const highlightRange = createRangeFromStoredData(
      JSON.parse(element.getAttribute('data-range') || '{}')
    );
    
    if (highlightRange && range.intersectsNode(element)) {
      return true;
    }
  }
  
  return false;
} 