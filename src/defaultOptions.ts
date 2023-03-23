import {DefaultOptions, RequiredDefaultOptions} from './types';

const MAX_ENABLE_INTERVAL = 1000 * 60 * 60 * 24 * 2; // 2 days

let defaultOptions: RequiredDefaultOptions;

const enhanceOptions = ({
  autoDisable = true,
  baseUrl = '/',
  successStatusCode = 200,
  errorStatusCode = 424,
}: DefaultOptions): RequiredDefaultOptions => ({
  disableTimeMs: autoDisable ? (typeof autoDisable === 'number' ? autoDisable : MAX_ENABLE_INTERVAL) : 0,
  baseUrl,
  successStatusCode,
  errorStatusCode,
});

export const setDefaultOptions = (options: DefaultOptions): void => {
  if (!options) {
    console.log('Options object was not passed, default ones will be used');
  }
  defaultOptions = enhanceOptions(options || {});
};

let returnedDefaultOptions: RequiredDefaultOptions;
// options could not be changed if they were used once
export const getDefaultOptions = (): RequiredDefaultOptions => {
  if (returnedDefaultOptions) {
    return returnedDefaultOptions;
  }

  if (!defaultOptions) {
    defaultOptions = enhanceOptions({});
    returnedDefaultOptions = defaultOptions;
  } else {
    returnedDefaultOptions = defaultOptions;
  }
  return returnedDefaultOptions;
};
