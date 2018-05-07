(function e(t, n, r) {
    function s(o, u) {
      if (!n[o]) {
        if (!t[o]) {
          var a = typeof require == "function" && require;
          if (!u && a) return a(o, !0);
          if (i) return i(o, !0);
          var f = new Error("Cannot find module '" + o + "'");
          throw f.code = "MODULE_NOT_FOUND", f
        }
        var l = n[o] = {
          exports: {}
        };
        t[o][0].call(l.exports, function (e) {
          var n = t[o][1][e];
          return s(n ? n : e)
        }, l, l.exports, e, t, n, r)
      }
      return n[o].exports
    }
    var i = typeof require == "function" && require;
    for (var o = 0; o < r.length; o++) s(r[o]);
    return s
  })({
    1: [function (require, module, exports) {
      var pathToRegexp = require('pathToRegexp');
      (function (global, factory) {
        // if(!global.document)
        //   throw new Error( "hashRouter requires a window with a document" );
        global.qRouter = factory();
      })(window, function () {
        // https://tc39.github.io/ecma262/#sec-array.prototype.find
        if (!Array.prototype.find) {
          Object.defineProperty(Array.prototype, 'find', {
            value: function (predicate) {
              if (this == null) {
                throw new TypeError('"this" is null or not defined');
              }
              var o = Object(this);
              var len = o.length >>> 0;
              if (typeof predicate !== 'function') {
                throw new TypeError('predicate must be a function');
              }
              var thisArg = arguments[1];
              var k = 0;
              while (k < len) {
                var kValue = o[k];
                if (predicate.call(thisArg, kValue, k, o)) {
                  return kValue;
                }
                k++;
              }
              return undefined;
            }
          });
        }
  
        function Router() {
          /**
           * routes: path, callback
           */
          this.routes = [];
          this.pathMap = {};
          this.fullUrl = '';
          this.pathname = '';
          this.querystring = '';
          this.watcher = function (from, to) {
            return true;
          }
        }
  
        Router.prototype.on = function (path, callback, force) {
          if (this.pathMap[path]) {
            !force && console.warn('This path "' + path + '" has registered an event already. Skipped.');
            if (force !== true)
              return;
          }
          if (force === true)
            this.off(path);
          this.pathMap[path] = 1;
          var keys = [];
          // 需要 pathToRegexp 模块支持
          var regexp = pathToRegexp(path, keys);
          this.routes.push({
            'path': path,
            'regexp': regexp,
            'keys': keys,
            'callbacks': callback ? [callback] : []
          });
        };
  
        Router.prototype.add = function (path, callback) {
          !callback && (callback = function () {});
          if (!this.pathMap[path]) {
            // this.on.call(this, path, addFn);
            this.on(path, callback);
            return true;
          }
          var route = this.routes.find(function (element) {
            return path === element.path
          });
          if (typeof route === 'undefined')
            return false;
          route.callbacks.push(callback);
          return true;
        }
  
        Router.prototype.off = function (path, callback) {
          if (this.pathMap[path]) {
            for (var i = 0; i < this.routes.length; i++) {
              if (this.routes[i].path === path) {
                if (typeof callback === 'function') {
                  var callbacks = this.routes[i].callbacks;
                  for (var k = 0; k < callbacks.length; k++) {
                    if (callbacks[k] === callback) {
                      callbacks.splice(k, 1);
                      return true;
                    }
                  }
                } else {
                  this.routes.splice(i, 1);
                  this.pathMap[path] = 0;
                  return true;
                }
              }
            }
          }
          return false;
        }
  
        Router.prototype.watch = function (callback) {
          !callback && (callback = function () {});
          this.watcher = callback;
        };
  
        Router.prototype.refresh = function () {
          var newUrl = window.location.hash.slice(1) || '/';
          if (this.watcher(this.fullUrl, newUrl) === false)
            return;
          this.fullUrl = newUrl;
          var queryIndex = this.fullUrl.lastIndexOf('?');
          var query = {};
          if (queryIndex + 1) {
            this.querystring = this.fullUrl.slice(queryIndex + 1).trim();
            this.pathname = this.fullUrl.slice(0, queryIndex);
            var queryStr = this.querystring;
            if (queryStr.length) {
              var queryArr = queryStr.split('&');
              for (var k = 0; k < queryArr.length; k++) {
                var itemArr = queryArr[k].split('=');
                //                     key           value
                itemArr[0] && (query[itemArr[0]] = itemArr[1]);
              }
            }
          } else {
            this.querystring = '';
            this.pathname = this.fullUrl;
          }
          var $this = this;
          var route = this.routes.find(function (element) {
            return !!element.regexp && element.regexp.test($this.pathname);
          });
  
          if (typeof route === 'undefined')
            return;
  
          var matches = route.regexp.exec(this.pathname).slice(1);
          var params = {};
          for (var i = 0; i < route.keys.length; i++)
            params[route.keys[i].name] = matches[i];
  
          var ctx = {
            'router': $this,
            'params': params,
            'query': query
          };
  
          var callbacks = route.callbacks;
  
          for (var j = 0; j < callbacks.length; j++)
            callbacks[j](ctx);
        };
  
        Router.prototype.go = function (path, query) {
          if (typeof path === 'undefined' || path === null)
            return;
          if (typeof path === 'number')
            return window.history.go(path);
          if (!query)
            return window.location.hash = path;
          if (typeof query === 'string')
            return window.location.hash = path + '?' + query;
          var queryArr = [];
          for (var k in query) {
            if (query.hasOwnProperty(k))
              queryArr.push(k + '=' + query[k]);
          }
          return window.location.hash = path + '?' + queryArr.join('&');
        };
  
        Router.prototype.init = function () {
          window.addEventListener('load', this.refresh.bind(this), false);
          window.addEventListener('hashchange', this.refresh.bind(this), false);
        };
  
        return new Router();
      });
    }, {
      "pathToRegexp": 2
    }],
    2: [function (require, module, exports) {
      /**
       * Expose `pathToRegexp`.
       */
      module.exports = pathToRegexp
      module.exports.parse = parse
      module.exports.compile = compile
      module.exports.tokensToFunction = tokensToFunction
      module.exports.tokensToRegExp = tokensToRegExp
  
      /**
       * The main path matching regexp utility.
       *
       * @type {RegExp}
       */
      var PATH_REGEXP = new RegExp([
        // Match escaped characters that would otherwise appear in future matches.
        // This allows the user to escape special characters that won't transform.
        '(\\\\.)',
        // Match Express-style parameters and un-named parameters with a prefix
        // and optional suffixes. Matches appear as:
        //
        // "/:test(\\d+)?" => ["/", "test", "\d+", undefined, "?"]
        // "/route(\\d+)"  => [undefined, undefined, undefined, "\d+", undefined]
        '(?:\\:(\\w+)(?:\\(((?:\\\\.|[^\\\\()])+)\\))?|\\(((?:\\\\.|[^\\\\()])+)\\))([+*?])?'
      ].join('|'), 'g')
  
      /**
       * Parse a string for the raw tokens.
       *
       * @param  {string}  str
       * @param  {Object=} options
       * @return {!Array}
       */
      function parse(str, options) {
        var tokens = []
        var key = 0
        var index = 0
        var path = ''
        var defaultDelimiter = (options && options.delimiter) || '/'
        var delimiters = (options && options.delimiters) || './'
        var pathEscaped = false
        var res
  
        while ((res = PATH_REGEXP.exec(str)) !== null) {
          var m = res[0]
          var escaped = res[1]
          var offset = res.index
          path += str.slice(index, offset)
          index = offset + m.length
  
          // Ignore already escaped sequences.
          if (escaped) {
            path += escaped[1]
            pathEscaped = true
            continue
          }
  
          var prev = ''
          var next = str[index]
          var name = res[2]
          var capture = res[3]
          var group = res[4]
          var modifier = res[5]
  
          if (!pathEscaped && path.length) {
            var k = path.length - 1
  
            if (delimiters.indexOf(path[k]) > -1) {
              prev = path[k]
              path = path.slice(0, k)
            }
          }
  
          // Push the current path onto the tokens.
          if (path) {
            tokens.push(path)
            path = ''
            pathEscaped = false
          }
  
          var partial = prev !== '' && next !== undefined && next !== prev
          var repeat = modifier === '+' || modifier === '*'
          var optional = modifier === '?' || modifier === '*'
          var delimiter = prev || defaultDelimiter
          var pattern = capture || group
  
          tokens.push({
            name: name || key++,
            prefix: prev,
            delimiter: delimiter,
            optional: optional,
            repeat: repeat,
            partial: partial,
            pattern: pattern ? escapeGroup(pattern) : '[^' + escapeString(delimiter) + ']+?'
          })
        }
  
        // Push any remaining characters.
        if (path || index < str.length) {
          tokens.push(path + str.substr(index))
        }
  
        return tokens
      }
  
      /**
       * Compile a string to a template function for the path.
       *
       * @param  {string}             str
       * @param  {Object=}            options
       * @return {!function(Object=, Object=)}
       */
      function compile(str, options) {
        return tokensToFunction(parse(str, options))
      }
  
      /**
       * Expose a method for transforming tokens into the path function.
       */
      function tokensToFunction(tokens) {
        // Compile all the tokens into regexps.
        var matches = new Array(tokens.length)
  
        // Compile all the patterns before compilation.
        for (var i = 0; i < tokens.length; i++) {
          if (typeof tokens[i] === 'object') {
            matches[i] = new RegExp('^(?:' + tokens[i].pattern + ')$')
          }
        }
  
        return function (data, options) {
          var path = ''
          var encode = (options && options.encode) || encodeURIComponent
  
          for (var i = 0; i < tokens.length; i++) {
            var token = tokens[i]
  
            if (typeof token === 'string') {
              path += token
              continue
            }
  
            var value = data ? data[token.name] : undefined
            var segment
  
            if (Array.isArray(value)) {
              if (!token.repeat) {
                throw new TypeError('Expected "' + token.name + '" to not repeat, but got array')
              }
  
              if (value.length === 0) {
                if (token.optional) continue
  
                throw new TypeError('Expected "' + token.name + '" to not be empty')
              }
  
              for (var j = 0; j < value.length; j++) {
                segment = encode(value[j])
  
                if (!matches[i].test(segment)) {
                  throw new TypeError('Expected all "' + token.name + '" to match "' + token.pattern + '"')
                }
  
                path += (j === 0 ? token.prefix : token.delimiter) + segment
              }
  
              continue
            }
  
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
              segment = encode(String(value))
  
              if (!matches[i].test(segment)) {
                throw new TypeError('Expected "' + token.name + '" to match "' + token.pattern + '", but got "' + segment + '"')
              }
  
              path += token.prefix + segment
              continue
            }
  
            if (token.optional) {
              // Prepend partial segment prefixes.
              if (token.partial) path += token.prefix
  
              continue
            }
  
            throw new TypeError('Expected "' + token.name + '" to be ' + (token.repeat ? 'an array' : 'a string'))
          }
  
          return path
        }
      }
  
      /**
       * Escape a regular expression string.
       *
       * @param  {string} str
       * @return {string}
       */
      function escapeString(str) {
        return str.replace(/([.+*?=^!:${}()[\]|/\\])/g, '\\$1')
      }
  
      /**
       * Escape the capturing group by escaping special characters and meaning.
       *
       * @param  {string} group
       * @return {string}
       */
      function escapeGroup(group) {
        return group.replace(/([=!:$/()])/g, '\\$1')
      }
  
      /**
       * Get the flags for a regexp from the options.
       *
       * @param  {Object} options
       * @return {string}
       */
      function flags(options) {
        return options && options.sensitive ? '' : 'i'
      }
  
      /**
       * Pull out keys from a regexp.
       *
       * @param  {!RegExp} path
       * @param  {Array=}  keys
       * @return {!RegExp}
       */
      function regexpToRegexp(path, keys) {
        if (!keys) return path
  
        // Use a negative lookahead to match only capturing groups.
        var groups = path.source.match(/\((?!\?)/g)
  
        if (groups) {
          for (var i = 0; i < groups.length; i++) {
            keys.push({
              name: i,
              prefix: null,
              delimiter: null,
              optional: false,
              repeat: false,
              partial: false,
              pattern: null
            })
          }
        }
  
        return path
      }
  
      /**
       * Transform an array into a regexp.
       *
       * @param  {!Array}  path
       * @param  {Array=}  keys
       * @param  {Object=} options
       * @return {!RegExp}
       */
      function arrayToRegexp(path, keys, options) {
        var parts = []
  
        for (var i = 0; i < path.length; i++) {
          parts.push(pathToRegexp(path[i], keys, options).source)
        }
  
        return new RegExp('(?:' + parts.join('|') + ')', flags(options))
      }
  
      /**
       * Create a path regexp from string input.
       *
       * @param  {string}  path
       * @param  {Array=}  keys
       * @param  {Object=} options
       * @return {!RegExp}
       */
      function stringToRegexp(path, keys, options) {
        return tokensToRegExp(parse(path, options), keys, options)
      }
  
      /**
       * Expose a function for taking tokens and returning a RegExp.
       *
       * @param  {!Array}  tokens
       * @param  {Array=}  keys
       * @param  {Object=} options
       * @return {!RegExp}
       */
      function tokensToRegExp(tokens, keys, options) {
        options = options || {}
  
        var strict = options.strict
        var end = options.end !== false
        var delimiter = escapeString(options.delimiter || '/')
        var endsWith = [].concat(options.endsWith || []).map(escapeString).concat('$').join('|')
        var route = ''
  
        // Iterate over the tokens and create our regexp string.
        for (var i = 0; i < tokens.length; i++) {
          var token = tokens[i]
  
          if (typeof token === 'string') {
            route += escapeString(token)
          } else {
            var prefix = escapeString(token.prefix)
            var capture = '(?:' + token.pattern + ')'
  
            if (keys) keys.push(token)
  
            if (token.repeat) {
              capture += '(?:' + prefix + capture + ')*'
            }
  
            if (token.optional) {
              if (!token.partial) {
                capture = '(?:' + prefix + '(' + capture + '))?'
              } else {
                capture = prefix + '(' + capture + ')?'
              }
            } else {
              capture = prefix + '(' + capture + ')'
            }
  
            route += capture
          }
        }
  
        if (end) {
          if (!strict) route += '(?:' + delimiter + ')?'
  
          route += endsWith === '$' ? '$' : '(?=' + endsWith + ')'
        } else {
          if (!strict) route += '(?:' + delimiter + '(?=' + endsWith + '))?'
  
          route += '(?=' + delimiter + '|' + endsWith + ')'
        }
  
        return new RegExp('^' + route, flags(options))
      }
  
      /**
       * Normalize the given path string, returning a regular expression.
       *
       * An empty array can be passed in for the keys, which will hold the
       * placeholder key descriptions. For example, using `/user/:id`, `keys` will
       * contain `[{ name: 'id', delimiter: '/', optional: false, repeat: false }]`.
       *
       * @param  {(string|RegExp|Array)} path
       * @param  {Array=}                keys
       * @param  {Object=}               options
       * @return {!RegExp}
       */
      function pathToRegexp(path, keys, options) {
        if (path instanceof RegExp) {
          return regexpToRegexp(path, keys)
        }
  
        if (Array.isArray(path)) {
          return arrayToRegexp( /** @type {!Array} */ (path), keys, options)
        }
  
        return stringToRegexp( /** @type {string} */ (path), keys, options)
      }
  
    }, {}]
  }, {}, [1]);