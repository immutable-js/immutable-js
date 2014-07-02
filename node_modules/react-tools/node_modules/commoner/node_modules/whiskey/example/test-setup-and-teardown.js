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

var i = 0;
var called = false;
var n = 0;

exports['not_called'] = function(test, assert) {
  assert.ok(false);
  test.finish();
};

exports['setUp'] = function(test, assert) {
  i = 9;
  called = true;
  n++;
  test.finish();
};

exports['test_indexOf'] = function(test, assert) {
  assert.ok(called);
  assert.equal('test'.indexOf('test'), 0);
  setTimeout(function() {
    n++;
    test.finish();
  }, 50);
};

exports['test_throw'] = function(test, assert) {
  assert.ok(called);

  try {
    throw new Error('test');
  }
  catch (err) {
    assert.ok(err);
  }

  n++;
  test.finish();
};

exports['tearDown'] = function(test, assert) {
  assert.ok(called);
  assert.equal(n, 3);

  test.finish();
};
