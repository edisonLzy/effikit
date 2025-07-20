import React, { useLayoutEffect } from 'react';
import { useFloating, autoUpdate, offset, flip, shift, useDismiss, useInteractions } from '@floating-ui/react';
import { ReactCustomElement } from './ReactCustomElement';
import type { VirtualElement } from '@floating-ui/react';
import { createLogger } from '@/lib/logger';

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
  onHighlight?: () => void;
  onColorChange?: (color: string) => void;
  onDelete?: () => void;
  attributes: HighlightToolbarElementAttributes;
}

function TagsArea() {
  return (
    <div className="tags-area">
      <div className="tags-placeholder">标签区域（待实现）</div>
    </div>
  );
}

interface ToolbarActionsProps {
  onHighlight: () => void;
  onColorChange: (color: string) => void;
  onDelete: () => void;
  highlightId?: string;
}

function ToolbarActions(props: ToolbarActionsProps) {

  const { onColorChange, onDelete, highlightId } = props;

  const isHighlighted = highlightId !== undefined;

  const handleHighlight = () => {
    const customEvent = new CustomEvent('effikit-highlight-create');
    document.dispatchEvent(customEvent);
  };

  return (
    <div className="toolbar-actions">
      <button
        className="highlight-btn"
        data-action="highlight"
        onClick={handleHighlight}
      >
        高亮
      </button>

      {isHighlighted && (
        <button
          className="color-btn"
          data-action="color"
          onClick={() => onColorChange('#ffeb3b')}
        >
          颜色
        </button>
      )}
      <button
        className="delete-btn"
        data-action="delete"
        onClick={onDelete}
      >
        删除
      </button>
    </div>
  );
}

function HighlightToolbar(props: HighlightToolbarProps) {
  const {
    onHighlight = () => { },
    onColorChange = () => { },
    onDelete = () => { },
    attributes
  } = props;

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
      const virtualElement: VirtualElement = {
        getBoundingClientRect() {
          return {
            left,
            top,
            right,
            bottom,
            height: bottom - top,
            width: 0,
            x: left,
            y: bottom - top
          };
        }
      };

      logger.info('the reference virtualElement', virtualElement);
      
      refs.setReference(virtualElement);
    } catch (error) {
      logger.error('Failed to parse reference', error);
    }
  }, [stringifiedRect, open]);

  // 处理按钮点击事件
  const handleHighlight = () => {
    onHighlight();
  };

  const handleColorChange = () => {
    onColorChange('#fff3cd');
  };

  const handleDelete = () => {
    onDelete();
  };

  if (!open) {
    return null;
  }

  return <div
    ref={refs.setFloating}
    style={floatingStyles}
    {...getFloatingProps()}
  >
    {highlightId && <TagsArea />}
    <ToolbarActions
      onHighlight={handleHighlight}
      onColorChange={handleColorChange}
      onDelete={handleDelete}
      highlightId={highlightId}
    />
  </div>;
}

// 创建自定义元素类
export class HighlightToolbarElement extends ReactCustomElement {

  static singleton: HighlightToolbarElement | null = null;

  static tagName = 'effikit-highlight-toolbar';

  static get observedAttributes() {
    return ['open', 'stringifiedRect', 'highlight-id'];
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
    const highlightId = this.getAttribute('highlight-id') || undefined;

    return React.createElement(HighlightToolbar, {
      attributes: {
        open,
        stringifiedRect,
        highlightId
      },
      onHighlight: () => {
        this.dispatchCustomEvent('highlight');
      },
      onColorChange: (color: string) => {
        this.dispatchCustomEvent('color-change', { color });
      },
      onDelete: () => {
        this.dispatchCustomEvent('delete');
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
          transform: translateY(-8px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
      
      .effikit-highlight-toolbar {
        background-color: white;
        border: 1px solid #e1e5e9;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        padding: 8px;
        min-width: 200px;
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        font-size: 14px;
        animation: effikit-toolbar-fadein 0.2s ease-out;
      }
      
      .tags-area {
        padding: 4px 0;
        border-bottom: 1px solid #f0f0f0;
        margin-bottom: 8px;
      }
      
      .tags-placeholder {
        color: #999;
        font-size: 12px;
        text-align: center;
      }
      
      .toolbar-actions {
        display: flex;
        gap: 8px;
        justify-content: center;
      }
      
      .toolbar-actions button {
        padding: 6px 12px;
        border: 1px solid #d1d5db;
        border-radius: 4px;
        background: white;
        cursor: pointer;
        font-size: 12px;
        transition: all 0.2s ease;
      }
      
      .toolbar-actions button:hover:not(:disabled) {
        background: #f9fafb;
        border-color: #9ca3af;
      }
      
      .toolbar-actions button:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .highlight-btn {
        color: #059669;
        border-color: #059669;
      }
      
      .color-btn {
        color: #7c3aed;
        border-color: #7c3aed;
      }
      
      .delete-btn {
        color: #dc2626;
        border-color: #dc2626;
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
    if (attributes.highlightId !== undefined) {
      if (attributes.highlightId) {
        this.setAttribute('highlight-id', attributes.highlightId);
      } else {
        this.removeAttribute('highlight-id');
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