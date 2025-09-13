import React, { useLayoutEffect } from 'react';
import { useFloating, autoUpdate, offset, flip, shift, useDismiss, useInteractions } from '@floating-ui/react';
import { Highlighter, Trash2 } from 'lucide-react';
import { ReactCustomElement } from './ReactCustomElement';
import type { VirtualElement } from '@floating-ui/react';
import { createLogger } from '@/utils/logger';

const logger = createLogger('HighlightToolbar');

export interface ShowToolbarOptions {
  selection: Selection;
  highlightId?: string;
}

export interface HighlightToolbarElementAttributes {
  open: boolean;
  stringifiedRect: string;
  highlightId?: string;
}

interface HighlightToolbarProps {
  attributes: HighlightToolbarElementAttributes;
}

// Tags area removed for simplified implementation

function ToolbarActions({ highlightId }: { highlightId?: string }) {
  const handleHighlight = () => {
    const customEvent = new CustomEvent('effikit-highlight-create');
    document.dispatchEvent(customEvent);
  };

  const handleRemoveHighlight = () => {
    const customEvent = new CustomEvent('effikit-highlight-remove');
    document.dispatchEvent(customEvent);
  };

  return (
    <div className="toolbar-actions">
      {highlightId ? (
        <button
          className="remove-highlight-btn"
          data-action="remove-highlight"
          onClick={handleRemoveHighlight}
          title="取消高亮"
        >
          <Trash2 size={14} />
        </button>
      ) : (
        <button
          className="highlight-btn"
          data-action="highlight"
          onClick={handleHighlight}
          title="高亮文本"
        >
          <Highlighter size={14} />
        </button>
      )}
    </div>
  );
}

function HighlightToolbar(props: HighlightToolbarProps) {
  const { attributes } = props;

  const { open, stringifiedRect, highlightId } = attributes;

  const { refs, floatingStyles, context } = useFloating({
    placement: 'top-start',
    strategy: 'fixed',
    middleware: [
      offset(4),
      flip(),
      shift({ padding: 8 })
    ],
    whileElementsMounted: autoUpdate,
  });

  const dismiss = useDismiss(context);
  const { getFloatingProps } = useInteractions([
    dismiss,
  ]);

  useLayoutEffect(() => {

    if(!open){
      return;
    }

    if (!stringifiedRect) {
      return;
    }

    try {
      const parsedRect:DOMRect = JSON.parse(stringifiedRect);
      const { left, top, right, bottom } = parsedRect;
      
      // Note: 使用 strategy: 'fixed' 时，坐标相对于视口
      // range.getClientRects() 已经返回相对于视口的坐标，不需要再加滚动偏移
      const virtualElement: VirtualElement = {
        getBoundingClientRect() {
          return {
            left,
            top,
            right,
            bottom,
            height: bottom - top,
            width: right - left,
            x: left,
            y: top
          };
        }
      };

      logger.info('the reference virtualElement', virtualElement);
      
      refs.setReference(virtualElement);
    } catch (error) {
      logger.error('Failed to parse reference', error);
    }
  }, [stringifiedRect, open]);

  if (!open) {
    return null;
  }

  return <div
    ref={refs.setFloating}
    style={floatingStyles}
    {...getFloatingProps()}
  >
    <ToolbarActions highlightId={highlightId} />
  </div>;
}

// 创建自定义元素类
export class HighlightToolbarElement extends ReactCustomElement {

  static singleton: HighlightToolbarElement | null = null;

  static tagName = 'effikit-highlight-toolbar';

  static get observedAttributes() {
    return ['open', 'stringifiedRect', 'highlightId'];
  }

  static getInstance() {
    if (!HighlightToolbarElement.singleton) {
      HighlightToolbarElement.singleton = new HighlightToolbarElement();
      document.body.appendChild(HighlightToolbarElement.singleton);
    }
    return HighlightToolbarElement.singleton;
  }

  protected createReactComponent(): React.ReactElement {
    const open = this.getAttribute('open') === 'true';
    const stringifiedRect = this.getAttribute('stringifiedRect') || '';
    const highlightId = this.getAttribute('highlightId') || undefined;

    return React.createElement(HighlightToolbar, {
      attributes: {
        open,
        stringifiedRect,
        highlightId
      }
    });
  }

  protected createStyleSheet(): CSSStyleSheet {
    const sheet = new CSSStyleSheet();
    sheet.replaceSync(`
      :host {
        position: fixed;
        z-index: 10000;
        pointer-events: auto;
      }
      
      @keyframes effikit-toolbar-fadein {
        from {
          opacity: 0;
          transform: translateY(-4px) scale(0.95);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
      
      .effikit-highlight-toolbar {
        background: linear-gradient(135deg, #ffffff 0%, #fafbfc 100%);
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 10px;
        box-shadow: 
          0 2px 8px rgba(0, 0, 0, 0.06),
          0 4px 24px rgba(0, 0, 0, 0.08),
          0 0 0 1px rgba(255, 255, 255, 0.8) inset;
        padding: 4px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        animation: effikit-toolbar-fadein 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        backdrop-filter: blur(12px);
      }
      
      .toolbar-actions {
        display: flex;
        gap: 4px;
        align-items: center;
        justify-content: center;
      }
      
      .toolbar-actions button {
        padding: 6px 8px;
        border: 1px solid rgba(0, 0, 0, 0.08);
        border-radius: 6px;
        background: rgba(255, 255, 255, 0.95);
        cursor: pointer;
        font-size: 12px;
        font-weight: 500;
        transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 32px;
        min-height: 32px;
        color: #374151;
        position: relative;
        overflow: hidden;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
      }
      
      .toolbar-actions button::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: linear-gradient(135deg, rgba(255, 255, 255, 0.5) 0%, rgba(255, 255, 255, 0.1) 100%);
        opacity: 0;
        transition: opacity 0.2s ease;
      }
      
      .toolbar-actions button:hover:not(:disabled) {
        background: rgba(255, 255, 255, 0.95);
        transform: translateY(-1px);
        box-shadow: 
          0 4px 12px rgba(0, 0, 0, 0.08),
          0 2px 4px rgba(0, 0, 0, 0.04);
      }
      
      .toolbar-actions button:hover:not(:disabled)::before {
        opacity: 1;
      }
      
      .toolbar-actions button:active:not(:disabled) {
        transform: translateY(0);
        box-shadow: 
          0 2px 6px rgba(0, 0, 0, 0.06),
          0 1px 2px rgba(0, 0, 0, 0.04);
      }
      
      .toolbar-actions button:disabled {
        opacity: 0.4;
        cursor: not-allowed;
        transform: none;
      }
      
      .highlight-btn {
        color: #10b981;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(16, 185, 129, 0.08) 100%);
        border-color: rgba(16, 185, 129, 0.2);
        box-shadow: 
          0 1px 2px rgba(16, 185, 129, 0.1),
          0 0 0 1px rgba(16, 185, 129, 0.05) inset;
      }
      
      .highlight-btn:hover:not(:disabled) {
        color: #059669;
        background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(16, 185, 129, 0.12) 100%);
        border-color: rgba(16, 185, 129, 0.3);
        box-shadow: 
          0 4px 12px rgba(16, 185, 129, 0.15),
          0 2px 4px rgba(16, 185, 129, 0.08),
          0 0 0 1px rgba(16, 185, 129, 0.1) inset;
      }
      
      .remove-highlight-btn {
        color: #ef4444;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(239, 68, 68, 0.08) 100%);
        border-color: rgba(239, 68, 68, 0.2);
        box-shadow: 
          0 1px 2px rgba(239, 68, 68, 0.1),
          0 0 0 1px rgba(239, 68, 68, 0.05) inset;
      }
      
      .remove-highlight-btn:hover:not(:disabled) {
        color: #dc2626;
        background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(239, 68, 68, 0.12) 100%);
        border-color: rgba(239, 68, 68, 0.3);
        box-shadow: 
          0 4px 12px rgba(239, 68, 68, 0.15),
          0 2px 4px rgba(239, 68, 68, 0.08),
          0 0 0 1px rgba(239, 68, 68, 0.1) inset;
      }
      
      /* 添加图标样式优化 */
      .toolbar-actions button svg {
        transition: transform 0.2s ease;
      }
      
      .toolbar-actions button:hover:not(:disabled) svg {
        transform: scale(1.1);
      }
    `);
    return sheet;
  }

  // 公共方法
  showToolbar(options: ShowToolbarOptions) {
    const { selection, highlightId } = options;

    if (selection.rangeCount === 0) {
      return;
    }

    const range = selection.getRangeAt(0);
    const rect = range.getClientRects();
    const firstRect = rect[0];

    this.updateToolbar({
      open: true,
      stringifiedRect: JSON.stringify(firstRect.toJSON()),
      highlightId
    });
  }

  hideToolbar() {
    this.updateToolbar({
      open: false
    });
  }

  updateToolbar(attributes: Partial<HighlightToolbarElementAttributes>) {
    if (attributes.open !== undefined) {
      this.setAttribute('open', attributes.open.toString());
    }
    if (attributes.stringifiedRect !== undefined) {
      this.setAttribute('stringifiedRect', attributes.stringifiedRect.toString());
    }
    // 处理 highlightId：如果为 undefined 或 null，则移除属性
    if ('highlightId' in attributes) {
      if (attributes.highlightId) {
        this.setAttribute('highlightId', attributes.highlightId.toString());
      } else {
        this.removeAttribute('highlightId');
      }
    }
  }

  disconnectedCallback(): void {
    //
    super.disconnectedCallback();
    //
    HighlightToolbarElement.singleton = null;
  }
}

export { HighlightToolbar };