import {ALWAYS_TIME} from './constants';
import {HttpMethod, PreparedMock, StoredData} from './types';
import {getMockPairsFromLocalStorage} from './utils';

export const getMocksFromStorage = (): PreparedMock[] => {
  const preparedMocks: PreparedMock[] = [];
  for (const {lsKey, method, url, value, times} of getMockPairsFromLocalStorage()) {
    const actualTimes = times === ALWAYS_TIME ? ALWAYS_TIME : Number(times);
    const {status, data, isRegex, options, originalUrl, originalStatus, headers}: StoredData = JSON.parse(value);

    const urlOrRegex: string | RegExp = isRegex ? new RegExp(url.slice(1, url.length - 1)) : url;
    preparedMocks.push({
      lsKey,
      method: method as HttpMethod,
      times: actualTimes,
      urlOrRegex,
      status,
      data,
      options,
      originalUrl: isRegex ? new RegExp(originalUrl) : originalUrl,
      originalStatus,
      headers,
    });
  }

  return preparedMocks
    .sort((a, b) => String(a.times).localeCompare(String(b.times)))
    .sort((a, b) => String(a).localeCompare(String(b)));
};
