import {DELAY_MOCK_KEY, MOCK_PREFIX} from '../constants';
import {clearAll} from '../clearAll';

describe('clearAll', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  const abcKey = 'abc'
  const mockKey = `${MOCK_PREFIX}abc`

  it('should clear all mocks', () => {
    localStorage.setItem(abcKey, '123');
    localStorage.setItem(mockKey, '456');
    localStorage.setItem(DELAY_MOCK_KEY, '900');

    clearAll();

    expect(localStorage.getItem(abcKey)).toEqual('123');
    expect(localStorage.getItem(mockKey)).toEqual(null);
    expect(localStorage.getItem(DELAY_MOCK_KEY)).toEqual('900');
  });

  it('should clear all mocks', () => {
    localStorage.setItem(abcKey, '123');
    localStorage.setItem(mockKey, '456');
    localStorage.setItem(DELAY_MOCK_KEY, '900');

    clearAll(true);

    expect(localStorage.getItem(abcKey)).toEqual('123');
    expect(localStorage.getItem(mockKey)).toEqual(null);
    expect(localStorage.getItem(DELAY_MOCK_KEY)).toEqual(null);
  });
});
