import type { Highlight, HighlightColor } from './types';
import { getHighlightColorClass } from './utils';

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

export function removeHighlightFromDOM(highlightId: string): boolean {
  try {
    const highlightSpan = document.querySelector(`[data-highlight-id="${highlightId}"]`);
    if (highlightSpan) {
      const parent = highlightSpan.parentNode;
      if (parent) {
        // 将高亮内容移到父节点中，移除高亮包装
        while (highlightSpan.firstChild) {
          parent.insertBefore(highlightSpan.firstChild, highlightSpan);
        }
        parent.removeChild(highlightSpan as ChildNode);
        
        // 合并相邻的文本节点
        parent.normalize();
        return true;
      }
    }
    return false;
  } catch (error) {
    console.error('Failed to remove highlight from DOM:', error);
    return false;
  }
}

export function renderHighlightInDOM(highlight: Highlight): boolean {
  try {
    // 尝试根据文本内容找到对应的位置并高亮
    const textNodes = getTextNodes(document.body);
    const targetText = highlight.text;
    
    for (const node of textNodes) {
      const nodeText = node.textContent || '';
      const index = nodeText.indexOf(targetText);
      
      if (index !== -1) {
        const range = document.createRange();
        range.setStart(node, index);
        range.setEnd(node, index + targetText.length);
        
        const span = document.createElement('span');
        span.className = `${HIGHLIGHT_SPAN_CLASS} ${getHighlightColorClass(highlight.color)}`;
        span.dataset.highlightId = highlight.id;
        span.dataset.highlightColor = highlight.color;
        
        try {
          range.surroundContents(span);
          return true;
        } catch (error) {
          // 如果 surroundContents 失败，使用 extractContents 和 insertNode
          const contents = range.extractContents();
          span.appendChild(contents);
          range.insertNode(span);
          return true;
        }
      }
    }
    
    return false;
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
      if (element.classList.contains(HIGHLIGHT_SPAN_CLASS)) {
        return true;
      }
    }
    node = node.parentNode;
  }
  
  node = endContainer;
  while (node) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as Element;
      if (element.classList.contains(HIGHLIGHT_SPAN_CLASS)) {
        return true;
      }
    }
    node = node.parentNode;
  }
  
  return false;
}

function getNodePath(node: Node): string {
  const path: string[] = [];
  let current: Node | null = node;
  
  while (current && current !== document.body) {
    if (current.nodeType === Node.ELEMENT_NODE) {
      const element = current as Element;
      const tagName = element.tagName.toLowerCase();
      const siblings = Array.from(element.parentNode?.children || []);
      const index = siblings.indexOf(element);
      path.unshift(`${tagName}[${index}]`);
    } else if (current.nodeType === Node.TEXT_NODE) {
      const parent = current.parentNode;
      if (parent) {
        const textNodes = Array.from(parent.childNodes).filter(
          n => n.nodeType === Node.TEXT_NODE
        );
        const index = textNodes.indexOf(current as Text);
        path.unshift(`text[${index}]`);
      }
    }
    current = current.parentNode;
  }
  
  return path.join('/');
} 