import {CodeStatus, RegisteredMock, ResponseData, ResponseHeaders, Times} from './types';
import {getCodeByStatus} from './registerMock';
import {saveMock} from './utils';
import {getAllRegisteredMocks} from './registeredMocks';

type OverrideOptions = {
  data?: ResponseData | ((data: ResponseData) => ResponseData);
  headers?: ResponseHeaders | ((headers?: ResponseHeaders) => ResponseHeaders);
  times?: Times;
  status?: CodeStatus;
  delay?: number;
};

export const applyReady = (mockId: number | string, optionsOrWidgetName?: OverrideOptions | string, overrideOptions?: OverrideOptions): void => {
  const globalMocks = getAllRegisteredMocks();

  let mock: RegisteredMock | undefined;
  if (Number.isInteger(mockId)) {
    if (mockId < 1 || mockId > globalMocks.length) {
      throw new Error(
        `Mock number should be withing registered mock array indexes, not more than ${globalMocks.length}`
      );
    }
    mock = globalMocks[Number(mockId) - 1];
  } else {
    mock = globalMocks.find(x => {
      if(typeof optionsOrWidgetName === 'string') {
        return x.name === mockId && x.widgetName === optionsOrWidgetName
      } else {
        return x.name === mockId
      }
    });
  }

  if (!mock) {
    throw new Error(`Mock ${mockId} was not found in registered mocks`);
  }

  const {method, url, originalUrl, data, status, headers, originalStatus} = mock;
  const isRegex = url instanceof RegExp;

  const applyOptions = typeof optionsOrWidgetName === 'string' ? {} : (optionsOrWidgetName || overrideOptions || {})
  const {data: overrideData, headers: overrideHeaders, times, status: overrideStatus, delay} = applyOptions;

  const finalData = overrideData ? (typeof overrideData === 'function' ? overrideData(data) : overrideData) : data;

  const finalHeaders = overrideHeaders
    ? typeof overrideHeaders === 'function'
      ? overrideHeaders(headers)
      : overrideHeaders
    : headers;

  const finalTimes = times || 'always';
  const finalStatus = overrideStatus || status;
  const numberStatusCode = getCodeByStatus(finalStatus);

  const options = {delay};

  saveMock({
    data: finalData,
    status: numberStatusCode,
    options,
    isRegex,
    method,
    times: finalTimes,
    url,
    originalUrl,
    originalStatus: overrideStatus ? finalStatus : originalStatus,
    headers: finalHeaders,
  });
};
