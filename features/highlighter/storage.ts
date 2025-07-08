import type { Highlight, HighlightStorage, HighlightSettings } from './types';
import { normalizeUrl } from './utils';

const STORAGE_KEY = 'effikit_highlights';
const SETTINGS_KEY = 'effikit_highlight_settings';

export async function saveHighlight(highlight: Highlight): Promise<void> {
  try {
    const storage = await getHighlightStorage();
    const url = normalizeUrl(highlight.url);
    
    if (!storage[url]) {
      storage[url] = [];
    }
    
    storage[url].push(highlight);
    
    await chrome.storage.local.set({ [STORAGE_KEY]: storage });
  } catch (error) {
    console.error('Failed to save highlight:', error);
    throw error;
  }
}

export async function getHighlights(url?: string): Promise<Highlight[]> {
  try {
    const storage = await getHighlightStorage();
    
    if (url) {
      const normalizedUrl = normalizeUrl(url);
      return storage[normalizedUrl] || [];
    }
    
    // 返回所有高亮
    return Object.values(storage).flat();
  } catch (error) {
    console.error('Failed to get highlights:', error);
    return [];
  }
}

export async function getHighlightsByUrl(): Promise<HighlightStorage> {
  try {
    return await getHighlightStorage();
  } catch (error) {
    console.error('Failed to get highlights by URL:', error);
    return {};
  }
}

export async function removeHighlight(highlightId: string, url: string): Promise<void> {
  try {
    const storage = await getHighlightStorage();
    const normalizedUrl = normalizeUrl(url);
    
    if (storage[normalizedUrl]) {
      storage[normalizedUrl] = storage[normalizedUrl].filter(h => h.id !== highlightId);
      
      // 如果该 URL 下没有高亮了，删除该 URL 键
      if (storage[normalizedUrl].length === 0) {
        delete storage[normalizedUrl];
      }
      
      await chrome.storage.local.set({ [STORAGE_KEY]: storage });
    }
  } catch (error) {
    console.error('Failed to remove highlight:', error);
    throw error;
  }
}

export async function clearHighlights(url?: string): Promise<void> {
  try {
    if (url) {
      const storage = await getHighlightStorage();
      const normalizedUrl = normalizeUrl(url);
      delete storage[normalizedUrl];
      await chrome.storage.local.set({ [STORAGE_KEY]: storage });
    } else {
      await chrome.storage.local.remove(STORAGE_KEY);
    }
  } catch (error) {
    console.error('Failed to clear highlights:', error);
    throw error;
  }
}

export async function getHighlightSettings(): Promise<HighlightSettings> {
  try {
    const result = await chrome.storage.local.get(SETTINGS_KEY);
    return result[SETTINGS_KEY] || {
      enabled: true,
      defaultColor: 'yellow'
    };
  } catch (error) {
    console.error('Failed to get highlight settings:', error);
    return {
      enabled: true,
      defaultColor: 'yellow'
    };
  }
}

export async function saveHighlightSettings(settings: HighlightSettings): Promise<void> {
  try {
    await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
  } catch (error) {
    console.error('Failed to save highlight settings:', error);
    throw error;
  }
}

async function getHighlightStorage(): Promise<HighlightStorage> {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    return result[STORAGE_KEY] || {};
  } catch (error) {
    console.error('Failed to get highlight storage:', error);
    return {};
  }
} 