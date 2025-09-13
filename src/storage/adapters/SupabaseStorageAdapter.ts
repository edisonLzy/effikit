import { v4 as uuidv4 } from 'uuid';
import type { Highlight, HighlightStorage, HighlightSettings } from '@/types';
import type { IHighlightStorage } from '@/types/storage';
import { supabase } from '@/config/supabase';
import { normalizeUrl } from '@/utils';

export class SupabaseStorageAdapter implements IHighlightStorage {
  private async getCurrentUser() {
    // 先尝试从 Chrome 存储中获取用户会话
    try {
      const result = await chrome.storage.local.get(['effikit_auth']);
      const authData = result.effikit_auth;
      
      if (authData && authData.access_token && authData.refresh_token) {
        // 设置 Supabase 会话
        const { data, error } = await supabase.auth.setSession({
          access_token: authData.access_token,
          refresh_token: authData.refresh_token,
        });
        
        if (!error && data.user) {
          return data.user;
        }
        
        // 如果会话过期，清除存储的认证数据
        if (error) {
          await chrome.storage.local.remove(['effikit_auth']);
        }
      }
    } catch (error) {
      console.error('Failed to get auth data from Chrome storage:', error);
    }
    
    // 如果从存储中无法获取会话，尝试从 Supabase 获取当前用户
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      console.error('Failed to get current user:', error);
      throw new Error('Authentication required');
    }
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    return user;
  }

  async saveHighlight(highlight: Highlight): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      
      const insertData = {
        id: highlight.id,
        text: highlight.text,
        url: normalizeUrl(highlight.url),
        color: highlight.color,
        range: highlight.range as any, // Cast to any to handle Json type compatibility
        timestamp: highlight.timestamp,
        last_modified: highlight.lastModified,
        user_id: user.id
      };

      const { error } = await supabase
        .from('highlights')
        .insert(insertData);

      if (error) {
        console.error('Failed to save highlight to Supabase:', error);
        throw error;
      }

      // 保存标签
      if (highlight.tags && highlight.tags.length > 0) {
        await this.saveTags(highlight.id, highlight.tags);
      }
    } catch (error) {
      console.error('Failed to save highlight:', error);
      throw error;
    }
  }

  async getHighlights(url?: string): Promise<Highlight[]> {
    try {
      const user = await this.getCurrentUser();
      
      let query = supabase
        .from('highlights')
        .select(`
          *,
          highlight_tags (
            id,
            type,
            title,
            content,
            is_active,
            created_at,
            updated_at
          )
        `)
        .eq('user_id', user.id); // 只获取当前用户的高亮

      if (url) {
        query = query.eq('url', normalizeUrl(url));
      }

      const { data, error } = await query;

      if (error) {
        console.error('Failed to get highlights from Supabase:', error);
        return [];
      }

      return (data || []).map(this.transformSupabaseToHighlight);
    } catch (error) {
      console.error('Failed to get highlights:', error);
      return [];
    }
  }

  async getHighlightsByUrl(): Promise<HighlightStorage> {
    try {
      const highlights = await this.getHighlights();
      const storage: HighlightStorage = {};

      highlights.forEach(highlight => {
        if (!storage[highlight.url]) {
          storage[highlight.url] = [];
        }
        storage[highlight.url].push(highlight);
      });

      return storage;
    } catch (error) {
      console.error('Failed to get highlights by URL:', error);
      return {};
    }
  }

  async removeHighlight(highlightId: string, url: string): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      
      // 先删除相关的标签
      await supabase
        .from('highlight_tags')
        .delete()
        .eq('highlight_id', highlightId);

      // 然后删除高亮
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', highlightId)
        .eq('url', normalizeUrl(url))
        .eq('user_id', user.id); // 只删除当前用户的高亮

      if (error) {
        console.error('Failed to remove highlight from Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to remove highlight:', error);
      throw error;
    }
  }

  async updateHighlight(highlightId: string, payload: Partial<Omit<Highlight, 'id'>>): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      
      const updateData: any = {};

      if (payload.text) updateData.text = payload.text;
      if (payload.color) updateData.color = payload.color;
      if (payload.range) updateData.range = payload.range;
      if (payload.lastModified) updateData.last_modified = payload.lastModified;

      const { error } = await supabase
        .from('highlights')
        .update(updateData)
        .eq('id', highlightId)
        .eq('user_id', user.id); // 只更新当前用户的高亮

      if (error) {
        console.error('Failed to update highlight in Supabase:', error);
        return false;
      }

      // 如果有标签更新
      if (payload.tags) {
        // 删除现有标签
        await supabase
          .from('highlight_tags')
          .delete()
          .eq('highlight_id', highlightId);

        // 保存新标签
        await this.saveTags(highlightId, payload.tags);
      }

      return true;
    } catch (error) {
      console.error('Failed to update highlight:', error);
      return false;
    }
  }

  async deleteHighlight(highlightId: string): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      
      // 先删除相关的标签
      await supabase
        .from('highlight_tags')
        .delete()
        .eq('highlight_id', highlightId);

      // 然后删除高亮
      const { error } = await supabase
        .from('highlights')
        .delete()
        .eq('id', highlightId)
        .eq('user_id', user.id); // 只删除当前用户的高亮

      if (error) {
        console.error('Failed to delete highlight from Supabase:', error);
        throw error;
      }
    } catch (error) {
      console.error('Failed to delete highlight:', error);
      throw error;
    }
  }

  async clearHighlights(url?: string): Promise<void> {
    try {
      const user = await this.getCurrentUser();
      
      if (url) {
        // 获取该 URL 下的所有高亮 ID
        const { data: highlights } = await supabase
          .from('highlights')
          .select('id')
          .eq('url', normalizeUrl(url))
          .eq('user_id', user.id);

        if (highlights && highlights.length > 0) {
          const highlightIds = highlights.map((h: { id: string }) => h.id);
          
          // 删除标签
          await supabase
            .from('highlight_tags')
            .delete()
            .in('highlight_id', highlightIds);

          // 删除高亮
          await supabase
            .from('highlights')
            .delete()
            .eq('url', normalizeUrl(url))
            .eq('user_id', user.id);
        }
      } else {
        // 获取所有高亮 ID
        const { data: highlights } = await supabase
          .from('highlights')
          .select('id')
          .eq('user_id', user.id);

        if (highlights && highlights.length > 0) {
          const highlightIds = highlights.map((h: { id: string }) => h.id);
          
          // 删除标签
          await supabase
            .from('highlight_tags')
            .delete()
            .in('highlight_id', highlightIds);
        }

        // 删除所有高亮
        await supabase
          .from('highlights')
          .delete()
          .eq('user_id', user.id);
      }
    } catch (error) {
      console.error('Failed to clear highlights:', error);
      throw error;
    }
  }

  async getHighlightSettings(): Promise<HighlightSettings> {
    // Supabase 版本暂时返回默认设置，后续可以扩展用户设置表
    return {
      enabled: true,
      defaultColor: 'yellow',
      autoCreateWordTag: false,
      autoCreateSentenceTag: false
    };
  }

  async saveHighlightSettings(settings: HighlightSettings): Promise<void> {
    // Supabase 版本暂时不实现设置保存，后续可以扩展用户设置表
    console.log('Settings save not implemented for Supabase adapter:', settings);
  }

  private async saveTags(highlightId: string, tags: any[]): Promise<void> {
    if (!tags || tags.length === 0) return;

    const tagInserts = tags.map(tag => ({
      id: tag.id || uuidv4(), // 如果没有 ID 或 ID 无效，生成新的 UUID
      highlight_id: highlightId,
      type: tag.type,
      title: tag.title,
      content: tag.content,
      is_active: tag.isActive || false
    }));

    const { error } = await supabase
      .from('highlight_tags')
      .insert(tagInserts);

    if (error) {
      console.error('Failed to save tags:', error);
      throw error;
    }
  }

  private transformSupabaseToHighlight(row: any): Highlight {
    return {
      id: row.id,
      text: row.text,
      url: row.url,
      color: row.color,
      range: row.range,
      tags: (row.highlight_tags || []).map((tag: any) => ({
        id: tag.id,
        type: tag.type,
        title: tag.title,
        content: tag.content,
        createdAt: new Date(tag.created_at).getTime(),
        updatedAt: new Date(tag.updated_at).getTime(),
        isActive: tag.is_active
      })),
      timestamp: row.timestamp,
      lastModified: row.last_modified
    };
  }
}