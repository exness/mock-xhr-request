import {DELAY_MOCK_KEY, MOCK_PREFIX} from '../constants';
import {clearMock} from '../clearMock';

describe('clearMock', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('should clear all mocks with passed url', () => {
    localStorage.setItem('abc', '123');
    localStorage.setItem(`${MOCK_PREFIX}(post)[1]abc/qwe`, '123');
    localStorage.setItem(`(put)[1]abc/qwe`, '789');
    localStorage.setItem(DELAY_MOCK_KEY, '900');

    clearMock('abc/qwe');

    expect(localStorage.getItem('abc')).toEqual('123');
    expect(localStorage.getItem(`${MOCK_PREFIX}(post)[1]abc/qwe`)).toEqual(null);
    expect(localStorage.getItem(`${MOCK_PREFIX}(get)[1]abc/qwe`)).toEqual(null);
    expect(localStorage.getItem('(put)[1]abc/qwe')).toEqual('789');
    expect(localStorage.getItem(DELAY_MOCK_KEY)).toEqual('900');
  });

  it('should clear mock by number', () => {
    localStorage.setItem('abc', '123');
    localStorage.setItem(`${MOCK_PREFIX}(post)[1]abc/qwe`, '123');
    localStorage.setItem(`${MOCK_PREFIX}(get)[1]abc/www`, '456');
    localStorage.setItem(`(put)[1]abc/qwe`, '789');
    localStorage.setItem(DELAY_MOCK_KEY, '900');

    clearMock(2);

    expect(localStorage.getItem('abc')).toEqual('123');
    expect(localStorage.getItem(`${MOCK_PREFIX}(post)[1]abc/qwe`)).toEqual('123');
    expect(localStorage.getItem(`${MOCK_PREFIX}(get)[1]abc/www`)).toEqual(null);
    expect(localStorage.getItem('(put)[1]abc/qwe')).toEqual('789');
    expect(localStorage.getItem(DELAY_MOCK_KEY)).toEqual('900');
  });

  it('should clear mock by number if delay mock key is earlie', () => {
    localStorage.setItem(DELAY_MOCK_KEY, '900');
    localStorage.setItem(`(put)[1]abc/qwe`, '789');
    localStorage.setItem('abc', '123');
    localStorage.setItem(`${MOCK_PREFIX}(post)[1]abc/qwe`, '123');
    localStorage.setItem(`${MOCK_PREFIX}(get)[1]abc/www`, '456');

    clearMock(2);

    expect(localStorage.getItem('abc')).toEqual('123');
    expect(localStorage.getItem(`${MOCK_PREFIX}(post)[1]abc/qwe`)).toEqual('123');
    expect(localStorage.getItem(`${MOCK_PREFIX}(get)[1]abc/www`)).toEqual(null);
    expect(localStorage.getItem('(put)[1]abc/qwe')).toEqual('789');
    expect(localStorage.getItem(DELAY_MOCK_KEY)).toEqual('900');
  });

  it('should clear mock by url and method', () => {
    localStorage.setItem('abc', '123');
    localStorage.setItem(`${MOCK_PREFIX}(post)[1]abc/qwe`, '123');
    localStorage.setItem(`${MOCK_PREFIX}(get)[1]abc/qwe`, '456');

    clearMock('abc/qwe', 'get');

    expect(localStorage.getItem(`${MOCK_PREFIX}(post)[1]abc/qwe`)).toEqual('123');
    expect(localStorage.getItem(`${MOCK_PREFIX}(get)[1]abc/qwe`)).toEqual(null);
  });

  it('should clear mock by regex', () => {
    const regex = /abc\/qwe\/:\d+/;
    localStorage.setItem('abc', '123');
    localStorage.setItem(`${MOCK_PREFIX}(post)[1]${regex}`, '123');

    clearMock(regex);

    expect(localStorage.getItem('abc')).toEqual('123');
    expect(localStorage.getItem(`${MOCK_PREFIX}(post)${regex}`)).toEqual(null);
  });
});
