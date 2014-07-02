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

var sprintf = require('sprintf').sprintf;

/*
 * How long to wait for a test file to complete.
 */
var DEFAULT_TEST_TIMEOUT = 15 * 1000;

var DEFAULT_CONCURRENCY = 1;

/**
 * Default reporters.
 */
var DEFAULT_TEST_REPORTER = 'cli';
var DEFAULT_COVERAGE_REPORTER = 'cli';
var DEFAULT_SCOPE_LEAKS_REPORTER = 'cli';

/**
 * Program version.
 */
var VERSION = '0.6.13';

/**
 * Path where the instrumented files are saved.
 */
var COVERAGE_PATH = 'lib-cov';

/**
 * Default test verbosity (1 = quiet, 2 = verbose, 3 = very verbose)
 */
var DEFAULT_VERBOSITY = 2;

var INIT_FUNCTION_NAME = 'init';

var TEARDOWN_FUNCTION_NAME = 'tearDown';

var SETUP_FUNCTION_NAME = 'setUp';

var DEFAULT_SOCKET_PATH = '/tmp/whiskey-parent.sock';

/**
 * Different markers.
 */
var TEST_START_MARKER = '@-start-test-@';
var DELIMITER = '@-delimiter-@';
var TEST_END_MARKER = '@-end-test-@';
var TEST_FILE_END_MARKER = '@-end-test-file-@';
var COVERAGE_END_MARKER = '@-end-coverage-@';

/**
 * Default switches for the option parser.
 */
var DEFAULT_OPTIONS = [
  ['-h', '--help', 'Print this help'],
  ['-V', '--version', 'Print the version']
];

/**
 * Other options for the Whiskey option parser.
 */
var WHISKEY_OPTIONS = [
  ['-t', '--tests STRING', 'Whitespace separated list of test suites to run sequentially.'],
  ['-T', '--independent-tests STRING', 'Whitespace separated list of test suites capable of running independently and concurrently.'],
  ['-m', '--max-suites NUMBER', 'The number of concurrently executing test suites (defaults to 5)'],
  ['-ti', '--test-init-file STRING', 'An initialization file which is run before each test file'],
  ['-c', '--chdir STRING', 'Directory to which each test process chdirs before running the tests'],
  ['-v', '--verbosity [NUMBER]', 'Test runner verbosity'],
  ['', '--failfast', 'Stop running the tests on the first failure'],
  ['', '--timeout [NUMBER]', 'How long to wait (ms) for a test file to complete before timing out'],
  ['', '--socket-path STRING', sprintf('A path to the unix socket used for communication. ' +
                                       'Defaults to %s', DEFAULT_SOCKET_PATH)],

  ['', '--concurrency [NUMBER]', sprintf('Maximum number of tests in a file which will run in ' +
                                         'parallel. Defaults to %s', DEFAULT_CONCURRENCY)],
  ['', '--sequential', 'Run test in a file in sequential mode. This is the same as using --concurrency 1'],

  ['', '--custom-assert-module STRING', 'Absolute path to a module with custom assert methods'],

  ['', '--no-styles', 'Don\'t use colors and styles'],

  ['', '--quiet', 'Don\'t print stdout and stderr'],
  ['', '--real-time', 'Print data which is sent to stdout / stderr as soon ' +
                       'as it comes in'],

  ['', '--test-reporter STRING', 'Rest reporter type (cli or tap)'],

  ['', '--coverage', 'Enable test coverage'],
  ['', '--coverage-file STRING', 'A file where the coverage result is stored. Only has an effect if json coverage reporter is used'],
  ['', '--coverage-files STRING', 'A comma-separated list of files containing coverage data'],
  ['', '--coverage-reporter STRING', 'Coverage reporter type (cli, html)'],
  ['', '--coverage-dir STRING', 'Directory where the HTML coverage report is saved'],
  ['', '--coverage-encoding STRING', 'Encoding which jscoverage will use when parsing files which are instrumented'],
  ['', '--coverage-exclude STRING', 'Paths which won\'t be instrumented'],
  ['', '--coverage-no-instrument STRING', 'Copy but don\'t instrument the path'],
  ['', '--coverage-no-regen', 'Don\'t generate coverage file if lib-cov directory already exists'],

  ['', '--scope-leaks', 'Records which variables were leaked into the global ' +
                        'scope.'],
  ['', '--scope-leaks-reporter STRING', 'Scope leaks reporter type (cli)'],
  ['-d', '--debug', 'Attach a debugger to a test process'],
  ['', '--gen-makefile', 'Genarate a Makefile'],
  ['', '--makefile-path STRING', 'Path where a generated Makefile is saved'],
  ['', '--report-timing', 'Report test timing'],
  ['', '--dependencies STRING', 'Path to the test dependencies configuration file'],
  ['', '--only-essential-dependencies', 'Only start dependencies required by the tests files which are ran']
];

/**
 * Other options for the Process runner option parser.
 */
var PROCESS_RUNNER_OPTIONS = [
  ['-c', '--config STRING', 'Path to the dependencies.json file'],
  ['-v', '--verify', 'Verify the config'],
  ['-r', '--run', 'Run the processes'],
  ['-n', '--names STRING', 'Comma-delimited string of the processes to run. Only applicable' +
                           ' if --run is used']
];

exports.DEFAULT_TEST_TIMEOUT = DEFAULT_TEST_TIMEOUT;
exports.DEFAULT_CONCURRENCY = DEFAULT_CONCURRENCY;
exports.DEFAULT_TEST_REPORTER = DEFAULT_TEST_REPORTER;
exports.DEFAULT_COVERAGE_REPORTER = DEFAULT_COVERAGE_REPORTER;
exports.DEFAULT_SCOPE_LEAKS_REPORTER = DEFAULT_SCOPE_LEAKS_REPORTER;

exports.VERSION = VERSION;
exports.COVERAGE_PATH = COVERAGE_PATH;
exports.DEFAULT_VERBOSITY = DEFAULT_VERBOSITY;
exports.INIT_FUNCTION_NAME = INIT_FUNCTION_NAME;
exports.SETUP_FUNCTION_NAME = SETUP_FUNCTION_NAME;
exports.TEARDOWN_FUNCTION_NAME = TEARDOWN_FUNCTION_NAME;
exports.DEFAULT_SOCKET_PATH = DEFAULT_SOCKET_PATH;
exports.DEFAULT_OPTIONS = DEFAULT_OPTIONS;
exports.WHISKEY_OPTIONS = WHISKEY_OPTIONS;
exports.PROCESS_RUNNER_OPTIONS = PROCESS_RUNNER_OPTIONS;

exports.TEST_START_MARKER = TEST_START_MARKER;
exports.DELIMITER = DELIMITER;
exports.TEST_END_MARKER = TEST_END_MARKER;
exports.TEST_FILE_END_MARKER = TEST_FILE_END_MARKER;
exports.COVERAGE_END_MARKER = COVERAGE_END_MARKER;
