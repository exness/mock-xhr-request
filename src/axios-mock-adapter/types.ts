import { AxiosAdapter, AxiosInstance, AxiosRequestConfig } from 'axios';

type CallbackResponseSpecFunc = (
  config: AxiosRequestConfig
) => any[] | Promise<any[]>;

type ResponseSpecFunc = <T = any>(
  statusOrCallback: number | CallbackResponseSpecFunc,
  data?: T,
  headers?: any
) => MockAdapter;

export interface RequestHandler {
  reply: ResponseSpecFunc;
  replyOnce: ResponseSpecFunc;
  passThrough(): MockAdapter;
  abortRequest(): MockAdapter;
  abortRequestOnce(): MockAdapter;
  networkError(): MockAdapter;
  networkErrorOnce(): MockAdapter;
  timeout(): MockAdapter;
  timeoutOnce(): MockAdapter;
}

interface MockAdapterOptions {
  delayResponse?: number;
  onNoMatch?: 'passthrough' | 'throwException';
}

interface AsymmetricMatcher {
  // eslint-disable-next-line @typescript-eslint/ban-types
  asymmetricMatch: Function;
}

interface RequestDataMatcher {
  [index: string]: any;
  params?: {
    [index: string]: any;
  };
}

interface HeadersMatcher {
  [header: string]: string;
}

type AsymmetricHeadersMatcher = AsymmetricMatcher | HeadersMatcher;

type AsymmetricRequestDataMatcher = AsymmetricMatcher | RequestDataMatcher;

type RequestMatcherFunc = (
  matcher?: string | RegExp,
  body?: string | AsymmetricRequestDataMatcher,
  headers?: AsymmetricHeadersMatcher
) => RequestHandler;

declare class MockAdapter {
  constructor(axiosInstance: AxiosInstance, options?: MockAdapterOptions);

  originalRequestFunc() : AxiosAdapter;
  adapter(): AxiosAdapter;
  reset(): void;
  resetHandlers(): void;
  restore(): void;

  onGet: RequestMatcherFunc;
  onPost: RequestMatcherFunc;
  onPut: RequestMatcherFunc;
  onHead: RequestMatcherFunc;
  onDelete: RequestMatcherFunc;
  onPatch: RequestMatcherFunc;
  onList: RequestMatcherFunc;
  onOptions: RequestMatcherFunc;
  onAny: RequestMatcherFunc;
  onLink: RequestMatcherFunc;
  onUnlink: RequestMatcherFunc;
}

export default MockAdapter
