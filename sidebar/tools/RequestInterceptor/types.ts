export interface HttpRequest {
  id: string;
  method: string;
  url: string;
  timestamp: number;
  isIntercepted: boolean;
  isMocked: boolean;
  mockData?: string;
}

export interface MockResponse {
  statusCode: number;
  body: string;
}

export interface InterceptedRequestData {
  requestId: string;
  method: string;
  url:string;
  timestamp: number;
}

export interface RequestInterceptorState {
  requests: HttpRequest[];
  interceptedUrls: Set<string>;
  mockResponses: Map<string, MockResponse>;
}
