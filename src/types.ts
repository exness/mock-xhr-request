import {applyReady} from './applyReady';
import {clearAll} from './clearAll';
import {clearMock} from './clearMock';
import {clearDelayResponseTime} from './delayResponse';
import {setDelayResponseTime} from './delayResponse';
import {disable} from './enable';
import {enable} from './enable';
import {getRegisteredMocks, getSetMocks} from './printing';
import {applySnapshot, snapshot} from './serializers';

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
  headers?: ResponseHeaders;
};
export type PreparedMock = {
  lsKey: string
  method: HttpMethod;
  status: number;
  originalStatus: CodeStatus;
  urlOrRegex: UrlOrRegex;
  times: Times;
  headers?: ResponseHeaders;
  data: ResponseData;
  options: Options;
  originalUrl: UrlOrRegex;
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

export type ResponseHeaders = Record<string, string | number | boolean>;

export type DefaultOptions = {
  successStatusCode?: number;
  errorStatusCode?: number;
  baseUrl?: string;
  autoDisable?: boolean | number;
};

export type RequiredDefaultOptions = Required<Omit<DefaultOptions, 'autoDisable'>> & {
  disableTimeMs: number;
};

export type RegisterMockPayload = {
  urlOrRegex: UrlOrRegex;
  method: HttpMethod;
  status: CodeStatus;
  data: ResponseData;
  name?: string;
  headers?: ResponseHeaders;
};
export type RegisterMockArgs = [UrlOrRegex, HttpMethod, CodeStatus, ResponseData];
export type RegisterFunctionArgs = [() => Promise<RegisterMockPayload> | RegisterMockPayload];

export type StatusBuilder = {
  error: (data?: ResponseData, headers?: ResponseHeaders) => void;
  success: (data?: ResponseData, headers?: ResponseHeaders) => void;
  withStatus: (status: number, data: ResponseData, headers?: ResponseHeaders) => void;
  withDelay: (delay?: number) => StatusBuilder;
};

type MockMethodBuilder = (url: UrlOrRegex, times?: Times) => StatusBuilder;

export type MockType = {
  get: MockMethodBuilder;
  post: MockMethodBuilder;
  patch: MockMethodBuilder;
  put: MockMethodBuilder;
  delete: MockMethodBuilder;
};

export type MockXHRType = MockType & {
  clearAll: typeof clearAll;
  clearMock: typeof clearMock;
  setDelayResponseTime: typeof setDelayResponseTime;
  clearDelayResponseTime: typeof clearDelayResponseTime;
  snapshot: typeof snapshot;
  applySnapshot: typeof applySnapshot;
  getSetMocks: typeof getSetMocks;
  getRegisteredMocks: typeof getRegisteredMocks;
  enable: typeof enable;
  disable: typeof disable;
  applyReady: typeof applyReady;
};
