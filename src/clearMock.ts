import {normalizeUrl} from './normilizeUrl';
import {MOCK_PREFIX} from './constants';
import {UrlOrRegex} from './types';
import {getLocalStorageKeyValue, getMockPairsFromLocalStorage} from './utils';

const allowedMethods = ['get', 'post', 'patch', 'delete', 'put'];

const removeNMock = (nMock: number) => {
  if (nMock < 1) {
    console.error('You should specify positive number when deleting mock by its order');
    return;
  }

  let count = 1;
  for (const [key, value] of getLocalStorageKeyValue()) {
    if (!key.startsWith(MOCK_PREFIX) || !value) {
      continue;
    }
    if (count === nMock) {
      localStorage.removeItem(key);
      return;
    }
    count += 1;
  }
};

const isUrlNumber = (url: UrlOrRegex | number): url is number => {
  return Number.isInteger(url);
};

export const clearMock = (url: UrlOrRegex | number, method?: string): void => {
  if (isUrlNumber(url)) {
    removeNMock(url as unknown as number);
    return;
  }
  const urlOrRegex = url instanceof RegExp ? url : normalizeUrl(url);
  const mockKey = urlOrRegex.toString();
  const actualMethod = method?.toLowerCase();
  if (actualMethod && !allowedMethods.includes(actualMethod)) {
    throw new Error(`You can only specify these http methods - ${allowedMethods.join(', ')}`);
  }

  const keysToClear: string[] = [];

  for (const {lsKey, url, method} of getMockPairsFromLocalStorage()) {
    if (url !== mockKey) continue;
    if (!actualMethod) {
      keysToClear.push(lsKey);
    } else if (method === actualMethod) {
      keysToClear.push(lsKey);
    }
  }

  keysToClear.forEach(key => localStorage.removeItem(key));
};
