import React from 'react';
import type { 
  Highlight, 
  HighlightColor, 
  HighlightPayload,
  HighlightTag,
  TagType,
  TagContent
} from './types';
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
import { domRenderer } from './ui/dom-renderer';
import { HighlightContentPopover } from './ui/HighlightContentPopover';

export class HighlightManager {
  private isEnabled = true;
  private currentHighlight: Highlight | null = null;

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
      const now = Date.now();
      
      const highlight: Highlight = {
        id: highlightId,
        text: selectedText,
        url: window.location.href,
        color,
        timestamp: now,
        lastModified: now,
        range,
        tags: [] // 初始化时没有标签
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
      
      // 通知背景脚本更新图标
      if (typeof chrome !== 'undefined' && chrome.runtime) {
        chrome.runtime.sendMessage({
          type: 'HIGHLIGHT_REMOVED',
          payload: { url: window.location.href }
        });
      }
      
      return domRemoved;
    } catch (error) {
      console.error('Failed to remove highlight:', error);
      return false;
    }
  }

  async getHighlights(url?: string): Promise<Highlight[]> {
    try {
      const highlights = await getHighlights(url || window.location.href);
      // 兼容旧数据结构
      return highlights.map(h => ({
        ...h,
        tags: h.tags || []
      }));
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

  async getHighlightById(id: string): Promise<Highlight | null> {
    const url = window.location.href;
    const highlights = await getHighlights(url);
    const found = highlights.find(h => h.id === id);
    // 更新当前高亮
    if (found) {
      this.currentHighlight = found;
    }
    return found || null;
  }

  // =================================================================
  // Tag Management Methods
  // =================================================================

  async addTagToHighlight(highlightId: string, type: TagType): Promise<Highlight | null> {
    try {
      const highlight = await this.getHighlightById(highlightId);
      if (!highlight) {
        throw new Error(`Highlight with ID ${highlightId} not found`);
      }

      const now = Date.now();
      const newTag: HighlightTag = {
        id: generateHighlightId('tag'), // e.g., tag-xxxx
        type,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)}`, // "Annotation", "Word"
        createdAt: now,
        updatedAt: now,
        isActive: true,
        content: this.createInitialTagContent(type)
      };
      
      // 将其他标签设为非激活
      highlight.tags.forEach(t => t.isActive = false);
      highlight.tags.push(newTag);
      highlight.lastModified = now;

      await saveHighlight(highlight);
      this.refreshPopoverWithHighlight(highlight);
      
      return highlight;
    } catch (error) {
      console.error(`Failed to add tag to highlight ${highlightId}:`, error);
      return null;
    }
  }

  async updateTagContent(highlightId: string, tagId: string, content: TagContent): Promise<Highlight | null> {
    try {
      const highlight = await this.getHighlightById(highlightId);
      if (!highlight) throw new Error(`Highlight ${highlightId} not found`);

      const tag = highlight.tags.find(t => t.id === tagId);
      if (!tag) throw new Error(`Tag ${tagId} not found in highlight ${highlightId}`);

      tag.content = content;
      tag.updatedAt = Date.now();
      highlight.lastModified = Date.now();
      
      await saveHighlight(highlight);
      
      return highlight;
    } catch (error) {
      console.error(`Failed to update tag content for ${tagId}:`, error);
      return null;
    }
  }
  
  async setActiveTag(highlightId: string, tagId: string): Promise<Highlight | null> {
    try {
      const highlight = await this.getHighlightById(highlightId);
      if (!highlight) throw new Error(`Highlight ${highlightId} not found`);

      highlight.tags.forEach(tag => {
        tag.isActive = tag.id === tagId;
      });

      await saveHighlight(highlight);
      
      return highlight;
    } catch(error) {
      console.error(`Failed to set active tag for ${highlightId}:`, error);
      return null;
    }
  }
  
  async deleteTag(highlightId: string, tagId: string): Promise<Highlight | null> {
    try {
      const highlight = await this.getHighlightById(highlightId);
      if (!highlight) throw new Error(`Highlight ${highlightId} not found`);

      const tagIndex = highlight.tags.findIndex(t => t.id === tagId);
      if (tagIndex === -1) throw new Error(`Tag ${tagId} not found`);
      
      const wasActive = highlight.tags[tagIndex].isActive;
      highlight.tags.splice(tagIndex, 1);
      
      // 如果被删除的是激活标签，则将第一个标签设为激活
      if (wasActive && highlight.tags.length > 0) {
        highlight.tags[0].isActive = true;
      }
      
      highlight.lastModified = Date.now();
      await saveHighlight(highlight);
      this.refreshPopoverWithHighlight(highlight);
      
      return highlight;
    } catch(error) {
      console.error(`Failed to delete tag ${tagId}:`, error);
      return null;
    }
  }

  // =================================================================
  // Popover Interaction Methods
  // =================================================================

  showContentPopover(highlightId: string, position: { x: number; y: number }): void {
    (async () => {
      try {
        const highlight = await this.getHighlightById(highlightId);
        if (!highlight) {
          console.error(`Highlight with id ${highlightId} not found`);
          return;
        }

        domRenderer.render(
          <HighlightContentPopover
            highlight={highlight}
            position={position}
            onClose={() => domRenderer.unmountAll('content-popover')}
            onUpdate={(updatedHighlight) => {
              this.currentHighlight = updatedHighlight;
              // 可能需要将更新保存到存储
              saveHighlight(updatedHighlight);
            }}
          />,
          'content-popover'
        );
      } catch (error) {
        console.error('Failed to show content popover:', error);
      }
    })();
  }
  
  private refreshPopoverWithHighlight(highlight: Highlight) {
    if (domRenderer.isVisible('content-popover')) {
      const instance = document.querySelector('[id^="effikit-react-root-content-popover-"]');
      if (instance) {
        const htmlInstance = instance as HTMLElement;
        const position = {
          x: parseFloat(htmlInstance.style.left),
          y: parseFloat(htmlInstance.style.top),
        };

        domRenderer.render(
          <HighlightContentPopover
            highlight={highlight}
            position={position}
            onClose={() => domRenderer.unmountAll('content-popover')}
            onUpdate={(updatedHighlight) => {
              this.currentHighlight = updatedHighlight;
              saveHighlight(updatedHighlight);
            }}
          />,
          'content-popover'
        );
      }
    }
  }

  private createInitialTagContent(type: TagType): TagContent {
    const now = Date.now();
    switch (type) {
      case 'annotation':
        return { note: '', createdAt: now, updatedAt: now };
      case 'word':
        return { definitions: [] };
      case 'sentence':
        return {};
      default:
        return {};
    }
  }
}

// 导出单例实例
export const highlightManager = new HighlightManager(); 