import {normalizeUrl} from './normilizeUrl';
import {getCodeByStatus} from './registerMock';
import {ALWAYS_TIME} from './constants';
import {CodeStatus, HttpMethod, Times, ResponseData, Options, UrlOrRegex, ResponseHeaders} from './types';
import {saveMock} from './utils';
import { getAllRegisteredMocks } from './registeredMocks'

type DataBuilderProps = {
  method: HttpMethod;
  statusCode: CodeStatus;
  isRegex: boolean;
  url: UrlOrRegex;
  originalUrl: UrlOrRegex;
  times: Times;
  options: Options;
};

const dataBuilder =
  ({method, statusCode, url, originalUrl, isRegex, times, options}: DataBuilderProps) =>
  (data?: ResponseData, headers?: ResponseHeaders) => {
    if (data && typeof data === 'string') {
      throw new Error('response data should be JSON. Use byName method to set named mock');
    }

    const numberStatusCode = getCodeByStatus(statusCode);

    let resultData: ResponseData | undefined = data;
    let resultStatusCode: number | undefined = numberStatusCode;
    let resultHeaders: ResponseHeaders | undefined = headers;
    if (!resultData && !(url instanceof RegExp)) {
      if (statusCode !== 'success' && statusCode !== 'error') {
        throw new Error('status should not be number if data is missing');
      }
      const result = getAllRegisteredMocks().find(
        m => m.url.toString() === url.toString() && m.method === method && m.status === numberStatusCode
      );
      if (result) {
        resultData = result.data;
        resultStatusCode = result.status;
        resultHeaders = result.headers;
      }
    }

    if (!resultData || !resultStatusCode) {
      throw new Error('Data for mock was not found');
    }

    saveMock({
      data: resultData,
      status: resultStatusCode,
      options,
      isRegex,
      method,
      times,
      url,
      originalUrl,
      originalStatus: statusCode,
      headers: resultHeaders,
    });
  };

type StatusBuilder = {
  error: (data?: ResponseData, headers?: ResponseHeaders) => void;
  success: (data?: ResponseData, headers?: ResponseHeaders) => void;
  withStatus: (status: number, data: ResponseData, headers?: ResponseHeaders) => void;
  withDelay: (delay: number) => StatusBuilder;
};

const methodBuilder =
  (method: HttpMethod, options: Options = {}) =>
  (url: UrlOrRegex, times: Times = ALWAYS_TIME): StatusBuilder => {
    if (!(url instanceof RegExp) && (!url.startsWith('http') && !url.startsWith('/'))) {
      throw new Error('Url should start with http/https or /')
    }

    const urlOrRegex: string | RegExp = url instanceof RegExp ? url : normalizeUrl(url);
    const isRegex = url instanceof RegExp;
    const params = {method, url: urlOrRegex, isRegex, times, options, originalUrl: url};

    return {
      error: dataBuilder({statusCode: 'error', ...params}),
      success: dataBuilder({statusCode: 'success', ...params}),
      withStatus: (status: number, data: ResponseData, headers?: ResponseHeaders) =>
        dataBuilder({statusCode: status, ...params})(data, headers),
      withDelay: (delay: number) => methodBuilder(method, {delay})(url, times),
    };
  };

type MockMethodBuilder = ReturnType<typeof methodBuilder>;

export type MockType = {
  get: MockMethodBuilder;
  post: MockMethodBuilder;
  patch: MockMethodBuilder;
  put: MockMethodBuilder;
  delete: MockMethodBuilder;
};

export const Mock: MockType = {
  get: methodBuilder('get'),
  post: methodBuilder('post'),
  patch: methodBuilder('patch'),
  put: methodBuilder('put'),
  delete: methodBuilder('delete'),
};
