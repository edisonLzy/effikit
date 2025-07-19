import React from 'react';
import { createRoot } from 'react-dom/client';
import type { Root } from 'react-dom/client';

/**
 * ReactCustomElement 基类
 * 提供 React 组件在 Custom Element 中的通用容器功能
 * 包括 Shadow DOM 管理、样式隔离和生命周期管理
 */
export abstract class ReactCustomElement extends HTMLElement {
  private reactRoot: Root | null = null;
  private container: HTMLElement | null = null;
  private styleSheet: CSSStyleSheet | null = null;

  constructor() {
    super();
    // 创建 Shadow DOM
    this.attachShadow({ mode: 'open' });
    
    // 初始化样式
    this.initializeStyles();
  }

  /**
   * 元素连接到 DOM 时调用
   */
  connectedCallback() {
    this.mount();
  }

  /**
   * 元素从 DOM 断开时调用
   */
  disconnectedCallback() {
    this.unmount();
  }

  /**
   * 属性变化时调用
   */
  protected attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null) {
    if (oldValue !== newValue) {
      this.onAttributeChanged(name, oldValue, newValue);
      this.updateComponent();
    }
  }

  /**
   * 子类需要实现：创建 React 组件
   */
  protected abstract createReactComponent(): React.ReactElement;

  /**
   * 子类需要实现：创建样式表
   */
  protected abstract createStyleSheet(): CSSStyleSheet;

  /**
   * 子类可以重写：处理属性变化
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected onAttributeChanged(_name: string, _oldValue: string | null, _newValue: string | null): void {
    // 默认实现为空，子类可以重写
  }

  /**
   * 初始化样式系统
   */
  private initializeStyles(): void {
    try {
      this.styleSheet = this.createStyleSheet();
      if (this.styleSheet && this.shadowRoot) {
        this.shadowRoot.adoptedStyleSheets = [this.styleSheet];
      }
    } catch (error) {
      console.warn('Failed to create stylesheet, falling back to style element:', error);
      this.fallbackToStyleElement();
    }
  }

  /**
   * 降级到 style 元素（兼容性处理）
   */
  private fallbackToStyleElement(): void {
    if (!this.shadowRoot) return;
    
    const styleElement = document.createElement('style');
    try {
      const sheet = this.createStyleSheet();
      if (sheet) {
        // 从 CSSStyleSheet 中提取规则
        const rules = Array.from(sheet.cssRules).map(rule => rule.cssText).join('\n');
        styleElement.textContent = rules;
      }
    } catch (error) {
      console.warn('Failed to extract CSS rules, using empty styles:', error);
      styleElement.textContent = '';
    }
    this.shadowRoot.appendChild(styleElement);
  }

  /**
   * 挂载 React 组件
   */
  private mount(): void {
    if (this.reactRoot || !this.shadowRoot) {
      return; // 已经挂载或 shadowRoot 不存在
    }

    // 创建容器
    this.container = document.createElement('div');
    this.container.style.cssText = `
      width: 100%;
      height: 100%;
      display: contents;
    `;
    this.shadowRoot.appendChild(this.container);

    // 创建 React 根节点
    this.reactRoot = createRoot(this.container);
    this.renderComponent();
  }

  /**
   * 卸载 React 组件
   */
  private unmount(): void {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }

    if (this.container) {
      this.container.remove();
      this.container = null;
    }
  }

  /**
   * 渲染 React 组件
   */
  private renderComponent(): void {
    if (!this.reactRoot) {
      return;
    }

    try {
      const component = this.createReactComponent();
      this.reactRoot.render(component);
    } catch (error) {
      console.error('Failed to render React component:', error);
      // 渲染错误组件
      this.reactRoot.render(
        React.createElement('div', {
          style: {
            padding: '8px',
            background: '#fee',
            border: '1px solid #fcc',
            borderRadius: '4px',
            color: '#c33',
            fontSize: '12px'
          }
        }, 'Component Error: ' + (error as Error).message)
      );
    }
  }

  /**
   * 更新组件（当属性变化时调用）
   */
  protected updateComponent(): void {
    if (this.reactRoot) {
      this.renderComponent();
    }
  }

  /**
   * 发送自定义事件
   */
  protected dispatchCustomEvent<T = any>(eventName: string, detail?: T, options?: CustomEventInit): void {
    const event = new CustomEvent(eventName, {
      detail,
      bubbles: true,
      cancelable: true,
      ...options
    });
    this.dispatchEvent(event);
  }

  /**
   * 获取属性值并解析为 JSON（如果可能）
   */
  protected getAttributeAsJson<T = any>(name: string, defaultValue?: T): T | undefined {
    const value = this.getAttribute(name);
    if (!value) {
      return defaultValue;
    }

    try {
      return JSON.parse(value) as T;
    } catch (error) {
      console.warn(`Failed to parse attribute '${name}' as JSON:`, error);
      return defaultValue;
    }
  }

  /**
   * 设置属性值（自动序列化对象）
   */
  protected setAttributeAsJson(name: string, value: any): void {
    if (value === null || value === undefined) {
      this.removeAttribute(name);
    } else if (typeof value === 'string') {
      this.setAttribute(name, value);
    } else {
      try {
        this.setAttribute(name, JSON.stringify(value));
      } catch (error) {
        console.warn(`Failed to serialize attribute '${name}':`, error);
      }
    }
  }
}

/**
 * 工具函数：注册 Custom Element
 */
export function defineCustomElement(tagName: string, elementClass: CustomElementConstructor): void {
  if (typeof customElements !== 'undefined' && customElements && !customElements.get(tagName)) {
    customElements.define(tagName, elementClass);
  }
}