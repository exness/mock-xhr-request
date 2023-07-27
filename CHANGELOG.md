# Changelog

## [1.0.6](https://github.com/exness/mock-xhr-request/compare/v1.0.5...v1.0.6) (2023-07-27)


### Bug Fixes

* **getFullUrlToMock:** do not concat path of base url and relative if second one starts with /; ([00886e3](https://github.com/exness/mock-xhr-request/commit/00886e3f0b8bcc414a91b1441437ba3813ce45ec))


## [1.0.5](https://github.com/exness/mock-xhr-request/compare/v1.0.3...v1.0.5) (2023-05-30)


### Bug Fixes

* **combineUrls:** remove host from base url when combining it with handler url; ([0918125](https://github.com/exness/mock-xhr-request/commit/091812583811e823be60493e4e60b6b6ae6d8c16))


## [1.0.3](https://github.com/exness/mock-xhr-request/compare/v1.0.2...v1.0.3) (2023-05-30)


### Bug Fixes

* **lazyRegisterMock, lazyWrapAxiosAdapter, lazyWrapChildAxiosAdapter:** call imported module in these functions if wrapAxiosAdapter bundle was already loaded; ([a931b4c](https://github.com/exness/mock-xhr-request/commit/a931b4c2ce3b81d757d3b1f2835002243b280b4c))


## [1.0.2](https://github.com/exness/mock-xhr-request/compare/v1.0.1...v1.0.2) (2023-05-24)


### Bug Fixes

* **lazyWrapAxiosAdapter:** move window.MockXHR = lazyMockXHR to lazyWrapAxiosAdapter func body; ([28f2221](https://github.com/exness/mock-xhr-request/commit/28f2221ae3d616d9f255bf5ff5310bdbed5f1157))


## [1.0.1](https://github.com/exness/mock-xhr-request/compare/v1.0.0...v1.0.1) (2023-04-14)


### Bug Fixes

* **registerMock:** removed Promise based mock api in static version of registerMock function; ([21716a8](https://github.com/exness/mock-xhr-request/commit/21716a8aa7dfeb7bcd69918228f3edc081bfe64f))
