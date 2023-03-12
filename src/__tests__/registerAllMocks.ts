import {getMocksFromStorage} from '../getMocksFromStorage';
import { registerAllMocks } from '../registerAllMocks'
import MockAdapter from '../axios-mock-adapter/types'
import { OPTIONAL_SEARCH_KEY, PARAM_KEY, REQUIRED_SEARCH_KEY } from '../constants'

jest.mock('../getMocksFromStorage', () => ({
  getMocksFromStorage: jest.fn(),
}));

const getMocksFromStorageMock = getMocksFromStorage as jest.Mock

const replyFn = jest.fn()
const replyOnceFn = jest.fn()
const onMethodFn = jest.fn().mockReturnValue({reply: replyFn, replyOnce: replyOnceFn})

const getMockAdapter = () => ({
  onGet: onMethodFn,
  onPost: onMethodFn,
})

describe('registerAllMocks', () => {
  beforeAll(() => {
    jest.useFakeTimers('modern')
  })

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should register success reply', () => {
    getMocksFromStorageMock.mockReturnValue([{
      method: 'get',
      status: 200,
      originalStatus: 'success',
      urlOrRegex: 'abc/qwe',
      times: 'always',
      data: {},
      options: {},
      originalUrl: 'abc/qwe'
    }])

    const adapter = getMockAdapter()

    registerAllMocks(adapter as unknown as MockAdapter, 'http://localhost:8080/')

    expect(adapter.onGet).toBeCalledWith('http://localhost:8080/abc/qwe')
    expect(replyFn.mock.lastCall[0]()).toEqual([200, {}])
  });

  it('should register success reply if url starts with base url', () => {
    getMocksFromStorageMock.mockReturnValue([{
      method: 'get',
      status: 200,
      originalStatus: 'success',
      urlOrRegex: '/api/v1/abc/qwe',
      times: 'always',
      data: {},
      options: {},
      originalUrl: 'abc/qwe'
    }])

    const adapter = getMockAdapter()

    registerAllMocks(adapter as unknown as MockAdapter, '/api/v1')

    expect(adapter.onGet).toBeCalledWith('/api/v1/abc/qwe')
    expect(replyFn.mock.lastCall[0]()).toEqual([200, {}])
  });

  it('should register success post reply', () => {
    getMocksFromStorageMock.mockReturnValue([{
      method: 'post',
      status: 200,
      originalStatus: 'success',
      urlOrRegex: 'abc/qwe',
      times: 'always',
      data: {},
      options: {},
      originalUrl: 'abc/qwe'
    }])

    const adapter = getMockAdapter()

    registerAllMocks(adapter as unknown as MockAdapter, 'http://localhost:8080/')

    expect(adapter.onPost).toBeCalledWith('http://localhost:8080/abc/qwe')
    expect(replyFn.mock.lastCall[0]()).toEqual([200, {}])
  });

  it('should replace mock arguments in url on regex', () => {
    getMocksFromStorageMock.mockReturnValue([{
      method: 'post',
      status: 200,
      originalStatus: 'success',
      urlOrRegex: `abc/${PARAM_KEY}/qwe${REQUIRED_SEARCH_KEY}`,
      times: 'always',
      data: {},
      options: {},
      originalUrl: 'abc/qwe'
    }])

    const adapter = getMockAdapter()

    registerAllMocks(adapter as unknown as MockAdapter, 'http://localhost:8080/')

    expect(adapter.onPost.mock.lastCall[0].toString()).toEqual(/http:\/\/localhost:8080\/abc\/[\w-]+\/qwe((\?).+)$/.toString())
    expect(replyFn.mock.lastCall[0]()).toEqual([200, {}])
  });

  it('should replace mock arguments in url on regex if there is no param key', () => {
    getMocksFromStorageMock.mockReturnValue([{
      method: 'post',
      status: 200,
      originalStatus: 'success',
      urlOrRegex: `abc/123/qwe${REQUIRED_SEARCH_KEY}`,
      times: 'always',
      data: {},
      options: {},
      originalUrl: 'abc/qwe'
    }])

    const adapter = getMockAdapter()

    registerAllMocks(adapter as unknown as MockAdapter, 'http://localhost:8080/')

    expect(adapter.onPost.mock.lastCall[0].toString()).toEqual(/http:\/\/localhost:8080\/abc\/123\/qwe((\?).+)$/.toString())
    expect(replyFn.mock.lastCall[0]()).toEqual([200, {}])
  });

  it('should replace mock arguments in url on regex with optional search', () => {
    getMocksFromStorageMock.mockReturnValue([{
      method: 'post',
      status: 200,
      originalStatus: 'success',
      urlOrRegex: `abc/${PARAM_KEY}/qwe${OPTIONAL_SEARCH_KEY}`,
      times: 'always',
      data: {},
      options: {},
      originalUrl: 'abc/qwe'
    }])

    const adapter = getMockAdapter()

    registerAllMocks(adapter as unknown as MockAdapter, 'http://localhost:8080/')

    expect(adapter.onPost.mock.lastCall[0].toString()).toEqual(/http:\/\/localhost:8080\/abc\/[\w-]+\/qwe((\?).+)?$/.toString())
  });

  it('should replace mock arguments in url on regex with optional search if there is no param key', () => {
    getMocksFromStorageMock.mockReturnValue([{
      method: 'post',
      status: 200,
      originalStatus: 'success',
      urlOrRegex: `abc/123/qwe${OPTIONAL_SEARCH_KEY}`,
      times: 'always',
      data: {},
      options: {},
      originalUrl: 'abc/qwe'
    }])

    const adapter = getMockAdapter()

    registerAllMocks(adapter as unknown as MockAdapter, 'http://localhost:8080/')

    expect(adapter.onPost.mock.lastCall[0].toString()).toEqual(/http:\/\/localhost:8080\/abc\/123\/qwe((\?).+)?$/.toString())
  });

  it('should call replyOnce if times is 1', () => {
    getMocksFromStorageMock.mockReturnValue([{
      method: 'post',
      status: 200,
      originalStatus: 'success',
      urlOrRegex: `abc/qwe`,
      times: 1,
      data: {},
      options: {},
      originalUrl: 'abc/qwe'
    }])

    const adapter = getMockAdapter()

    registerAllMocks(adapter as unknown as MockAdapter, 'http://localhost:8080/')

    expect(adapter.onPost.mock.lastCall[0].toString()).toEqual('http://localhost:8080/abc/qwe')
    expect(replyOnceFn.mock.lastCall[0]()).toEqual([200, {}])
  });

  it('should add delay', async () => {
    getMocksFromStorageMock.mockReturnValue([{
      method: 'post',
      status: 200,
      originalStatus: 'success',
      urlOrRegex: `abc/qwe`,
      times: 1,
      data: {},
      options: {
        delay: 2000
      },
      originalUrl: 'abc/qwe'
    }])

    const adapter = getMockAdapter()

    registerAllMocks(adapter as unknown as MockAdapter, 'http://localhost:8080/')

    const promise = replyOnceFn.mock.lastCall[0]()
    jest.advanceTimersByTime(2000)
    const result = await promise

    expect(result).toEqual([200, {}])
  });
});
