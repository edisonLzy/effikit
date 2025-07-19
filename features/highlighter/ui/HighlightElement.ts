import React from 'react';
import { ReactCustomElement } from './ReactCustomElement';
import { highlightManager } from './HighlightManager';
import type { HighlightColor } from '../types';

/**
 * 高亮内容组件的 Props
 */
interface HighlightContentProps {
  highlightId: string;
  color: HighlightColor;
  text: string;
  metadata?: Record<string, any>;
  onClick?: (id: string, event: MouseEvent) => void;
  onHover?: (id: string, event: MouseEvent) => void;
}

/**
 * React 高亮内容组件
 */
const HighlightContent: React.FC<HighlightContentProps> = ({
  highlightId,
  color,
  text,
  onClick,
  onHover
}) => {
  const handleClick = (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    // 触发事件总线事件
    highlightManager.getEventBus().emit('highlight:clicked', {
      id: highlightId,
      position: { x: event.clientX, y: event.clientY }
    });
    
    // 调用外部回调
    if (onClick) {
      onClick(highlightId, event.nativeEvent);
    }
  };

  const handleMouseEnter = (event: React.MouseEvent) => {
    // 触发事件总线事件
    highlightManager.getEventBus().emit('highlight:hovered', {
      id: highlightId,
      position: { x: event.clientX, y: event.clientY }
    });
    
    // 调用外部回调
    if (onHover) {
      onHover(highlightId, event.nativeEvent);
    }
  };

  return React.createElement(
    'span',
    {
      className: `effikit-highlight effikit-highlight--${color}`,
      'data-highlight-id': highlightId,
      'data-highlight-color': color,
      onClick: handleClick,
      onMouseEnter: handleMouseEnter,
      style: {
        cursor: 'pointer',
        userSelect: 'none'
      }
    },
    text
  );
};

/**
 * 高亮内容 Custom Element
 * 用于在页面中渲染高亮标记
 */
export class HighlightContentElement extends ReactCustomElement {
  static get observedAttributes(): string[] {
    return ['highlight-id', 'color', 'metadata'];
  }

  /**
   * 创建 React 组件
   */
  protected createReactComponent(): React.ReactElement {
    const highlightId = this.getAttribute('highlight-id') || '';
    const color = (this.getAttribute('color') as HighlightColor) || 'yellow';
    const text = this.textContent || '';
    const metadataStr = this.getAttribute('metadata');
    
    let metadata: Record<string, any> | undefined;
    if (metadataStr) {
      try {
        metadata = JSON.parse(metadataStr);
      } catch (error) {
        console.warn('Failed to parse metadata:', error);
      }
    }

    return React.createElement(HighlightContent, {
      highlightId,
      color,
      text,
      metadata,
      onClick: this.handleClick.bind(this),
      onHover: this.handleHover.bind(this)
    });
  }

  /**
   * 创建样式表
   */
  protected createStyleSheet(): CSSStyleSheet {
    const styleSheet = new CSSStyleSheet();
    const styles = `
      :host {
        display: inline;
        position: relative;
      }
      
      .effikit-highlight {
        display: inline;
        position: relative;
        border-radius: 2px;
        padding: 1px 2px;
        margin: 0;
        transition: all 0.2s ease;
        font-weight: inherit;
        font-size: inherit;
        line-height: inherit;
        text-decoration: none;
      }
      
      .effikit-highlight:hover {
        filter: brightness(0.9);
        transform: scale(1.02);
      }
      
      /* 高亮颜色样式 */
      .effikit-highlight--yellow {
        background-color: rgba(255, 255, 0, 0.3);
        border: 1px solid rgba(255, 255, 0, 0.5);
      }
      
      .effikit-highlight--green {
        background-color: rgba(0, 255, 0, 0.3);
        border: 1px solid rgba(0, 255, 0, 0.5);
      }
      
      .effikit-highlight--blue {
        background-color: rgba(0, 0, 255, 0.3);
        border: 1px solid rgba(0, 0, 255, 0.5);
      }
      
      .effikit-highlight--red {
        background-color: rgba(255, 0, 0, 0.3);
        border: 1px solid rgba(255, 0, 0, 0.5);
      }
      
      .effikit-highlight--purple {
        background-color: rgba(128, 0, 128, 0.3);
        border: 1px solid rgba(128, 0, 128, 0.5);
      }
      
      .effikit-highlight--orange {
        background-color: rgba(255, 165, 0, 0.3);
        border: 1px solid rgba(255, 165, 0, 0.5);
      }
      
      .effikit-highlight--pink {
        background-color: rgba(255, 192, 203, 0.3);
        border: 1px solid rgba(255, 192, 203, 0.5);
      }
      
      .effikit-highlight--gray {
        background-color: rgba(128, 128, 128, 0.3);
        border: 1px solid rgba(128, 128, 128, 0.5);
      }
      
      /* 选中状态 */
      .effikit-highlight--selected {
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.5);
      }
      
      /* 禁用状态 */
      .effikit-highlight--disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
      
      .effikit-highlight--disabled:hover {
        filter: none;
        transform: none;
      }
    `;
    styleSheet.replaceSync(styles);
    return styleSheet;
  }

  /**
   * 处理点击事件
   */
  private handleClick(id: string, event: MouseEvent): void {
    // 分发自定义事件
    this.dispatchEvent(new CustomEvent('highlight-click', {
      detail: {
        id,
        color: this.getAttribute('color'),
        text: this.textContent,
        metadata: this.getMetadata(),
        position: { x: event.clientX, y: event.clientY }
      },
      bubbles: true,
      cancelable: true
    }));
  }

  /**
   * 处理悬停事件
   */
  private handleHover(id: string, event: MouseEvent): void {
    // 分发自定义事件
    this.dispatchEvent(new CustomEvent('highlight-hover', {
      detail: {
        id,
        color: this.getAttribute('color'),
        text: this.textContent,
        metadata: this.getMetadata(),
        position: { x: event.clientX, y: event.clientY }
      },
      bubbles: true,
      cancelable: true
    }));
  }

  /**
   * 获取元数据
   */
  private getMetadata(): Record<string, any> | undefined {
    const metadataStr = this.getAttribute('metadata');
    if (metadataStr) {
      try {
        return JSON.parse(metadataStr);
      } catch (error) {
        console.warn('Failed to parse metadata:', error);
      }
    }
    return undefined;
  }

  /**
   * 设置选中状态
   */
  setSelected(selected: boolean): void {
    const element = this.shadowRoot?.querySelector('.effikit-highlight');
    if (element) {
      if (selected) {
        element.classList.add('effikit-highlight--selected');
      } else {
        element.classList.remove('effikit-highlight--selected');
      }
    }
  }

  /**
   * 设置禁用状态
   */
  setDisabled(disabled: boolean): void {
    const element = this.shadowRoot?.querySelector('.effikit-highlight');
    if (element) {
      if (disabled) {
        element.classList.add('effikit-highlight--disabled');
      } else {
        element.classList.remove('effikit-highlight--disabled');
      }
    }
  }

  /**
   * 获取高亮信息
   */
  getHighlightInfo(): {
    id: string;
    color: HighlightColor;
    text: string;
    metadata?: Record<string, any>;
  } {
    return {
      id: this.getAttribute('highlight-id') || '',
      color: (this.getAttribute('color') as HighlightColor) || 'yellow',
      text: this.textContent || '',
      metadata: this.getMetadata()
    };
  }

  /**
   * 更新高亮颜色
   */
  updateColor(color: HighlightColor): void {
    this.setAttribute('color', color);
  }

  /**
   * 更新元数据
   */
  updateMetadata(metadata: Record<string, any>): void {
    this.setAttribute('metadata', JSON.stringify(metadata));
  }
}

// 注册 Custom Element
if (typeof customElements !== 'undefined' && customElements && !customElements.get('effikit-highlight-content')) {
  customElements.define('effikit-highlight-content', HighlightContentElement);
}

// 导出类型
export type { HighlightContentProps };