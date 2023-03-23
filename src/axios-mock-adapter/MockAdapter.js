import {handleRequest} from './handle_request';
import utils from './utils';

var VERBS = ['get', 'post', 'head', 'delete', 'patch', 'put', 'options', 'list', 'link', 'unlink'];

function adapter() {
  return function (config) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    var mockAdapter = this;
    return new Promise(function (resolve, reject) {
      handleRequest(mockAdapter, resolve, reject, config);
    });
  }.bind(this);
}

function getVerbObject() {
  return VERBS.reduce(function (accumulator, verb) {
    accumulator[verb] = [];
    return accumulator;
  }, {});
}

function reset() {
  resetHandlers.call(this);
}

function resetHandlers() {
  this.handlers = getVerbObject();
}

function MockAdapter(axiosInstance, options) {
  reset.call(this);

  if (axiosInstance) {
    this.axiosInstance = axiosInstance;

    // Clone the axios instance to remove interceptors
    // this is used for the passThrough mode with axios > 1.2
    // https://github.com/ctimmerm/axios-mock-adapter/pull/363
    const axiosInstanceWithoutInterceptors = axiosInstance.create ? axiosInstance.create() : undefined;
    this.originalAdapter = axiosInstance.defaults.adapter;
    this.originalRequestFunc = config => {
      // Axios pre 1.2
      if (typeof this.originalAdapter === 'function') {
        return this.originalAdapter(config);
      }

      // Axios v0.17 mutates the url to include the baseURL for non hostnames
      // but does not remove the baseURL from the config
      var baseURL = config.baseURL;
      if (config.baseURL && !/^https?:/.test(config.baseURL)) {
        baseURL = undefined;
      }
      return axiosInstanceWithoutInterceptors(
        Object.assign({}, config, {
          baseURL,
          //  Use the original adapter, not the mock adapter
          adapter: this.originalAdapter,
          // The request transformation runs on the original axios handler already
          transformRequest: [],
          transformResponse: [],
        })
      );
    };

    this.delayResponse = options && options.delayResponse > 0 ? options.delayResponse : null;
    this.onNoMatch = (options && options.onNoMatch) || null;
    axiosInstance.defaults.adapter = this.adapter.call(this);
  } else {
    throw new Error('Please provide an instance of axios to mock');
  }
}

MockAdapter.prototype.adapter = adapter;

MockAdapter.prototype.restore = function restore() {
  if (this.axiosInstance) {
    this.axiosInstance.defaults.adapter = this.originalAdapter;
    this.axiosInstance = undefined;
  }
};

MockAdapter.prototype.reset = reset;
MockAdapter.prototype.resetHandlers = resetHandlers;

VERBS.concat('any').forEach(function (method) {
  var methodName = 'on' + method.charAt(0).toUpperCase() + method.slice(1);
  MockAdapter.prototype[methodName] = function (matcher, body, requestHeaders) {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    var _this = this;
    // eslint-disable-next-line @typescript-eslint/no-redeclare
    var matcher = matcher === undefined ? /.*/ : matcher;

    function reply(code, response, headers) {
      var handler = [matcher, body, requestHeaders, code, response, headers];
      addHandler(method, _this.handlers, handler);
      return _this;
    }

    function replyOnce(code, response, headers) {
      var handler = [matcher, body, requestHeaders, code, response, headers, true];
      addHandler(method, _this.handlers, handler);
      return _this;
    }

    return {
      reply,

      replyOnce,

      passThrough: function passThrough() {
        var handler = [matcher, body];
        addHandler(method, _this.handlers, handler);
        return _this;
      },

      abortRequest() {
        return reply(function (config) {
          var error = utils.createAxiosError('Request aborted', config, undefined, 'ECONNABORTED');
          return Promise.reject(error);
        });
      },

      abortRequestOnce() {
        return replyOnce(function (config) {
          var error = utils.createAxiosError('Request aborted', config, undefined, 'ECONNABORTED');
          return Promise.reject(error);
        });
      },

      networkError() {
        return reply(function (config) {
          var error = utils.createAxiosError('Network Error', config);
          return Promise.reject(error);
        });
      },

      networkErrorOnce() {
        return replyOnce(function (config) {
          var error = utils.createAxiosError('Network Error', config);
          return Promise.reject(error);
        });
      },

      timeout() {
        return reply(function (config) {
          var error = utils.createAxiosError(
            config.timeoutErrorMessage || 'timeout of ' + config.timeout + 'ms exceeded',
            config,
            undefined,
            'ECONNABORTED'
          );
          return Promise.reject(error);
        });
      },

      timeoutOnce() {
        return replyOnce(function (config) {
          var error = utils.createAxiosError(
            config.timeoutErrorMessage || 'timeout of ' + config.timeout + 'ms exceeded',
            config,
            undefined,
            'ECONNABORTED'
          );
          return Promise.reject(error);
        });
      },
    };
  };
});

function findInHandlers(method, handlers, handler) {
  var index = -1;
  for (var i = 0; i < handlers[method].length; i += 1) {
    var item = handlers[method][i];
    var isReplyOnce = item.length === 7;
    var comparePaths =
      item[0] instanceof RegExp && handler[0] instanceof RegExp
        ? String(item[0]) === String(handler[0])
        : item[0] === handler[0];
    var isSame = comparePaths && utils.isEqual(item[1], handler[1]) && utils.isEqual(item[2], handler[2]);
    if (isSame && !isReplyOnce) {
      index = i;
    }
  }
  return index;
}

function addHandler(method, handlers, handler) {
  if (method === 'any') {
    VERBS.forEach(function (verb) {
      handlers[verb].push(handler);
    });
  } else {
    var indexOfExistingHandler = findInHandlers(method, handlers, handler);
    if (indexOfExistingHandler > -1 && handler.length < 7) {
      handlers[method].splice(indexOfExistingHandler, 1, handler);
    } else {
      handlers[method].push(handler);
    }
  }
}

export {MockAdapter};
