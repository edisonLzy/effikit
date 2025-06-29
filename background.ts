// background.ts

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
}

interface MockResponse {
  statusCode: number;
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
      if (chrome.runtime.lastError) {
        chrome.runtime.lastError;
      }
    });
  } catch (error) {
    // Ignore errors
  }
}

// 监听web请求 - 仅用于观察
chrome.webRequest.onBeforeRequest.addListener(
  (details) => {
    if (details.url.startsWith('chrome-extension://') || details.url.startsWith('data:')) {
      return;
    }

    const requestId = generateRequestId(details.method, details.url);
    
    const request: InterceptedRequest = {
      id: requestId,
      method: details.method,
      url: details.url,
      timestamp: Date.now(),
      isIntercepted: interceptorState.interceptRules.has(requestId),
      isMocked: interceptorState.mockResponses.has(requestId)
    };
    
    interceptorState.requests.set(requestId, request);
    
    sendMessageToSidebar({
      type: 'NEW_REQUEST_INTERCEPTED',
      payload: {
        requestId: requestId,
        method: details.method,
        url: details.url,
        timestamp: Date.now()
      }
    });
  },
  { urls: ['<all_urls>'] }
);

// 更新declarativeNetRequest规则
async function updateDeclarativeNetRequestRules() {
  const rules: chrome.declarativeNetRequest.Rule[] = [];
  let ruleId = 1;

  for (const [requestId, mockResponse] of interceptorState.mockResponses.entries()) {
    const [method, url] = requestId.split(/:(.*)/s);
    const dataUrl = `data:application/json;charset=utf-8,${encodeURIComponent(mockResponse.body)}`;
    
    rules.push({
      id: ruleId++,
      priority: 1,
      action: {
        type: 'redirect',
        redirect: {
          url: dataUrl
        }
      },
      condition: {
        urlFilter: url,
        resourceTypes: ['main_frame', 'sub_frame', 'xmlhttprequest', 'script', 'image', 'font', 'object', 'stylesheet', 'media', 'websocket', 'other'],
        methods: [method]
      }
    });
  }

  const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
  const existingRuleIds = existingRules.map(rule => rule.id);

  await chrome.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: existingRuleIds,
    addRules: rules
  });
}

// 监听来自侧边栏的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  (async () => {
    if (request.type === 'UPDATE_INTERCEPT_RULE') {
      const { requestId, isIntercepted } = request.payload;
      if (isIntercepted) {
        interceptorState.interceptRules.add(requestId);
      } else {
        interceptorState.interceptRules.delete(requestId);
        interceptorState.mockResponses.delete(requestId); // Also remove mock response
      }
      await updateDeclarativeNetRequestRules();
      sendResponse({ success: true });
    } else if (request.type === 'UPDATE_MOCK_RESPONSE') {
      const { requestId, mockData, statusCode } = request.payload;
      interceptorState.mockResponses.set(requestId, {
        statusCode: statusCode || 200,
        body: mockData
      });
      
      const existingRequest = interceptorState.requests.get(requestId);
      if (existingRequest) {
        existingRequest.isMocked = true;
      }
      
      await updateDeclarativeNetRequestRules();
      sendResponse({ success: true });
    } else if (request.type === 'GET_CURRENT_REQUESTS') {
      const requests = Array.from(interceptorState.requests.values())
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 100);
      sendResponse({ requests });
    }
  })();
  return true; // Indicates that the response is sent asynchronously
});

// 清除所有规则
chrome.runtime.onStartup.addListener(async () => {
    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);
    if (existingRuleIds.length > 0) {
        await chrome.declarativeNetRequest.updateDynamicRules({
            removeRuleIds: existingRuleIds,
            addRules: []
        });
    }
});