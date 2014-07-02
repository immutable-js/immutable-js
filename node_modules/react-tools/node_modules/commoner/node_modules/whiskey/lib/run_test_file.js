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

var path = require('path');

var sprintf = require('sprintf').sprintf;

var common = require('./common');
var testUtil = require('./util');
var coverage = require('./coverage');
var constants = require('./constants');

var ARGUMENTS = {
  'test_path': {
    'pos': 2
  },
  'socket_path': {
    'pos': 3
  },
  'cwd': {
    'pos': 4
  },
  'lib_cov_dir': {
    'pos': 5
  },
  'scope_leaks': {
    'pos': 6
  },
  'chdir': {
    'pos': 7
  },
  'custom_assert_module': {
    'pos': 8
  },
  'init_file': {
    'pos': 9
  },
  'timeout': {
    'pos': 10,
    'type': 'number'
  },
  'concurrency': {
    'pos': 11,
    'type': 'pos'
  },
  'pattern': {
    'pos': 12
  },
};

if (process.argv.length < 6) {
  console.log('No enough argumentes provided');
  process.exit(1);
}

var args = testUtil.parseArguments(ARGUMENTS, process.argv);

var testPath = args['test_path'];
var socketPath = args['socket_path'];
var cwd = args['cwd'];
var libCovDir = args['lib_cov_dir'];
var scopeLeaks = args['scope_leaks'];
var chdir = args['chdir'];
var customAssertModule = args['custom_assert_module'];
var testInitFile = args['init_file'];
var timeout = args['timeout'];
var concurrency = args['concurrency'];
var pattern = args['pattern'];

if (customAssertModule) {
  var exportedFunctions = require(customAssertModule.replace(/$\.js/, ''));
  common.registerCustomAssertionFunctions(exportedFunctions);
}

if (chdir && path.existsSync(chdir)) {
  process.chdir(chdir);
}

var options = { 'cwd': cwd, 'socket_path': socketPath,
                'init_file': testInitFile, 'timeout': timeout,
                'concurrency': concurrency, 'scope_leaks': scopeLeaks,
                'pattern': pattern};
var testFile = new common.TestFile(testPath, options);
testFile.runTests(function onTestFileEnd() {
  if (libCovDir && typeof _$jscoverage === 'object') {
    testFile._reportTestCoverage(_$jscoverage);
  }

  testFile._reportTestFileEnd();
});

process.on('uncaughtException', function(err) {
  testFile.addUncaughtException(err);
});
