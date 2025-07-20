import { HighlightElement } from './ui/HighlightElement';
import { HighlightToolbarElement } from './ui/HighlightToolbar';
import type { Highlight, HighlightTag, TextRange } from './types';

/**
 * 获取选区内的所有文本节点
 */
function getTextNodesFromRange(range: Range): Text[] {
  const textNodes: Text[] = [];
  
  // 拆分首尾文本节点，确保选区边界与节点边界对齐
  // 若选区首节点为文本节点，调用 splitText 拆分
  if (range.startContainer.nodeType === Node.TEXT_NODE && range.startOffset > 0) {
    const startTextNode = range.startContainer as Text;
    const newNode = startTextNode.splitText(range.startOffset);
    range.setStart(newNode, 0);
  }
  
  if (range.endContainer.nodeType === Node.TEXT_NODE && range.endOffset < range.endContainer.textContent!.length) {
    const endTextNode = range.endContainer as Text;
    endTextNode.splitText(range.endOffset);
  }
  
  // 收集选区内所有完整的文本节点
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode: (node: Node) => {
        // 只接受落在选区内的文本节点
        if (range.intersectsNode(node)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    }
  );
  
  // 将首节点加入文本列表（如果是文本节点）
  if (range.startContainer.nodeType === Node.TEXT_NODE) {
    textNodes.push(range.startContainer as Text);
  }
  
  // 遍历中间的文本节点
  let currentNode = walker.nextNode();
  while (currentNode) {
    // 避免重复添加首尾节点
    if (currentNode !== range.startContainer && currentNode !== range.endContainer) {
      textNodes.push(currentNode as Text);
    }
    currentNode = walker.nextNode();
  }
  
  // 将尾节点加入文本列表（如果是文本节点且不同于首节点）
  if (range.endContainer.nodeType === Node.TEXT_NODE && range.endContainer !== range.startContainer) {
    textNodes.push(range.endContainer as Text);
  }
  
  return textNodes;
}

/**
 * 获取选区内已有的高亮信息
 */
function getExistingHighlightsTagsInRange(range: Range): HighlightTag[] {
  const existingTags = new Set<HighlightTag>();
  
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        if (node.nodeName === 'EFFIKIT-HIGHLIGHT' && range.intersectsNode(node)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    }
  );
  
  while (walker.nextNode()) {
    const highlightElement = walker.currentNode as HTMLElement;
    const highlightData = highlightElement.getAttribute('data-highlight-data');
    if (highlightData) {
      try {
        const highlight = JSON.parse(highlightData) as Highlight;
        if (highlight.tags) {
          highlight.tags.forEach((tag: HighlightTag) => existingTags.add(tag));
        }
      } catch (error) {
        console.warn('Failed to parse highlight data:', error);
      }
    }
  }
  
  return Array.from(existingTags);
}

/**
 * 移除选区内的所有高亮
 */
function removeHighlightsInRange(range: Range): void {
  const highlightElements: HTMLElement[] = [];
  
  const walker = document.createTreeWalker(
    range.commonAncestorContainer,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: (node) => {
        if (node.nodeName === 'EFFIKIT-HIGHLIGHT' && range.intersectsNode(node)) {
          return NodeFilter.FILTER_ACCEPT;
        }
        return NodeFilter.FILTER_REJECT;
      }
    }
  );
  
  while (walker.nextNode()) {
    highlightElements.push(walker.currentNode as HTMLElement);
  }
  
  // 移除所有找到的高亮元素
  highlightElements.forEach(element => {
    const parent = element.parentNode;
    if (parent) {
      // 将高亮元素的子节点移动到父节点
      while (element.firstChild) {
        parent.insertBefore(element.firstChild, element);
      }
      parent.removeChild(element);
    }
  });
  
  // 合并相邻的文本节点
  range.commonAncestorContainer.normalize();
}

/**
 * 应用高亮到选中的文本
 */
export function applyHighlight(selection: Selection, highlight: Highlight): boolean {
  try {
    if (selection.rangeCount === 0) {
      return false;
    }

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      return false;
    }

    // 1. 首先检查 selection 中是否已经包括已有的highlight
    const existingHighlightsTags = getExistingHighlightsTagsInRange(range);
    
    // 合并标签和颜色 - 复用已有的tags和color
    const mergedTags = [...new Set([...highlight.tags, ...existingHighlightsTags])] as HighlightTag[];
    
    // 创建新的高亮数据
    const newHighlight: Highlight = {
      ...highlight,
      tags: mergedTags,
    };
    
    // 移除 selection下已有所有highlight
    removeHighlightsInRange(range);
    
    // 2. 获取 selection下所有的文本节点
    const textNodes = getTextNodesFromRange(range);
    
    if (textNodes.length === 0) {
      return false;
    }
    
    // 3. 创建highlightElement 包裹 textNode
    textNodes.forEach(textNode => {
      if (textNode.textContent && textNode.textContent.trim()) {
        // 创建高亮元素
        const highlightElement = HighlightElement.create(newHighlight.id, newHighlight.color);
        
        // 将文本节点包裹在高亮元素中
        const parent = textNode.parentNode;
        if (parent) {
          parent.insertBefore(highlightElement, textNode);
          highlightElement.appendChild(textNode);
        }
      }
    });

    // 清除选择
    selection.removeAllRanges();

    return true;
  } catch (error) {
    console.error('Failed to apply highlight:', error);
    return false;
  }
}

/**
 * 移除高亮
 */
export function removeHighlight(highlightId: string): boolean {
  try {
    const highlightElement = document.querySelector(`effikit-highlight[data-highlight-id="${highlightId}"]`);
    if (!highlightElement) {
      return false;
    }

    // 获取高亮元素的内容
    const parent = highlightElement.parentNode;
    if (!parent) {
      return false;
    }

    // 将高亮元素的子节点移动到父节点
    while (highlightElement.firstChild) {
      parent.insertBefore(highlightElement.firstChild, highlightElement);
    }

    // 移除高亮元素
    parent.removeChild(highlightElement as ChildNode);

    // 合并相邻的文本节点
    parent.normalize();

    return true;
  } catch (error) {
    console.error('Failed to remove highlight:', error);
    return false;
  }
}

/**
 * 从选择范围创建TextRange对象
 */
export function createTextRangeFromSelection(selection: Selection): TextRange | null {
  try {
    if (selection.rangeCount === 0) {
      return null;
    }

    const range = selection.getRangeAt(0);
    if (range.collapsed) {
      return null;
    }

    // 计算文本偏移量
    const startOffset = getTextOffset(range.startContainer, range.startOffset);
    const endOffset = getTextOffset(range.endContainer, range.endOffset);

    return {
      startOffset,
      endOffset,
      startContainer: getNodePath(range.startContainer),
      endContainer: getNodePath(range.endContainer)
    };
  } catch (error) {
    console.error('Failed to create text range from selection:', error);
    return null;
  }
}

/**
 * 恢复页面上的所有高亮
 */
export function restoreHighlights(highlights: Highlight[]): void {
  try {
    // 清除现有的高亮
    clearAllHighlights();

    // 按照创建时间排序，确保恢复顺序正确
    const sortedHighlights = highlights.sort((a, b) => a.timestamp - b.timestamp);

    for (const highlight of sortedHighlights) {
      restoreHighlight(highlight);
    }
  } catch (error) {
    console.error('Failed to restore highlights:', error);
  }
}

/**
 * 恢复单个高亮
 */
function restoreHighlight(highlight: Highlight): boolean {
  try {
    // 使用简单的文本匹配来恢复高亮
    const walker = document.createTreeWalker(
      document.body,
      NodeFilter.SHOW_TEXT,
      {
        acceptNode: (node) => {
          // 跳过已经在高亮元素内的文本节点
          if (isInsideHighlight(node)) {
            return NodeFilter.FILTER_REJECT;
          }
          return NodeFilter.FILTER_ACCEPT;
        }
      }
    );

    const targetText = highlight.text;
    
    while (walker.nextNode()) {
      const node = walker.currentNode;
      const nodeText = node.textContent || '';

      // 检查是否包含目标文本
      const textIndex = nodeText.indexOf(targetText);
      if (textIndex !== -1) {
        // 创建范围
        const range = document.createRange();
        range.setStart(node, textIndex);
        range.setEnd(node, textIndex + targetText.length);

        // 创建临时选择
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(range);
          
          // 应用高亮
          const success = applyHighlight(selection, highlight);
          if (success) {
            return true;
          }
        }
      }

      // 移除未使用的变量注释
    }

    return false;
  } catch (error) {
    console.error('Failed to restore highlight:', error);
    return false;
  }
}

/**
 * 清除页面上的所有高亮
 */
export function clearAllHighlights(): void {
  try {
    const highlightElements = document.querySelectorAll('effikit-highlight');
    highlightElements.forEach(element => {
      const highlightId = element.getAttribute('data-highlight-id');
      if (highlightId) {
        removeHighlight(highlightId);
      }
    });
  } catch (error) {
    console.error('Failed to clear all highlights:', error);
  }
}

/**
 * 检查节点是否在高亮元素内
 */
function isInsideHighlight(node: Node | Range): boolean {
  let currentNode: Node | null;
  
  if (node instanceof Range) {
    currentNode = node.commonAncestorContainer;
  } else {
    currentNode = node;
  }

  while (currentNode && currentNode !== document.body) {
    if (currentNode.nodeName === HighlightElement.nodeName) {
      return true;
    }
    currentNode = currentNode.parentNode;
  }
  return false;
}

/**
 * 获取节点的文本偏移量
 */
function getTextOffset(container: Node, offset: number): number {
  let textOffset = 0;
  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    null
  );

  while (walker.nextNode()) {
    const node = walker.currentNode;
    if (node === container) {
      return textOffset + offset;
    }
    textOffset += node.textContent?.length || 0;
  }

  return textOffset;
}

/**
 * 获取节点路径
 */
function getNodePath(node: Node): string {
  const path: string[] = [];
  let current: Node | null = node;

  while (current && current !== document.body) {
    if (current.parentNode) {
      const siblings = Array.from(current.parentNode.childNodes);
      const index = siblings.indexOf(current as ChildNode);
      path.unshift(`${current.nodeName}[${index}]`);
    }
    current = current.parentNode;
  }

  return path.join('/');
}

// 注册自定义元素
export function registerHighlightElements() {
  if (!customElements.get(HighlightElement.tagName)) {
    customElements.define(HighlightElement.tagName, HighlightElement);
  }

  if (!customElements.get(HighlightToolbarElement.tagName)) {
    customElements.define(HighlightToolbarElement.tagName, HighlightToolbarElement);
  }
}
