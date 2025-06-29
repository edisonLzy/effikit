// 请求拦截状态管理
interface InterceptedRequest {
  id: string;
  method: string;
  url: string;
  timestamp: number;
  isIntercepted: boolean;
  isMocked: boolean;
  mockData?: string;
  mockStatusCode?: number;
  mockHeaders?: Record<string, string>;
}

interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

// 全局状态
const interceptorState = {
  requests: new Map<string, InterceptedRequest>(),
  interceptRules: new Set<string>(),
  mockResponses: new Map<string, MockResponse>()
};

// 生成请求ID
function generateRequestId(method: string, url: string): string {
  return `${method}:${url}`;
}

// 安全地发送消息到sidebar
function sendMessageToSidebar(message: any): void {
  try {
    chrome.runtime.sendMessage(message).catch((error) => {
      // Sidebar可能未打开，这是正常情况，不需要记录错误
      if (chrome.runtime.lastError) {
        // 清除错误状态
        chrome.runtime.lastError;
      }
    });
  } catch (error) {
    // 忽略发送失败的情况
  }
}

// 获取HTTP状态码对应的文本
function getStatusText(statusCode: number): string {
  const statusTexts: Record<number, string> = {
    200: 'OK',
    201: 'Created',
    204: 'No Content',
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    500: 'Internal Server Error'
  };
  return statusTexts[statusCode] || 'Unknown';
}

// 处理扩展图标点击事件
chrome.action.onClicked.addListener(() => {
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true });
});

// 监听扩展安装事件
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('EffiKit 扩展已安装');
  } else if (details.reason === 'update') {
    console.log('EffiKit 扩展已更新');
  }
});

// 监听web请求 - 在请求发送前
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    // 过滤掉扩展内部请求和某些系统请求
    if (details.url.startsWith('chrome-extension://') || 
        details.url.startsWith('moz-extension://') ||
        details.url.startsWith('chrome://') ||
        details.url.startsWith('about:')) {
      return;
    }

    const requestId = generateRequestId(details.method, details.url);
    
    // 记录请求
    const request: InterceptedRequest = {
      id: requestId,
      method: details.method,
      url: details.url,
      timestamp: Date.now(),
      isIntercepted: interceptorState.interceptRules.has(requestId),
      isMocked: interceptorState.mockResponses.has(requestId)
    };
    
    interceptorState.requests.set(requestId, request);
    
    // 构建请求体
    let requestBody: string | undefined;
    if (details.requestBody) {
      try {
        if (details.requestBody.formData) {
          requestBody = JSON.stringify(details.requestBody.formData);
        } else if (details.requestBody.raw && details.requestBody.raw[0]?.bytes) {
          requestBody = new TextDecoder().decode(details.requestBody.raw[0].bytes);
        }
      } catch (error) {
        console.warn('Failed to decode request body:', error);
      }
    }
    
    // 异步发送消息到sidebar，避免阻塞请求
    setTimeout(() => {
      sendMessageToSidebar({
        type: 'NEW_REQUEST_INTERCEPTED',
        payload: {
          requestId: requestId,
          method: details.method,
          url: details.url,
          headers: {},
          body: requestBody,
          timestamp: Date.now()
        }
      });
    }, 0);

    // 如果需要mock响应，则阻止原始请求
    if (interceptorState.mockResponses.has(requestId)) {
      return { cancel: true };
    }
  },
  { urls: ['<all_urls>'] },
  ['requestBody']
);

// 监听web请求 - 在发送headers前
chrome.webRequest.onBeforeSendHeaders.addListener(
  (details) => {
    // 过滤掉扩展内部请求
    if (details.url.startsWith('chrome-extension://') || 
        details.url.startsWith('moz-extension://') ||
        details.url.startsWith('chrome://') ||
        details.url.startsWith('about:')) {
      return;
    }

    const requestId = generateRequestId(details.method, details.url);
    
    // 更新请求头信息
    const existingRequest = interceptorState.requests.get(requestId);
    if (existingRequest && details.requestHeaders) {
      const headers: Record<string, string> = {};
      details.requestHeaders.forEach(header => {
        if (header.name && header.value) {
          headers[header.name] = header.value;
        }
      });
      
      // 发送更新的请求信息到sidebar
      setTimeout(() => {
        sendMessageToSidebar({
          type: 'REQUEST_HEADERS_UPDATED',
          payload: {
            requestId: requestId,
            headers: headers
          }
        });
      }, 0);
    }
    
    // 如果设置了mock响应，阻止请求
    if (interceptorState.mockResponses.has(requestId)) {
      return { cancel: true };
    }
    
    return { requestHeaders: details.requestHeaders };
  },
  { urls: ['<all_urls>'] },
  ['requestHeaders', 'blocking']
);

// 处理被拦截的请求，返回mock响应
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    const requestId = generateRequestId(details.method, details.url);
    const mockResponse = interceptorState.mockResponses.get(requestId);
    
    if (mockResponse) {
      // 创建mock响应
      const responseHeaders = [
        { name: 'Content-Type', value: 'application/json' },
        { name: 'Access-Control-Allow-Origin', value: '*' },
        { name: 'Access-Control-Allow-Methods', value: 'GET, POST, PUT, DELETE, OPTIONS' },
        { name: 'Access-Control-Allow-Headers', value: 'Content-Type, Authorization' },
        ...Object.entries(mockResponse.headers).map(([name, value]) => ({ name, value }))
      ];
      
      return {
        responseHeaders,
        statusLine: `HTTP/1.1 ${mockResponse.statusCode} ${getStatusText(mockResponse.statusCode)}`
      };
    }
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders', 'blocking']
);

// 监听来自侧边栏的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Background received message:', request.type);

  if (request.action === 'getStorageData') {
    chrome.storage.local.get(null, (data) => {
      sendResponse(data);
    });
    return true;
  }
  
  if (request.action === 'setStorageData') {
    chrome.storage.local.set(request.data, () => {
      sendResponse({ success: true });
    });
    return true;
  }

  // 处理请求拦截器相关消息
  if (request.type === 'UPDATE_INTERCEPT_RULE') {
    const { requestId, isIntercepted } = request.payload;
    
    if (isIntercepted) {
      interceptorState.interceptRules.add(requestId);
    } else {
      interceptorState.interceptRules.delete(requestId);
      interceptorState.mockResponses.delete(requestId);
    }
    
    // 更新请求状态
    const existingRequest = interceptorState.requests.get(requestId);
    if (existingRequest) {
      existingRequest.isIntercepted = isIntercepted;
      if (!isIntercepted) {
        existingRequest.isMocked = false;
        existingRequest.mockData = undefined;
      }
    }
    
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'UPDATE_MOCK_RESPONSE') {
    const { requestId, mockData, statusCode, headers } = request.payload;
    
    interceptorState.mockResponses.set(requestId, {
      statusCode: statusCode || 200,
      headers: headers || { 'Content-Type': 'application/json' },
      body: mockData
    });
    
    // 更新请求状态
    const existingRequest = interceptorState.requests.get(requestId);
    if (existingRequest) {
      existingRequest.isMocked = true;
      existingRequest.mockData = mockData;
      existingRequest.mockStatusCode = statusCode;
      existingRequest.mockHeaders = headers;
    }
    
    sendResponse({ success: true });
    return true;
  }

  if (request.type === 'GET_MOCK_RESPONSE') {
    const { requestId } = request.payload;
    const mockResponse = interceptorState.mockResponses.get(requestId);
    
    if (mockResponse) {
      sendResponse({
        mockData: mockResponse.body,
        statusCode: mockResponse.statusCode,
        statusText: getStatusText(mockResponse.statusCode),
        headers: mockResponse.headers
      });
    } else {
      sendResponse(null);
    }
    return true;
  }

  if (request.type === 'GET_CURRENT_REQUESTS') {
    const requests = Array.from(interceptorState.requests.values())
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, 100);
    
    console.log('Sending current requests:', requests.length);
    sendResponse({ requests });
    return true;
  }

  if (request.type === 'CONTENT_SCRIPT_LOADED') {
    console.log('Content script loaded for:', request.payload.url);
    sendResponse({ success: true });
    return true;
  }
});

// 初始化扩展存储
chrome.runtime.onStartup.addListener(() => {
  chrome.storage.local.get(['effikit_settings'], (result) => {
    if (!result.effikit_settings) {
      chrome.storage.local.set({
        effikit_settings: {
          networkMonitorEnabled: true,
          responseEditingEnabled: false,
          performanceMonitorEnabled: true,
          automationEnabled: false
        }
      });
    }
  });
}); 