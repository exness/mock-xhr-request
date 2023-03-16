import {
  CodeStatus,
  HttpMethod,
  RegisteredMock, RegisterFunctionArgs, RegisterMockArgs,
  RegisterMockPayload,
  ResponseData,
  ResponseHeaders,
  UrlOrRegex,
} from './types';
import {normalizeUrl} from './normilizeUrl';
import {addRegisteredMock, updateRegisteredMock} from './registeredMocks';
import { areArgsFromFunction } from './lazyUtils'

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

function registerMock(func: () => Promise<RegisterMockPayload> | RegisterMockPayload): void;
function registerMock(urlOrRegex: UrlOrRegex, method: HttpMethod, status: CodeStatus, data: ResponseData): WithHelpersBuilder;
function registerMock(...args: RegisterMockArgs | RegisterFunctionArgs): void | WithHelpersBuilder {
  if (areArgsFromFunction(args)) {
    const resultMock = args[0]()
    if (resultMock instanceof Promise) {
      resultMock.then(r => applyParameters(r))
    } else {
      applyParameters(resultMock)
    }
  } else {
    const [urlOrRegex, method, status, data] = args
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
