import {AxiosInstance} from 'axios';
import {Mock} from './mockBuilder';
import {registerMock} from './registerMock';
import {clearMock} from './clearMock';
import {clearAll} from './clearAll';
import {registerAllMocks} from './registerAllMocks';
import {clearDelayResponseTime, setDelayResponseTime} from './delayResponse';
import {applySnapshot, snapshot} from './serializers';
import {getSetMocks, getRegisteredMocks} from './printing';
import {enable, disable, isEnabled} from './enable';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import {MockAdapter} from './axios-mock-adapter/MockAdapter';
import {applyReady} from './applyReady';
import {setRelativeBaseUrl} from './baseUrl';
import {setWidgetName} from './widgetName';
import {setGlobalMocksToWindow} from './registeredMocks';
import {tryToAutoDisable} from './autoDisable';
import {getDefaultOptions, setDefaultOptions} from './defaultOptions';
import { MockXHRType } from './types'

export * from './exportedTypes'

const MockXHR: MockXHRType = {
  ...Mock,
  clearAll,
  clearMock,
  setDelayResponseTime,
  clearDelayResponseTime,
  snapshot,
  applySnapshot,
  getSetMocks,
  getRegisteredMocks,
  enable,
  disable,
  applyReady,
};

const wrapAxiosAdapter = (axiosInstance: AxiosInstance): void => {
  const {disableTimeMs, baseUrl} = getDefaultOptions();

  if (disableTimeMs) {
    tryToAutoDisable();
  }
  if (isEnabled()) {
    const adapter = new MockAdapter(axiosInstance, {onNoMatch: 'passthrough'});
    setRelativeBaseUrl(baseUrl);
    setGlobalMocksToWindow();
    registerAllMocks(adapter, baseUrl);
  }

  window.MockXHR = MockXHR;
};

const wrapChildAxiosAdapter = (axiosInstance: AxiosInstance, widgetName: string): void => {
  const {baseUrl} = getDefaultOptions();

  if (isEnabled()) {
    const adapter = new MockAdapter(axiosInstance, {onNoMatch: 'passthrough'});
    setRelativeBaseUrl(baseUrl);
    setWidgetName(widgetName);
    setGlobalMocksToWindow();
    registerAllMocks(adapter, baseUrl);
  }
};

export {wrapAxiosAdapter, wrapChildAxiosAdapter, registerMock, setDefaultOptions, MockXHR};
