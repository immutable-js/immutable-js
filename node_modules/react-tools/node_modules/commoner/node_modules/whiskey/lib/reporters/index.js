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

var fs = require('fs');
var path = require('path');

var sprintf = require('sprintf').sprintf;

var TEST_REPORTERS = {};
var COVERAGE_REPORTERS = {};
var SCOPE_LEAKS_REPORTERS = {};

function getReporter(type, name, tests, options) {
  var reporters, availableReporters;
  if (type === 'test') {
    reporters = TEST_REPORTERS;
  }
  else if (type === 'coverage') {
    reporters = COVERAGE_REPORTERS;
  }
  else if (type === 'scope-leaks') {
    reporters = SCOPE_LEAKS_REPORTERS;
  }
  else {
    throw new Error(sprintf('Invalid reporter type: %s', type));
  }

  availableReporters = Object.keys(reporters);

  if (availableReporters.indexOf(name) === -1) {
    throw new Error(sprintf('Invalid reporter: %s. Valid reporters are: %s',
                            name, availableReporters.join(', ')));
  }

  return new reporters[name](tests, options);
}

function discoverReporters(reporters, reportersPath) {
  var i, files, file, filesLen, moduleName, exported;
  var fullPath = path.join(__dirname, reportersPath);
  files = fs.readdirSync(fullPath);

  filesLen = files.length;
  for (i = 0; i < filesLen; i++) {
    file = files[i];
    moduleName = file.replace(/\.js$/, '');
    exported = require(sprintf('./%s/%s', reportersPath, moduleName));

    if (exported.name && exported.klass) {
      reporters[exported.name] = exported.klass;
    }
  }
}

if (Object.keys(TEST_REPORTERS).length === 0) {
  discoverReporters(TEST_REPORTERS, 'test');
}

if (Object.keys(COVERAGE_REPORTERS).length === 0) {
  discoverReporters(COVERAGE_REPORTERS, 'coverage');
}

if (Object.keys(SCOPE_LEAKS_REPORTERS).length === 0) {
  discoverReporters(SCOPE_LEAKS_REPORTERS, 'scope-leaks');
}

exports.getReporter = getReporter;
