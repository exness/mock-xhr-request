import {ENABLE_MOCK_SYSTEM_KEY, LAST_TIME_ENABLED} from './constants';

let isEnabledValue: boolean | undefined;

export const enable = (): void => {
  isEnabledValue = true;
  localStorage.setItem(ENABLE_MOCK_SYSTEM_KEY, 'true');
  localStorage.setItem(LAST_TIME_ENABLED, Date.now().toString());
};

export const disable = (): void => {
  isEnabledValue = false;
  localStorage.removeItem(ENABLE_MOCK_SYSTEM_KEY);
  localStorage.removeItem(LAST_TIME_ENABLED);
};

export const isEnabled = (): boolean => {
  if (isEnabledValue !== undefined) {
    return isEnabledValue;
  }
  try {
    isEnabledValue = localStorage.getItem(ENABLE_MOCK_SYSTEM_KEY) !== null;
    return isEnabledValue;
  } catch (e) {
    return false;
  }
};
