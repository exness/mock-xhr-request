import {RegisteredMock} from './types';
import {getWidgetName} from './widgetName';
import {getBaseUrl} from './baseUrl';

const registeredMocks: RegisteredMock[] = [];
const mockNames = new Set<string>();

const updateMockNames = (mock: RegisteredMock) => {
  if (mock.name) {
    if (mockNames.has(mock.name)) {
      console.error(
        `Mock with name ${mock.name} is already in collection. Choose different name for url ${mock.url.toString()}`
      );
      return;
    }
    mockNames.add(mock.name);
  }
};

export const addRegisteredMock = (mock: RegisteredMock): void => {
  mock.url = mergeWithBaseUrl(mock.url);
  registeredMocks.push(mock);
  updateMockNames(mock);
};

export const updateRegisteredMock = (mock: RegisteredMock, callback: (mock: RegisteredMock) => void): void => {
  callback(mock);
  updateMockNames(mock);
};

let isErrorShown = false;
const showBaseUrlMissedErrorOnce = () => {
  if (isErrorShown) {
    return;
  }
  console.error('Prepared mocks should start with / or base url should be set');
  isErrorShown = true;
};

const mergeWithBaseUrl = (urlOrRegexp: string | RegExp): string | RegExp => {
  const baseUrl = getBaseUrl();
  if (urlOrRegexp instanceof RegExp || baseUrl === undefined) {
    return urlOrRegexp;
  }
  if (urlOrRegexp.startsWith('/')) {
    return urlOrRegexp;
  }

  if(baseUrl === '') {
    showBaseUrlMissedErrorOnce()
    return `/${urlOrRegexp}`
  }

  return `${baseUrl}${urlOrRegexp}`;
};

export const addBaseUrlToRegisteredMocks = (): void => {
  registeredMocks.forEach(mock => {
    mock.url = mergeWithBaseUrl(mock.url);
  });
};

export type MockXHRMocks = Record<string, RegisteredMock[]>;

export const getAllRegisteredMocks = (): RegisteredMock[] => {
  try {
    const externalMocks = window.__MOCK_XHR__MOCKS__;
    if (!externalMocks) {
      return registeredMocks;
    }
    let allMocks = [...registeredMocks];

    Object.keys(externalMocks).forEach(widgetName => {
      const widgetMocks = externalMocks[widgetName];
      allMocks = allMocks.concat(widgetMocks.map(m => ({...m, widgetName})));
    });

    return allMocks;
  } catch (e) {
    console.error('Did not manage to merge external mocks');
  }

  return registeredMocks;
};

export const setGlobalMocksToWindow = (): void => {
  try {
    let allMocks = window.__MOCK_XHR__MOCKS__;
    if (!allMocks) {
      window.__MOCK_XHR__MOCKS__ = {};
      allMocks = {};
    }
    const widgetName = getWidgetName();
    if (widgetName) {
      allMocks[widgetName] = registeredMocks;
    }
  } catch (e) {
    console.error('Error happened when creating external mocks', e);
  }
};

export const __resetGlobalMocks = (): void => {
  registeredMocks.splice(0, registeredMocks.length);
  mockNames.clear();
};
