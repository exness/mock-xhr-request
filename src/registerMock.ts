import {CodeStatus, HttpMethod, RegisteredMock, ResponseData, ResponseHeaders, UrlOrRegex} from './types';
import {normalizeUrl} from './normilizeUrl';
import {addRegisteredMock, updateRegisteredMock} from './registeredMocks';

export type WithNameBuilder = {
  withName: (mockName: string) => void;
};
export type WithHelpersBuilder = {
  withHeaders: (headers: ResponseHeaders) => WithNameBuilder;
} & WithNameBuilder;

export const getCodeByStatus = (status: CodeStatus): number => {
  return status === 'success' ? 200 : status === 'error' ? 424 : status;
};

export const registerMock = (
  urlOrRegex: UrlOrRegex,
  method: HttpMethod,
  status: CodeStatus,
  data: ResponseData
): WithHelpersBuilder => {
  const mockedUrl = urlOrRegex instanceof RegExp ? urlOrRegex : normalizeUrl(urlOrRegex);
  const statusNumber = getCodeByStatus(status);

  const element: RegisteredMock = {
    url: mockedUrl,
    method,
    data,
    status: statusNumber,
    originalUrl: urlOrRegex,
    originalStatus: status,
  };
  addRegisteredMock(element);

  const withName = (mockName: string) => {
    updateRegisteredMock(element, el => (el.name = mockName));
  };
  const withHeaders = (headers: ResponseHeaders): WithNameBuilder => {
    updateRegisteredMock(element, el => (el.headers = headers));

    return {
      withName,
    };
  };

  return {
    withName,
    withHeaders,
  };
};
