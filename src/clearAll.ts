import {DELAY_MOCK_KEY, MOCK_PREFIX} from './constants';
import {getLocalStorageKeys} from './utils';
import {disable} from './enable';

export const clearAll = (clearEverything = false): void => {
  const keysToClear: string[] = [];

  for (const key of getLocalStorageKeys()) {
    const shouldClear = key.startsWith(MOCK_PREFIX) || (clearEverything && key.startsWith(DELAY_MOCK_KEY));
    if (shouldClear) {
      keysToClear.push(key);
    }
  }

  keysToClear.forEach(key => localStorage.removeItem(key));

  if (clearEverything) {
    disable();
  }
};
