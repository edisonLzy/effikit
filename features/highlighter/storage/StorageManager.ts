import { ChromeStorageAdapter } from './adapters/ChromeStorageAdapter';
import { SupabaseStorageAdapter } from './adapters/SupabaseStorageAdapter';
import type { IHighlightStorage } from './interfaces/IHighlightStorage';
import type { Highlight, HighlightStorage, HighlightSettings } from '../types';

export class StorageManager implements IHighlightStorage {
  private static instance: StorageManager;
  private adapters: IHighlightStorage[];

  private constructor() {
    // 固定顺序：Supabase 优先，Chrome 作为备用
    this.adapters = [
      new SupabaseStorageAdapter(),
      new ChromeStorageAdapter()
    ];
  }

  public static getInstance(): StorageManager {
    if (!StorageManager.instance) {
      StorageManager.instance = new StorageManager();
    }
    return StorageManager.instance;
  }

  async saveHighlight(highlight: Highlight): Promise<void> {
    for (const adapter of this.adapters) {
      try {
        await adapter.saveHighlight(highlight);
        return; // 成功就返回
      } catch (error) {
        console.warn('Storage adapter failed for saveHighlight:', error);
        // 继续尝试下一个适配器
      }
    }
    throw new Error('All storage adapters failed for saveHighlight');
  }

  async getHighlights(url?: string): Promise<Highlight[]> {
    for (const adapter of this.adapters) {
      try {
        return await adapter.getHighlights(url);
      } catch (error) {
        console.warn('Storage adapter failed for getHighlights:', error);
        // 继续尝试下一个适配器
      }
    }
    throw new Error('All storage adapters failed for getHighlights');
  }

  async getHighlightsByUrl(): Promise<HighlightStorage> {
    for (const adapter of this.adapters) {
      try {
        return await adapter.getHighlightsByUrl();
      } catch (error) {
        console.warn('Storage adapter failed for getHighlightsByUrl:', error);
        // 继续尝试下一个适配器
      }
    }
    throw new Error('All storage adapters failed for getHighlightsByUrl');
  }

  async removeHighlight(highlightId: string, url: string): Promise<void> {
    for (const adapter of this.adapters) {
      try {
        await adapter.removeHighlight(highlightId, url);
        return; // 成功就返回
      } catch (error) {
        console.warn('Storage adapter failed for removeHighlight:', error);
        // 继续尝试下一个适配器
      }
    }
    throw new Error('All storage adapters failed for removeHighlight');
  }

  async updateHighlight(highlightId: string, payload: Partial<Omit<Highlight, 'id'>>): Promise<boolean> {
    for (const adapter of this.adapters) {
      try {
        return await adapter.updateHighlight(highlightId, payload);
      } catch (error) {
        console.warn('Storage adapter failed for updateHighlight:', error);
        // 继续尝试下一个适配器
      }
    }
    throw new Error('All storage adapters failed for updateHighlight');
  }

  async deleteHighlight(highlightId: string): Promise<void> {
    for (const adapter of this.adapters) {
      try {
        await adapter.deleteHighlight(highlightId);
        return; // 成功就返回
      } catch (error) {
        console.warn('Storage adapter failed for deleteHighlight:', error);
        // 继续尝试下一个适配器
      }
    }
    throw new Error('All storage adapters failed for deleteHighlight');
  }

  async clearHighlights(url?: string): Promise<void> {
    for (const adapter of this.adapters) {
      try {
        await adapter.clearHighlights(url);
        return; // 成功就返回
      } catch (error) {
        console.warn('Storage adapter failed for clearHighlights:', error);
        // 继续尝试下一个适配器
      }
    }
    throw new Error('All storage adapters failed for clearHighlights');
  }

  async getHighlightSettings(): Promise<HighlightSettings> {
    for (const adapter of this.adapters) {
      try {
        return await adapter.getHighlightSettings();
      } catch (error) {
        console.warn('Storage adapter failed for getHighlightSettings:', error);
        // 继续尝试下一个适配器
      }
    }
    throw new Error('All storage adapters failed for getHighlightSettings');
  }

  async saveHighlightSettings(settings: HighlightSettings): Promise<void> {
    for (const adapter of this.adapters) {
      try {
        await adapter.saveHighlightSettings(settings);
        return; // 成功就返回
      } catch (error) {
        console.warn('Storage adapter failed for saveHighlightSettings:', error);
        // 继续尝试下一个适配器
      }
    }
    throw new Error('All storage adapters failed for saveHighlightSettings');
  }
}

// 导出单例实例
export const storageManager = StorageManager.getInstance();