// Re-export types and convenience functions
import { storageManager } from './StorageManager';
import type { Highlight, HighlightStorage, HighlightSettings } from '@/types';

// Convenience functions that wrap StorageManager methods
export async function saveHighlight(highlight: Highlight): Promise<void> {
  return storageManager.saveHighlight(highlight);
}

export async function getHighlights(url?: string): Promise<Highlight[]> {
  return storageManager.getHighlights(url);
}

export async function getHighlightsByUrl(): Promise<HighlightStorage> {
  return storageManager.getHighlightsByUrl();
}

export async function removeHighlight(highlightId: string, url: string): Promise<void> {
  return storageManager.removeHighlight(highlightId, url);
}

export async function updateHighlightFromStore(highlightId: string, payload: Partial<Omit<Highlight,'id'>>): Promise<boolean> {
  return storageManager.updateHighlight(highlightId, payload);
}

/**
 * 删除高亮（deleteHighlight的别名函数）
 */
export async function deleteHighlightFromStorage(highlightId: string): Promise<void> {
  return storageManager.deleteHighlight(highlightId);
}

export async function clearHighlights(url?: string): Promise<void> {
  return storageManager.clearHighlights(url);
}

export async function getHighlightSettings(): Promise<HighlightSettings> {
  return storageManager.getHighlightSettings();
}

export async function saveHighlightSettings(settings: HighlightSettings): Promise<void> {
  return storageManager.saveHighlightSettings(settings);
}