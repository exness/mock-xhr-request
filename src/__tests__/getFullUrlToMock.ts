import {getFullUrlToMock} from '../registerAllMocks';

describe('getFullUrlToMock', () => {
  it('should return relative URL if it starts with the base URL', () => {
    const baseUrl = 'https://example.com/api';
    const relativeUrl = '/users';
    const result = getFullUrlToMock(baseUrl, relativeUrl);
    expect(result).toBe('https://example.com/users');
  });

  it('should return relative URL if the base URL is "/"', () => {
    const baseUrl = '/';
    const relativeUrl = '/posts';
    const result = getFullUrlToMock(baseUrl, relativeUrl);
    expect(result).toBe('/posts');
  });

  it('should return the full URL when the relative URL does not start with "/"', () => {
    const baseUrl = 'https://example.com/api';
    const relativeUrl = 'users';
    const result = getFullUrlToMock(baseUrl, relativeUrl);
    expect(result).toBe('https://example.com/api/users');
  });

  it('should return the full URL when the base URL starts with "http"', () => {
    const baseUrl = 'https://example.com';
    const relativeUrl = '/posts';
    const result = getFullUrlToMock(baseUrl, relativeUrl);
    expect(result).toBe('https://example.com/posts');
  });

  it('should return the full URL when the base URL starts with "https"', () => {
    const baseUrl = 'https://example.com';
    const relativeUrl = '/articles';
    const result = getFullUrlToMock(baseUrl, relativeUrl);
    expect(result).toBe('https://example.com/articles');
  });

  it('should return the relative URL when the base URL starts with "/"', () => {
    const baseUrl = '/abc/';
    const relativeUrl = '/articles';
    const result = getFullUrlToMock(baseUrl, relativeUrl);
    expect(result).toBe('/articles');
  });
});
