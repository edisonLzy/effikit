export interface CapturedHttpRequest {
  url: string;
  method: string;
  timestamp: number;
  isIntercepted: boolean;
  isMocked: boolean;
  mockData?: string;
}

export interface MockResponse {
  statusCode: number;
  body: string;
}

export interface RequestInterceptorState {
  requests: CapturedHttpRequest[];
  interceptedUrls: Set<string>;
  mockResponses: Map<string, MockResponse>;
}


// share with background.ts
export interface CapturedRequest {
  url: string; // origin + pathname
  method: string;
  timestamp: number;
  tabUrl: string; // Add tabUrl to differentiate requests by page
}

export interface CapturedRequestMessage {
  action: 'NEW_REQUEST_FOUND'
  request: CapturedRequest;
}

export type UpsertMockResponsePayload = {
  enabled: boolean
  mockData: string // stringified json
  url: string
}

export interface UpsertMockResponseMessage {
  action: 'UPSERT_MOCK_RESPONSE'
  payload: UpsertMockResponsePayload
}

export interface GetCurrentRequestsMessage {
  action: 'GET_CURRENT_REQUESTS'
  payload: {
    tabUrl: string
  }
}

export interface ClearRequestsMessage {
  action: 'CLEAR_REQUESTS'
  payload: {
    tabUrl: string
  }
}

export interface TabChangedMessage {
  action: 'TAB_CHANGED';
  payload: {
    tabUrl: string;
  };
}