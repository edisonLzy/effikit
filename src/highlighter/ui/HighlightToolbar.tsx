import React, { useLayoutEffect, useState } from 'react';
import { useFloating, autoUpdate, offset, flip, shift, useDismiss, useInteractions } from '@floating-ui/react';
import { Highlighter, Trash2, FileText, Loader2 } from 'lucide-react';
import { ReactCustomElement } from './ReactCustomElement';
import type { VirtualElement } from '@floating-ui/react';
import { createLogger } from '@/utils/logger';
import { getFeishuWorkflow, DifyService } from '@/services/difyService';

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

// SaveToFeishuButton 独立组件
function SaveToFeishuButton() {
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveToFeishu = async () => {
    if (isLoading) return; // 防止重复点击

    setIsLoading(true);

    try {
      // 获取当前选中的文本
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        logger.warn('No text selection found for saving to Feishu');
        return;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) {
        logger.warn('Selected text is empty');
        return;
      }

      // 获取配置的飞书工作流
      const feishuWorkflow = await getFeishuWorkflow();
      if (!feishuWorkflow) {
        logger.error('No Feishu workflow configured');
        alert('未配置"保存内容到飞书"工作流，请先在配置页面中添加');
        return;
      }

      // 获取当前页面URL
      const currentUrl = window.location.href;

      logger.info('Saving to Feishu:', { text: selectedText, url: currentUrl });

      // 调用 Dify 工作流保存到飞书
      const success = await DifyService.saveToFeishu(feishuWorkflow, selectedText, currentUrl);

      if (success) {
        logger.info('Successfully saved to Feishu');
        // TODO: 可以添加更好的成功提示
      } else {
        logger.error('Failed to save to Feishu');
        alert('保存到飞书失败，请检查工作流配置');
      }
    } catch (error) {
      logger.error('Error saving to Feishu:', error);
      alert(`保存到飞书时发生错误: ${error instanceof Error ? error.message : '未知错误'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <button
      className={`save-to-feishu-btn ${isLoading ? 'loading' : ''}`}
      data-action="save-to-feishu"
      onClick={handleSaveToFeishu}
      disabled={isLoading}
      title={isLoading ? '保存中...' : '保存到飞书'}
    >
      {isLoading ? <Loader2 size={14} className="animate-spin" /> : <FileText size={14} />}
    </button>
  );
}

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
        <>
          <SaveToFeishuButton />
          <button
            className="remove-highlight-btn"
            data-action="remove-highlight"
            onClick={handleRemoveHighlight}
            title="取消高亮"
          >
            <Trash2 size={14} />
          </button>
        </>
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

      .save-to-feishu-btn {
        color: #3b82f6;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.08) 100%);
        border-color: rgba(59, 130, 246, 0.2);
        box-shadow:
          0 1px 2px rgba(59, 130, 246, 0.1),
          0 0 0 1px rgba(59, 130, 246, 0.05) inset;
      }

      .save-to-feishu-btn:hover:not(:disabled) {
        color: #2563eb;
        background: linear-gradient(135deg, rgba(59, 130, 246, 0.2) 0%, rgba(59, 130, 246, 0.12) 100%);
        border-color: rgba(59, 130, 246, 0.3);
        box-shadow:
          0 4px 12px rgba(59, 130, 246, 0.15),
          0 2px 4px rgba(59, 130, 246, 0.08),
          0 0 0 1px rgba(59, 130, 246, 0.1) inset;
      }

      .save-to-feishu-btn.loading {
        opacity: 0.7;
        cursor: wait;
      }

      .save-to-feishu-btn:disabled {
        opacity: 0.6;
        cursor: not-allowed;
        transform: none;
      }

      .save-to-feishu-btn:disabled:hover {
        transform: none;
        box-shadow:
          0 1px 2px rgba(59, 130, 246, 0.1),
          0 0 0 1px rgba(59, 130, 246, 0.05) inset;
      }
      
      /* 添加图标样式优化 */
      .toolbar-actions button svg {
        transition: transform 0.2s ease;
      }

      .toolbar-actions button:hover:not(:disabled) svg {
        transform: scale(1.1);
      }

      /* Loading spinner animation */
      @keyframes spin {
        from {
          transform: rotate(0deg);
        }
        to {
          transform: rotate(360deg);
        }
      }

      .animate-spin {
        animation: spin 1s linear infinite;
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