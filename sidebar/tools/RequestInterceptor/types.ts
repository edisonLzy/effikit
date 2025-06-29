export interface HttpRequest {
  id: string;
  method: string;
  url: string;
  timestamp: number;
  isIntercepted: boolean;
  isMocked: boolean;
  mockData?: string;
  originalRequest?: {
    headers?: Record<string, string>;
    body?: string;
  };
}

export interface MockResponse {
  statusCode: number;
  headers: Record<string, string>;
  body: string;
}

export interface InterceptedRequestData {
  requestId: string;
  method: string;
  url: string;
  headers: Record<string, string>;
  body?: string;
  timestamp: number;
}

export interface RequestInterceptorState {
  requests: HttpRequest[];
  interceptedUrls: Set<string>;
  mockResponses: Map<string, MockResponse>;
} 