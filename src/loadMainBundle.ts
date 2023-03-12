import { AxiosAdapter, AxiosInstance } from 'axios';
import { isEnabled } from './enable';
import { registerMock, WithHelpersBuilder, WithNameBuilder } from './registerMock';
import { ResponseHeaders } from './types';
import { wrapAxiosAdapter, wrapChildAxiosAdapter } from './index';
import { storageHaveSomeMocks } from './storageHaveSomeMocks'

type RegisterCall = {
  args: Parameters<typeof registerMock>;
  enhanceCalls: (((r: WithNameBuilder) => void) | ((r: WithHelpersBuilder) => WithNameBuilder))[];
};
const registerMockCalls: RegisterCall[] = [];
const wrapAxiosCalls: { args: Parameters<typeof wrapAxiosAdapter>; originalAdapter?: AxiosAdapter }[] = [];
const wrapChildAxiosCalls: { args: Parameters<typeof wrapChildAxiosAdapter>; originalAdapter?: AxiosAdapter }[] = [];

let loadBundleResolveFunc: () => void;
const loadBundlePromise = new Promise<void>(res => {
  loadBundleResolveFunc = res;
});
let hasEnablingHappened = false;

// replace original adapter to make all requests wait for main bundle resolution
// when main bundle will be loaded the adapter will be changed on mocked one before calling continuation of loadBundlePromise promise
const replaceOriginalAdapter = (axiosInstance: AxiosInstance): AxiosAdapter | undefined => {
  let originalAdapter: AxiosAdapter | undefined;
  if (isEnabled() && !hasEnablingHappened && storageHaveSomeMocks()) {
    originalAdapter = axiosInstance.defaults.adapter as AxiosAdapter;
    axiosInstance.defaults.adapter = (config) => {
      return new Promise((res, rej) => {
        loadBundlePromise.then(() => {
          return (axiosInstance.defaults.adapter as AxiosAdapter)(config).then(res, rej);
        });
      });
    }
  }

  return originalAdapter;
};

export const lazyRegisterMock: typeof registerMock = (...args) => {
  const registerMockCall: RegisterCall = { args, enhanceCalls: [] };
  registerMockCalls.push(registerMockCall);
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
};

export const lazyWrapAxiosAdapter: typeof wrapAxiosAdapter = (...args) => {
  const originalAdapter = replaceOriginalAdapter(args[0]);
  wrapAxiosCalls.push({ args, originalAdapter });
};

export const lazyWrapChildAxiosAdapter: typeof wrapChildAxiosAdapter = (...args) => {
  const originalAdapter = replaceOriginalAdapter(args[0]);
  wrapChildAxiosCalls.push({ args, originalAdapter });
};

// replace original adapter, through which all not mocked requests will go
const replaceAdapterIfNeeded = (axiosInstance: AxiosInstance, adapter?: AxiosAdapter) => {
  if (isEnabled() && adapter) {
    axiosInstance.defaults.adapter = adapter;
  }
};

export const loadMainBundle = async (): Promise<void> => {
  const result = await import('./index');
  registerMockCalls.forEach(({ args, enhanceCalls }) => {
    const r = result.registerMock(...args);
    enhanceCalls.reduce((acc, call) => call(acc), r);
  });
  wrapAxiosCalls.forEach(c => {
    replaceAdapterIfNeeded(c.args[0], c.originalAdapter);
    result.wrapAxiosAdapter(...c.args);
  });
  wrapChildAxiosCalls.forEach(c => {
    replaceAdapterIfNeeded(c.args[0], c.originalAdapter);
    result.wrapChildAxiosAdapter(...c.args);
  });
  hasEnablingHappened = true;
  loadBundleResolveFunc();
};
