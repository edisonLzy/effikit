import { useState, useEffect, useCallback, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { HttpRequest, InterceptedRequestData } from './types';

export function useRequestInterceptor() {
  const [requests, setRequests] = useState<HttpRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<HttpRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

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

  const generateRequestId = useCallback((method: string, url: string) => {
    return `${method}:${url}`;
  }, []);

  const addRequest = useCallback((requestData: InterceptedRequestData) => {
    const id = requestData.requestId || generateRequestId(requestData.method, requestData.url);
    
    setRequests(prev => {
      const existingIndex = prev.findIndex(req => req.id === id);
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          timestamp: requestData.timestamp,
        };
        return updated;
      }
      
      const newRequest: HttpRequest = {
        id,
        method: requestData.method,
        url: requestData.url,
        timestamp: requestData.timestamp,
        isIntercepted: false,
        isMocked: false,
      };
      
      const newRequests = [newRequest, ...prev];
      return newRequests.slice(0, 100);
    });
  }, [generateRequestId]);

  const toggleIntercept = useCallback((requestId: string, isIntercepted: boolean) => {
    setRequests(prev => 
      prev.map(request => {
        if (request.id === requestId) {
          const updated = { ...request, isIntercepted };
          
          if (!isIntercepted) {
            updated.isMocked = false;
            updated.mockData = undefined;
          }
          
          return updated;
        }
        return request;
      })
    );

    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'UPDATE_INTERCEPT_RULE',
        payload: { requestId, isIntercepted }
      }).catch(error => {
        console.warn('Failed to send intercept rule update:', error);
      });
    }
  }, []);

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

    if (chrome?.runtime?.sendMessage) {
      chrome.runtime.sendMessage({
        type: 'UPDATE_MOCK_RESPONSE',
        payload: { 
          requestId, 
          mockData, 
          statusCode
        }
      }).catch(error => {
        console.warn('Failed to send mock response update:', error);
      });
    }
  }, []);

  const handleSearch = useCallback((term: string) => {
    setSearchTerm(term);
  }, []);

  const openMockDialog = useCallback((request: HttpRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  }, []);

  const closeMockDialog = useCallback(() => {
    setSelectedRequest(null);
    setIsDialogOpen(false);
  }, []);

  const clearAllRequests = useCallback(() => {
    setRequests([]);
  }, []);

  useEffect(() => {
    if (!chrome?.runtime?.onMessage) {
      return;
    }

    const messageListener = (message: any, sender: any, sendResponse: (response?: any) => void) => {
      if (message.type === 'NEW_REQUEST_INTERCEPTED') {
        addRequest(message.payload);
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      if (chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    };
  }, [addRequest]);

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
