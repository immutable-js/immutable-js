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

/**
 * @constructor
 */
function Foo () {
  /**
   * @param {bool}
   */
  this.fooCalled = false;
  /**
   * @param {string}
   */
  this.bar = "";
  /**
   * @param {string}
   */
  this.postFix = 'postFix';
}

Foo.prototype.setFoo = function () {
  this.fooCalled = true;
};

/**
 * @param {string} bar
 */
Foo.prototype.setBar = function (bar) {
  this.bar = bar;
  return bar + this.postFix;
};

exports['test_spyon_calls_method'] = function(test, assert) {
  var foo = new Foo();
  test.spy.on('setFoo', foo);
  foo.setFoo();
  assert.equal(foo.fooCalled, true);
  test.spy.clear('setFoo', foo);
  test.finish();
};

exports['test_spyon_returns_right'] = function(test, assert) {
  var foo, str;
  foo = new Foo();
  str = 'foo';
  test.spy.on('setBar', foo);
  assert.equal(foo.setBar(str), str + foo.postFix);
  test.spy.clear('setBar', foo);
  test.finish();
};

exports['test_spyon_count_correct'] = function(test, assert) {
  var foo = new Foo();
  test.spy.on('setFoo', foo);
  foo.setFoo();
  foo.setFoo();
  foo.setFoo();
  foo.setFoo();
  foo.setFoo();
  foo.setFoo();
  foo.setFoo();
  assert.equal(test.spy.called('setFoo'), 7);
  test.spy.clear('setFoo', foo);
  test.finish();
};

exports['test_spyon_with_arguments_correct'] = function(test, assert) {
  var foo, arr;
  foo = new Foo();
  arr = ['a', 'b', null];
  test.spy.on('setBar', foo);
  foo.setBar(arr);
  assert.ok(test.spy.called('setBar').withArgs(arr));
  test.spy.clear('setBar', foo);
  test.finish();
};

exports['test_spyon_with_arguments_alias'] = function(test, assert) {
  var foo, arr;
  foo = new Foo();
  arr = ['a', 'b', null];
  test.spy.on('setBar', foo);
  foo.setBar(arr);
  assert.ok(test.spy.called('setBar').with(arr));
  test.spy.clear('setBar', foo);
  test.finish();
};

exports['test_spyon_with_arguments_incorrect'] = function(test, assert) {
  var foo, arr;
  foo = new Foo();
  arr = ['a', 'b', null];
  test.spy.on('setBar', foo);
  foo.setBar(['c']);
  assert.ok(!test.spy.called('setBar').withArgs(arr));
  test.spy.clear('setBar', foo);
  test.finish();
};

exports['test_spyon_accepts_function'] = function(test, assert) {
  var foo, func, set;
  foo = new Foo();
  set = false;
  func = function () {
    set = true;
  }
  test.spy.on('setFoo', foo, func);
  foo.setFoo();
  assert.equal(set, true);
  test.spy.clear('setFoo', foo);
  test.finish();
};

exports['test_spyon_reapplies_original_function'] = function(test, assert) {
  var foo, func;
  foo = new Foo();
  func = foo.setFoo;
  test.spy.on('setFoo', foo);
  test.spy.clear('setFoo', foo);
  assert.equal(foo.setFoo, func);
  test.finish();
};

exports['test_spyon_reapplies_given_function'] = function(test, assert) {
  var foo, func, set;
  foo = new Foo();
  set = false;
  func = function () {
    set = true;
  };
  test.spy.on('setFoo', foo);
  test.spy.clear('setFoo', foo, func);
  assert.equal(foo.setFoo, func);
  test.finish();
};

exports['test_spyon_reset'] = function(test, assert) {
  var foo = new Foo();
  test.spy.on('setFoo', foo);
  foo.setFoo();
  test.spy.reset('setFoo');
  assert.equal(test.spy.called('setFoo'), 0);
  test.spy.clear('setFoo', foo);
  test.finish();
};

