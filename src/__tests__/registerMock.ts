import { PARAM_KEY } from '../constants';
import { registerMock } from '../registerMock';
import { __resetGlobalMocks, getAllRegisteredMocks } from '../registeredMocks';
import { getRelativeBaseUrl } from '../baseUrl';

jest.mock('../baseUrl', () => ({
  getRelativeBaseUrl: jest.fn(),
}))

const getBaseUrlMock = getRelativeBaseUrl as jest.Mock

describe('registerMock', () => {
  const globalMocks = getAllRegisteredMocks();

  beforeEach(() => {
    __resetGlobalMocks();
    getBaseUrlMock.mockClear()
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

  it('should add mock to globalMocks array if mock is function', () => {
    registerMock(() => ({ urlOrRegex: 'abc/qwe', method: 'get', status: 'success', data: {} }));

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

  it('should add mock with name to globalMocks array if mock is function', () => {
    registerMock(() => ({ urlOrRegex: 'abc/qwe', method: 'get', status: 'success', data: {}, name: 'abcd' }));

    expect(globalMocks).toHaveLength(1);
    expect(globalMocks[0]).toEqual({
      method: 'get',
      status: 200,
      originalStatus: 'success',
      url: 'abc/qwe',
      originalUrl: 'abc/qwe',
      name: 'abcd',
      data: {},
    });
  });

  it('should add mock with name and headers to globalMocks array if mock is function', () => {
    registerMock(() => ({
      urlOrRegex: 'abc/qwe',
      method: 'get',
      status: 'success',
      data: {},
      name: 'abcd',
      headers: { requestId: '123123' },
    }));

    expect(globalMocks).toHaveLength(1);
    expect(globalMocks[0]).toEqual({
      method: 'get',
      status: 200,
      originalStatus: 'success',
      url: 'abc/qwe',
      originalUrl: 'abc/qwe',
      name: 'abcd',
      data: {},
      headers: { requestId: '123123' },
    });
  });

  it('should add mock to globalMocks array if mock is function which returns promise', async () => {
    registerMock(() =>
      Promise.resolve({
        urlOrRegex: 'abc/qwe',
        method: 'get',
        status: 'success',
        data: {},
      } as const),
    );

    await Promise.resolve();

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

  it('should add mock with headers to globalMocks array if mock is function which returns promise', async () => {
    registerMock(() =>
      Promise.resolve({
        urlOrRegex: 'abc/qwe',
        method: 'get',
        status: 'success',
        data: {},
        headers: { requestId: '123123' },
      } as const),
    );

    await Promise.resolve();

    expect(globalMocks).toHaveLength(1);
    expect(globalMocks[0]).toEqual({
      method: 'get',
      status: 200,
      originalStatus: 'success',
      url: 'abc/qwe',
      originalUrl: 'abc/qwe',
      headers: { requestId: '123123' },
      data: {},
    });
  });

  it('should add mock with name to globalMocks array if mock is function which returns promise', async () => {
    registerMock(() =>
      Promise.resolve({
        urlOrRegex: 'abc/qwe',
        method: 'get',
        status: 'success',
        data: {},
        name: 'abcd',
      } as const),
    );

    await Promise.resolve();

    expect(globalMocks).toHaveLength(1);
    expect(globalMocks[0]).toEqual({
      method: 'get',
      status: 200,
      originalStatus: 'success',
      url: 'abc/qwe',
      originalUrl: 'abc/qwe',
      name: 'abcd',
      data: {},
    });
  });

  it('should add mock to globalMocks array with headers', () => {
    registerMock('abc/qwe', 'get', 'success', {}).withHeaders({ requestId: '123123' });

    expect(globalMocks).toHaveLength(1);
    expect(globalMocks[0]).toEqual({
      method: 'get',
      status: 200,
      originalStatus: 'success',
      url: 'abc/qwe',
      originalUrl: 'abc/qwe',
      data: {},
      headers: { requestId: '123123' },
    });
  });

  it('should convert error status to 424', () => {
    registerMock('abc/qwe', 'get', 'error', {});

    expect(globalMocks[0].status).toEqual(424);
    expect(globalMocks[0].originalStatus).toEqual('error');
  });

  it('should add name and headers', () => {
    registerMock('abc/qwe', 'get', 'error', {}).withHeaders({ requestId: '123123' }).withName('specialName');

    expect(globalMocks[0].name).toEqual('specialName');
    expect(globalMocks[0].headers).toEqual({ requestId: '123123' });
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
});
