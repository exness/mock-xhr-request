import {normalizeUrl} from '../normilizeUrl';
import {OPTIONAL_SEARCH_KEY, PARAM_KEY, REQUIRED_SEARCH_KEY} from '../constants';

describe('normalizeUrl', () => {
  it('should produce absolute url', () => {
    const url = normalizeUrl('http://localhost:8000/abc/qwe');

    expect(url).toBe('/abc/qwe');
  });

  it('should accept the absolute url', () => {
    const url = normalizeUrl('/abc/qwe');

    expect(url).toBe('/abc/qwe');
  });

  it('should accept the relative url', () => {
    const url = normalizeUrl('abc/qwe');

    expect(url).toBe('abc/qwe');
  });

  it('should accept url starts with /', () => {
    const url = normalizeUrl('/abc/qwe');

    expect(url).toBe('/abc/qwe');
  });

  it('should accept url starts with / and ends with /', () => {
    const url = normalizeUrl('/abc/qwe/');

    expect(url).toBe('/abc/qwe');
  });

  it('should replace params on special keywords', () => {
    const url = normalizeUrl('/:account/qwe:?search');

    expect(url).toBe(`/${PARAM_KEY}/qwe${OPTIONAL_SEARCH_KEY}`);
  });

  it('should replace required search param', () => {
    const url = normalizeUrl('/abc/qwe:!search');

    expect(url).toBe(`/abc/qwe${REQUIRED_SEARCH_KEY}`);
  });
});
