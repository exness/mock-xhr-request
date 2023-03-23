import {getRelativeUrl} from './normilizeUrl';
import {addBaseUrlToRegisteredMocks} from './registeredMocks';

let baseUrl: string | undefined;

export const getBaseUrl = (): string | undefined => baseUrl;
export const setBaseUrl = (url?: string): void => {
  if (url === undefined) {
    baseUrl = undefined;
    return;
  }

  baseUrl = getRelativeUrl(url);
  if (!baseUrl.startsWith('/')) {
    baseUrl = `/${baseUrl}`;
  }
  if (!baseUrl.endsWith('/')) {
    baseUrl = `${baseUrl}/`;
  }
  addBaseUrlToRegisteredMocks();
};
