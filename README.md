# mock-xhr-request

Mocking library, that allows to mock requests made with [axios](https://github.com/axios/axios) npm package 

### Features

- Mock requests right in browser console
- Do it everywhere, even on production(if you want)
- Set up with one line of code
- Supports lazy load
- Easy to share the whole mock environment
- Supports mocking in external components(e.g. by webpack module federation)

## Install

```bash
npm install mock-xhr-request
```
Or
```bash
yarn add mock-xhr-request
```

### Quickstart

```typescript
import { wrapAxiosAdapter} from 'mock-xhr-request'

wrapAxiosAdapter(axiosInstance)

// in browser console
MockXHR.enable()
MockXHR.get('/api/account/:id/information').success({ firstName: 'John', lastName: 'Doe' })
```

## Library API

### wrapAxiosAdapter
To start using mock system need call this function by passing axios instance as a first argument.
Second argument "baseUrl" allow to register prepared mocks without the need to base url from the site root.

```typescript
import { wrapAxiosAdapter} from 'mock-xhr-request'

//Usage
wrapAxiosAdapter(axiosInstance, '/api/v2')

// API
wrapAxiosAdapter(axiosInstance: AxiosInstance, baseUrl: string = location.origin): void
```

### wrapChildAxiosAdapter
if you have external widgets, which use its own axios instance, just call this function in their module. 
That will allow to set and share mocks across the application root and widget's module.

```typescript
import { wrapChildAxiosAdapter} from 'mock-xhr-request'

//Usage
wrapChildAxiosAdapter(axiosInstance, 'userInfoWidget', '/api/v2')

// API
wrapChildAxiosAdapter(axiosInstance: AxiosInstance, widgetName: string, baseUrl: string = location.origin): void
```

### registerMock
To prepare mock in application, call this function with all required arguments, which are
1) Url path - started with / if set from the site root, or without /, then it will be registered based on passed baseUrl argument
2) Http method (get/post/patch/put/delete)
3) Status code or success(200)/error(424) key word
4) Mock data represented by JSON object

Url path as a string value supports several placeholders:
1) Any word - ``:someWord``, where under someWord variable could be sequence of letters with numbers.
2) Required search - ``:!search``, used at the end of Url path to signify, that the Url search should be present.
3) Non required search - ``:?search`` not required Url search.

Instead of string URL path you can use RegExp.

```typescript
import { registerMock} from 'mock-xhr-request'

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

## MockXHR API
This section describes the api of MockXHR global variable, that appears as global object(property of window) after wrapping the axios instance. 

### MockXHR.enable
To enable mock system, call this function. In simple mode(not lazy) you can set/delete mocks without enabling mock system. 
To see the result, refresh the web page. All set mocks are applied only after refresh.

```typescript
// usage
MockXHR.enable()

// API
MockXHR.enable()
```

### MockXHR.disable
To disable mock system call this function. Disabling will not clear the set mocks. Don't forget to refresh the web page.

```typescript
// usage
MockXHR.disable()

// API
MockXHR.disable()
```

### MockXHR.load
If you want to use lazy load, switch to import from ``mock-xhr-request/lazy``. Call load function to load mock system library in browser context.
After the first load the js bundle should be cached. You can start setting mocks without page refresh.

```typescript
// usage
MockXHR.load()

// API
MockXHR.load()
```

### MockXHR.unload
If you want to use lazy load, switch to import from ``mock-xhr-request/lazy``. Call unload function to unload mock system library from browser context.
On the next web page refresh, mock system will stop loading its main js bundle, but that doesn't mean, that it will be unloaded from browser cache.

```typescript
// usage
MockXHR.unload()

// API
MockXHR.unload()
```


### MockXHR.get/post/patch/put/delete
To mock request in browser console call one of the methods (get/post/patch/put/delete) and pass url path. Then call one of the continuation methods:
1) success - that will set 200 code response.
2) error - is equivalent to 424 status code.
3) withStatus - here you can specify any number status code as first argument, second and other ones are the same as in success/error methods.
4) withDelay - before calling success/error/withStatus methods you can call this one to set response delay in milliseconds.

The second argument for http method function(get/post/...) is order number. You can set mocks in order. 
The mock with last order number of mock without order will be used as default for specified url path.

The url path could string with placeholders(any word, required and optional search) or RegExp. 
if you call ``success`` or ``error`` functions without arguments, the mock system will try to apply the prepared mock, if url path matches. 

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
  .withDelay(time: number)
  .withStatus(status: number, data: object, headers?: object);
```

### MockXHR.applyReady
To apply prepared mock call this function with mock name or index number, which you can get by calling ``MockXHR.getSetMocks()``.
You can pass modifier object to change prepared mock value. All properties in modifier object are optional.
If prepared mock name is the same as for main site, you need to pass widget name avoid collide. 

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
Call it with passing delay time in milliseconds. That will set response delay time in ms for all mocks. Local call withDelay has more priority.

```typescript
//Usage
MockXHR.setDelayResponseTime(2000); // will set 2 seconds delay time

// API
MockXHR.setDelayResponseTime(delayMs: number);
```

### MockXHR.clearDelayResponseTime
To remove global response delat time call this function.

```typescript
//Usage
MockXHR.clearDelayResponseTime(); // will set 2 seconds delay time

// API
MockXHR.clearDelayResponseTime();
```

### MockXHR.clearMock
To clear specified mock call this function passing its index number (from getSetMocks) or url path, that was used when setting it.
If you delete mock by url path, you can also specify http method. That will delete only specified mock, not all mocks, which url paths match passed one.

```typescript
//Usage
MockXHR.clearMock('/api/account/:id/information');
// Or with index number
MockXHR.clearMock(3);
// By url path and http method
MockXHR.clearMock('/api/account/:id/information', 'get');

// API
MockXHR.clearMock(urlOrRegex: number | string | RegExp, method?: 'get' | 'post' | 'put' | 'delete');
```

### MockXHR.clearAll
To clear all set in console mocks, call this function without arguments. If you want to clear also global delay time and disable mock system, pass ``true``.

```typescript
//Usage
MockXHR.clearAll()
// To clear also delay time and disable mock system
MockXHR.clearAll(true)

// API
MockXHR.clearAll(clearEverything: boolean);
```

### MockXHR.snapshot
To get a serialized string of all set mocks, call this function. In return, you will get a string, that should be passed to applySnapshot function to set the same mock environment. 
If you want to set this string in your copy/paste buffer, pass ``true`` in arguments and set within 2 seconds focus on browser.
```typescript
// Usage
MockXHR.snapshot() // copy the result from the browser console
// to set the snapshot in copy/paste buffer
MockXHR.snapshot(true) // do not forget to set focus on browser within 2 seconds

// API
MockXHR.snapshot(copyToClipboard: boolean = false): string | void
```

### MockXHR.applySnapshot
To apply serialized mocks pass string as argument to this function. 
If you want to take serialized string from your copy/paste buffer, pass ``true`` in arguments and set within 2 seconds focus on browser.

```typescript
// Usage
MockXHR.applySnapshot('some content');
// Or from buffer
MockXHR.applySnapshot(true);

// API
MockXHR.applySnapshot(value: string | true);
```

### MockXHR.getSetMocks
To get a list of all set mocks, call this function. You will return the JSON object, that will be nicely rendered by browser in console.

```typescript
// Usage
MockXHR.getSetMocks();

// API
MockXHR.getSetMocks(): Record<string, object>
```

### MockXHR.getRegisteredMocks
To get a list of all prepared in app mocks, including mocks from external components. 

```typescript
// Usage
MockXHR.getRegisteredMocks()
// Passing search term
MockXHR.getRegisteredMocks('information')

// API
MockXHR.getRegisteredMocks(url?: string): Record<string, object>
```

```typescript

// to set optional search params
MockXHR.get('company_info/:secret:?search').success()
// to set required search params
MockXHR.get('company_info/:secret:!search').success()
// to change or add some parameters for prepared mock (all params are optional)
MockXHR.applyReady(21, {
  data: data => ({...data, balance: 123}),
  times: 1,
  delay: 2000,
  status: 401,
  headers: {requestId: 456}
})
// to change or add some parameters for prepared with name mock (all params are optional)
MockXHR.applyReady('401GetAccounts', {
  data: data => ({...data, balance: 123}),
  times: 1,
  delay: 2000,
  status: 401,
  headers: {requestId: 456}
})
// returns set in console mocks
MockXHR.getSetMocks()
// returns registered in App auto-mocks
MockXHR.getRegisteredMocks()
// returns registered in App auto-mocks which equals or includes the string "/account" in their URL
MockXHR.getRegisteredMocks('/account') 
```

## Notes

Local delay time always takes precedence for global one.

Relative url - start with **/**. Example - **company_info/:secret**

Absolute one - without **/**. Example - **/v3/async/company_info/:secret**

Second parameter of wrapAxiosAdapter function is base url, all mocked url will be based on it.

## Examples

```typescript
wrapAxiosAdapter(axiosInstance, 'http://localhost:8080/v3/async')
MockXHR.get('company_info/:secret').success()
```
Mocked url will be **http://localhost:8080/v3/async/company_info/:secret** where **:secret** is any word
