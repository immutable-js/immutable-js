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

var someFile = require('./some-file');

exports['test_uncaught_exception'] = function(test, assert) {
  throw new Error('Testing uncaught exception');
  // Line bellow won't be reached
  test.finish();
};

exports['test_uncaught_exception_2'] = function(test, assert) {
  someFile.throwException();
  // Line bellow won't be reached
  test.finish();
};

exports['test_unknown_method'] = function(test, assert) {
  someFile.unknownMethod();
  // Line bellow won't be reached
  test.finish();
};

exports['test_uncaught_nested_functions'] = function(test, assert) {
  someFile.throwNestedFunctions();
  // Line bellow won't be reached
  test.finish();
};

exports['test1_require_throws'] = function(test, assert) {
  require('timeout-throws.js');
};
