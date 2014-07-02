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

var bdd = require('../lib/bdd').init(exports);
var describe = bdd.describe;
var beforeEach = bdd.beforeEach;

var wasBeforeEachCalled = false;

beforeEach(function() {
  wasBeforeEachCalled = true;
});

describe('the bdd module', function(it) {

  it('supports it(), expect(), and toEqual()', function(expect) {
    expect(true).toEqual(true);
  });

  it('supports beforeEach()', function(expect) {
    expect(wasBeforeEachCalled).toEqual(true);
  });

  it('supports async tests', function(expect, callback) {
    var called = false;
    setTimeout(function() {
      called = true;
    }, 1);
    setTimeout(function() {
      expect(called).toEqual(true);
      callback();
    }, 3);
  });

});

describe('the bdd expect()', function(it) {

  it('handles toBeNull()', function(expect) {
    expect(null).toBeNull();
  });

  it('handles toBeDefined()', function(expect) {
    expect(true).toBeDefined();
  });

  it('handles toBeUndefined()', function(expect) {
    expect(undefined).toBeUndefined();
  });

  it('handles toMatch()', function(expect) {
    expect('fish').toMatch(/is/);
  });

});
