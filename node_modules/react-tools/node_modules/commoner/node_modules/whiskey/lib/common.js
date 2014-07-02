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
 */

var path = require('path');
var net = require('net');
var util = require('util');

var sprintf = require('sprintf').sprintf;
var async = require('async');
var gex = require('gex');
var log = require('logmagic').local('whiskey.common');

var assert = require('./assert');
var constants = require('./constants');
var testUtil = require('./util');
var coverage = require('./coverage');
var scopeleaks = require('./scopeleaks');

var isValidTestFunctionName = function(name) {
  return name.indexOf('test') === 0;
};


// foo.bar.test.* -> [ foo/bar/test.js, '*' ]
// test. -> [ 'test.js', '*']
// some.path.foo.test_bar* -> [ 'some/path/foo.js', 'test_bar*' ]
function getTestFilePathAndPattern(patternString) {
  if (/\.js$/.test(patternString)) {
    return [ patternString, '*' ];
  }

  var split = patternString.split('.');
  var len = split.length;
  var testFile, basePath, testPath, pattern;

  testFile = sprintf('%s.js', split[len - 2]);
  pattern = split[len - 1] || '*';
  basePath = split.splice(0, len - 2).join('/');
  testPath = path.join(basePath, testFile);

  return [ testPath, pattern ];
}

function SkipError(test, msg) {
  this.test = test;
  this.msg = msg || '';
  Error.call(this, 'skipped');
}

util.inherits(SkipError, Error);

var runInitFunction = function(filePath, callback) {
  var testObj;
  var initModule = null;

  try {
    initModule = require(filePath);
  }
  catch (err) {
    // Invalid init file path provided
    callback();
    return;
  }

  if (initModule) {
    if (initModule.hasOwnProperty(constants.INIT_FUNCTION_NAME)) {
      try {
        initModule[constants.INIT_FUNCTION_NAME](callback);
        return;
      }
      catch (err2) {
        callback();
        return;
      }
    }
  }

  callback();
};

function Test(testName, testFunction, scopeLeaks) {
  this._testName = testName;
  this._testFunction = testFunction;

  this._finished = false;
  this._testObj = null;
  this._assertObj = null;

  this._timeStart = null;
  this._timeEnd = null;
  this._status = null; // 'success' or 'failure'
  this._err = null; // only populated if _status = 'failure'
  this._skipMsg = null;
  this._scopeLeaks = scopeLeaks || false;
  this._leakedVariables = null; // a list of variables which leaked into
                                // global scope
}

Test.prototype._getScopeSnapshot = function(scope) {
  if (!this._scopeLeaks) {
    return null;
  }

  return scopeleaks.getSnapshot(scope);
};

Test.prototype._getLeakedVariables = function(scopeBefore, scopeAfter) {
  if (!this._scopeLeaks) {
    return null;
  }

  return scopeleaks.getDifferences(scopeBefore, scopeAfter);
};

Test.prototype.run = function(callback) {
  var self = this;
  var scopeBefore, scopeAfter;
  var finishCallbackCalled = false;

  function finishCallback() {
    callback(self.getResultObject());
  }

  function finishFunc() {
    if (finishCallbackCalled) {
      // someone called .finish() twice.
      log.infof('test.finish in [bold]${name}[/bold] has been called twice' +
                ', possible double callback in your code!',
                {'name': self._testName});
      return;
    }

    if (!self._status) {
      scopeAfter = self._getScopeSnapshot(global);
      self._leakedVariables = self._getLeakedVariables(scopeBefore, scopeAfter);

      self._markAsSucceeded();
    }

    self._timeEnd = new Date().getTime();
    finishCallbackCalled = true;
    finishCallback();
  }

  this._testObj = this._getTestObject(finishFunc);
  this._assertObj = this._getAssertObject();

  self._timeStart = new Date().getTime();

  try {
    scopeBefore = this._getScopeSnapshot(global);
    this._testFunction(this._testObj, this._assertObj);

  }
  catch (err) {
    if (!err.hasOwnProperty('message') && err.toString && typeof err.toString === 'function') {
      err.message = err.toString();
    }

    scopeAfter = this._getScopeSnapshot(global);
    this._leakedVariables = this._getLeakedVariables(scopeBefore, scopeAfter);

    if (err instanceof SkipError) {
      this._markAsSkipped(err.msg);
    }
    else {
      this._markAsFailed(err);
    }

    finishFunc();
    return;
  }
};

Test.prototype._getTestObject = function(finishFunc) {
  var self = this;
  var testObj = function test() {
    return finishFunc.apply(undefined, arguments);
  };

  function skipFunc(msg) {
    throw new SkipError(self, msg);
  }

  testObj.finish = finishFunc;
  testObj.skip = skipFunc;
  testObj.spy = new SpyOn();

  return testObj;
};

Test.prototype._getAssertObject = function() {
  return assert.getAssertModule(this);
};

Test.prototype._markAsSucceeded = function() {
  this._finished = true;
  this._status = 'success';
};

Test.prototype._markAsFailed = function(err) {
  var stack;

  if (err.hasOwnProperty('test')) {
    delete err.test;
  }

  if (err.stack) {
    // zomg, hacky, but in a later versions of V8 it looks like stack is some
    // kind of special attribute which can't be serialized.
    stack = err.stack.toString();
    delete err.stack;
    err.stack = stack;
  }

  this._finished = true;
  this._err = err;
  this._status = 'failure';
};

Test.prototype._markAsSkipped = function(msg) {
  this._finished = true;
  this._status = 'skipped';
  this._skipMsg = msg;
};

Test.prototype.isRunning = function() {
  return !this._finished;
};

Test.prototype.beforeExit = function(handler) {
  this._beforeExitHandler = handler;
};

Test.prototype.getResultObject = function() {
  var resultObj = {
    'name': this._testName,
    'status': this._status,
    'error': this._err,
    'skip_msg': this._skipMsg,
    'leaked_variables': this._leakedVariables,
    'time_start': this._timeStart,
    'time_end': this._timeEnd
  };

  return resultObj;
};

function TestFile(filePath, options) {
  this._filePath = filePath;
  this._pattern = options['pattern'];

  this._socketPath = options['socket_path'];
  this._fileName = path.basename(this._filePath);
  this._testInitFile = options['init_file'];
  this._timeout = options['timeout'];
  this._concurrency = options['concurrency'];
  this._scopeLeaks = options['scope_leaks'];

  this._tests = [];
  this._uncaughtExceptions = [];

  this._runningTest = null;
}

TestFile.prototype.addTest = function(test) {
  this._tests.push(test);
};

TestFile.prototype.runTests = function(callback) {
  var self = this;
  var i, test, exportedFunctions, exportedFunctionsNames, errName;
  var setUpFunc, tearDownFunc, setUpFuncIndex, tearDownFuncIndex;
  var testName, testFunc, testsLen;
  var callbackCalled = false;
  var testModule = this._filePath.replace(/\.js$/, '');

  function handleEnd() {
    var resultObj;
    if (callbackCalled) {
      return;
    }

    callbackCalled = true;
    callback();
  }

  function onTestDone(test, callback) {
    var resultObj = test.getResultObject();

    self.addTest(test);
    self._reportTestResult(resultObj);
    callback();
  }

  async.series([
    // Obtain the connection
    function(callback) {
      self._getConnection(function(err, connection) {
        if (err) {
          callback(new Error('Unable to establish connection with the master ' +
                             'process'));
          return;
        }

        self._connection = connection;
        callback();
      });
    },

    // if test init file is present, run init function in it
    function(callback) {
      if (!self._testInitFile) {
        callback();
        return;
      }

      runInitFunction(self._testInitFile, callback);
    },

    // Require the test file
    function(callback) {
      var errName;
      try {
        exportedFunctions = require(testModule);
      }
      catch (err) {
        if (err.message.indexOf(testModule) !== -1 &&
            err.message.match(/cannot find module/i)) {
            errName = 'file_does_not_exist';
          }
          else {
            errName = 'uncaught_exception';
          }

          test = new Test(errName, null);
          test._markAsFailed(err);
          self._reportTestResult(test.getResultObject());
          callback(err);
          return;
      }

      exportedFunctionsNames = Object.keys(exportedFunctions);
      exportedFunctionsNames = exportedFunctionsNames.filter(isValidTestFunctionName);
      testsLen = exportedFunctionsNames.length;
      setUpFunc = exportedFunctions[constants.SETUP_FUNCTION_NAME];
      tearDownFunc = exportedFunctions[constants.TEARDOWN_FUNCTION_NAME];

      callback();
    },

    // if setUp function is present, run it
    function(callback){
      if (!setUpFunc) {
        callback();
        return;
      }

      var test = new Test(constants.SETUP_FUNCTION_NAME, setUpFunc,
                          self._scopeLeaks);
      test.run(async.apply(onTestDone, test, callback));
    },

    // Run the tests
    function(callback) {
      var queue;

      if (exportedFunctionsNames.length === 0) {
        callback();
        return;
      }

      function taskFunc(task, _callback) {
        var test = task.test;
        self._runningTest = test;
        test.run(async.apply(onTestDone, task.test, _callback));
      }

      function onDrain() {
        callback();
      }

      queue = async.queue(taskFunc, self._concurrency);
      queue.drain = onDrain;

      for (i = 0; i < testsLen; i++) {
        testName = exportedFunctionsNames[i];
        testFunc = exportedFunctions[testName];

        if (!gex(self._pattern).on(testName)) {
          continue;
        }

        test = new Test(testName, testFunc, self._scopeLeaks);
        queue.push({'test': test});
      }

      if (queue.length() === 0) {
        // No test matched the provided pattern
        callback();
      }

    },

    // if tearDown function is present, run it
    function(callback) {
      if (!tearDownFunc) {
        callback();
        return;
      }

      var test = new Test(constants.TEARDOWN_FUNCTION_NAME, tearDownFunc,
                          self._scopeLeaks);
      test.run(async.apply(onTestDone, test, callback));
    }
  ],

  function(err) {
    handleEnd();
  });
};

TestFile.prototype._getConnection = function(callback) {
  var connection = net.createConnection(this._socketPath);

  connection.on('connect', function onConnect() {
    callback(null, connection);
  });

  connection.on('error', function onError(err) {
    callback(err, null);
  });
};

TestFile.prototype._reportTestResult = function(resultObj) {
  var payload;
  payload = sprintf('%s%s%s%s%s\n', constants.TEST_START_MARKER, this._filePath,
                    constants.DELIMITER, JSON.stringify(resultObj),
                    constants.TEST_END_MARKER);
  this._connection.write(payload);
};

TestFile.prototype._reportTestCoverage = function(coverageObj) {
  this._connection.write(sprintf('%s%s%s%s\n',
                                 this._filePath,
                                 constants.DELIMITER,
                                 coverage.stringifyCoverage(coverageObj),
                                 constants.COVERAGE_END_MARKER));
};

TestFile.prototype._reportTestFileEnd = function() {
  this._connection.end(sprintf('%s%s\n', this._filePath,
                               constants.TEST_FILE_END_MARKER));
};

TestFile.prototype.addUncaughtException = function(err) {
  var test = err.test;

  if (test) {
    if (err instanceof SkipError) {
      test._markAsSkipped(err.msg);
      test._testObj.finish();
    }
    else {
      test._markAsFailed(err);
      test._testObj.finish();
    }

    this.addTest(test);
  }
  else if (this._runningTest) {
    // User did not use our assert module or uncaughtException was thrown
    // somewhere in the async code.
    // Check which test is still running, mark it as failed and finish it.
    test = this._runningTest;
    test._markAsFailed(err);
    test._testObj.finish();
    this.addTest(test);
  }
  else {
    // Can't figure out the origin, just add it to the _uncaughtExceptions
    // array.
    this._uncaughtExceptions.push(err);
  }
};

TestFile.prototype.getResultObject = function(errObj) {
  var i, test, result, name, uncaughtException;
  var testsLen = this._tests.length;
  var uncaughtExceptionsLen = this._uncaughtExceptions.length;

  var resultObj = {
    'file_path': this._filePath,
    'file_name': this._fileName,
    'error': null,
    'timeout': false,
    'stdout': '',
    'stderr': '',
    'tests': {}
  };

  if (errObj) {
    resultObj.error = errObj;
    return resultObj;
  }

  for (i = 0; i < testsLen; i++) {
    test = this._tests[i];
    result = test.getResultObject();
    resultObj.tests[result.name] = result;
  }

  for (i = 0; i < uncaughtExceptionsLen; i++) {
    name = sprintf('uncaught_exception_%d', i + 1);
    uncaughtException = this._uncaughtExceptions[i];
    test = new Test(name, null);
    test._markAsFailed(uncaughtException);
    resultObj.tests[name] = test.getResultObject();
  }

  return resultObj;
};

function registerCustomAssertionFunctions(functions) {
  assert.merge(null, functions);
}

exports.Test = Test;
exports.TestFile = TestFile;
exports.getTestFilePathAndPattern = getTestFilePathAndPattern;

exports.registerCustomAssertionFunctions = registerCustomAssertionFunctions;

/**
 * @constructor
 */
function SpyOn (){
  /**
   * This tracks the arguments a function has been called with.
   * @param {Object.<Array>}
   * @private
   */
  this._calls = {};
  /**
   * This tracks the function to call
   * @param {Object.<Function>}
   * @private
   */
  this._funcMap = {};
};

/**
 * @param {string} funcName The key to use for tracking call counts.
 * @param {Object} context The context in which the function should execute.
 * @param {Function} optFunc The optional function to call in wrapper. If not
 * provided, original function will be called.
 */
SpyOn.prototype.on = function (funcName, context, optFunc) {
  var wrapper, func;
  if (optFunc) {
    func = optFunc;
  } else {
    func = context[funcName];
  }
  if (this._calls.hasOwnProperty(funcName)) {
    throw "Function already being tracked.";
  }
  this.reset(funcName);
  wrapper = (function () {
    this._calls[funcName].push(Array.prototype.slice.call(arguments));
    return func.apply(context, arguments);
  }).bind(this);
  context[funcName] = wrapper;
  this._funcMap[funcName] = func;
  return this;
};

/**
 * @param {string} funcName The key to clear.
 * @param {Object} context The context in which the function should execute.
 * @param {Function} optFunc The optional function to reapply to the context.
 */
SpyOn.prototype.clear = function (funcName, context, optFunc) {
  if (optFunc) {
    context[funcName] = optFunc
  } else {
    context[funcName] = this._funcMap[funcName];
  }
  delete this._calls[funcName];
  delete this._funcMap[funcName];
  return this;
};

/**
 * Reset a call count.
 * @param {string} funcName The name of the function.
 */
SpyOn.prototype.reset = function (funcName) {
  this._calls[funcName] = [];
};

/**
 * Get the call count for a spied on function.
 * @param {string} funcName
 */
SpyOn.prototype.called = function (funcName) {
  var calls = this._calls[funcName];

  // checks the actual args match the expected args
  var checkArgsMatch = function (actualArgs, expectedArgs) {
    var i;
    if (actualArgs.length !== expectedArgs.length) {
      return false;
    }
    for (i = 0; i < expectedArgs.length; i++) {
      if (actualArgs[i] !== expectedArgs[i]) {
        return false;
      }
    }
    return true;
  };

  return {
    valueOf: function () {
      return calls.length;
    },
    withArgs: function () {
      var i, j, match;
      var args = Array.prototype.slice.call(arguments);
      for (i = 0; i < calls.length; i++) {
        if (checkArgsMatch(calls[i], args)) {
          return true;
        }
      }
      return false;
    },
    with: function () {
      return this.withArgs.apply(this, arguments);
    }
  }
};
