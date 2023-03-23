import { registerMock } from '../registerMock'
import { __resetGlobalMocks, getAllRegisteredMocks } from '../registeredMocks'
import { __setTestBaseUrl, setBaseUrl } from '../baseUrl'

describe('baseUrl', () => {
  const globalMocks = getAllRegisteredMocks();

  beforeEach(() => {
    __setTestBaseUrl(undefined)
    __resetGlobalMocks()
  })

  it('should change url of global mock', () => {
    registerMock('abc/qwe', 'get', 'success', {});

    expect(globalMocks[0].url).toBe('abc/qwe');

    setBaseUrl('/rrr');

    expect(globalMocks[0].url).toBe('/rrr/abc/qwe');
  });

  it('should not change url of global mock if it starts with /', () => {
    registerMock('/abc/qwe', 'get', 'success', {});
    setBaseUrl('/rrr');

    expect(globalMocks[0].url).toBe('/abc/qwe');
  });

  it('should change url of global mock if it does not start with / and base url is full', () => {
    registerMock('abc/qwe', 'get', 'success', {});
    setBaseUrl('https://example.com/rrr');

    expect(globalMocks[0].url).toBe('/rrr/abc/qwe');
  });

  it('should change url of global mock if it does not start with / and base url is full and ends with /', () => {
    registerMock('abc/qwe', 'get', 'success', {});
    setBaseUrl('https://example.com/rrr/');

    expect(globalMocks[0].url).toBe('/rrr/abc/qwe');
  });

  it('should change url of global mock if it does not start with / and base url without /', () => {
    registerMock('abc/qwe', 'get', 'success', {});
    setBaseUrl('rrr');

    expect(globalMocks[0].url).toBe('/rrr/abc/qwe');
  });

  it('should change url of global mock if it does not start with / and base ends with /', () => {
    registerMock('abc/qwe', 'get', 'success', {});
    setBaseUrl('rrr/');

    expect(globalMocks[0].url).toBe('/rrr/abc/qwe');
  });
})
