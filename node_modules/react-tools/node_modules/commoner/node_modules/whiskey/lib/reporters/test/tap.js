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
*/

var util = require('util');
var path = require('path');

var sprintf = require('sprintf').sprintf;

var TestReporter = require('./base').TestReporter;
var testUtil = require('./../../util');

function TapReporter(tests, options) {
  TestReporter.call(this, tests, options);

  this._tempResults = {};
  this._successes = 0;
  this._failures = 0;
  this._timeouts = 0;
}

util.inherits(TapReporter, TestReporter);

TapReporter.prototype.handleTestsStart = function() {
};

TapReporter.prototype.handleTestFileStart = function(filePath) {
};

TapReporter.prototype.handleTestFileComplete = function(filePath,
                                                        stdout, stderr) {
  var tests, test, key;
  var fileName = path.basename(filePath);

  stdout = stdout || '';
  stderr = stderr || '';
  tests = this._testResults[filePath];

  for (key in tests) {
    if (tests.hasOwnProperty(key)) {
      test = tests[key];

      if (test.error) {
        this._addFailure(fileName, test.name);
      }
      else if (test.timeout) {
        this._addTimeout(fileName, 'timeout');
      }
      else if (test.status === 'skipped') {
        continue;
      }
      else {
        this._addSuccess(fileName, test.name);
      }
    }
  }
  /*if (error) {
    // Test file does not exist or an exception was thrown before the tests were
    // even run
    this._addFailure(fileName, error.name);
    return;
  }*/
};

TapReporter.prototype.handleTestsComplete = function() {
  this._reportResults();

  return this._failures + this._timeouts;
};

TapReporter.prototype._addSuccess = function(testFile, testName) {
  this._successes++;
  this._addResult(testFile, testName, 'success');
};

TapReporter.prototype._addFailure = function(testFile, testName) {
  this._failures++;
  this._addResult(testFile, testName, 'failure');
};

TapReporter.prototype._addTimeout = function(testFile, testName) {
  this._timeouts++;
  this._addResult(testFile, testName, 'timeout');
};

TapReporter.prototype._addResult = function(testFile, testName, testStatus) {
  if (!this._tempResults.hasOwnProperty(testFile)) {
    this._tempResults[testFile] = {};
  }

  this._tempResults[testFile][testName] = {
    'file': testFile,
    'name': testName,
    'status': testStatus
  };
};

TapReporter.prototype._reportResults = function() {
  var self = this;
  var startNum, i, files, file, filesLen, testsLen, tests, test, testResult, testNum;
  files = Object.keys(this._tempResults);
  filesLen = files.length;

  function getFileTestLen(file) {
    return Object.keys(self._tempResults[file]).length;
  }

  testsLen = files.map(getFileTestLen).reduce(function (a, b) { return a + b; });

  if (testsLen === 0) {
    startNum = 0;
  }
  else {
    startNum = 1;
  }

  console.log('  %d..%d', startNum, testsLen);

  testNum = 0;
  for (i = 0; i < filesLen; i++) {
    file = files[i];
    tests = this._tempResults[file];

    for (test in tests) {
      if (tests.hasOwnProperty(test)) {
        testNum++;
        testResult = tests[test];

        if (testResult.status === 'success') {
          console.log('  ok %d - %s: %s', testNum, testResult.file, testResult.name);
        }
        else if (testResult.status === 'failure') {
          console.log('  not ok %d - %s: %s', testNum, testResult.file, testResult.name);
        }
        else if (testResult.status === 'timeout') {
          console.log('  not ok %d - %s: %s (timeout)', testNum, testResult.file,
                       testResult.name);
        }
      }
    }
  }
};

exports.name = 'tap';
exports.klass = TapReporter;
