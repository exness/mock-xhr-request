import {Mock} from '../mockBuilder';
import {registerMock} from '../registerMock';
import {stringifyMockData} from '../utils';
import { setBaseUrl } from '../baseUrl'
import { __resetGlobalMocks } from '../registeredMocks'
import { applyReady } from '../applyReady'

describe('mockBuilder', () => {
  beforeEach(() => {
    localStorage.clear();
    __resetGlobalMocks()
    setBaseUrl('')
  });

  it('should set mock', () => {
    Mock.get('/abc/qwe').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(JSON.parse(result)).toEqual({
      data: {f: 12},
      status: 200,
      options: {},
      isRegex: false,
      originalUrl: '/abc/qwe',
      originalStatus: 'success',
    });
  });

  it('should set mock with headers', () => {
    Mock.get('/abc/qwe').success({f: 12}, {requestId: '123'});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(JSON.parse(result)).toEqual({
      data: {f: 12},
      status: 200,
      options: {},
      isRegex: false,
      originalUrl: '/abc/qwe',
      originalStatus: 'success',
      headers: {requestId: '123'},
    });
  });

  it('should set order mock', () => {
    Mock.post('/abc/qwe', 1).error({f: 12});

    const result = localStorage.getItem(stringifyMockData('post', 1, '/abc/qwe'))!;

    expect(JSON.parse(result)).toEqual({
      data: {f: 12},
      status: 424,
      options: {},
      isRegex: false,
      originalUrl: '/abc/qwe',
      originalStatus: 'error',
    });
  });

  it('should set number status', () => {
    Mock.post('/abc/qwe', 'always').withStatus(404, {f: 12}, {requestId: '12313'});

    const result = localStorage.getItem(stringifyMockData('post', 'always', '/abc/qwe'))!;

    expect(JSON.parse(result)).toEqual({
      data: {f: 12},
      status: 404,
      options: {},
      isRegex: false,
      originalUrl: '/abc/qwe',
      originalStatus: 404,
      headers: {requestId: '12313'},
    });
  });

  it('should set delay', () => {
    Mock.put('/abc/qwe').withDelay(2000).success({f: 12});

    const result = localStorage.getItem(stringifyMockData('put', 'always', '/abc/qwe'))!;

    expect(JSON.parse(result)).toEqual({
      data: {f: 12},
      status: 200,
      options: {delay: 2000},
      isRegex: false,
      originalUrl: '/abc/qwe',
      originalStatus: 'success',
    });
  });

  it('should find registered mock with success status', () => {
    registerMock('/abc/qwe', 'get', 'success', {f: 123});
    Mock.get('/abc/qwe').success();

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(JSON.parse(result)).toEqual({
      data: {f: 123},
      status: 200,
      options: {},
      isRegex: false,
      originalUrl: '/abc/qwe',
      originalStatus: 'success',
    });
  });

  it('should find mock by name', () => {
    registerMock('/abc/qwe', 'get', 401, {f: 123}).withName('error401');
    applyReady('error401');

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(JSON.parse(result)).toEqual({
      data: {f: 123},
      status: 401,
      options: {},
      isRegex: false,
      originalUrl: '/abc/qwe',
      originalStatus: 401,
    });
  });

  it('should find mock by name and set headers', () => {
    registerMock('/abc/qwe', 'get', 401, {f: 123}).withHeaders({requestId: '123123'}).withName('error401');
    applyReady('error401');

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(JSON.parse(result)).toEqual({
      data: {f: 123},
      status: 401,
      options: {},
      isRegex: false,
      originalUrl: '/abc/qwe',
      originalStatus: 401,
      headers: {requestId: '123123'},
    });
  });

  it('should truncate the url if base url is set', () => {
    setBaseUrl('https://example.com')
    Mock.get('https://example.com/abc/qwe').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(result).not.toBeNull()
  })

  it('should truncate the url if base url is set, but mocked one is relative', () => {
    setBaseUrl('https://example.com')
    Mock.get('/abc/qwe').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(result).not.toBeNull()
  })

  it('should truncate the url if base url is set and ends on /', () => {
    setBaseUrl('https://example.com/')
    Mock.get('https://example.com/abc/qwe').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(result).not.toBeNull()
  })

  it('should truncate the url if base url is set and ends on / and mocked one is relative', () => {
    setBaseUrl('https://example.com/')
    Mock.get('/abc/qwe').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(result).not.toBeNull()
  })

  it('should truncate the url if base url is set it is relative', () => {
    setBaseUrl('/abc')
    Mock.get('https://example.com/abc/qwe').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(result).not.toBeNull()
  })

  it('should not truncate the url if base url is set it is relative and mocked one is relative', () => {
    setBaseUrl('/abc')
    Mock.get('/rrr/qwe').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/rrr/qwe'))!;

    expect(result).not.toBeNull()
  })

  it('should truncate the url if base url is set it is relative and mocked one is relative and all starts with /', () => {
    setBaseUrl('/abc')
    Mock.get('/abc/qwe').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(result).not.toBeNull()
  })

  it('should truncate the url if base url is set it is relative and mocked one is relative and all starts with / and ends with /', () => {
    setBaseUrl('/abc/')
    Mock.get('/abc/qwe/').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(result).not.toBeNull()
  })

  it('should truncate the url if base url is set it is relative and mocked one is relative and all starts with / and mocked ends with /', () => {
    setBaseUrl('/abc')
    Mock.get('/abc/qwe/').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(result).not.toBeNull()
  })

  it('should truncate the url if base url is set it is relative and ends on /', () => {
    setBaseUrl('/abc/')
    Mock.get('https://example.com/abc/qwe').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(result).not.toBeNull()
  })

  it('should truncate the url if base url is set it is relative and ends on /', () => {
    setBaseUrl('/abc/')
    Mock.get('https://example.com/abc/qwe/').success({f: 12});

    const result = localStorage.getItem(stringifyMockData('get', 'always', '/abc/qwe'))!;

    expect(result).not.toBeNull()
  })
});
