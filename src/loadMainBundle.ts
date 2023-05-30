import {AxiosAdapter, AxiosInstance} from 'axios';
import {enable, isEnabled} from './enable';
import {WithHelpersBuilder, WithNameBuilder} from './registerMock';
import {
  CodeStatus,
  HttpMethod,
  RegisterFunctionArgs,
  RegisterMockArgs,
  RegisterMockPayload,
  ResponseData,
  ResponseHeaders,
  UrlOrRegex,
} from './types';
import {wrapAxiosAdapter, wrapChildAxiosAdapter} from './index';
import {storageHaveSomeMocks} from './storageHaveSomeMocks';
import {areArgsFromFunction} from './lazyUtils';
import * as wrapAxiosAdapterBundle from './wrapAxiosAdapter';

type RegisterCall = {
  args: RegisterMockArgs | RegisterFunctionArgs;
  enhanceCalls: (((r: WithNameBuilder) => void) | ((r: WithHelpersBuilder) => WithNameBuilder))[];
};
const registerMockCalls: RegisterCall[] = [];
const wrapAxiosCalls: {args: Parameters<typeof wrapAxiosAdapter>; originalAdapter?: AxiosAdapter}[] = [];
const wrapChildAxiosCalls: {args: Parameters<typeof wrapChildAxiosAdapter>; originalAdapter?: AxiosAdapter}[] = [];

let loadBundleResolveFunc: () => void;
const loadBundlePromise = new Promise<void>(res => {
  loadBundleResolveFunc = res;
});
let hasEnablingHappened = false;
let wrapAxiosAdapterModule: typeof wrapAxiosAdapterBundle;

// replace original adapter to make all requests wait for main bundle resolution
// when main bundle will be loaded the adapter will be changed on mocked one before calling continuation of loadBundlePromise promise
const replaceOriginalAdapter = (axiosInstance: AxiosInstance): AxiosAdapter | undefined => {
  let originalAdapter: AxiosAdapter | undefined;
  if (!hasEnablingHappened && isEnabled() && storageHaveSomeMocks()) {
    originalAdapter = axiosInstance.defaults.adapter as AxiosAdapter;
    axiosInstance.defaults.adapter = config => {
      return new Promise((res, rej) => {
        loadBundlePromise.then(() => {
          return (axiosInstance.defaults.adapter as AxiosAdapter)(config).then(res, rej);
        });
      });
    };
  }

  return originalAdapter;
};

function lazyRegisterMock(func: () => Promise<RegisterMockPayload> | RegisterMockPayload): void;
function lazyRegisterMock(
  urlOrRegex: UrlOrRegex,
  method: HttpMethod,
  status: CodeStatus,
  data: ResponseData
): WithHelpersBuilder;
function lazyRegisterMock(...args: RegisterMockArgs | RegisterFunctionArgs): void | Promise<void> | WithHelpersBuilder {
  if (wrapAxiosAdapterModule) {
    if (areArgsFromFunction(args)) {
      return wrapAxiosAdapterModule.internalRegisterMock(args[0]);
    } else {
      return wrapAxiosAdapterModule.internalRegisterMock(...args);
    }
  }
  const registerMockCall: RegisterCall = {args, enhanceCalls: []};
  registerMockCalls.push(registerMockCall);

  if (areArgsFromFunction(args)) {
    return;
  }

  const withName = (mockName: string) => {
    registerMockCall.enhanceCalls.push((r: WithNameBuilder) => {
      r.withName(mockName);
    });
  };
  const withHeaders = (headers: ResponseHeaders): WithNameBuilder => {
    registerMockCall.enhanceCalls.push((r: WithHelpersBuilder) => r.withHeaders(headers));

    return {
      withName,
    };
  };

  return {
    withName,
    withHeaders,
  };
}

export type LazyMockXHR = {
  enable: typeof enable;
};

export const lazyMockXHR: LazyMockXHR = {
  enable: async (): Promise<void> => {
    enable();
    try {
      await loadMainBundle();
    } catch (e) {
      console.error('Bundle with mock system was not loaded');
      throw e;
    }
  },
};

export const lazyWrapAxiosAdapter: typeof wrapAxiosAdapter = (...args) => {
  try {
    if (!window.MockXHR) {
      window.MockXHR = lazyMockXHR;
    }
    if (wrapAxiosAdapterModule) {
      wrapAxiosAdapterModule.wrapAxiosAdapter(...args);
      return;
    }
    const originalAdapter = replaceOriginalAdapter(args[0]);
    wrapAxiosCalls.push({args, originalAdapter});
  } catch (e) {
    console.error('Error occured while calling lazyWrapAxiosAdapter function', e);
  }
};

export const lazyWrapChildAxiosAdapter: typeof wrapChildAxiosAdapter = (...args) => {
  try {
    if (wrapAxiosAdapterModule) {
      wrapAxiosAdapterModule.wrapChildAxiosAdapter(...args);
      return;
    }
    const originalAdapter = replaceOriginalAdapter(args[0]);
    wrapChildAxiosCalls.push({args, originalAdapter});
  } catch (e) {
    console.error('Error occured while calling lazyWrapChildAxiosAdapter function', e);
  }
};

// replace original adapter, through which all not mocked requests will go
const replaceAdapterIfNeeded = (axiosInstance: AxiosInstance, adapter?: AxiosAdapter) => {
  if (isEnabled() && adapter) {
    axiosInstance.defaults.adapter = adapter;
  }
};

export const loadMainBundle = async (): Promise<void> => {
  wrapAxiosAdapterModule = await import('./wrapAxiosAdapter');
  registerMockCalls.forEach(({args, enhanceCalls}) => {
    if (areArgsFromFunction(args)) {
      wrapAxiosAdapterModule.internalRegisterMock(...args);
    } else {
      const withNameBuilder = wrapAxiosAdapterModule.internalRegisterMock(...args);
      enhanceCalls.reduce((acc, call) => call(acc), withNameBuilder);
    }
  });
  wrapAxiosCalls.forEach(c => {
    replaceAdapterIfNeeded(c.args[0], c.originalAdapter);
    wrapAxiosAdapterModule.wrapAxiosAdapter(...c.args);
  });
  wrapChildAxiosCalls.forEach(c => {
    replaceAdapterIfNeeded(c.args[0], c.originalAdapter);
    wrapAxiosAdapterModule.wrapChildAxiosAdapter(...c.args);
  });
  hasEnablingHappened = true;
  loadBundleResolveFunc();
};

export {lazyRegisterMock};
