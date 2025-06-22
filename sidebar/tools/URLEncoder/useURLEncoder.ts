import { useState, useCallback, useMemo } from 'react';

export type ConversionMode = 'encode' | 'decode';

export interface URLEncoderState {
  input: string;
  mode: ConversionMode;
  copied: boolean;
}

export interface URLEncoderActions {
  setInput: (input: string) => void;
  setMode: (mode: ConversionMode) => void;
  toggleMode: () => void;
  clearInput: () => void;
  copyResult: () => Promise<void>;
  setCopied: (copied: boolean) => void;
}

export interface URLEncoderData {
  result: string;
  inputType: 'encoded' | 'plain' | null;
  examples: string[];
  isError: boolean;
}

export function useURLEncoder() {
  const [input, setInput] = useState('');
  const [mode, setMode] = useState<ConversionMode>('encode');
  const [copied, setCopied] = useState(false);

  // URL编码函数
  const encodeURL = useCallback((text: string): { result: string; isError: boolean } => {
    try {
      return { 
        result: encodeURIComponent(text), 
        isError: false 
      };
    } catch (error) {
      console.error('编码失败:', error);
      return { 
        result: text, 
        isError: true 
      };
    }
  }, []);

  // URL解码函数
  const decodeURL = useCallback((text: string): { result: string; isError: boolean } => {
    try {
      return { 
        result: decodeURIComponent(text), 
        isError: false 
      };
    } catch (error) {
      console.error('解码失败:', error);
      return { 
        result: text, 
        isError: true 
      };
    }
  }, []);

  // 计算转换结果
  const { result, isError } = useMemo(() => {
    if (!input.trim()) {
      return { result: '', isError: false };
    }
    
    if (mode === 'encode') {
      return encodeURL(input);
    } else {
      return decodeURL(input);
    }
  }, [input, mode, encodeURL, decodeURL]);

  // 检测输入内容类型
  const inputType = useMemo(() => {
    if (!input.trim()) return null;
    
    // 检测是否包含百分号编码
    const hasPercentEncoding = /%[0-9A-Fa-f]{2}/.test(input);
    
    if (hasPercentEncoding) {
      return 'encoded';
    } else {
      return 'plain';
    }
  }, [input]);

  // 切换转换模式
  const toggleMode = useCallback(() => {
    setMode(prev => prev === 'encode' ? 'decode' : 'encode');
    // 切换模式时重置复制状态
    setCopied(false);
  }, []);

  // 复制结果到剪贴板
  const copyResult = useCallback(async () => {
    if (!result || isError) return;
    
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      // 2秒后重置复制状态
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('复制失败:', error);
      // 可以在这里添加用户友好的错误提示
    }
  }, [result, isError]);

  // 清空输入
  const clearInput = useCallback(() => {
    setInput('');
    setCopied(false);
  }, []);

  // 使用示例
  const examples = useMemo(() => {
    if (mode === 'encode') {
      return [
        'https://example.com/search?q=中文查询',
        'hello world!@#$%^&*()',
        'file:///C:/Users/用户/Documents/文档.txt',
        'mailto:test@example.com?subject=测试邮件&body=邮件内容',
        'https://api.example.com/v1/users?name=张三&age=25'
      ];
    } else {
      return [
        'https%3A//example.com/search%3Fq%3D%E4%B8%AD%E6%96%87%E6%9F%A5%E8%AF%A2',
        'hello%20world%21%40%23%24%25%5E%26%2A%28%29',
        'file%3A///C%3A/Users/%E7%94%A8%E6%88%B7/Documents/%E6%96%87%E6%A1%A3.txt',
        'mailto%3Atest%40example.com%3Fsubject%3D%E6%B5%8B%E8%AF%95%E9%82%AE%E4%BB%B6%26body%3D%E9%82%AE%E4%BB%B6%E5%86%85%E5%AE%B9',
        'https%3A//api.example.com/v1/users%3Fname%3D%E5%BC%A0%E4%B8%89%26age%3D25'
      ];
    }
  }, [mode]);

  // 智能模式建议
  const suggestedMode = useMemo(() => {
    if (!input.trim()) return null;
    
    if (inputType === 'encoded' && mode === 'encode') {
      return 'decode';
    } else if (inputType === 'plain' && mode === 'decode') {
      return 'encode';
    }
    
    return null;
  }, [input, inputType, mode]);

  const state: URLEncoderState = {
    input,
    mode,
    copied
  };

  const actions: URLEncoderActions = {
    setInput,
    setMode,
    toggleMode,
    clearInput,
    copyResult,
    setCopied
  };

  const data: URLEncoderData = {
    result,
    inputType,
    examples,
    isError
  };

  return {
    state,
    actions,
    data,
    suggestedMode
  };
} 