import type { HighlightColor } from './types';

interface ShadowHostData {
  host: HTMLElement;
  shadowRoot: ShadowRoot;
  styleSheet: CSSStyleSheet;
}

/**
 * Shadow DOM 样式管理器
 * 使用 CSSStyleSheet API 统一管理所有样式，实现完全的样式隔离
 */
class ShadowStyleManager {
  private shadowHosts: Map<string, ShadowHostData> = new Map();
  private baseStyleSheet: CSSStyleSheet | null = null;
  private highlightStyleSheet: CSSStyleSheet | null = null;
  private popoverStyleSheet: CSSStyleSheet | null = null;

  constructor() {
    this.initializeStyleSheets();
  }

  /**
   * 初始化全局样式表
   */
  private initializeStyleSheets(): void {
    // 检查浏览器是否支持 CSSStyleSheet 构造函数和 replace 方法
    try {
      if (typeof CSSStyleSheet !== 'undefined' && 'replace' in CSSStyleSheet.prototype) {
        this.baseStyleSheet = new CSSStyleSheet();
        this.highlightStyleSheet = new CSSStyleSheet();
        this.popoverStyleSheet = new CSSStyleSheet();

        // 初始化基础样式
        this.baseStyleSheet.replace(this.getBaseStyles());
        // 初始化高亮样式
        this.highlightStyleSheet.replace(this.getHighlightStyles());
        // 初始化弹出框样式
        this.popoverStyleSheet.replace(this.getPopoverStyles());
      }
    } catch (error) {
      console.warn('CSSStyleSheet constructor not supported, will use fallback styles');
    }
  }

  /**
   * 创建 Shadow DOM host 并应用样式
   */
  createShadowHost(id: string, type: 'highlight' | 'popover' = 'popover'): ShadowHostData {
    // 清理可能存在的旧实例
    this.destroyShadowHost(id);

    // 创建 Shadow DOM host
    const host = document.createElement('div');
    host.id = `effikit-shadow-${id}`;
    host.style.cssText = 'position: fixed; height: 100%; z-index: 2147483647;';
    
    // 为 highlight 类型设置特殊样式
    if (type === 'highlight') {
      host.style.cssText = 'position: relative; display: contents;';
    }

    // 创建 Shadow Root
    const shadowRoot = host.attachShadow({ mode: 'open' });

    // 创建并应用样式表
    const styleSheet = this.createStyleSheetForType(type);
    
    // 根据浏览器支持情况应用样式
    if (this.baseStyleSheet && shadowRoot.adoptedStyleSheets !== undefined) {
      // 使用现代 adoptedStyleSheets API
      shadowRoot.adoptedStyleSheets = [styleSheet];
    } else {
      // 降级到传统 <style> 标签
      this.injectLegacyStyles(shadowRoot, type);
    }

    // 将 host 添加到页面
    document.body.appendChild(host);

    const shadowData: ShadowHostData = {
      host,
      shadowRoot,
      styleSheet
    };

    this.shadowHosts.set(id, shadowData);
    return shadowData;
  }

  /**
   * 销毁 Shadow DOM host
   */
  destroyShadowHost(id: string): void {
    const shadowData = this.shadowHosts.get(id);
    if (shadowData) {
      shadowData.host.remove();
      this.shadowHosts.delete(id);
    }
  }

  /**
   * 更新高亮颜色样式
   */
  updateHighlightColor(id: string, color: HighlightColor): void {
    const shadowData = this.shadowHosts.get(id);
    if (shadowData && this.highlightStyleSheet) {
      // 动态更新样式表
      const colorRule = this.getHighlightColorRule(color);
      try {
        shadowData.styleSheet.insertRule(colorRule);
      } catch (error) {
        // 如果规则已存在，先删除再添加
        console.warn('Style rule already exists, updating...');
      }
    }
  }

  /**
   * 根据类型创建样式表
   */
  private createStyleSheetForType(type: 'highlight' | 'popover'): CSSStyleSheet {
    const styleSheet = new CSSStyleSheet();
    
    let styles = this.getBaseStyles();
    
    if (type === 'highlight') {
      styles += '\n' + this.getHighlightStyles();
    } else {
      styles += '\n' + this.getPopoverStyles();
    }

    styleSheet.replace(styles);
    return styleSheet;
  }

  /**
   * 为不支持 adoptedStyleSheets 的浏览器注入传统样式
   */
  private injectLegacyStyles(shadowRoot: ShadowRoot, type: 'highlight' | 'popover'): void {
    const style = document.createElement('style');
    
    let styles = this.getBaseStyles();
    
    if (type === 'highlight') {
      styles += '\n' + this.getHighlightStyles();
    } else {
      styles += '\n' + this.getPopoverStyles();
    }
    
    style.textContent = styles;
    shadowRoot.appendChild(style);
  }

  /**
   * 获取基础样式
   */
  private getBaseStyles(): string {
    return `
      /* CSS Reset for Shadow DOM */
      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
      }
      
      /* Host styles */
      :host {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 
                     'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        line-height: 1.5;
        color: #333;
        --shadow-color: rgba(0, 0, 0, 0.1);
        --border-color: #e1e5e9;
        --primary-color: #007bff;
        --success-color: #28a745;
        --warning-color: #ffc107;
        --danger-color: #dc3545;
        --bg-color: #ffffff;
        --text-color: #333333;
        --text-muted: #666666;
        --text-light: #999999;
      }
      
      /* Basic element styles */
      button {
        cursor: pointer;
        border: none;
        background: none;
        font-family: inherit;
        font-size: inherit;
        transition: all 0.2s ease;
      }
      
      button:hover {
        opacity: 0.8;
      }
      
      input, textarea {
        font-family: inherit;
        font-size: inherit;
        border: 1px solid var(--border-color);
        border-radius: 4px;
        padding: 8px;
        background: var(--bg-color);
        color: var(--text-color);
      }
      
      input:focus, textarea:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
      }
      
      /* Scrollbar styles */
      ::-webkit-scrollbar {
        width: 6px;
      }
      
      ::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 3px;
      }
      
      ::-webkit-scrollbar-thumb {
        background: #c1c1c1;
        border-radius: 3px;
      }
      
      ::-webkit-scrollbar-thumb:hover {
        background: #a8a8a8;
      }
    `;
  }

  /**
   * 获取高亮相关样式
   */
  private getHighlightStyles(): string {
    return `
      /* Highlight container */
      :host {
        position: relative;
        display: contents;
      }
      
      /* Highlight background */
      .highlight-bg {
        border-radius: 2px;
        transition: opacity 0.2s ease;
        opacity: 0.3;
        pointer-events: none;
        position: absolute;
        z-index: -1;
      }
      
      .highlight-bg:hover {
        opacity: 0.5;
      }
      
      /* Color variations */
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
  }

  /**
   * 获取弹出框相关样式
   */
  private getPopoverStyles(): string {
    return `
      /* Popover base styles */
      .popover {
        background: var(--bg-color);
        border: 1px solid var(--border-color);
        border-radius: 8px;
        box-shadow: 0 4px 12px var(--shadow-color);
        z-index: 10000;
        max-width: 400px;
        overflow: hidden;
      }
      
      /* Color popover specific styles */
      .color-popover {
        padding: 12px;
        display: flex;
        flex-direction: column;
        gap: 12px;
        min-width: 200px;
      }
      
      .color-popover-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 8px;
      }
      
      .selected-text {
        font-size: 12px;
        color: var(--text-muted);
        max-width: 150px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        flex: 1;
      }
      
      .close-button {
        font-size: 18px;
        color: var(--text-light);
        padding: 0 4px;
        line-height: 1;
      }
      
      .close-button:hover {
        color: var(--text-muted);
      }
      
      .color-buttons {
        display: flex;
        gap: 8px;
        justify-content: center;
      }
      
      .color-button {
        width: 28px;
        height: 28px;
        border-radius: 50%;
        border: 2px solid var(--bg-color);
        box-shadow: 0 0 0 1px var(--shadow-color);
        opacity: 0.8;
        transition: all 0.2s ease;
      }
      
      .color-button:hover {
        opacity: 1;
        transform: scale(1.1);
        box-shadow: 0 0 0 2px rgba(0,0,0,0.2);
      }
      
      .color-button.yellow { background-color: #ffd700; }
      .color-button.red { background-color: #ff6b6b; }
      .color-button.blue { background-color: #4dabf7; }
      .color-button.green { background-color: #51cf66; }
      .color-button.purple { background-color: #9775fa; }
      .color-button.orange { background-color: #ff922b; }
      
      /* Content popover specific styles */
      .content-popover {
        width: 320px;
        max-height: 400px;
        display: flex;
        flex-direction: column;
      }
      
      .content-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px;
        border-bottom: 1px solid var(--border-color);
      }
      
      .content-title {
        font-size: 12px;
        color: var(--text-muted);
        max-width: 220px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      }
      
      .tabs-container {
        display: flex;
        border-bottom: 1px solid var(--border-color);
        padding: 0 8px;
        background: #f8f9fa;
      }
      
      .tab-button {
        padding: 8px 12px;
        font-size: 14px;
        border-bottom: 2px solid transparent;
        color: var(--text-muted);
        transition: all 0.2s ease;
      }
      
      .tab-button.active {
        border-bottom-color: var(--primary-color);
        color: var(--primary-color);
        font-weight: 500;
      }
      
      .tab-button:hover {
        color: var(--primary-color);
        background: rgba(0, 123, 255, 0.05);
      }
      
      .add-tab-button {
        padding: 8px;
        font-size: 16px;
        color: var(--text-light);
        margin-left: auto;
      }
      
      .add-tab-button:hover {
        color: var(--primary-color);
      }
      
      .content-body {
        padding: 12px;
        flex: 1;
        overflow-y: auto;
      }
      
      .no-tags {
        text-align: center;
        color: var(--text-light);
        font-style: italic;
      }
      
      .annotation-editor {
        width: 100%;
        min-height: 100px;
        resize: vertical;
      }
      
      .word-viewer {
        line-height: 1.6;
      }
      
      .word-phonetic {
        font-size: 16px;
        color: var(--text-color);
        margin-bottom: 4px;
      }
      
      .word-pos {
        font-size: 12px;
        color: var(--text-muted);
        font-style: italic;
        margin-bottom: 8px;
      }
      
      .word-definitions {
        padding-left: 20px;
        margin: 0;
      }
      
      .word-definitions li {
        margin-bottom: 4px;
        font-size: 14px;
      }
      
      .sentence-viewer {
        text-align: center;
        color: var(--text-light);
        font-style: italic;
      }
    `;
  }

  /**
   * 获取特定颜色的高亮规则
   */
  private getHighlightColorRule(color: HighlightColor): string {
    const colorMap = {
      yellow: '#ffd700',
      red: '#ff6b6b',
      blue: '#4dabf7',
      green: '#51cf66',
      purple: '#9775fa',
      orange: '#ff922b'
    };

    return `.highlight-bg.color-${color} { background-color: ${colorMap[color]}; }`;
  }

  /**
   * 获取所有活动的 Shadow DOM 实例
   */
  getActiveShadowHosts(): Map<string, ShadowHostData> {
    return new Map(this.shadowHosts);
  }

  /**
   * 清理所有 Shadow DOM 实例
   */
  cleanup(): void {
    this.shadowHosts.forEach((_, id) => {
      this.destroyShadowHost(id);
    });
    this.shadowHosts.clear();
  }
}

// 导出单例
export const shadowStyleManager = new ShadowStyleManager(); 