import type { Highlight, HighlightColor, HighlightPayload } from './types';
import { generateHighlightId } from './utils';
import { 
  saveHighlight, 
  getHighlights, 
  getHighlightsByUrl, 
  removeHighlight, 
  clearHighlights,
  getHighlightSettings,
  saveHighlightSettings
} from './storage';
import { 
  wrapSelectionWithHighlight, 
  removeHighlightFromDOM, 
  renderHighlightInDOM, 
  clearAllHighlightsFromDOM,
  getSelectionRange
} from './dom';

export class HighlightManager {
  private isEnabled = true;

  async initialize(): Promise<void> {
    try {
      const settings = await getHighlightSettings();
      this.isEnabled = settings.enabled;
      
      // 页面加载时渲染已有的高亮
      await this.renderExistingHighlights();
    } catch (error) {
      console.error('Failed to initialize highlight manager:', error);
    }
  }

  async createHighlight(color: HighlightColor): Promise<Highlight | null> {
    try {
      if (!this.isEnabled) {
        return null;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return null;
      }

      const selectedText = selection.toString().trim();
      if (!selectedText) {
        return null;
      }

      const range = getSelectionRange();
      if (!range) {
        return null;
      }

      const highlightId = generateHighlightId();
      const highlight: Highlight = {
        id: highlightId,
        text: selectedText,
        url: window.location.href,
        color,
        timestamp: Date.now(),
        range
      };

      // 在 DOM 中创建高亮
      const success = wrapSelectionWithHighlight(selection, highlightId, color);
      if (!success) {
        return null;
      }

      // 保存到存储
      await saveHighlight(highlight);

      return highlight;
    } catch (error) {
      console.error('Failed to create highlight:', error);
      return null;
    }
  }

  async removeHighlight(highlightId: string): Promise<boolean> {
    try {
      // 从 DOM 中移除
      const domRemoved = removeHighlightFromDOM(highlightId);
      
      // 从存储中移除
      await removeHighlight(highlightId, window.location.href);
      
      return domRemoved;
    } catch (error) {
      console.error('Failed to remove highlight:', error);
      return false;
    }
  }

  async getHighlights(url?: string): Promise<Highlight[]> {
    try {
      return await getHighlights(url || window.location.href);
    } catch (error) {
      console.error('Failed to get highlights:', error);
      return [];
    }
  }

  async getAllHighlights(): Promise<Record<string, Highlight[]>> {
    try {
      return await getHighlightsByUrl();
    } catch (error) {
      console.error('Failed to get all highlights:', error);
      return {};
    }
  }

  async clearHighlights(url?: string): Promise<void> {
    try {
      if (!url || url === window.location.href) {
        clearAllHighlightsFromDOM();
      }
      await clearHighlights(url);
    } catch (error) {
      console.error('Failed to clear highlights:', error);
    }
  }

  async setEnabled(enabled: boolean): Promise<void> {
    try {
      this.isEnabled = enabled;
      const settings = await getHighlightSettings();
      settings.enabled = enabled;
      await saveHighlightSettings(settings);

      if (enabled) {
        await this.renderExistingHighlights();
      } else {
        clearAllHighlightsFromDOM();
      }
    } catch (error) {
      console.error('Failed to set highlight enabled state:', error);
    }
  }

  isHighlightEnabled(): boolean {
    return this.isEnabled;
  }

  async renderExistingHighlights(): Promise<void> {
    try {
      if (!this.isEnabled) {
        return;
      }

      const highlights = await this.getHighlights();
      
      for (const highlight of highlights) {
        renderHighlightInDOM(highlight);
      }
    } catch (error) {
      console.error('Failed to render existing highlights:', error);
    }
  }

  async hasHighlights(url?: string): Promise<boolean> {
    try {
      const highlights = await this.getHighlights(url);
      return highlights.length > 0;
    } catch (error) {
      console.error('Failed to check if has highlights:', error);
      return false;
    }
  }

  getSelectedText(): string {
    const selection = window.getSelection();
    return selection ? selection.toString().trim() : '';
  }

  hasSelection(): boolean {
    const selection = window.getSelection();
    return !!(selection && selection.rangeCount > 0 && selection.toString().trim());
  }
}

// 导出单例实例
export const highlightManager = new HighlightManager(); 