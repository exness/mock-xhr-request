import {getRelativeUrl} from './normilizeUrl';
import {addBaseUrlToRegisteredMocks} from './registeredMocks';

let baseUrl: string | undefined;

export const getRelativeBaseUrl = (): string | undefined => baseUrl;
export const setRelativeBaseUrl = (url: string): void => {
  baseUrl = getRelativeUrl(url);
  if (!baseUrl.startsWith('/')) {
    baseUrl = `/${baseUrl}`;
  }
  if (!baseUrl.endsWith('/')) {
    baseUrl = `${baseUrl}/`;
  }
  addBaseUrlToRegisteredMocks();
};

export const __setTestBaseUrl = (value: string | undefined): void => {
  baseUrl = value;
};
