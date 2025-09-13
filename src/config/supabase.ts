import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/types/supabase.types';

// 从环境变量读取 Supabase 配置，如果不存在则使用默认值
const supabaseUrl = process.env.EXTENSION_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXTENSION_PUBLIC_SUPABASE_ANON_KEY;

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    flowType: 'implicit',
    persistSession: true,
    storage: {
      getItem: async (key) => {
        const result = await chrome.storage.local.get(key);
        return result[key];
      },
      setItem: async (key, value) => {
        await chrome.storage.local.set({ [key]: value });
      },
      removeItem: async (key) => {
        await chrome.storage.local.remove(key);
      }
    }
  }
});