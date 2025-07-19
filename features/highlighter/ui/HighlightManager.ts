import { TypedEventBus, type HighlightEvents } from './EventBus';
import type { HighlightColor } from '../types';

/**
 * 高亮管理器配置
 */
export interface HighlightManagerConfig {
  /** 是否启用调试模式 */
  debug?: boolean;
  /** 事件总线实例 */
  eventBus?: TypedEventBus<HighlightEvents>;
}

/**
 * 高亮元素信息
 */
export interface HighlightElementInfo {
  /** 元素ID */
  id: string;
  /** 高亮颜色 */
  color: HighlightColor;
  /** 高亮文本 */
  text: string;
  /** 元素位置信息 */
  rect: DOMRect;
  /** 关联的 Custom Element */
  element: HTMLElement;
}

/**
 * 高亮管理器
 * 负责协调 React 组件和 Custom Element 的交互
 * 管理高亮元素的生命周期和状态同步
 */
export class HighlightManager {
  private eventBus: TypedEventBus<HighlightEvents>;
  private highlights = new Map<string, HighlightElementInfo>();
  private debug: boolean;
  private isEnabled = true;

  constructor(config: HighlightManagerConfig = {}) {
    this.debug = config.debug ?? false;
    this.eventBus = config.eventBus ?? new TypedEventBus<HighlightEvents>();
    
    this.initializeEventListeners();
    this.loadEnabledState();
    this.log('HighlightManager initialized');
  }

  /**
   * 初始化事件监听器
   */
  private initializeEventListeners(): void {
    // 监听高亮创建事件
    this.eventBus.on('highlight:created', (data) => {
      this.handleHighlightCreated(data);
    });

    // 监听高亮删除事件
    this.eventBus.on('highlight:deleted', (data) => {
      this.handleHighlightDeleted(data.id);
    });

    // 监听高亮更新事件
    this.eventBus.on('highlight:updated', (data) => {
      this.handleHighlightUpdated(data);
    });

    // 监听高亮点击事件
    this.eventBus.on('highlight:clicked', (data) => {
      this.handleHighlightClicked(data);
    });

    // 监听高亮悬停事件
    this.eventBus.on('highlight:hovered', (data) => {
      this.handleHighlightHovered(data);
    });
  }

  /**
   * 创建高亮元素
   */
  createHighlight(params: {
    id: string;
    text: string;
    color: HighlightColor;
    range: Range;
    metadata?: Record<string, any>;
  }): HighlightElementInfo | null {
    try {
      const { id, text, color, range, metadata } = params;
      
      // 检查是否已存在
      if (this.highlights.has(id)) {
        this.log(`Highlight ${id} already exists`);
        return this.highlights.get(id)!;
      }

      // 创建 Custom Element
      const element = this.createHighlightElement({
        id,
        text,
        color,
        metadata
      });

      if (!element) {
        this.log(`Failed to create highlight element for ${id}`);
        return null;
      }

      // 替换选中的文本
      try {
        range.deleteContents();
        range.insertNode(element);
      } catch (error) {
        this.log(`Failed to insert highlight element: ${error}`);
        return null;
      }

      // 获取元素位置信息
      const rect = element.getBoundingClientRect();

      // 创建高亮信息
      const highlightInfo: HighlightElementInfo = {
        id,
        color,
        text,
        rect,
        element
      };

      // 存储高亮信息
      this.highlights.set(id, highlightInfo);

      // 触发创建事件
      this.eventBus.emit('highlight:created', {
        id,
        text,
        color,
        metadata
      });

      this.log(`Highlight created: ${id}`);
      return highlightInfo;
    } catch (error) {
      this.log(`Error creating highlight: ${error}`);
      return null;
    }
  }

  /**
   * 删除高亮元素
   */
  deleteHighlight(id: string): boolean {
    try {
      const highlight = this.highlights.get(id);
      if (!highlight) {
        this.log(`Highlight ${id} not found`);
        return false;
      }

      // 移除 DOM 元素
      const parent = highlight.element.parentNode;
      if (parent) {
        // 将高亮元素替换为纯文本
        const textNode = document.createTextNode(highlight.text);
        parent.replaceChild(textNode, highlight.element);
      }

      // 从管理器中移除
      this.highlights.delete(id);

      // 触发删除事件
      this.eventBus.emit('highlight:deleted', { id });

      this.log(`Highlight deleted: ${id}`);
      return true;
    } catch (error) {
      this.log(`Error deleting highlight: ${error}`);
      return false;
    }
  }

  /**
   * 更新高亮元素
   */
  updateHighlight(id: string, updates: Partial<{
    color: HighlightColor;
    metadata: Record<string, any>;
  }>): boolean {
    try {
      const highlight = this.highlights.get(id);
      if (!highlight) {
        this.log(`Highlight ${id} not found`);
        return false;
      }

      // 更新颜色
      if (updates.color && updates.color !== highlight.color) {
        highlight.color = updates.color;
        highlight.element.setAttribute('color', updates.color);
      }

      // 更新元数据
      if (updates.metadata) {
        highlight.element.setAttribute('metadata', JSON.stringify(updates.metadata));
      }

      // 触发更新事件
      this.eventBus.emit('highlight:updated', {
        id,
        color: highlight.color,
        text: highlight.text,
        metadata: updates.metadata
      });

      this.log(`Highlight updated: ${id}`);
      return true;
    } catch (error) {
      this.log(`Error updating highlight: ${error}`);
      return false;
    }
  }

  /**
   * 获取高亮元素信息
   */
  getHighlight(id: string): HighlightElementInfo | undefined {
    return this.highlights.get(id);
  }

  /**
   * 获取所有高亮元素
   */
  getAllHighlights(): HighlightElementInfo[] {
    return Array.from(this.highlights.values());
  }

  /**
   * 清除所有高亮
   */
  clearAllHighlights(): void {
    const ids = Array.from(this.highlights.keys());
    ids.forEach(id => this.deleteHighlight(id));
    this.log('All highlights cleared');
  }

  /**
   * 创建高亮 Custom Element
   */
  private createHighlightElement(params: {
    id: string;
    text: string;
    color: HighlightColor;
    metadata?: Record<string, any>;
  }): HTMLElement | null {
    try {
      const { id, text, color, metadata } = params;
      
      // 创建 effikit-highlight-content 元素
      const element = document.createElement('effikit-highlight-content');
      
      // 设置属性
      element.setAttribute('highlight-id', id);
      element.setAttribute('color', color);
      element.textContent = text;
      
      if (metadata) {
        element.setAttribute('metadata', JSON.stringify(metadata));
      }

      return element;
    } catch (error) {
      this.log(`Error creating highlight element: ${error}`);
      return null;
    }
  }

  /**
   * 处理高亮创建事件
   */
  private handleHighlightCreated(data: HighlightEvents['highlight:created']): void {
    this.log(`Highlight created event: ${data.id}`);
    // 可以在这里添加额外的处理逻辑
  }

  /**
   * 处理高亮删除事件
   */
  private handleHighlightDeleted(id: string): void {
    this.log(`Highlight deleted event: ${id}`);
    // 可以在这里添加额外的处理逻辑
  }

  /**
   * 处理高亮更新事件
   */
  private handleHighlightUpdated(data: HighlightEvents['highlight:updated']): void {
    this.log(`Highlight updated event: ${data.id}`);
    // 可以在这里添加额外的处理逻辑
  }

  /**
   * 处理高亮点击事件
   */
  private handleHighlightClicked(data: HighlightEvents['highlight:clicked']): void {
    this.log(`Highlight clicked event: ${data.id}`);
    // 可以在这里添加点击处理逻辑，比如显示弹出框
  }

  /**
   * 处理高亮悬停事件
   */
  private handleHighlightHovered(data: HighlightEvents['highlight:hovered']): void {
    this.log(`Highlight hovered event: ${data.id}`);
    // 可以在这里添加悬停处理逻辑
  }

  /**
   * 获取事件总线实例
   */
  getEventBus(): TypedEventBus<HighlightEvents> {
    return this.eventBus;
  }



  /**
   * 销毁管理器
   */
  destroy(): void {
    this.clearAllHighlights();
    this.eventBus.offNamespace('highlight-manager');
    this.log('HighlightManager destroyed');
  }

  /**
   * 检查高亮功能是否启用
   */
  isHighlightEnabled(): boolean {
    return this.isEnabled;
  }

  /**
   * 设置高亮功能启用状态
   */
  async setEnabled(enabled: boolean): Promise<void> {
    try {
      this.isEnabled = enabled;
      
      // 保存到 Chrome 存储
      if (typeof chrome !== 'undefined' && chrome.storage) {
        await chrome.storage.local.set({ highlightEnabled: enabled });
      }
      
      this.log(`Highlight enabled state set to: ${enabled}`);
    } catch (error) {
      this.log(`Error setting enabled state: ${error}`);
    }
  }

  /**
   * 从存储中加载启用状态
   */
  private async loadEnabledState(): Promise<void> {
    try {
      if (typeof chrome !== 'undefined' && chrome.storage) {
        const result = await chrome.storage.local.get(['highlightEnabled']);
        this.isEnabled = result.highlightEnabled !== false; // 默认启用
      }
      this.log(`Loaded enabled state: ${this.isEnabled}`);
    } catch (error) {
      this.log(`Error loading enabled state: ${error}`);
      this.isEnabled = true; // 默认启用
    }
  }

  /**
   * 调试日志
   */
  private log(message: string): void {
    if (this.debug) {
      console.log(`[HighlightManager] ${message}`);
    }
  }
}

// 导出单例实例
export const highlightManager = new HighlightManager({ debug: true });