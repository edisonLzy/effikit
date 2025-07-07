// Sidebar功能的background脚本
// 专门处理sidebar相关的background逻辑

import { initialRequestInterceptorBackground } from './tools/RequestInterceptor/_background';
import { CONSTANTS } from '@/lib/constants';

// 处理Sidebar相关的运行时消息
export function handleSidebarMessage(
  message: any, 
  sender: chrome.runtime.MessageSender, 
  sendResponse: (response?: any) => void
): boolean {
  // 处理存储相关的消息
  if (message.action === CONSTANTS.COMMON.MESSAGE_TYPES.GET_STORAGE_DATA) {
    chrome.storage.local.get(null, (data) => {
      sendResponse(data);
    });
    return true; // 保持消息通道开放
  }

  if (message.action === CONSTANTS.COMMON.MESSAGE_TYPES.SET_STORAGE_DATA) {
    chrome.storage.local.set(message.data, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  return false;
}

// 初始化Sidebar功能的存储设置
export function initializeSidebarStorage() {
  chrome.storage.local.get(['effikit_settings'], (result) => {
    if (!result.effikit_settings) {
      // 设置默认配置
      chrome.storage.local.set({
        effikit_settings: {
          networkMonitorEnabled: true,
          responseEditingEnabled: false,
          performanceMonitorEnabled: true,
          automationEnabled: false
        }
      });
    } else {
      // 确保所有必要的设置都存在
      const defaultSettings = {
        networkMonitorEnabled: true,
        responseEditingEnabled: false,
        performanceMonitorEnabled: true,
        automationEnabled: false
      };
      
      let needsUpdate = false;
      const updatedSettings = { ...result.effikit_settings };
      
      Object.entries(defaultSettings).forEach(([key, defaultValue]) => {
        if (updatedSettings[key] === undefined) {
          updatedSettings[key] = defaultValue;
          needsUpdate = true;
        }
      });
      
      if (needsUpdate) {
        chrome.storage.local.set({
          effikit_settings: updatedSettings
        });
      }
    }
  });
}

// 初始化Sidebar的所有background功能
export function initializeSidebarBackground() {
  console.log('Initializing sidebar background...');
  
  // 初始化RequestInterceptor功能
  initialRequestInterceptorBackground();
  
  // 初始化存储设置
  initializeSidebarStorage();
  
  console.log('Sidebar background initialized');
} 