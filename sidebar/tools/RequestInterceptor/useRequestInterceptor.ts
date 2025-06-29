import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { HttpRequest, InterceptedRequestData } from './types';

export function useRequestInterceptor() {
  const [requests, setRequests] = useState<HttpRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<HttpRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // 过滤请求列表
  const filteredRequests = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return requests;
    }
    
    const term = debouncedSearchTerm.toLowerCase();
    return requests.filter(request => 
      request.url.toLowerCase().includes(term) ||
      request.method.toLowerCase().includes(term)
    );
  }, [requests, debouncedSearchTerm]);

  // 生成请求的唯一ID
  const generateRequestId = useCallback((method: string, url: string) => {
    return `${method}:${url}`;
  }, []);

  // 添加新请求到列表
  const addRequest = useCallback((requestData: InterceptedRequestData) => {
    const id = requestData.requestId || generateRequestId(requestData.method, requestData.url);
    
    setRequests(prev => {
      // 检查是否已存在相同的请求
      const existingIndex = prev.findIndex(req => req.id === id);
      
      if (existingIndex >= 0) {
        // 更新现有请求的时间戳和其他信息
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          timestamp: requestData.timestamp,
          originalRequest: {
            ...updated[existingIndex].originalRequest,
            headers: requestData.headers || updated[existingIndex].originalRequest?.headers,
            body: requestData.body || updated[existingIndex].originalRequest?.body
          }
        };
        return updated;
      }
      
      // 添加新请求
      const newRequest: HttpRequest = {
        id,
        method: requestData.method,
        url: requestData.url,
        timestamp: requestData.timestamp,
        isIntercepted: false,
        isMocked: false,
        originalRequest: {
          headers: requestData.headers || {},
          body: requestData.body
        }
      };
      
      // 将新请求添加到列表顶部，并限制最大数量
      const newRequests = [newRequest, ...prev];
      return newRequests.slice(0, 100); // 最多保留100个请求
    });
  }, [generateRequestId]);

  // 更新请求头信息
  const updateRequestHeaders = useCallback((requestId: string, headers: Record<string, string>) => {
    setRequests(prev => 
      prev.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            originalRequest: {
              ...request.originalRequest,
              headers: headers
            }
          };
        }
        return request;
      })
    );
  }, []);

  // 切换拦截状态
  const toggleIntercept = useCallback((requestId: string, isIntercepted: boolean) => {
    setRequests(prev => 
      prev.map(request => {
        if (request.id === requestId) {
          const updated = { ...request, isIntercepted };
          
          // 如果关闭拦截，同时清除mock状态
          if (!isIntercepted) {
            updated.isMocked = false;
            updated.mockData = undefined;
          }
          
          return updated;
        }
        return request;
      })
    );

    // 通知background脚本更新拦截规则
    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'UPDATE_INTERCEPT_RULE',
        payload: { requestId, isIntercepted }
      }).catch(error => {
        console.warn('Failed to send intercept rule update:', error);
      });
    }
  }, []);

  // 更新Mock数据
  const updateMockData = useCallback((requestId: string, mockData: string, statusCode = 200) => {
    setRequests(prev => 
      prev.map(request => {
        if (request.id === requestId) {
          return {
            ...request,
            isMocked: true,
            mockData
          };
        }
        return request;
      })
    );

    // 通知background脚本更新mock响应
    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'UPDATE_MOCK_RESPONSE',
        payload: { 
          requestId, 
          mockData, 
          statusCode,
          headers: { 'Content-Type': 'application/json' }
        }
      }).catch(error => {
        console.warn('Failed to send mock response update:', error);
      });
    }
  }, []);

  // 处理搜索
  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  // 打开Mock编辑弹窗
  const openMockDialog = useCallback((request: HttpRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  }, []);

  // 关闭Mock编辑弹窗
  const closeMockDialog = useCallback(() => {
    setSelectedRequest(null);
    setIsDialogOpen(false);
  }, []);

  // 清除所有请求
  const clearAllRequests = useCallback(() => {
    setRequests([]);
  }, []);

  // 监听来自background脚本的消息
  useEffect(() => {
    if (!chrome?.runtime?.onMessage) {
      return;
    }

    const messageListener = (message: any, sender: any, sendResponse: (response?: any) => void) => {
      switch (message.type) {
        case 'NEW_REQUEST_INTERCEPTED':
          addRequest(message.payload);
          break;
        
        case 'REQUEST_HEADERS_UPDATED':
          updateRequestHeaders(message.payload.requestId, message.payload.headers);
          break;
        
        case 'REQUEST_COMPLETED':
          // 可以在这里处理请求完成的逻辑
          break;
        
        default:
          break;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      if (chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    };
  }, [addRequest, updateRequestHeaders]);

  // 初始化时请求当前的拦截状态
  useEffect(() => {
    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'GET_CURRENT_REQUESTS'
      }).then(response => {
        if (response?.requests) {
          setRequests(response.requests);
        }
      }).catch(error => {
        console.warn('Failed to get current requests:', error);
      });
    }
  }, []);

  return {
    requests,
    searchTerm,
    filteredRequests,
    selectedRequest,
    isDialogOpen,
    toggleIntercept,
    updateMockData,
    handleSearch,
    openMockDialog,
    closeMockDialog,
    clearAllRequests
  };
} 