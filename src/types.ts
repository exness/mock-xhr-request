export type HttpMethod = keyof DataByMethod;
export type ResponseData = unknown;
export type UrlOrRegex = string | RegExp;
export type DataByMethod = {
  get?: RegisteredMock;
  post?: RegisteredMock;
  patch?: RegisteredMock;
  put?: RegisteredMock;
  delete?: RegisteredMock;
};
export type Options = {
  delay?: number;
};
export type StoredData = {
  data: ResponseData;
  status: number;
  isRegex: boolean;
  options: Options;
  originalUrl: string;
  originalStatus: CodeStatus;
  headers?: ResponseHeaders
};
export type PreparedMock = {
  method: HttpMethod;
  status: number;
  originalStatus: CodeStatus;
  urlOrRegex: UrlOrRegex;
  times: Times;
  headers?: ResponseHeaders;
  data: ResponseData;
  options: Options;
  originalUrl: UrlOrRegex
};

export type RegisteredMock = {
  method: HttpMethod;
  status: number;
  originalStatus: CodeStatus;
  url: UrlOrRegex;
  originalUrl: UrlOrRegex;
  data: ResponseData;
  name?: string;
  widgetName?: string;
  headers?: ResponseHeaders;
};

export type CodeStatus = number | 'success' | 'error';
export type Times = number | 'always';

export type ResponseHeaders = Record<string, string | number | boolean>

export type WrapAdapterOptions = {
  baseUrl?: string
  autoDisable?: boolean | number
}

export type RegisterMockPayload = {
  urlOrRegex: UrlOrRegex,
  method: HttpMethod,
  status: CodeStatus,
  data: ResponseData,
  name?: string,
  headers?: ResponseHeaders
}
export type RegisterMockArgs = [UrlOrRegex, HttpMethod, CodeStatus, ResponseData]
export type RegisterFunctionArgs = [() => Promise<RegisterMockPayload> | RegisterMockPayload]

