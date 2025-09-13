# Highlighter 功能重构方案

## 概述

本文档描述了将 Highlighter 功能重构为 React 组件与 Custom Element 结合的架构方案。该方案旨在实现 UI 和逻辑分离，通过 Custom Element 和 Shadow DOM 避免样式冲突，同时保持 React 组件的开发体验。

## 架构设计

### 核心理念

- **Custom Element 作为容器**：提供 Shadow DOM 隔离和生命周期管理
- **React 组件专注 UI**：保持原有的 React 开发体验和组件逻辑
- **事件驱动通信**：通过自定义事件实现组件间解耦
- **样式完全隔离**：利用 Shadow DOM 避免样式冲突

### 技术栈

- **Web Components**：Custom Element + Shadow DOM
- **React 18**：UI 组件开发
- **TypeScript**：类型安全
- **Constructable Stylesheets**：现代样式管理

## 实现方案

### 1. ReactCustomElement 基类

创建通用的 Custom Element 基类，作为 React 组件的容器：

```typescript
// ui/ReactCustomElement.ts
abstract class ReactCustomElement extends HTMLElement {
  protected shadowRoot: ShadowRoot;
  protected reactRoot: Root | null = null;
  protected styleSheet: CSSStyleSheet;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });
    this.styleSheet = this.createStyleSheet();
    this.applyStyles();
  }

  connectedCallback() {
    this.mount();
  }

  disconnectedCallback() {
    this.unmount();
  }

  protected abstract createReactComponent(): React.ReactElement;
  protected abstract createStyleSheet(): CSSStyleSheet;

  private mount() {
    const container = document.createElement('div');
    this.shadowRoot.appendChild(container);
    this.reactRoot = createRoot(container);
    this.reactRoot.render(this.createReactComponent());
  }

  private unmount() {
    if (this.reactRoot) {
      this.reactRoot.unmount();
      this.reactRoot = null;
    }
  }
}
```

### 2. 具体组件实现

#### HighlightColorPopover Custom Element

```typescript
// ui/HighlightColorPopoverElement.ts
class HighlightColorPopoverElement extends ReactCustomElement {
  private position: PopoverPosition = { x: 0, y: 0 };
  private selectedText: string = '';

  static get observedAttributes() {
    return ['position', 'selected-text'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'position') {
      this.position = JSON.parse(newValue);
    } else if (name === 'selected-text') {
      this.selectedText = newValue;
    }
    this.updateComponent();
  }

  protected createReactComponent(): React.ReactElement {
    return React.createElement(HighlightColorPopover, {
      position: this.position,
      selectedText: this.selectedText,
      onColorSelect: (color: HighlightColor) => {
        this.dispatchEvent(new CustomEvent('color-select', {
          detail: { color },
          bubbles: true
        }));
      },
      onClose: () => {
        this.dispatchEvent(new CustomEvent('close', {
          bubbles: true
        }));
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
      /* 其他样式 */
    `);
    return sheet;
  }

  private updateComponent() {
    if (this.reactRoot) {
      this.reactRoot.render(this.createReactComponent());
    }
  }
}

customElements.define('highlight-color-popover', HighlightColorPopoverElement);
```

#### HighlightContentPopover Custom Element

```typescript
// ui/HighlightContentPopoverElement.ts
class HighlightContentPopoverElement extends ReactCustomElement {
  private highlight: Highlight | null = null;
  private position: PopoverPosition = { x: 0, y: 0 };

  static get observedAttributes() {
    return ['highlight', 'position'];
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'highlight') {
      this.highlight = JSON.parse(newValue);
    } else if (name === 'position') {
      this.position = JSON.parse(newValue);
    }
    this.updateComponent();
  }

  protected createReactComponent(): React.ReactElement {
    if (!this.highlight) return React.createElement('div');

    return React.createElement(HighlightContentPopover, {
      highlight: this.highlight,
      position: this.position,
      onClose: () => {
        this.dispatchEvent(new CustomEvent('close', {
          bubbles: true
        }));
      },
      onUpdate: (updatedHighlight: Highlight) => {
        this.dispatchEvent(new CustomEvent('update', {
          detail: { highlight: updatedHighlight },
          bubbles: true
        }));
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
      /* 内容弹窗样式 */
    `);
    return sheet;
  }
}

customElements.define('highlight-content-popover', HighlightContentPopoverElement);
```

### 3. 更新的 DomRenderer

```typescript
// ui/dom-renderer.ts
class DomRenderer {
  private instances: Map<string, HTMLElement> = new Map();

  renderColorPopover(
    position: PopoverPosition,
    selectedText: string,
    onColorSelect: (color: HighlightColor) => void,
    onClose: () => void
  ): string {
    const id = `color-popover-${Date.now()}`;
    
    // 清理旧实例
    this.unmountAll('color-popover');
    
    // 创建 Custom Element
    const element = document.createElement('highlight-color-popover') as HighlightColorPopoverElement;
    element.id = id;
    element.setAttribute('position', JSON.stringify(position));
    element.setAttribute('selected-text', selectedText);
    
    // 添加事件监听
    element.addEventListener('color-select', (e: CustomEvent) => {
      onColorSelect(e.detail.color);
    });
    
    element.addEventListener('close', () => {
      onClose();
    });
    
    // 添加到页面
    document.body.appendChild(element);
    this.instances.set(id, element);
    
    return id;
  }

  renderContentPopover(
    highlight: Highlight,
    position: PopoverPosition,
    onClose: () => void,
    onUpdate: (highlight: Highlight) => void
  ): string {
    const id = `content-popover-${Date.now()}`;
    
    // 清理旧实例
    this.unmountAll('content-popover');
    
    // 创建 Custom Element
    const element = document.createElement('highlight-content-popover') as HighlightContentPopoverElement;
    element.id = id;
    element.setAttribute('highlight', JSON.stringify(highlight));
    element.setAttribute('position', JSON.stringify(position));
    
    // 添加事件监听
    element.addEventListener('close', () => {
      onClose();
    });
    
    element.addEventListener('update', (e: CustomEvent) => {
      onUpdate(e.detail.highlight);
    });
    
    // 添加到页面
    document.body.appendChild(element);
    this.instances.set(id, element);
    
    return id;
  }

  unmount(id: string): void {
    const element = this.instances.get(id);
    if (element) {
      element.remove();
      this.instances.delete(id);
    }
  }

  unmountAll(type?: string): void {
    const toRemove: string[] = [];
    this.instances.forEach((element, id) => {
      if (!type || id.includes(type)) {
        toRemove.push(id);
      }
    });
    toRemove.forEach(id => this.unmount(id));
  }
}

export const domRenderer = new DomRenderer();
```

### 4. 事件总线系统

```typescript
// events/EventBus.ts
type EventCallback<T = any> = (data: T) => void;

class EventBus {
  private listeners: Map<string, EventCallback[]> = new Map();

  on<T = any>(event: string, callback: EventCallback<T>): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(callback);

    // 返回取消监听的函数
    return () => this.off(event, callback);
  }

  off<T = any>(event: string, callback: EventCallback<T>): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  emit<T = any>(event: string, data?: T): void {
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => callback(data));
    }
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const eventBus = new EventBus();
```

### 5. 更新的 HighlightManager

```typescript
// manager.tsx
export class HighlightManager {
  private isEnabled = true;
  private currentHighlight: Highlight | null = null;

  // 显示颜色选择弹窗
  showColorPopover(selection: Selection, selectedText: string): void {
    if (!this.isEnabled || selection.rangeCount === 0) return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const position = {
      x: rect.left + rect.width / 2,
      y: rect.bottom + window.scrollY + 5
    };

    domRenderer.renderColorPopover(
      position,
      selectedText,
      (color: HighlightColor) => this.handleColorSelect(color, selection),
      () => this.hidePopover()
    );
  }

  // 显示内容编辑弹窗
  showContentPopover(highlight: Highlight, position: PopoverPosition): void {
    if (!this.isEnabled) return;

    domRenderer.renderContentPopover(
      highlight,
      position,
      () => this.hideContentPopover(),
      (updatedHighlight: Highlight) => this.handleHighlightUpdate(updatedHighlight)
    );
  }

  private handleColorSelect(color: HighlightColor, selection: Selection): void {
    // 创建高亮逻辑
    const highlightId = generateHighlightId();
    const range = getSelectionRange(selection);
    
    if (range && wrapSelectionWithHighlight(selection, highlightId, color)) {
      const highlight: Highlight = {
        id: highlightId,
        color,
        range,
        tags: [],
        createdAt: new Date().toISOString(),
        url: normalizeUrl(window.location.href)
      };
      
      saveHighlight(highlight);
      this.hidePopover();
      
      // 发送事件通知
      eventBus.emit('highlight:created', highlight);
    }
  }

  private handleHighlightUpdate(updatedHighlight: Highlight): void {
    this.currentHighlight = updatedHighlight;
    saveHighlight(updatedHighlight);
    eventBus.emit('highlight:updated', updatedHighlight);
  }

  private hidePopover(): void {
    domRenderer.unmountAll('color-popover');
  }

  private hideContentPopover(): void {
    domRenderer.unmountAll('content-popover');
  }
}
```

## 迁移计划

### 阶段 1：基础架构搭建

1. **创建 ReactCustomElement 基类**
   - 实现 Shadow DOM 管理
   - 实现 React 组件挂载/卸载
   - 实现样式隔离机制

2. **重构 DomRenderer**
   - 适配 Custom Element 渲染
   - 简化 API 接口
   - 移除 Shadow DOM 直接操作

### 阶段 2：组件迁移

1. **迁移 HighlightColorPopover**
   - 创建对应的 Custom Element
   - 保持原有 React 组件不变
   - 更新事件处理机制

2. **迁移 HighlightContentPopover**
   - 创建对应的 Custom Element
   - 处理复杂的状态管理
   - 实现数据双向绑定

### 阶段 3：集成和优化

1. **更新 HighlightManager**
   - 适配新的渲染方式
   - 实现事件总线通信
   - 优化性能和内存使用

2. **样式系统优化**
   - 统一 Constructable Stylesheets
   - 优化样式加载性能
   - 确保完全的样式隔离

### 阶段 4：测试和文档

1. **全面测试**
   - 单元测试
   - 集成测试
   - 浏览器兼容性测试

2. **文档完善**
   - API 文档
   - 使用示例
   - 最佳实践指南

## 优势分析

### 技术优势

- **完全样式隔离**：Shadow DOM 确保样式不会泄露或被污染
- **更好的封装性**：Custom Element 提供标准的 Web 组件接口
- **性能优化**：减少 DOM 操作，提高渲染效率
- **类型安全**：TypeScript 提供完整的类型检查

### 开发体验

- **保持 React 优势**：继续使用 React 的组件化开发模式
- **标准化接口**：Custom Element 提供标准的 Web API
- **事件驱动**：清晰的事件通信机制
- **易于测试**：组件职责分离，便于单元测试

### 维护性

- **职责分离**：UI 逻辑与业务逻辑分离
- **可扩展性**：易于添加新的弹窗组件
- **向后兼容**：渐进式迁移，不影响现有功能
- **标准化**：基于 Web 标准，长期稳定

## 注意事项

### 浏览器兼容性

- **Custom Elements**：现代浏览器原生支持
- **Shadow DOM**：需要考虑旧版本浏览器
- **Constructable Stylesheets**：提供降级方案

### 性能考虑

- **内存管理**：及时清理 Custom Element 实例
- **事件监听**：避免内存泄漏
- **样式优化**：合理使用 Constructable Stylesheets

### 开发调试

- **Shadow DOM 调试**：使用 Chrome DevTools 的 Shadow DOM 支持
- **事件追踪**：实现完善的日志系统
- **错误处理**：提供友好的错误提示

## 总结

这个重构方案成功结合了 Web Components 的隔离优势和 React 的开发体验，实现了：

1. **完全的样式隔离**：解决了样式冲突问题
2. **清晰的架构分层**：UI 和逻辑职责分离
3. **良好的开发体验**：保持 React 组件开发模式
4. **高度的可维护性**：标准化的组件接口和事件通信
5. **优秀的扩展性**：易于添加新功能和组件

通过分阶段的迁移计划，可以在不影响现有功能的前提下，逐步完成整个系统的重构，最终实现一个更加健壮、可维护的 Highlighter 功能。