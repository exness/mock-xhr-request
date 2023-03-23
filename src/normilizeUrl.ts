import {OPTIONAL_SEARCH_KEY, PARAM_KEY, REQUIRED_SEARCH_KEY} from './constants';

const urlPathPartRegex = /(:\w+)/g;
const requiredUrlSearch = /(:!search)/;
const optionalUrlSearch = /(:\?search)/;

export const getRelativeUrl = (url: string): string => {
  if (url.startsWith('http')) {
    const {pathname, search} = new URL(url);
    return pathname + search;
  }

  return url;
};

export const normalizeUrl = (url: string): string => {
  if (!url) {
    throw new Error('Url is empty');
  }
  let finalUrl = getRelativeUrl(url);

  if (finalUrl.endsWith('/')) {
    finalUrl = finalUrl.slice(0, finalUrl.length - 1);
  }

  return finalUrl
    .replace(urlPathPartRegex, PARAM_KEY)
    .replace(optionalUrlSearch, OPTIONAL_SEARCH_KEY)
    .replace(requiredUrlSearch, REQUIRED_SEARCH_KEY);
};
