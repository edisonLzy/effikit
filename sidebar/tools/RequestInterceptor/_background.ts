
import type { CapturedRequest, CapturedRequestMessage, UpsertMockResponseMessage, UpsertMockResponsePayload, GetCurrentRequestsMessage, TabChangedMessage, ClearRequestsMessage } from './types';

export function initialRequestInterceptorBackground() {
    
  let capturedRequestsMap: Record<string, CapturedRequest[]> = {}; // Store requests per tab URL

  console.log('capturedRequestsMap');

  // Load requests from storage on startup
  chrome.storage.local.get(['capturedRequestsMap'], (result) => {
    if (result.capturedRequestsMap) {
      capturedRequestsMap = result.capturedRequestsMap;
    }
  });

  // Helper to extract URI from URL
  function getUriFromUrl(url: string): string {
    try {
      const urlObj = new URL(url);
      return urlObj.origin + urlObj.pathname;
    } catch {
      return url; // Fallback if URL is invalid
    }
  }

  // onBeforeRequest: Capture request details before it's sent
  chrome.webRequest.onBeforeRequest.addListener(
    (details) => { // Made async to use chrome.tabs.get

      const { tabId, url: requestUrl } = details;

      if (tabId === -1) return undefined; // Ignore requests not associated with a tab

      // Check if the URI has a file extension (e.g., .js, .css, .png)
      const hasFileExtension = /\.[a-zA-Z0-9]+([?#].*)?$/.test(requestUrl);
      if (hasFileExtension) {
        return undefined; // Ignore requests with file extensions
      }

      chrome.tabs.get(tabId, (tab) => {
        //
        const tabUrl = tab?.url;
        //
        if(!tabUrl) return;
        if (tabUrl.includes('chrome://')) return;
        //
        const normalizedTabUrl = getUriFromUrl(tabUrl);
        //
        const { method, url } = details;
        const normalizedUrl = getUriFromUrl(url);
        const newRequest: CapturedRequest = {
          url: normalizedUrl,
          method,
          tabUrl, // Include tabId
          timestamp: Date.now(),
        };
        const message: CapturedRequestMessage = {
          action: 'NEW_REQUEST_FOUND',
          request: newRequest
        };
        chrome.runtime.sendMessage(message);
        //
        if (!capturedRequestsMap[normalizedTabUrl]) {
          capturedRequestsMap[normalizedTabUrl] = [];
        }
        // Check if the request already exists to prevent duplicates
        const isDuplicate = capturedRequestsMap[normalizedTabUrl].some(
          (existingRequest) => existingRequest.url === normalizedUrl && existingRequest.method === method
        );

        if (!isDuplicate) {
          capturedRequestsMap[normalizedTabUrl] = [newRequest, ...capturedRequestsMap[normalizedTabUrl]];
        }
        chrome.storage.local.set({ capturedRequestsMap }); // Persist to storage
      });
      return undefined;
    },
    {
      urls: ['<all_urls>'],
      types: ['xmlhttprequest']
    },
  );

  // 监听来自侧边栏的消息
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {

    const messageFromClient = request as UpsertMockResponseMessage | GetCurrentRequestsMessage | ClearRequestsMessage;

    if (messageFromClient.action === 'UPSERT_MOCK_RESPONSE') {
      console.log('Received updateHttpRequestMockRules message. Rules:', messageFromClient.payload);
      upsertDeclarativeNetRequestRules(messageFromClient.payload)
        .then(() => {
          sendResponse({ success: true });
        })
        .catch((error) => {
          console.log('error', error);
          sendResponse({ success: false, error: error.message });
        });
      return true;
    } 

    if (messageFromClient.action === 'GET_CURRENT_REQUESTS') {
      const { tabUrl } = request.payload;
      sendResponse({ requests: capturedRequestsMap[tabUrl] || [] });
      return true;
    } 

    if (messageFromClient.action === 'CLEAR_REQUESTS') {
      const { tabUrl } = messageFromClient.payload;
      if (tabUrl && capturedRequestsMap[tabUrl]) {
        delete capturedRequestsMap[tabUrl];
        chrome.storage.local.set({ capturedRequestsMap });
        sendResponse({ success: true });
      } else {
        sendResponse({ success: false, error: 'Tab URL not found or requests already empty.' });
      }
      return true;
    }
  });

  // 监听 tab 切换和更新
  chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, (tab) => {
      if (tab.url) {
        // 
        const normalizedTabUrl = getUriFromUrl(tab.url);
        if (normalizedTabUrl.includes('chrome://')) return;
        //
        const message: TabChangedMessage = {
          action: 'TAB_CHANGED',
          payload: { tabUrl: normalizedTabUrl }
        };
        chrome.runtime.sendMessage(message);
      }
    });
  });

  chrome.tabs.onUpdated.addListener((_, changeInfo, tab) => {
    if (changeInfo.url && tab.active) {
      //
      const normalizedTabUrl = getUriFromUrl(changeInfo.url);
      if (normalizedTabUrl.includes('chrome://')) return;
      //
      const message: TabChangedMessage = {
        action: 'TAB_CHANGED',
        payload: { tabUrl: normalizedTabUrl }
      };
      chrome.runtime.sendMessage(message);
    }
  });

  // Helper function to create a declarativeNetRequest rule from a mock rule
  function stringToHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash) + 1; // Ensure it's a positive integer and at least 1
  }

  function createDeclarativeNetRequestRule(upsertMockResponsePayload: UpsertMockResponsePayload): chrome.declarativeNetRequest.Rule | null {
    if (!upsertMockResponsePayload.enabled) {
      return null; // Only create rules for enabled mock rules
    }

    const { mockData, url } = upsertMockResponsePayload;

    // Base64 encode the response body
    const contentType = 'application/json'; // Default content type
    // To handle Unicode characters correctly, we need to encode them first.
    const encodedBody = btoa(unescape(encodeURIComponent(mockData)));
    const dataUrl = `data:${contentType};base64,${encodedBody}`;
    //
    const id = stringToHash(url);

    return {
      id, // Use the hash function to generate a numeric ID
      priority: 1, // Set a priority for the rule
      action: {
        type: chrome.declarativeNetRequest.RuleActionType.REDIRECT,
        redirect: {
          url: dataUrl,
        },
      },
      condition: {
        urlFilter: `|${url}|`,
        resourceTypes: [chrome.declarativeNetRequest.ResourceType.XMLHTTPREQUEST],
      },
    };
  }

  async function upsertDeclarativeNetRequestRules(upsertMockResponsePayload: UpsertMockResponsePayload) {
    console.log('Updating declarativeNetRequest rules...');

    const upsertRule = createDeclarativeNetRequestRule(upsertMockResponsePayload);

    const existingRules = await chrome.declarativeNetRequest.getDynamicRules();
    const existingRuleIds = existingRules.map(rule => rule.id);

    await chrome.declarativeNetRequest.updateDynamicRules({
      removeRuleIds: existingRuleIds,
      addRules: upsertRule ? [upsertRule] : [],
    });

    console.log('DeclarativeNetRequest rules update complete.');
    console.log('Removed rules:', existingRuleIds);
    console.log('Added rules:', upsertRule);
  }

  chrome.declarativeNetRequest.onRuleMatchedDebug.addListener(
    (details) => {
      console.log('Rule matched:', details);
    }
  );
}
