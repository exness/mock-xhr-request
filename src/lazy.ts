import {setDefaultOptions} from './defaultOptions';
import {isEnabled} from './enable';
import {lazyRegisterMock, lazyWrapChildAxiosAdapter, lazyWrapAxiosAdapter, loadMainBundle, lazyMockXHR} from './loadMainBundle';

export * from './exportedTypes';

if (isEnabled()) {
  loadMainBundle().catch(e => console.error('Bundle with mock system was not loaded automatically', e));
}

// need to reassign imported functions to break tree shaking, otherwise code in file will not be executed
const registerMock = lazyRegisterMock;
const wrapAxiosAdapter = lazyWrapAxiosAdapter;
const wrapChildAxiosAdapter = lazyWrapChildAxiosAdapter;
const MockXHR = lazyMockXHR;

export {registerMock, wrapAxiosAdapter, wrapChildAxiosAdapter, setDefaultOptions, MockXHR};
