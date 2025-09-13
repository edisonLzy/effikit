import { normalizeUrl } from '../../utils';
import type { Highlight, HighlightStorage, HighlightSettings } from '../../types';
import type { IHighlightStorage } from '../interfaces/IHighlightStorage';

const STORAGE_KEY = 'effikit_highlights';
const SETTINGS_KEY = 'effikit_highlight_settings';

export class ChromeStorageAdapter implements IHighlightStorage {
  async saveHighlight(highlight: Highlight): Promise<void> {
    try {
      const storage = await this.getHighlightStorage();
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

  async getHighlights(url?: string): Promise<Highlight[]> {
    try {
      const storage = await this.getHighlightStorage();
      
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

  async getHighlightsByUrl(): Promise<HighlightStorage> {
    try {
      return await this.getHighlightStorage();
    } catch (error) {
      console.error('Failed to get highlights by URL:', error);
      return {};
    }
  }

  async removeHighlight(highlightId: string, url: string): Promise<void> {
    try {
      const storage = await this.getHighlightStorage();
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

  async updateHighlight(highlightId: string, payload: Partial<Omit<Highlight, 'id'>>): Promise<boolean> {
    try {
      const highlights = await this.getHighlights();
      const highlight = highlights.find(h => h.id === highlightId);
      
      if (highlight) {
        const mergedPayload = {
          ...highlight,
          ...payload
        };
        await this.saveHighlight(mergedPayload);
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Failed to update highlight:', error);
      return false;
    }
  }

  async deleteHighlight(highlightId: string): Promise<void> {
    try {
      // 获取当前页面URL
      const url = window.location.href;
      await this.removeHighlight(highlightId, url);
    } catch (error) {
      console.error('Failed to delete highlight:', error);
      throw error;
    }
  }

  async clearHighlights(url?: string): Promise<void> {
    try {
      if (url) {
        const storage = await this.getHighlightStorage();
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

  async getHighlightSettings(): Promise<HighlightSettings> {
    try {
      const result = await chrome.storage.local.get(SETTINGS_KEY);
      return result[SETTINGS_KEY] || {
        enabled: true,
        defaultColor: 'yellow',
        autoCreateWordTag: false,
        autoCreateSentenceTag: false
      };
    } catch (error) {
      console.error('Failed to get highlight settings:', error);
      return {
        enabled: true,
        defaultColor: 'yellow',
        autoCreateWordTag: false,
        autoCreateSentenceTag: false
      };
    }
  }

  async saveHighlightSettings(settings: HighlightSettings): Promise<void> {
    try {
      await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
    } catch (error) {
      console.error('Failed to save highlight settings:', error);
      throw error;
    }
  }

  private async getHighlightStorage(): Promise<HighlightStorage> {
    try {
      const result = await chrome.storage.local.get(STORAGE_KEY);
      return result[STORAGE_KEY] || {};
    } catch (error) {
      console.error('Failed to get highlight storage:', error);
      return {};
    }
  }
}