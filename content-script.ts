// 内容脚本：监听页面中的网络请求
console.log('EffiKit content script loaded');

// 记录原始的 fetch 和 XMLHttpRequest
const originalFetch = window.fetch;
const originalXHROpen = XMLHttpRequest.prototype.open;
const originalXHRSend = XMLHttpRequest.prototype.send;

// 生成请求ID
function generateRequestId(method: string, url: string): string {
  return `${method}:${url}`;
}

// 发送请求信息到扩展
function reportRequest(method: string, url: string, headers?: Record<string, string>, body?: string) {
  try {
    chrome.runtime.sendMessage({
      type: 'NEW_REQUEST_INTERCEPTED',
      payload: {
        requestId: generateRequestId(method, url),
        method: method,
        url: url,
        headers: headers || {},
        body: body,
        timestamp: Date.now()
      }
    }).catch((error) => {
      console.warn('Failed to report request to extension:', error);
    });
  } catch (error) {
    console.warn('Extension context not available:', error);
  }
}

// 检查是否有mock响应
async function checkMockResponse(method: string, url: string): Promise<any> {
  try {
    const response = await chrome.runtime.sendMessage({
      type: 'GET_MOCK_RESPONSE',
      payload: {
        requestId: generateRequestId(method, url)
      }
    });
    return response;
  } catch (error) {
    return null;
  }
}

// 拦截 fetch 请求
window.fetch = async function(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const method = init?.method || 'GET';
  
  // 提取请求头
  const headers: Record<string, string> = {};
  if (init?.headers) {
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, key) => {
        headers[key] = value;
      });
    } else if (Array.isArray(init.headers)) {
      init.headers.forEach(([key, value]) => {
        headers[key] = value;
      });
    } else {
      Object.entries(init.headers).forEach(([key, value]) => {
        headers[key] = String(value);
      });
    }
  }
  
  // 提取请求体
  let body: string | undefined;
  if (init?.body) {
    if (typeof init.body === 'string') {
      body = init.body;
    } else if (init.body instanceof FormData) {
      body = '[FormData]';
    } else if (init.body instanceof URLSearchParams) {
      body = init.body.toString();
    } else {
      body = '[Binary Data]';
    }
  }
  
  // 报告请求
  reportRequest(method.toUpperCase(), url, headers, body);
  
  // 检查是否有mock响应
  const mockResponse = await checkMockResponse(method.toUpperCase(), url);
  if (mockResponse && mockResponse.mockData) {
    // 返回mock响应
    const response = new Response(mockResponse.mockData, {
      status: mockResponse.statusCode || 200,
      statusText: mockResponse.statusText || 'OK',
      headers: {
        'Content-Type': 'application/json',
        ...mockResponse.headers
      }
    });
    return response;
  }
  
  // 执行原始请求
  return originalFetch.call(this, input, init);
};

// 拦截 XMLHttpRequest
XMLHttpRequest.prototype.open = function(method: string, url: string | URL, async?: boolean, user?: string | null, password?: string | null) {
  // 存储请求信息
  (this as any)._effikit_method = method.toUpperCase();
  (this as any)._effikit_url = typeof url === 'string' ? url : url.href;
  (this as any)._effikit_headers = {};
  
  return originalXHROpen.call(this, method, url, async ?? true, user, password);
};

// 重写 setRequestHeader 来捕获请求头
const originalSetRequestHeader = XMLHttpRequest.prototype.setRequestHeader;
XMLHttpRequest.prototype.setRequestHeader = function(name: string, value: string) {
  (this as any)._effikit_headers = (this as any)._effikit_headers || {};
  (this as any)._effikit_headers[name] = value;
  
  return originalSetRequestHeader.call(this, name, value);
};

// 拦截 send 方法
XMLHttpRequest.prototype.send = async function(body?: Document | XMLHttpRequestBodyInit | null) {
  const method = (this as any)._effikit_method || 'GET';
  const url = (this as any)._effikit_url;
  const headers = (this as any)._effikit_headers || {};
  
  let bodyString: string | undefined;
  if (body) {
    if (typeof body === 'string') {
      bodyString = body;
    } else if (body instanceof FormData) {
      bodyString = '[FormData]';
    } else if (body instanceof URLSearchParams) {
      bodyString = body.toString();
    } else if (body instanceof Document) {
      bodyString = '[Document]';
    } else {
      bodyString = '[Binary Data]';
    }
  }
  
  // 报告请求
  if (url) {
    reportRequest(method, url, headers, bodyString);
    
    // 检查是否有mock响应
    const mockResponse = await checkMockResponse(method, url);
    if (mockResponse && mockResponse.mockData) {
      // 模拟XHR响应
      Object.defineProperty(this, 'readyState', { value: 4, writable: false });
      Object.defineProperty(this, 'status', { value: mockResponse.statusCode || 200, writable: false });
      Object.defineProperty(this, 'statusText', { value: mockResponse.statusText || 'OK', writable: false });
      Object.defineProperty(this, 'responseText', { value: mockResponse.mockData, writable: false });
      Object.defineProperty(this, 'response', { value: mockResponse.mockData, writable: false });
      
             // 触发事件
       if (this.onreadystatechange) {
         setTimeout(() => this.onreadystatechange?.(new ProgressEvent('readystatechange')), 0);
       }
       if (this.onload) {
         setTimeout(() => this.onload?.(new ProgressEvent('load')), 0);
       }
      return;
    }
  }
  
  return originalXHRSend.call(this, body);
};

// 监听页面卸载事件，清理资源
window.addEventListener('beforeunload', () => {
  // 恢复原始方法（虽然页面即将卸载，但这是个好习惯）
  window.fetch = originalFetch;
  XMLHttpRequest.prototype.open = originalXHROpen;
  XMLHttpRequest.prototype.send = originalXHRSend;
});

// 通知扩展内容脚本已加载
chrome.runtime.sendMessage({
  type: 'CONTENT_SCRIPT_LOADED',
  payload: {
    url: window.location.href,
    timestamp: Date.now()
  }
}).catch(() => {
  // 扩展可能未准备好，忽略错误
}); 