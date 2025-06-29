import { useState, useEffect, useMemo } from 'react';
import { useDebounce } from '@/hooks/useDebounce';
import type { CapturedHttpRequest, CapturedRequest, CapturedRequestMessage, GetCurrentRequestsMessage, TabChangedMessage, UpsertMockResponseMessage } from './types';

export function useRequestInterceptor() {
  const [requests, setRequests] = useState<CapturedHttpRequest[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<CapturedHttpRequest | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentTabUrl, setCurrentTabUrl] = useState<string | undefined>(undefined);

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

  const addRequest = (requestData: CapturedRequest) => {
    // Only add requests that match the current tab's URL
    if (currentTabUrl && requestData.tabUrl !== currentTabUrl) {
      return;
    }

    setRequests(prev => {
      const existingIndex = prev.findIndex(req => req.url === requestData.url);

      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          timestamp: requestData.timestamp,
        };
        return updated;
      }

      const newRequest: CapturedHttpRequest = {
        method: requestData.method,
        url: requestData.url,
        timestamp: requestData.timestamp,
        isIntercepted: false,
        isMocked: false,
      };

      const newRequests = [newRequest, ...prev];
      return newRequests;
    });
  }

  const toggleIntercept = (url: string, isIntercepted: boolean) => {

    const request = requests.find(req => req.url === url)
    if (!request) {
      console.error('Request not found')
      return
    }

    setRequests(prev =>
      prev.map(request => {
        if (request.url === url) {
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
      const upsertMessage: UpsertMockResponseMessage = {
        action: 'UPSERT_MOCK_RESPONSE',
        payload: {
          enabled: isIntercepted,
          mockData: request.mockData || '',
          url: request.url,
        }
      }
      chrome.runtime.sendMessage(upsertMessage).catch(error => {
        console.warn('Failed to send intercept rule update:', error);
      });
    }
  }

  const upsertMockData = (url: string, mockData: string) => {

    const request = requests.find(req => req.url === url)
    if (!request) {
      console.error('Request not found')
      return
    }

    const nextRequests = requests.map(req => {
      if (req.url === url) {
        return {
          ...req,
          isMocked: true,
          mockData
        }
      }
      return req
    })

    setRequests(nextRequests);

    if (chrome?.runtime?.sendMessage) {

      const updateMockResponseMessage: UpsertMockResponseMessage = {
        action: 'UPSERT_MOCK_RESPONSE',
        payload: {
          mockData,
          url: request.url,
          enabled: true
        }
      }
      chrome.runtime.sendMessage(updateMockResponseMessage).catch(error => {
        console.warn('Failed to send mock response update:', error);
      });
    }
  }
  
  const handleSearch = (term: string) => {
    setSearchTerm(term);
  }

  const openMockDialog = (request: CapturedHttpRequest) => {
    setSelectedRequest(request);
    setIsDialogOpen(true);
  };

  const closeMockDialog = () => {
    setSelectedRequest(null);
    setIsDialogOpen(false);
  }

  const clearAllRequests = () => {
    if (currentTabUrl) {
      // Send a message to background to clear requests for this tab
      chrome.runtime.sendMessage({
        action: 'CLEAR_REQUESTS',
        tabUrl: currentTabUrl
      }).then(() => {
        setRequests([]);
      }).catch(error => {
        console.error('Failed to clear requests:', error);
      });
    } else {
      setRequests([]);
    }
  }

  const fetchRequestsForCurrentTab = (tabUrl: string) => {
    const getCurrentRequestsMessage: GetCurrentRequestsMessage = {
      action: 'GET_CURRENT_REQUESTS',
      payload: {
        tabUrl: tabUrl
      }
    }
    chrome.runtime.sendMessage(getCurrentRequestsMessage).then(response => {
      setRequests(response.requests);
    });
  }

  useEffect(() => {
    if (!chrome?.runtime?.onMessage) {
      return;
    }

    const messageListener = (message: CapturedRequestMessage | TabChangedMessage) => {

      console.log('message', message);

      if (message.action === 'NEW_REQUEST_FOUND') {
        addRequest((message as CapturedRequestMessage).request);
        return 
      } 
      
      if (message.action === 'TAB_CHANGED') {
        fetchRequestsForCurrentTab(message.payload.tabUrl)
        return;
      }
    };

    chrome.runtime.onMessage.addListener(messageListener);

    return () => {
      if (chrome?.runtime?.onMessage) {
        chrome.runtime.onMessage.removeListener(messageListener);
      }
    };
  }, []);

  return {
    requests,
    searchTerm,
    filteredRequests,
    selectedRequest,
    isDialogOpen,
    toggleIntercept,
    upsertMockData,
    handleSearch,
    openMockDialog,
    closeMockDialog,
    clearAllRequests
  };
}
