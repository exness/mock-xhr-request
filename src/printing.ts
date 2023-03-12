import {getMocksFromStorage} from './getMocksFromStorage';
import { ResponseData } from './types';
import {normalizeUrl} from './normilizeUrl';
import { getAllRegisteredMocks } from './registeredMocks'

export const getSetMocks = (): Record<string, ResponseData> => {
  const allMocks = getMocksFromStorage();

  return allMocks.reduce((acc, {originalStatus, method, times, originalUrl, data, options: {delay}}, i) => {
    const key = `${i + 1} ${originalUrl} ${method} ${originalStatus} T:${times} D:${delay ?? 0}`;
    return {
      ...acc,
      [key]: data,
    };
  }, {});
};

export const getRegisteredMocks = (url?: string): Record<string, ResponseData> => {
  const globalMocks = getAllRegisteredMocks()
  const finalUrl = url ? normalizeUrl(url) : undefined;
  const allGlobalMocks = globalMocks.map((x,i) => ({...x, index: i}));
  let finalMocks = allGlobalMocks
  if (finalUrl) {
    const strictEqualIndexes: number[] = [];
    const substringIndexes: number[] = [];
    globalMocks.forEach((mock, index) => {
      if (mock.url === finalUrl || mock.name === finalUrl) {
        strictEqualIndexes.push(index);
      } else if (!(mock.url instanceof RegExp) && (mock.url.includes(finalUrl) || mock.name?.includes(finalUrl))) {
        substringIndexes.push(index);
      }
    });

    finalMocks = [...strictEqualIndexes, ...substringIndexes].map(i => allGlobalMocks[i]);
  }

  return finalMocks.reduce((acc, {method, widgetName, name, data, originalUrl, originalStatus, index}) => {
    const widgetPlaceholder = widgetName ? ` ${widgetName} ` : ' '
    const key = `${index + 1}${widgetPlaceholder}${originalUrl} ${originalStatus} ${method} N:${name || '-'}`;
    return {
      ...acc,
      [key]: data,
    };
  }, {});
};
