import {setDefaultOptions} from './defaultOptions';
import {enable, isEnabled} from './enable';
import {lazyRegisterMock, lazyWrapChildAxiosAdapter, lazyWrapAxiosAdapter, loadMainBundle} from './loadMainBundle';

export * from './exportedTypes'

export type LazyMockXHR = {
  enable: typeof enable;
};

const lazyMockXHR: LazyMockXHR = {
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

window.MockXHR = lazyMockXHR;

if (isEnabled()) {
  loadMainBundle().catch(e => console.error('Bundle with mock system was not loaded automatically', e));
}

// need to reassign imported functions to break tree shaking, otherwise code in file will not be executed
const registerMock = lazyRegisterMock;
const wrapAxiosAdapter = lazyWrapAxiosAdapter;
const wrapChildAxiosAdapter = lazyWrapChildAxiosAdapter;
const MockXHR = lazyMockXHR;

export {registerMock, wrapAxiosAdapter, wrapChildAxiosAdapter, setDefaultOptions, MockXHR};
