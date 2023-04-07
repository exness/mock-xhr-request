# @exness-tech/mock-xhr-request

Mocking library, that allows mocking AJAX requests made with [axios](https://github.com/axios/axios) npm package 

### Features

- Mock AJAX requests right in the browser console
- Do it everywhere, even on production(if you want)
- Set up with one line of code
- Supports lazy load
- Easy to share the whole mock environment
- Supports mocking in external components(e.g. by webpack module federation)
- Allows preparing mocks in the application, even in lazy load mode

## Install

```bash
npm install @exness-tech/mock-xhr-request
```
Or
```bash
yarn add @exness-tech/mock-xhr-request
```

### Quickstart

```typescript
import { wrapAxiosAdapter} from '@exness-tech/mock-xhr-request'

wrapAxiosAdapter(axiosInstance)

// in browser console
MockXHR.enable()
MockXHR.get('/api/account/:id/information').success({ firstName: 'John', lastName: 'Doe' })
```

## Library API

### wrapAxiosAdapter
To start using the mock system call this function by passing axios instance as a first argument.

```typescript
import { wrapAxiosAdapter} from '@exness-tech/mock-xhr-request'

//Usage
wrapAxiosAdapter(axiosInstance)

// API
wrapAxiosAdapter(axiosInstance: AxiosInstance): void
```

### wrapChildAxiosAdapter
If you have external widgets, which use their own axios instance, just call this function in their module.
That will allow us to set and share mocks across the application root and widget's module.

```typescript
import { wrapChildAxiosAdapter} from '@exness-tech/mock-xhr-request'

//Usage
wrapChildAxiosAdapter(axiosInstance, 'userInfoWidget')

// API
wrapChildAxiosAdapter(axiosInstance: AxiosInstance, widgetName: string): void
```

### setDefaultOptions
To change default options call this function, passing an object's possible keys:
1) autoDisable - time in milliseconds to auto-disable mock system
2) baseUrl - URL which stars from / or HTTP to allow register mocks with URL path, relative to baseUrl
3) successStatusCode - status code, that will be used when calling the success method
4) errorStatusCode - status code, that will be used when calling the error method

```typescript
import { setDefaultOptions} from '@exness-tech/mock-xhr-request'

setDefaultOptions({
  successStatusCode?: number = 200,
  errorStatusCode?: number = 424,
  baseUrl?: string = '/',
  autoDisable?: boolean | number = 2000, // 2 seconds
})
```

### registerMock
To prepare a mock in the application, call this function with all required arguments, which are
1) Url path - started with/if set from the site root, or without /, then it will be registered based on the passed baseUrl argument
2) Http method (get/post/patch/put/delete)
3) Status code or success(200)/error(424) key word
4) Mock data represented by JSON object

URL path as a string value supports several placeholders:
1) Any word - ``:someWord``, where under someWord variable could be a sequence of letters with numbers.
2) Required search - ``:!search``, used at the end of the URL path to signify, that the Url search should be present.
3) Non required search - ``:?search`` not required Url search.

Instead of a string URL path, you can use RegExp.

```typescript
import { registerMock} from '@exness-tech/mock-xhr-request'

// Usage
const mockedUserInfo = { firstName: 'John', lastName: 'Doe' }
registerMock(
  '/api/account/:id/information',
  'get',
  'success',
  mockedUserInfo,
)
// Or
registerMock(
  /\/account\/\d+\/information/,
  'get',
  200,
  mockedUserInfo,
)

// API
registerMock(
  urlOrRegex: string | RegExp,
  method: 'get' | 'post' | 'put' | 'delete',
  status: 'success' | 'error' | number,
  data: object,
)
```

You can also add name to prepared mock to refer to it by name later. Call the ``withName`` function from the result of ``registerMock`` call.
```typescript
// Usage
registerMock(
  '/api/account/:id/information',
  'get',
  'success',
  mockedUserInfo,
).withName('userInfoSuccess')

// later by applying it in console
MockXHR.applyReady('userInfoSuccess')

// API
registerMock(
  ...
).withName('userInfoSuccess')
```

If you want to set headers in response, you can call ``withHeaders`` function and pass JSON object with headers.

```typescript
// Usage
registerMock(
  '/api/account/:id/information',
  'get',
  'success',
  mockedUserInfo,
).withHeaders({ 'X-RequestId': 12345 })

// API
registerMock(
  ...
).withHeaders(headers: Record<string, string | number | boolean>)
```

All registerMock function arguments also could be passed through function.

```typescript
// Usage
registerMock(() => ({
    urlOrRegex: '/api/account/:id/information',
    method: 'get',
    status: 'success',
    data: mockedUserInfo,
    name: 'userInfoSuccess',
    headers: { 'X-RequestId' : 12345 } 
  })
)

// API
type UrlOrRegex = string | RegExp
type HttpMethod = 'get' | 'post' | 'patch' | 'delete' | 'put'
type CodeStatus = number | 'success' | 'error'
type ResponseData = unknown
type ResponseHeaders = Record<string, string | number | boolean>

registerMock({
    urlOrRegex: UrlOrRegex,
    method: HttpMethod,
    status: CodeStatus,
    data: ResponseData,
    name? : string,
    headers? : ResponseHeaders
  }
)
```

If you have data, which is loaded in lazy mode, you can pass function, that returns promise with mock parameters.

```typescript
// Usage
import { registerMock } from '@exness-tech/mock-xhr-request/lazy'

registerMock(() => import('./userInfo/mock').then(m => m.userInfoMock)) // mock file contains variable userInfoMock with mock JSON value

// API
registerMock(() => Promise<{
    urlOrRegex: UrlOrRegex,
    method: HttpMethod,
    status: CodeStatus,
    data: ResponseData,
    name?: string,
    headers?: ResponseHeaders
  }>
)
```

## MockXHR API
This section describes the api of MockXHR global variable, that appears as global object(property of window) after wrapping the axios instance. 

### MockXHR.enable
To enable mock system, call this function. In simple mode(not lazy) you can set/delete mocks without enabling mock system. To see the result, refresh the web page. 
All set mocks are applied only after refresh. If you want to use lazy load, switch to import from ``@exness-tech/mock-xhr-request/lazy``. Call this function to load mock system library in browser context.
After the first load the js bundle should be cached. You can start setting mocks without page refresh. Mock system should be enabled already at this time.

```typescript
// usage
MockXHR.enable()

// API
MockXHR.enable()
```

### MockXHR.disable
To disable mock system call this function. Disabling will not clear the set mocks. Don't forget to refresh the web page.
If you want to use lazy load, switch to import from ``@exness-tech/mock-xhr-request/lazy``. Call this function to unload mock system library from browser context.
On the next web page refresh, mock system will stop loading its main js bundle, but that doesn't mean, that it will be unloaded from browser cache.

```typescript
// usage
MockXHR.disable()

// API
MockXHR.disable()
```

### MockXHR.get/post/patch/put/delete
To mock request in browser console call one of the methods (get/post/patch/put/delete) and pass URL path. Then call one of the continuation methods:
1) success - that will set 200 code response.
2) error - is equivalent to 424 status code.
3) withStatus - here you can specify any number status code as first argument, second and other ones are the same as in success/error methods.
4) withDelay - before calling success/error/withStatus methods you can call this one to set response delay in milliseconds. Default value for delay is 2147483647 ms

The second argument for http method function(get/post/...) is order number. You can set mocks in order. 
The mock with last order number of mock without order will be used as default for specified URL path.

The URL path could string with placeholders(any word, required and optional search) or RegExp. 
if you call ``success`` or ``error`` functions without arguments, the mock system will try to apply the prepared mock, if URL path matches. 

```typescript
// Usage
const successData = { firstName: 'John', lastName: 'Doe' }
MockXHR.get('/api/account/:id/information').success(successData);
// With error code (424)
const errorData = { reason: 'some reason', code: 123 }
MockXHR.get('/api/account/:id/information').error(errorData);
// With 2 seconds delay
MockXHR.get('/api/account/:id/information').withDelay(2000).success(successData);
// With custom status code
MockXHR.get('/api/account/:id/information').withStatus(403, errorData);
// In order
const urlPath = '/api/account/:id/information'
MockXHR.get(urlPath, 1).success(some mock);
MockXHR.get(urlPath, 2).success(another mock);
MockXHR.get(urlPath).success(default mock);
// apply prepared mock
registerMock('/api/account/:id/information', ... other args); // call it in code

MockXHR.get('/api/account/:id/information').success(); // call it in console

// API
MockXHR.get(urlOrRegex: string | RegExp, times: number | 'always');
MockXHR.post(urlOrRegex: string | RegExp, times: number | 'always');
MockXHR.put(urlOrRegex: string | RegExp, times: number | 'always');
MockXHR.delete(urlOrRegex: string | RegExp, times: number | 'always');

MockXHR
  .get(urlOrRegex: string | RegExp, times: number | 'always')
  .success(data?: object, headers?: object);

MockXHR
  .get(urlOrRegex: string | RegExp, times: number | 'always')
  .error(data?: object, headers?: object);

MockXHR
  .get(urlOrRegex: string | RegExp, times: number | 'always')
  .withDelay(time?: number = 2147483647)
  .withStatus(status: number, data: object, headers?: object);
```

### MockXHR.applyReady
To apply the prepared mock call this function with a mock name or index number, which you can get by calling ``MockXHR.getSetMocks()``.
You can pass the modifier object to change the prepared mock value. All properties in the modifier object are optional.
If the prepared mock name is the same as for the main site, you need to pass the widget name to avoid collisions.

```typescript
// Usage
registerMock(...).withName('userInfoSuccess'); // first register a prepared mock 

MockXHR.applyReady('userInfoSuccess');
// Or pass an index number
MockXHR.applyReady(12); // it is a number, that you can see by calling MockXHR.getSetMocks() function
// With modifier
MockXHR.applyReady(12, {
  data: data => ({...data, lastName: 'Wick'}),
  times: 1,
  delay: 2000,
  status: 401,
  headers: { 'X-Request-Id' : 456}
})
// Specify the widget name to set mock from external component
MockXHR.applyReady('userInfoSuccess', 'userInfoWidget');

// API
MockXHR.applyReady(mockNameOrIndex: number | string, options?: OverrideOptions)
MockXHR.applyReady(mockNameOrIndex: number | string, widgetName?: string)
MockXHR.applyReady(mockNameOrIndex: number | string, widgetName?: string, options?: OverrideOptions)
```

### MockXHR.setDelayResponseTime
Call it with passing delay time in milliseconds. That will set the response delay time in ms for all mocks. Local call of "withDelay" function has more priority.

```typescript
//Usage
MockXHR.setDelayResponseTime(2000); // will set 2 seconds delay time

// API
MockXHR.setDelayResponseTime(delayMs: number);
```

### MockXHR.clearDelayResponseTime
To remove global response delay time call this function.

```typescript
//Usage
MockXHR.clearDelayResponseTime(); // will set 2 seconds delay time

// API
MockXHR.clearDelayResponseTime();
```

### MockXHR.clearMock
To clear specified mock calls this function passes its index number (from getSetMocks) or URL path, that was used when setting it.
If you delete the mock by URL path, you can also specify the HTTP method. That will delete only specified mock, not all, in which URL paths match the passed one.

```typescript
//Usage
MockXHR.clearMock('/api/account/:id/information');
// Or with index number
MockXHR.clearMock(3);
// By URL path and http method
MockXHR.clearMock('/api/account/:id/information', 'get');

// API
MockXHR.clearMock(urlOrRegex: number | string | RegExp, method?: 'get' | 'post' | 'put' | 'delete');
```

### MockXHR.clearAll
To clear all set in console mocks, call this function without arguments. If you want to also clear global delay time and disable the mock system, pass ``true``.

```typescript
//Usage
MockXHR.clearAll()
// To clear also delay time and disable mock system
MockXHR.clearAll(true)

// API
MockXHR.clearAll(clearEverything: boolean);
```

### MockXHR.snapshot
To get a serialized string of all set mocks, call this function. In return, you will get a string, that should be passed to the "applySnapshot" function to set the same mock environment.
If you want to set this string in your copy/paste buffer, pass ``true`` in arguments and set it within 2 seconds focus on the browser.

```typescript
// Usage
MockXHR.snapshot() // copy the result from the browser console
// to set the snapshot in copy/paste buffer
MockXHR.snapshot(true) // do not forget to set focus on browser within 2 seconds

// API
MockXHR.snapshot(copyToClipboard: boolean = false): string | void
```

### MockXHR.applySnapshot
To apply serialized mocks pass a string as an argument to this function.
If you want to take a serialized string from your copy/paste buffer, pass ``true`` in arguments and set it within 2 seconds focusing on the browser.

```typescript
// Usage
MockXHR.applySnapshot('some content');
// Or from buffer
MockXHR.applySnapshot(true);

// API
MockXHR.applySnapshot(value: string | true);
```

### MockXHR.getSetMocks
To get a list of all set mocks, call this function. You will receive the JSON object, which will be nicely rendered by the browser in the console.

```typescript
// Usage
MockXHR.getSetMocks();

// API
MockXHR.getSetMocks(): Record<string, object>
```

### MockXHR.getRegisteredMocks
To get a list of all prepared in-app mocks, including mocks from external components.

```typescript
// Usage
MockXHR.getRegisteredMocks();
// Passing search term
MockXHR.getRegisteredMocks('information');

// API
MockXHR.getRegisteredMocks(url?: string): Record<string, object>
```

## Notes

Local delay time always takes precedence for global one.

Relative URL - start with **/**. Example - **company_info/:secret**

Absolute one - without **/**. Example - **/v3/async/company_info/:secret**

The second parameter of the "wrapAxiosAdapter" function is the base URL, all mocked URLs will be based on it.

## Examples

### Mocking request for user info

```typescript
import axios from 'axios'
import { wrapAxiosAdapter, registerMock, setDefaultOptions } from '@exness-tech/mock-xhr-request'

setDefaultOptions({ baseUrl: '/api/v2'}); // only for shortening the URL path in the registerMock function

const isProd = process.env.NODE_ENV !== 'production';
const baseApiUrl = isProd ? 'http://localhost:8080/api/v2' : '/api/v2';
const axiosInstance = axios.create({ withCredentials: true });

wrapAxiosAdapter(axiosInstance);

const mockData = { userName: 'johnDoe123', age: 30 }
registerMock('user/:id/info', 'get', 200, mockData);
const getUserInfo = (userId: number): Promise<UserInfo> => {
  const url = `${baseApiUrl}/user/${userId}/info`;
  return axiosInstance.get<UserInfo>(url);
}

// somewhere in code the request happens
api.getUserInfo(accountId).then(userInfo => renderUser(userInfo));

// in browser console
MockXHR.enable(); // call it once, no need to do it after the page load/refresh
MockXHR.get('/api/v2/user/:id/info').success(); // will be applied the prepared mock
// Or set mock for specified user id
MockXHR.get('/api/v2/user/345/info').success({
  userName: 'Some user name',
  age: 99
});
// Or set mocks in order, the second request will return another response
MockXHR.get('/api/v2/user/:id/info', 1).success({
  userName: 'User name for the first request',
  age: 50
});
MockXHR.get('/api/v2/user/:id/info', 2).success({
  userName: 'Another response',
  age: 99
});
// Or return error 401 and add delay to check how the site reacts to long requests
MockXHR.get('/api/v2/user/345/info')
  .withDelay(2000)
  .withStatus(401, {
    reason: 'unauthorized',
    internal_code: 898232
  });
```

Mocked URL will be **http://localhost:8080/api/v2/user/:id/info**, in dev mode, and for prod, the version is **/api/v2/user/:id/info**.
The mock system will return mocked results until disabling or unloading.
