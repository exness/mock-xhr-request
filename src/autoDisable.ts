import {LAST_TIME_ENABLED} from './constants';
import {disable} from './enable';

const MAX_ENABLE_INTERVAL = 1000 * 60 * 60 * 24 * 2; // 2 days

export const tryToAutoDisable = (): void => {
  const lastTimeEnabled = localStorage.getItem(LAST_TIME_ENABLED);
  if (!lastTimeEnabled) {
    return;
  }
  const lastTime = Number(lastTimeEnabled);
  if (Number.isNaN(lastTime)) {
    console.error('last time enabled is not a number');
    localStorage.setItem(LAST_TIME_ENABLED, Date.now().toString());
    return;
  }

  if (Date.now() - lastTime > MAX_ENABLE_INTERVAL) {
    disable();
  }
};
