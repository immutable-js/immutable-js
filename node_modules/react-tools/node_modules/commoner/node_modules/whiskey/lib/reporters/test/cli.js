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
var terminal = require('terminal');

var TestReporter = require('./base').TestReporter;
var testUtil = require('./../../util');

function CliReporter(tests, options) {
  TestReporter.call(this, tests, options);

  this._dateStart = null;
  this._dateEnd = null;
  this._successes = 0;
  this._failures = 0;
  this._timeouts = 0;
  this._skipped = 0;

  this._puts = (this._options['styles']) ? terminal.puts : terminal.putsNoStyle;
}

util.inherits(CliReporter, TestReporter);

CliReporter.prototype.handleTestsStart = function() {
  this._dateStart = testUtil.getUnixTimestamp();
};

CliReporter.prototype.handleTestFileStart = function(filePath) {
  this._puts(filePath);
};

CliReporter.prototype.handleTestFileComplete = function(filePath, stdout, stderr) {
  var tests, test, timing, key, runTime = 0, testCount = 0;

  stdout = stdout || '';
  stderr = stderr || '';
  tests = this._testResults[filePath];

  for (key in tests) {
    if (tests.hasOwnProperty(key)) {
      test = tests[key];
      timing = {'start': (test.time_start || 0), 'end': (test.time_end || 0)};

      runTime += (timing.end - timing.start);
      testCount++;

      if (test.error) {
        this._failures++;
        this._reportFailure(test.name, test.error, timing);
      }
      else if (test.timeout) {
        this._timeouts++;
        this._reportTimeout();
      }
      else if (test.status === 'skipped') {
        this._skipped++;
        this._reportSkipped(test.name, test.skip_msg, timing);
      }
      else {
        this._successes++;
        this._reportSuccess(test.name, timing);
      }
    }
  }

  if (this._options['report_timing']) {
    this._reportTestStatistics(testCount, runTime);
  }

  if (this._failures > 0 || this._timeouts > 0) {
    this._printStderr(stderr);
    this._printStdout(stdout);
  }
  else {
    if (this._options['print_stderr']) {
      this._printStderr(stderr);
    }

    if (this._options['print_stdout']) {
      this._printStdout(stdout);
    }
  }
};

CliReporter.prototype.handleTestsComplete = function() {
  this._dateEnd = testUtil.getUnixTimestamp();
  this._reportStatistics();

  return (this._failures + this._timeouts);
};

CliReporter.prototype._reportTestStatistics = function(testCount, runTime) {
  this._puts('');
  this._puts(sprintf('Ran %d tests in %0.3fs', testCount, (runTime / 1000)));
};

CliReporter.prototype._printStdout = function(stdout) {
  if (stdout.length > 0) {
    this._puts('');
    this._puts('[bold]Stdout[/bold]:');
    this._puts(stdout);
  }
};

CliReporter.prototype._printStderr = function(stdout) {
  if (stdout.length > 0) {
    this._puts('');
    this._puts('[bold]Stderr[/bold]:');
    this._puts(stdout);
  }
};

CliReporter.prototype._getTestNameWithTiming = function(testName, timing) {
  var str;

  if (!this._options['report_timing']) {
    return testName;
  }

  return sprintf('%s (took %0.3fs)', testName, ((timing.end - timing.start) / 1000));
};

CliReporter.prototype._reportSuccess = function(testName, timing) {
  testName = this._getTestNameWithTiming(testName, timing);
  this._puts(sprintf('  %s [green][OK][/green]',
                      testUtil.addCharacters(testName, 74, ' ')));
};

CliReporter.prototype._reportFailure = function(testName, error, timing) {
  testName = this._getTestNameWithTiming(testName, timing);
  var errMsg = (error.stack) ? error.stack : error.message;
  this._puts(sprintf('  %s [red][FAIL][/red]',
                      testUtil.addCharacters(testName, 72, ' ')));
  this._puts('');
  this._puts('[bold]Exception[/bold]');
  this._puts(errMsg);
  this._puts('');
};

CliReporter.prototype._reportTimeout = function() {
  this._puts(sprintf('  %s [cyan][TIMEOUT][/cyan]',
                      testUtil.addCharacters('timeout', 69, ' ')));
};

CliReporter.prototype._reportSkipped = function(testName, msg, timing) {
  msg = msg || '';
  testName = (msg) ? sprintf('%s (%s)', testName, msg) : testName;
  this._puts(sprintf('  %s [grey][SKIPPED][/grey]',
                     testUtil.addCharacters(testName, 69, ' ')));
};

CliReporter.prototype._reportStatistics = function() {
  var runTime = (this._dateEnd - this._dateStart);
  var successes = this._successes;
  var failures = this._failures;
  var timeouts = this._timeouts;
  var skipped = this._skipped;

  this._puts(testUtil.addCharacters('', 81, '-'));
  this._puts(sprintf('Ran %d tests in %0.3fs', (successes + failures), runTime));
  this._puts('');
  this._puts(sprintf('Successes: %s', successes));
  this._puts(sprintf('Failures: %s', failures));
  this._puts(sprintf('Timeouts: %s', timeouts));
  this._puts(sprintf('Skipped: %s', skipped));
  this._puts('');

  if (failures === 0 && timeouts === 0) {
    this._puts('[green]PASSED[/green]');
  }
  else {
    this._puts('[red]FAILED[/red]');
  }
};

exports.name = 'cli';
exports.klass = CliReporter;
