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

var ScopeLeaksReporter = require('./base').ScopeLeaksReporter;

function CliReporter(tests, options) {
  ScopeLeaksReporter.call(this, tests, options);
}

util.inherits(CliReporter, ScopeLeaksReporter);

CliReporter.prototype.handleTestsComplete = function() {
  this._reportLeakedVariables();
};

CliReporter.prototype._reportLeakedVariables = function() {
  var testFilePath, testFile, tests, test, leakedVariables, leakedVariablesTest;

  console.log('');
  console.log('\033[1mLeaked Variables\033[22m');
  console.log('');

  for (testFilePath in this._leakedVariables) {
    testFile = path.basename(testFilePath);
    tests = this._leakedVariables[testFilePath];

    if (this._options['sequential']) {
      // Sequential mode was used so we can accurately report leaked variables for
      // each test separately.
      console.log(testFile);

      for (test in tests) {
        leakedVariables = ((tests[test] && tests[test].length > 0) ? tests[test] : null);
 
        if (leakedVariables && leakedVariables.length > 0) {
          console.log(sprintf('  %s: %s', test, leakedVariables.join(', ')));
        }
        else {
          console.log(sprintf('  %s: no leaks detected', test));
        }
      }
    }
    else {
      leakedVariables = [];
      for (test in tests) {
        leakedVariablesTest = ((tests[test] && tests[test].length > 0) ? tests[test] : null);

        if (leakedVariablesTest) {
          leakedVariables = leakedVariables.concat(leakedVariablesTest);
        }
      }

      if (leakedVariables && leakedVariables.length > 0) {
        console.log(sprintf('  %s: %s', testFile, leakedVariables.join(', ')));
      }
      else {
        console.log(sprintf('  %s: no leaks detected', testFile));
      }
    }
  }
};

exports.name = 'cli';
exports.klass = CliReporter;
