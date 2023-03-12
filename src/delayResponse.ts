import {DELAY_MOCK_KEY} from './constants';

export const setDelayResponseTime = (ms: number): void => {
  if (ms <= 0) {
    throw new Error('Delay should be greater than 0');
  }
  localStorage.setItem(DELAY_MOCK_KEY, String(ms));
};

export const clearDelayResponseTime = (): void => {
  localStorage.removeItem(DELAY_MOCK_KEY);
};

export const getDelayResponseTime = (): number => {
  const delay = localStorage.getItem(DELAY_MOCK_KEY);

  return delay === null ? 0 : Number(delay);
};
