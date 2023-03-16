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

const applyParameters = ({method, headers, name, data, status, urlOrRegex}: RegisterMockPayload): void => {
  const mock = registerStaticMock(urlOrRegex, method, status, data)
  if (headers) {
    mock.withHeaders(headers)
  }
  if (name) {
    mock.withName(name)
  }
}

type RegisterMockPayload = {
  urlOrRegex: UrlOrRegex,
  method: HttpMethod,
  status: CodeStatus,
  data: ResponseData,
  name?: string,
  headers?: ResponseHeaders
}
type RegisterMockArgs = [UrlOrRegex, HttpMethod, CodeStatus, ResponseData]
type RegisterFunctionArgs = [() => Promise<RegisterMockPayload> | RegisterMockPayload]

function registerMock(func: () => RegisterMockPayload): void;
function registerMock(func: () => Promise<RegisterMockPayload>): Promise<void>;
function registerMock(urlOrRegex: UrlOrRegex, method: HttpMethod, status: CodeStatus, data: ResponseData): WithHelpersBuilder;
function registerMock(...args: RegisterMockArgs | RegisterFunctionArgs): void |  Promise<void> | WithHelpersBuilder {
  if (typeof args[0] === 'function') {
    const resultMock = args[0]()
    if (resultMock instanceof Promise) {
      return resultMock.then(r => applyParameters(r))
    } else {
      applyParameters(resultMock)
    }
  } else {
    const [urlOrRegex, method, status, data] = args as RegisterMockArgs
    return registerStaticMock(urlOrRegex, method, status, data)
  }
}


const registerStaticMock = (
  urlOrRegex: UrlOrRegex,
  method: HttpMethod,
  status: CodeStatus,
  data: ResponseData,
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
}

export { registerMock }
