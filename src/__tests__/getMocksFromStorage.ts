import {setRelativeBaseUrl} from '../baseUrl';
import {Mock} from '../mockBuilder';
import {getMocksFromStorage} from '../getMocksFromStorage';

describe('getMocksFromStorage', () => {
  beforeEach(() => {
    localStorage.clear();
    setRelativeBaseUrl('');
  });

  it('should return set mocks', () => {
    Mock.get('/abc/qwe').success({a: 1});
    Mock.get('/abc/rty').success({a: 2});

    const mocks = getMocksFromStorage();

    expect(mocks.length).toBe(2);
    expect(mocks.map(x => x.data)).toEqual([{a: 1}, {a: 2}]);
  });

  it('should return set mocks in order with the same url path', () => {
    Mock.get('/abc', 1).success({a: 1});
    Mock.get('/abc', 2).success({a: 2});

    const mocks = getMocksFromStorage();

    expect(mocks.length).toBe(2);
    expect(mocks.map(x => x.data)).toEqual([{a: 1}, {a: 2}]);
  });

  it('should return set mocks in order with the same url path if order is set differently', () => {
    Mock.get('/abc', 2).success({a: 2});
    Mock.get('/abc', 1).success({a: 1});

    const mocks = getMocksFromStorage();

    expect(mocks.length).toBe(2);
    expect(mocks.map(x => x.data)).toEqual([{a: 1}, {a: 2}]);
  });

  it('should override mock in order if times is the same', () => {
    Mock.get('/abc', 1).success({a: 2});
    Mock.get('/abc', 1).success({a: 1});

    const mocks = getMocksFromStorage();

    expect(mocks.length).toBe(1);
    expect(mocks.map(x => x.data)).toEqual([{a: 1}]);
  });

  it('should set mock with always time at the end', () => {
    Mock.get('/abc', 2).success({a: 2});
    Mock.get('/abc').success({a: 3});
    Mock.get('/abc', 1).success({a: 1});

    const mocks = getMocksFromStorage();

    expect(mocks.length).toBe(3);
    expect(mocks.map(x => x.data)).toEqual([{a: 1}, {a: 2}, {a: 3}]);
  });
});
