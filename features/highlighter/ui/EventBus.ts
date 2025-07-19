/**
 * 事件回调函数类型
 */
type EventCallback<T = any> = (data: T) => void;

/**
 * 事件监听器信息
 */
interface EventListener<T = any> {
  callback: EventCallback<T>;
  once?: boolean;
  namespace?: string;
}

/**
 * 事件总线类
 * 提供组件间解耦的事件通信机制
 */
export class EventBus {
  private listeners: Map<string, EventListener[]> = new Map();
  private debugMode: boolean = false;

  /**
   * 启用/禁用调试模式
   */
  setDebugMode(enabled: boolean): void {
    this.debugMode = enabled;
  }

  /**
   * 监听事件
   * @param event 事件名称
   * @param callback 回调函数
   * @param options 选项
   * @returns 取消监听的函数
   */
  on<T = any>(
    event: string,
    callback: EventCallback<T>,
    options?: {
      once?: boolean;
      namespace?: string;
    }
  ): () => void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    const listener: EventListener<T> = {
      callback,
      once: options?.once,
      namespace: options?.namespace
    };

    this.listeners.get(event)!.push(listener);

    if (this.debugMode) {
      console.log(`[EventBus] Registered listener for '${event}'${options?.namespace ? ` (namespace: ${options.namespace})` : ''}`);
    }

    // 返回取消监听的函数
    return () => this.off(event, callback, options?.namespace);
  }

  /**
   * 监听事件（仅触发一次）
   * @param event 事件名称
   * @param callback 回调函数
   * @param namespace 命名空间
   * @returns 取消监听的函数
   */
  once<T = any>(
    event: string,
    callback: EventCallback<T>,
    namespace?: string
  ): () => void {
    return this.on(event, callback, { once: true, namespace });
  }

  /**
   * 取消监听事件
   * @param event 事件名称
   * @param callback 回调函数
   * @param namespace 命名空间
   */
  off<T = any>(
    event: string,
    callback: EventCallback<T>,
    namespace?: string
  ): void {
    const listeners = this.listeners.get(event);
    if (!listeners) {
      return;
    }

    const index = listeners.findIndex(
      listener => 
        listener.callback === callback &&
        listener.namespace === namespace
    );

    if (index > -1) {
      listeners.splice(index, 1);
      
      if (this.debugMode) {
        console.log(`[EventBus] Removed listener for '${event}'${namespace ? ` (namespace: ${namespace})` : ''}`);
      }

      // 如果没有监听器了，删除事件
      if (listeners.length === 0) {
        this.listeners.delete(event);
      }
    }
  }

  /**
   * 发送事件
   * @param event 事件名称
   * @param data 事件数据
   */
  emit<T = any>(event: string, data?: T): void {
    const listeners = this.listeners.get(event);
    if (!listeners || listeners.length === 0) {
      if (this.debugMode) {
        console.log(`[EventBus] No listeners for event '${event}'`);
      }
      return;
    }

    if (this.debugMode) {
      console.log(`[EventBus] Emitting event '${event}' to ${listeners.length} listener(s)`, data);
    }

    // 复制监听器数组，避免在回调中修改原数组导致的问题
    const listenersToCall = [...listeners];
    const onceListeners: EventListener[] = [];

    listenersToCall.forEach(listener => {
      try {
        listener.callback(data);
        
        // 收集需要移除的一次性监听器
        if (listener.once) {
          onceListeners.push(listener);
        }
      } catch (error) {
        console.error(`[EventBus] Error in event listener for '${event}':`, error);
      }
    });

    // 移除一次性监听器
    if (onceListeners.length > 0) {
      const remainingListeners = listeners.filter(
        listener => !onceListeners.includes(listener)
      );
      
      if (remainingListeners.length === 0) {
        this.listeners.delete(event);
      } else {
        this.listeners.set(event, remainingListeners);
      }
    }
  }

  /**
   * 移除指定命名空间的所有监听器
   * @param namespace 命名空间
   */
  offNamespace(namespace: string): void {
    let removedCount = 0;
    
    this.listeners.forEach((listeners, event) => {
      const filteredListeners = listeners.filter(
        listener => listener.namespace !== namespace
      );
      
      const removed = listeners.length - filteredListeners.length;
      removedCount += removed;
      
      if (filteredListeners.length === 0) {
        this.listeners.delete(event);
      } else {
        this.listeners.set(event, filteredListeners);
      }
    });

    if (this.debugMode) {
      console.log(`[EventBus] Removed ${removedCount} listener(s) from namespace '${namespace}'`);
    }
  }

  /**
   * 获取事件的监听器数量
   * @param event 事件名称
   * @returns 监听器数量
   */
  listenerCount(event: string): number {
    const listeners = this.listeners.get(event);
    return listeners ? listeners.length : 0;
  }

  /**
   * 获取所有事件名称
   * @returns 事件名称数组
   */
  eventNames(): string[] {
    return Array.from(this.listeners.keys());
  }

  /**
   * 清除所有监听器
   */
  clear(): void {
    const eventCount = this.listeners.size;
    this.listeners.clear();
    
    if (this.debugMode) {
      console.log(`[EventBus] Cleared all listeners (${eventCount} events)`);
    }
  }

  /**
   * 获取调试信息
   */
  getDebugInfo(): {
    totalEvents: number;
    totalListeners: number;
    events: Array<{
      name: string;
      listenerCount: number;
      namespaces: string[];
    }>;
  } {
    const events = Array.from(this.listeners.entries()).map(([name, listeners]) => ({
      name,
      listenerCount: listeners.length,
      namespaces: [...new Set(listeners.map(l => l.namespace).filter(Boolean))] as string[]
    }));

    return {
      totalEvents: this.listeners.size,
      totalListeners: events.reduce((sum, event) => sum + event.listenerCount, 0),
      events
    };
  }
}

/**
 * 全局事件总线实例
 */
export const eventBus = new EventBus();

/**
 * 高亮功能相关的事件类型定义
 */
export interface HighlightEvents {
  'highlight:created': { id: string; text: string; color: string; metadata?: any };
  'highlight:updated': { id: string; text: string; color: string; metadata?: any };
  'highlight:deleted': { id: string };
  'highlight:clicked': { id: string; position: { x: number; y: number } };
  'highlight:hovered': { id: string; position: { x: number; y: number } };
  'highlight:selected': { highlight: any; position: { x: number; y: number } };
  'popover:show': { type: 'color' | 'content'; data: any };
  'popover:hide': { type: 'color' | 'content' };
  'selection:changed': { text: string; range: Range | null };
}

/**
 * 类型安全的事件发送器
 */
export class TypedEventBus<T extends Record<string, any> = Record<string, any>> {
  constructor(private bus: EventBus = eventBus) {}

  on<K extends keyof T>(
    event: K,
    callback: (data: T[K]) => void,
    options?: { once?: boolean; namespace?: string }
  ): () => void {
    return this.bus.on(event as string, callback, options);
  }

  once<K extends keyof T>(
    event: K,
    callback: (data: T[K]) => void,
    namespace?: string
  ): () => void {
    return this.bus.once(event as string, callback, namespace);
  }

  off<K extends keyof T>(
    event: K,
    callback: (data: T[K]) => void,
    namespace?: string
  ): void {
    this.bus.off(event as string, callback, namespace);
  }

  emit<K extends keyof T>(event: K, data: T[K]): void {
    this.bus.emit(event as string, data);
  }

  offNamespace(namespace: string): void {
    this.bus.offNamespace(namespace);
  }
}

/**
 * 高亮功能专用的类型安全事件总线
 */
export const highlightEventBus = new TypedEventBus<HighlightEvents>();