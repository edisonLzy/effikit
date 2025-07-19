import React from 'react';
import { ReactCustomElement } from './ReactCustomElement';
import { HighlightPopover, popoverStyles } from './components/HighlightPopover';
import { highlightManager } from './HighlightManager';
import type { PopoverPosition } from './components/HighlightPopover';
import type { HighlightColor } from '../types';

/**
 * 高亮弹出框 Custom Element
 * 用于在页面中渲染高亮弹出框
 */
export class HighlightPopoverElement extends ReactCustomElement {
  private _visible = false;
  private _position: PopoverPosition = { x: 0, y: 0 };
  private _highlightId = '';
  private _color: HighlightColor = 'yellow';
  private _text = '';
  private _metadata: Record<string, any> | undefined;

  static get observedAttributes(): string[] {
    return [
      'visible',
      'position',
      'highlight-id',
      'color',
      'text',
      'metadata'
    ];
  }

  constructor() {
    super();
    this.style.position = 'fixed';
    this.style.pointerEvents = 'none';
    this.style.zIndex = '10000';
  }

  /**
   * 创建 React 组件
   */
  protected createReactComponent(): React.ReactElement {
    return React.createElement(HighlightPopover, {
      visible: this._visible,
      position: this._position,
      highlightId: this._highlightId,
      color: this._color,
      text: this._text,
      metadata: this._metadata,
      onClose: this.handleClose.bind(this),
      onDelete: this.handleDelete.bind(this),
      onColorChange: this.handleColorChange.bind(this),
      onEdit: this.handleEdit.bind(this),
      customActions: this.getCustomActions()
    });
  }

  /**
   * 创建样式表
   */
  protected createStyleSheet(): CSSStyleSheet {
    const styleSheet = new CSSStyleSheet();
    const styles = `
      :host {
        position: fixed;
        pointer-events: none;
        z-index: 10000;
      }
      
      :host([visible="true"]) {
        pointer-events: auto;
      }
      
      ${popoverStyles}
    `;
    styleSheet.replaceSync(styles);
    return styleSheet;
  }

  /**
   * 属性变化处理
   */
  protected attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    super.attributeChangedCallback(name, oldValue, newValue);

    switch (name) {
      case 'visible':
        this._visible = newValue === 'true';
        this.style.pointerEvents = this._visible ? 'auto' : 'none';
        break;
      
      case 'position':
        if (newValue) {
          try {
            this._position = JSON.parse(newValue);
          } catch (error) {
            console.warn('Failed to parse position:', error);
          }
        }
        break;
      
      case 'highlight-id':
        this._highlightId = newValue || '';
        break;
      
      case 'color':
        this._color = (newValue as HighlightColor) || 'yellow';
        break;
      
      case 'text':
        this._text = newValue || '';
        break;
      
      case 'metadata':
        if (newValue) {
          try {
            this._metadata = JSON.parse(newValue);
          } catch (error) {
            console.warn('Failed to parse metadata:', error);
            this._metadata = undefined;
          }
        } else {
          this._metadata = undefined;
        }
        break;
    }
  }

  /**
   * 显示弹出框
   */
  show(params: {
    position: PopoverPosition;
    highlightId: string;
    color: HighlightColor;
    text: string;
    metadata?: Record<string, any>;
  }): void {
    this.setAttribute('visible', 'true');
    this.setAttribute('position', JSON.stringify(params.position));
    this.setAttribute('highlight-id', params.highlightId);
    this.setAttribute('color', params.color);
    this.setAttribute('text', params.text);
    
    if (params.metadata) {
      this.setAttribute('metadata', JSON.stringify(params.metadata));
    } else {
      this.removeAttribute('metadata');
    }

    // 分发显示事件
    this.dispatchEvent(new CustomEvent('popover-show', {
      detail: params,
      bubbles: true
    }));
  }

  /**
   * 隐藏弹出框
   */
  hide(): void {
    this.setAttribute('visible', 'false');
    
    // 分发隐藏事件
    this.dispatchEvent(new CustomEvent('popover-hide', {
      bubbles: true
    }));
  }

  /**
   * 更新位置
   */
  updatePosition(position: PopoverPosition): void {
    this.setAttribute('position', JSON.stringify(position));
  }

  /**
   * 显示颜色选择器
   */
  showColorPicker(params: {
    position: PopoverPosition;
    highlightId: string;
    color: HighlightColor;
    text: string;
    metadata?: Record<string, any>;
  }): void {
    this.show(params);
  }

  /**
   * 处理关闭事件
   */
  private handleClose(): void {
    this.hide();
  }

  /**
   * 处理删除事件
   */
  private handleDelete(id: string): void {
    // 通过 HighlightManager 删除高亮
    const success = highlightManager.deleteHighlight(id);
    
    if (success) {
      this.hide();
      
      // 分发删除事件
      this.dispatchEvent(new CustomEvent('highlight-delete', {
        detail: { id },
        bubbles: true
      }));
    }
  }

  /**
   * 处理颜色变化事件
   */
  private handleColorChange(id: string, color: HighlightColor): void {
    // 通过 HighlightManager 更新颜色
    const success = highlightManager.updateHighlight(id, { color });
    
    if (success) {
      this.setAttribute('color', color);
      
      // 分发颜色变化事件
      this.dispatchEvent(new CustomEvent('highlight-color-change', {
        detail: { id, color },
        bubbles: true
      }));
    }
  }

  /**
   * 处理编辑事件
   */
  private handleEdit(id: string): void {
    // 分发编辑事件
    this.dispatchEvent(new CustomEvent('highlight-edit', {
      detail: { id },
      bubbles: true
    }));
  }

  /**
   * 获取自定义操作
   */
  private getCustomActions(): Array<{
    label: string;
    icon?: string;
    onClick: (id: string) => void;
  }> {
    // 可以通过属性或方法配置自定义操作
    const customActionsAttr = this.getAttribute('custom-actions');
    if (customActionsAttr) {
      try {
        const actions = JSON.parse(customActionsAttr);
        return actions.map((action: any) => ({
          ...action,
          onClick: (id: string) => {
            this.dispatchEvent(new CustomEvent('custom-action', {
              detail: { id, action: action.label },
              bubbles: true
            }));
          }
        }));
      } catch (error) {
        console.warn('Failed to parse custom actions:', error);
      }
    }
    
    return [];
  }

  /**
   * 设置自定义操作
   */
  setCustomActions(actions: Array<{
    label: string;
    icon?: string;
    handler: (id: string) => void;
  }>): void {
    const serializedActions = actions.map(({ label, icon }) => ({ label, icon }));
    this.setAttribute('custom-actions', JSON.stringify(serializedActions));
    
    // 存储处理函数
    (this as any)._customActionHandlers = actions.reduce((handlers, action) => {
      handlers[action.label] = action.handler;
      return handlers;
    }, {} as Record<string, (id: string) => void>);
  }

  /**
   * 获取弹出框状态
   */
  getState(): {
    visible: boolean;
    position: PopoverPosition;
    highlightId: string;
    color: HighlightColor;
    text: string;
    metadata?: Record<string, any>;
  } {
    return {
      visible: this._visible,
      position: this._position,
      highlightId: this._highlightId,
      color: this._color,
      text: this._text,
      metadata: this._metadata
    };
  }

  /**
   * 检查是否可见
   */
  isVisible(): boolean {
    return this._visible;
  }

  /**
   * 获取关联的高亮ID
   */
  getHighlightId(): string {
    return this._highlightId;
  }

  /**
   * 连接到 DOM 时的处理
   */
  connectedCallback(): void {
    super.connectedCallback();
    
    // 监听自定义操作事件
    this.addEventListener('custom-action', (event: any) => {
      const { id, action } = event.detail;
      const handlers = (this as any)._customActionHandlers;
      
      if (handlers && handlers[action]) {
        handlers[action](id);
      }
    });
  }

  /**
   * 从 DOM 断开时的处理
   */
  disconnectedCallback(): void {
    super.disconnectedCallback();
    
    // 清理自定义操作处理函数
    delete (this as any)._customActionHandlers;
  }
}

// 注册 Custom Element
if (typeof customElements !== 'undefined' && customElements && !customElements.get('effikit-highlight-popover')) {
  customElements.define('effikit-highlight-popover', HighlightPopoverElement);
}

// 导出类型
export type { PopoverPosition };