import {
  CodeStatus,
  HttpMethod,
  RegisteredMock,
  RegisterFunctionArgs,
  RegisterMockArgs,
  RegisterMockPayload,
  ResponseData,
  ResponseHeaders,
  UrlOrRegex,
} from './types';
import {normalizeUrl} from './normilizeUrl';
import {addRegisteredMock, updateRegisteredMock} from './registeredMocks';
import {areArgsFromFunction} from './lazyUtils';
import {getDefaultOptions} from './defaultOptions';

export type WithNameBuilder = {
  withName: (mockName: string) => void;
};
export type WithHelpersBuilder = {
  withHeaders: (headers: ResponseHeaders) => WithNameBuilder;
} & WithNameBuilder;

export const getCodeByStatus = (status: CodeStatus): number => {
  const {successStatusCode, errorStatusCode} = getDefaultOptions();
  return status === 'success' ? successStatusCode : status === 'error' ? errorStatusCode : status;
};

const applyParameters = ({method, headers, name, data, status, urlOrRegex}: RegisterMockPayload): void => {
  const mock = registerStaticMock(urlOrRegex, method, status, data);
  if (headers) {
    mock.withHeaders(headers);
  }
  if (name) {
    mock.withName(name);
  }
};

function registerMock(func: () => RegisterMockPayload): void;
function registerMock(
  urlOrRegex: UrlOrRegex,
  method: HttpMethod,
  status: CodeStatus,
  data: ResponseData
): WithHelpersBuilder;
function registerMock(...args: RegisterMockArgs | RegisterFunctionArgs): void | WithHelpersBuilder {
  if (areArgsFromFunction(args)) {
    return internalRegisterMock(args[0])
  } else {
    return internalRegisterMock(...args)
  }
}

function internalRegisterMock(func: () => Promise<RegisterMockPayload> | RegisterMockPayload): void;
function internalRegisterMock(
  urlOrRegex: UrlOrRegex,
  method: HttpMethod,
  status: CodeStatus,
  data: ResponseData
): WithHelpersBuilder;
function internalRegisterMock(...args: RegisterMockArgs | RegisterFunctionArgs): void | WithHelpersBuilder {
  if (areArgsFromFunction(args)) {
    const resultMock = args[0]();
    if (resultMock instanceof Promise) {
      resultMock.then(r => applyParameters(r));
    } else {
      applyParameters(resultMock);
    }
  } else {
    const [urlOrRegex, method, status, data] = args;
    return registerStaticMock(urlOrRegex, method, status, data);
  }
}

const registerStaticMock = (
  urlOrRegex: UrlOrRegex,
  method: HttpMethod,
  status: CodeStatus,
  data: ResponseData
): WithHelpersBuilder => {
  try {
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
  } catch (e) {
    console.error('Error happened while registering a mock ', e);

    const withName = () => void 0;
    return {
      withName,
      withHeaders: () => ({withName}),
    };
  }
};

export {registerMock, internalRegisterMock};
