import { CodeStatus, HttpMethod, Options, ResponseData, ResponseHeaders, StoredData, Times, UrlOrRegex } from './types'
import { MOCK_PREFIX, ALWAYS_TIME } from './constants'

export const makeDelayPromise = <T>(delayMs: number, result: T): Promise<T> => {
  return new Promise(res => {
    setTimeout(() => {
      res(result);
    }, delayMs);
  });
};

export function* getLocalStorageKeys(): Generator<string> {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    yield key;
  }
}

export function* getLocalStorageKeyValue(): Generator<[string, string]> {
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    const value = localStorage.getItem(key);
    if(!value) continue;
    yield [key, value];
  }
}

type SavedMock = {
  method: HttpMethod;
  data: ResponseData;
  url: UrlOrRegex;
  originalUrl: UrlOrRegex;
  isRegex: boolean;
  times: Times;
  options: Options;
  status: number;
  originalStatus: CodeStatus;
  headers?: ResponseHeaders;
};

// example __MOCK__(post)[always]/accounts/info
export const stringifyMockData = (mockMethod: HttpMethod, times: Times, url: string | RegExp): string =>
  `${MOCK_PREFIX}(${mockMethod})[${times}]${url}`;

export const saveMock = ({method, status, url, isRegex, times, options, data, originalUrl, originalStatus, headers}: SavedMock): void => {
  const storedData: StoredData = {
    data,
    status,
    options,
    isRegex,
    originalUrl: originalUrl.toString(),
    originalStatus,
    headers
  };
  localStorage.setItem(stringifyMockData(method, times, url), JSON.stringify(storedData));
};

type ParsedMock = {
  lsKey: string,
  method: string,
  times: string,
  url: string,
  value: string
}

const keyRegex = new RegExp(`${MOCK_PREFIX}\\((\\w+)\\)\\[(${ALWAYS_TIME}|\\d+)\\](.+)`)

export function* getMockPairsFromLocalStorage(): Generator<ParsedMock> {
  for(const [lsKey, value] of getLocalStorageKeyValue()) {
    if (!lsKey.startsWith(MOCK_PREFIX)) {
      continue;
    }
    const regexResult = keyRegex.exec(lsKey);
    if (regexResult === null) {
      throw new Error(`Mock key ${lsKey} is invalid`);
    }
    const [, method, times, url] = regexResult;

    yield {
      lsKey,
      method,
      times,
      url,
      value
    }
  }
}

