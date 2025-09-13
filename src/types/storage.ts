import type { Highlight, HighlightStorage, HighlightSettings } from '@/types';

export interface IHighlightStorage {
  // 高亮相关操作
  saveHighlight(highlight: Highlight): Promise<void>;
  getHighlights(url?: string): Promise<Highlight[]>;
  getHighlightsByUrl(): Promise<HighlightStorage>;
  removeHighlight(highlightId: string, url: string): Promise<void>;
  updateHighlight(highlightId: string, payload: Partial<Omit<Highlight, 'id'>>): Promise<boolean>;
  deleteHighlight(highlightId: string): Promise<void>;
  clearHighlights(url?: string): Promise<void>;
  
  // 设置相关操作
  getHighlightSettings(): Promise<HighlightSettings>;
  saveHighlightSettings(settings: HighlightSettings): Promise<void>;
}

export enum StorageType {
  CHROME = 'chrome',
  SUPABASE = 'supabase',
  INDEXEDDB = 'indexeddb'
}

export interface StorageConfig {
  type: StorageType;
  options?: Record<string, any>;
}