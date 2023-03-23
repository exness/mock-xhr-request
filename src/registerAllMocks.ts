import MockAdapter, {RequestHandler} from './axios-mock-adapter/types';
import {getDelayResponseTime} from './delayResponse';
import {getMocksFromStorage} from './getMocksFromStorage';
import {ALWAYS_TIME, OPTIONAL_SEARCH_KEY, PARAM_KEY, REQUIRED_SEARCH_KEY} from './constants';
import {makeDelayPromise} from './utils';

const getFullUrlToMock = (baseUrl: string, url: string): string => {
  if (url.startsWith(baseUrl)) {
    return url;
  }
  if (!url.startsWith('/')) {
    return baseUrl + (baseUrl.endsWith('/') ? '' : '/') + url;
  }
  const {origin} = new URL(baseUrl);

  return `${origin}${url}`;
};

const escapeRegExp = (str: string): string => {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
};

const paramRegex = new RegExp(PARAM_KEY, 'g');
const optionalSearchRegex = new RegExp(OPTIONAL_SEARCH_KEY);
const requiredSearchRegex = new RegExp(REQUIRED_SEARCH_KEY);

const getRegexPattern = (baseUrl: string, url: string): string | RegExp => {
  const finalUrl = getFullUrlToMock(baseUrl, url);
  if (![PARAM_KEY, OPTIONAL_SEARCH_KEY, REQUIRED_SEARCH_KEY].some(x => finalUrl.includes(x))) {
    return finalUrl;
  }
  const regexStr = escapeRegExp(finalUrl)
    .replace(optionalSearchRegex, '((\\?).+)?')
    .replace(requiredSearchRegex, '((\\?).+)')
    .replace(paramRegex, '[\\w-]+');

  return new RegExp(`${regexStr}$`);
};

export const registerAllMocks = (adapter: MockAdapter, baseUrl: string): void => {
  const storedMocks = getMocksFromStorage();
  const globalDelayResponseTime = getDelayResponseTime();

  for (const {method, times, urlOrRegex, status, data, options, headers} of storedMocks) {
    let requestHandler: RequestHandler;
    const finalUrlOrRegex = urlOrRegex instanceof RegExp ? urlOrRegex : getRegexPattern(baseUrl, urlOrRegex);

    switch (method) {
      case 'get':
        requestHandler = adapter.onGet(finalUrlOrRegex);
        break;
      case 'post':
        requestHandler = adapter.onPost(finalUrlOrRegex);
        break;
      case 'put':
        requestHandler = adapter.onPut(finalUrlOrRegex);
        break;
      case 'patch':
        requestHandler = adapter.onPatch(finalUrlOrRegex);
        break;
      case 'delete':
        requestHandler = adapter.onDelete(finalUrlOrRegex);
        break;
    }

    const replyFunction = () => {
      const result = [status, data];
      if (headers) {
        result.push(headers);
      }
      const delayMs = options.delay || globalDelayResponseTime;
      if (delayMs) {
        return makeDelayPromise(delayMs, result);
      }
      return result;
    };

    if (times !== ALWAYS_TIME) {
      requestHandler.replyOnce(replyFunction);
    } else {
      requestHandler.reply(replyFunction);
    }
  }
};
