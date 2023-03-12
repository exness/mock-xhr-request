import {PARAM_KEY} from '../constants';
import {registerMock} from '../registerMock';
import { __resetGlobalMocks, getAllRegisteredMocks } from '../registeredMocks'
import { setBaseUrl } from '../baseUrl'

describe('registerMock', () => {
  const globalMocks = getAllRegisteredMocks()

  beforeEach(() => {
    __resetGlobalMocks()
    setBaseUrl(undefined)
  });

  it('should add mock to globalMocks array', () => {
    registerMock('abc/qwe', 'get', 'success', {});

    expect(globalMocks).toHaveLength(1);
    expect(globalMocks[0]).toEqual({
      method: 'get',
      status: 200,
      originalStatus: 'success',
      url: 'abc/qwe',
      originalUrl: 'abc/qwe',
      data: {},
    });
  });

  it('should add mock to globalMocks array with headers', () => {
    registerMock('abc/qwe', 'get', 'success', {}).withHeaders({requestId: '123123'});

    expect(globalMocks).toHaveLength(1);
    expect(globalMocks[0]).toEqual({
      method: 'get',
      status: 200,
      originalStatus: 'success',
      url: 'abc/qwe',
      originalUrl: 'abc/qwe',
      data: {},
      headers: {requestId: '123123'},
    });
  });

  it('should convert error status to 424', () => {
    registerMock('abc/qwe', 'get', 'error', {});

    expect(globalMocks[0].status).toEqual(424);
    expect(globalMocks[0].originalStatus).toEqual('error');
  });

  it('should add name and headers', () => {
    registerMock('abc/qwe', 'get', 'error', {}).withHeaders({requestId: '123123'}).withName('specialName');

    expect(globalMocks[0].name).toEqual('specialName');
    expect(globalMocks[0].headers).toEqual({requestId: '123123'});
  });

  it('should replace url params on __PARAM__', () => {
    registerMock('abc/:account/qwe/:option', 'get', 'error', {});

    expect(globalMocks[0].url).toEqual(`abc/${PARAM_KEY}/qwe/${PARAM_KEY}`);
    expect(globalMocks[0].originalUrl).toEqual('abc/:account/qwe/:option');
  });

  it('should keep the regex url untouched', () => {
    const regex = /abc\/:d+/;
    registerMock(regex, 'get', 'error', {});

    expect(globalMocks[0].url).toEqual(regex);
    expect(globalMocks[0].originalUrl).toEqual(regex);
  });

  it('should change url of global mock', () => {
    registerMock('abc/qwe', 'get', 'success', {});

    expect(globalMocks[0].url).toBe('abc/qwe');

    setBaseUrl('/rrr')

    expect(globalMocks[0].url).toBe('/rrr/abc/qwe');
  });

  it('should not change url of global mock if it starts with /', () => {
    registerMock('/abc/qwe', 'get', 'success', {});
    setBaseUrl('/rrr')

    expect(globalMocks[0].url).toBe('/abc/qwe');
  });

  it('should change url of global mock if it does not start with / and base url is full', () => {
    registerMock('abc/qwe', 'get', 'success', {});
    setBaseUrl('https://example.com/rrr')

    expect(globalMocks[0].url).toBe('/rrr/abc/qwe');
  });

  it('should change url of global mock if it does not start with / and base url is full and ends with /', () => {
    registerMock('abc/qwe', 'get', 'success', {});
    setBaseUrl('https://example.com/rrr/')

    expect(globalMocks[0].url).toBe('/rrr/abc/qwe');
  });

  it('should change url of global mock if it does not start with / and base url without /', () => {
    registerMock('abc/qwe', 'get', 'success', {});
    setBaseUrl('rrr')

    expect(globalMocks[0].url).toBe('/rrr/abc/qwe');
  });

  it('should change url of global mock if it does not start with / and base ends with /', () => {
    registerMock('abc/qwe', 'get', 'success', {});
    setBaseUrl('rrr/')

    expect(globalMocks[0].url).toBe('/rrr/abc/qwe');
  });
});
