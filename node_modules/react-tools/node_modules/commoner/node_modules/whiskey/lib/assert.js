/*
 * Licensed to Cloudkick, Inc ('Cloudkick') under one or more
 * contributor license agreements.  See the NOTICE file distributed with
 * this work for additional information regarding copyright ownership.
 * Cloudkick licenses this file to You under the Apache License, Version 2.0
 * (the "License"); you may not use this file except in compliance with
 * the License.  You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 * Many of the modifications to 'assert' that take place here are borrowed
 * from the 'Expresso' test framework:
 *  <http://visionmedia.github.com/expresso/>
 *
 * Expresso
 * Copyright(c) TJ Holowaychuk <tj@vision-media.ca>
 * (MIT Licensed)
 */

var util = require('util');
var url = require('url');
var http = require('http');
var https = require('https');

var port = parseInt((Math.random() * (65500 - 2000) + 2000), 10);

// Code bellow is taken from Node core
// http://wiki.commonjs.org/wiki/Unit_Testing/1.0
//
// THIS IS NOT TESTED NOR LIKELY TO WORK OUTSIDE V8!
//
// Originally from narwhal.js (http://narwhaljs.org)
// Copyright (c) 2009 Thomas Robinson <280north.com>
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the 'Software'), to
// deal in the Software without restriction, including without limitation the
// rights to use, copy, modify, merge, publish, distribute, sublicense, and/or
// sell copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN
// ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.

var origAssert = require('assert');

var assert = {};

  /*
   * Alias deepEqual as eql for complex equality
   */
  assert.eql = origAssert.deepEqual;

  /**
   * Assert that `val` is null.
   *
   * @param {Mixed} val
   * @param {String} msg
   */
  assert.isNull = function(val, msg) {
      assert.strictEqual(null, val, msg);
  };

  assert.ifError = function(err) {
    if (err) {
      if (err instanceof Error) {
        Error.captureStackTrace(err, arguments.callee);
      }

      throw err;
    }
  };

  /**
   * Assert that `val` is not null.
   *
   * @param {Mixed} val
   * @param {String} msg
   */
  assert.isNotNull = function(val, msg) {
      assert.notStrictEqual(null, val, msg);
  };

  /**
   * Assert that `val` is undefined.
   *
   * @param {Mixed} val
   * @param {String} msg
   */
  assert.isUndefined = function(val, msg) {
      assert.strictEqual(undefined, val, msg);
  };

  /**
   * Assert that `val` is not undefined.
   *
   * @param {Mixed} val
   * @param {String} msg
   */
  assert.isDefined = function(val, msg) {
      assert.notStrictEqual(undefined, val, msg);
  };

  /**
   * Assert that `obj` is `type`.
   *
   * @param {Mixed} obj
   * @param {String} type
   * @api public
   */
  assert.type = function(obj, type, msg){
      var real = typeof obj;
      msg = msg || 'typeof ' + util.inspect(obj) + ' is ' + real + ', expected ' + type;
      assert.ok(type === real, msg);
  };

  /**
   * Assert that `str` matches `regexp`.
   *
   * @param {String} str
   * @param {RegExp} regexp
   * @param {String} msg
   */
  assert.match = function(str, regexp, msg) {
      msg = msg || util.inspect(str) + ' does not match ' + util.inspect(regexp);
      assert.ok(regexp.test(str), msg);
  };

  /**
   * Assert that `val` is within `obj`.
   *
   * Examples:
   *
   *    assert.includes('foobar', 'bar');
   *    assert.includes(['foo', 'bar'], 'foo');
   *
   * @param {String|Array} obj
   * @param {Mixed} val
   * @param {String} msg
   */
  assert.includes = function(obj, val, msg) {
      msg = msg || util.inspect(obj) + ' does not include ' + util.inspect(val);
      assert.ok(obj.indexOf(val) >= 0, msg);
  };

  /**
   * Assert length of `val` is `n`.
   *
   * @param {Mixed} val
   * @param {Number} n
   * @param {String} msg
   */
  assert.length = function(val, n, msg) {
      msg = msg || util.inspect(val) + ' has length of ' + val.length + ', expected ' + n;
      assert.equal(n, val.length, msg);
  };

  /**
   * Assert response from `server` with
   * the given `req` object and `res` assertions object.
   *
   * @param {Server} server
   * @param {Object} req
   * @param {Object|Function} res
   * @param {String} msg
   */
  assert.response = function(server, req, res, msg){
    // Callback as third or fourth arg
    var callback = typeof res === 'function'
        ? res
        : typeof msg === 'function'
            ? msg
            : function(){};

    // Default messate to test title
    if (typeof msg === 'function') msg = null;
    msg = msg || assert.testTitle;
    msg += '. ';

    // Pending responses
    server.__pending = server.__pending || 0;
    server.__pending++;

    server.listen(server.__port = port++, '127.0.0.1');

    process.nextTick(function() {
      // Issue request
      var timer;
      var trailer;
      var method = req.method || 'GET';
      var status = res.status || res.statusCode;
      var data = req.data || req.body;
      var streamer = req.streamer;
      var timeout = req.timeout || 0;
      var headers = req.headers || {};

      for (trailer in req.trailers) {
        if (req.trailers.hasOwnProperty(trailer)) {
          if (headers['Trailer']) {
            headers['Trailer'] += ', ' + trailer;
          }
          else {
            headers['Trailer'] = trailer;
          }
        }
      }

      var urlParsed = url.parse(req.url);
      var reqOptions = {
          'host': '127.0.0.1',
          'port': server.__port,
          'path': urlParsed.pathname,
          'method': method,
          'headers': headers
      };

      var reqMethod = (urlParsed.protocol === 'http:' || !urlParsed.hasOwnProperty('protocol')) ? http.request : https.request;
      var request = http.request(reqOptions);

      if (req.trailers) {
        request.addTrailers(req.trailers);
      }

      // Timeout
      if (timeout) {
        timer = setTimeout(function(){
          --server.__pending || server.close();
          delete req.timeout;
          assert.fail(msg + 'Request timed out after ' + timeout + 'ms.');
        }, timeout);
      }

      if (data) request.write(data);

      request.addListener('response', function(response) {
        response.body = '';
        response.setEncoding('utf8');
        response.addListener('data', function(chunk){ response.body += chunk; });
        response.addListener('end', function(){
          --server.__pending || server.close();
          if (timer) clearTimeout(timer);

          // Assert response body
          if (res.body !== undefined) {
            assert.equal(
              response.body,
              res.body,
              msg + 'Invalid response body.\n'
                  + '    Expected: ' + util.inspect(res.body) + '\n'
                  + '    Got: ' + util.inspect(response.body)
            );
          }

          // Assert response status
          if (typeof status === 'number') {
            assert.equal(
              response.statusCode,
              status,
              msg + 'Invalid response status code.\n'
                  + '    Expected: [{' + status + '}\n'
                  + '    Got: {' + response.sttusCode + '}'
            );
          }

          // Assert response headers
          if (res.headers) {
            var keys = Object.keys(res.headers);
            for (var i = 0, len = keys.length; i < len; ++i) {
              var name = keys[i];
              var actual = response.headers[name.toLowerCase()];
              var expected = res.headers[name];
              assert.equal(
                actual,
                expected,
                msg + 'Invalid response header [bold]{' + name + '}.\n'
                    + '    Expected: {' + expected + '}\n'
                    + '    Got: {' + actual + '}'
              );
            }
          }

        callback(response);
      });
    });

    if (streamer) {
      streamer(request);
    }
    else {
      request.end();
    }
  });
};

function merge(obj1, obj2, ignore) {
  obj1 = obj1 || assert;
  ignore = ignore || [];

  for (var key in obj2) {
    if (obj2.hasOwnProperty(key) && ignore.indexOf(key) === -1) {
      obj1[key] = obj2[key];
    }
  }
}

function getAssertModule(test) {
  assert.AssertionError = function AssertionError(options) {
    origAssert.AssertionError.call(this, options);
    this.test = test;
  };

  util.inherits(assert.AssertionError, origAssert.AssertionError);

  var ignore = ['AssertionError'];
  for (var key in origAssert) {
    if (origAssert.hasOwnProperty(key) && ignore.indexOf(key) === -1) {
      assert[key] = (function(key) {
        return function() {
          try {
            origAssert[key].apply(null, arguments);
          }
          catch (err) {
            err.test = test;
            throw err;
          }
        }
      })(key);
    }
  }

  return assert;
}

exports.getAssertModule = getAssertModule;
exports.merge = merge;
