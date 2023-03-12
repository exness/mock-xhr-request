import { MockXHRType } from './src'
import { MockXHRMocks } from './src/registeredMocks'
import { LazyMockXHR } from './src/lazy'

declare global {

  interface Window {
    MockXHR?: MockXHRType | LazyMockXHR
    __MOCK_XHR__MOCKS__?: MockXHRMocks
  }
}
