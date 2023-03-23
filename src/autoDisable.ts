import {LAST_TIME_ENABLED} from './constants';
import {disable} from './enable';
import { getDefaultOptions } from './defaultOptions'

export const tryToAutoDisable = (): void => {
  const { disableTimeMs } = getDefaultOptions();

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

  if (Date.now() - lastTime > disableTimeMs) {
    disable();
  }
};
