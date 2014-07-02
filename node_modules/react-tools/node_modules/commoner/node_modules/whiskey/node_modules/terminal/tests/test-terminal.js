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
var events = require('events');

var terminal = require('terminal');

exports['test_getStylesLength'] = function(test, assert) {
  var i, string, styleLength;
  var strings = [
    'foobar',
    '[blue]foo[/blue]',
    '[bold][blue]foobar[/blue] moo[/bold]'
  ];
  var styleLengths = [
    0,
    13,
    26
  ];

  for (i = 0; i < strings.length; i++) {
    string = strings[i];
    styleLength = styleLengths[i];

    assert.equal(terminal.getStylesLength(string), styleLength);
  }

  test.finish();
};

exports['test_lpad_and_rpad'] = function(test, assert) {
  var i, string, padWidth;
  var strings = [
    'foo',
    'foobar',
    'bar x',
  ];
  var padWidths = [
    20,
    10,
    20,
    30
  ];

  for (i = 0; i < strings.length; i++) {
    string = strings[i];
    padWidth = padWidths[i];

    assert.equal(terminal.lpad(string, padWidth).length, padWidth);
    assert.ok(terminal.lpad(string, padWidth).indexOf(string) === padWidth - string.length);
    assert.equal(terminal.rpad(string, padWidth).length, padWidth);
    assert.ok(terminal.rpad(string, padWidth).indexOf(string) === 0);
  }

  test.finish();
};

exports['test_printWrapped'] = function(test, assert) {
  test.finish();
};

exports['test_prompt'] = function(test, assert) {
  var buffer = '';
  var gotResult = false;
  var exceptionCount = 0;
  var oldPutsFunc = terminal.PUTS_FUNC;
  var oldOpenStdin = process.openStdin;

  function MockStdin() {
  }

  util.inherits(MockStdin, events.EventEmitter);

  MockStdin.prototype.pause = function() {};
  MockStdin.prototype.resume = function() {};
  MockStdin.prototype._emitData = function(data) {
    this.emit(data);
  };

  // @TODO: Mock process.stdin and verify the whole flow

  function bufferFunc(data) {
    buffer += data;
  }

  function handleResult(input) {
    gotResult = true;
  }

  // Test invalid default option
  try {
    terminal.prompt('test question?', ['y', 'n'], 'u', bufferFunc, handleResult);
  }
  catch (err) {
    exceptionCount++;
    assert.match(err.message, /invalid default option/i);
  }

  // Test normal flow
  var mockStdinInstance = new MockStdin();
  process.openStdin = function() {
    return mockStdinInstance;
  };

  // Invalid option
  terminal.prompt('yes?', ['y', 'n'], 'n', bufferFunc, handleResult);
  mockStdinInstance.emit('data', 'x');

  // Valid result, callback should be called
  mockStdinInstance.emit('data', 'y');

  process.openStdin = oldOpenStdin;
  assert.equal(exceptionCount, 1);
  assert.ok(gotResult);
  assert.ok(buffer.indexOf('Invalid option "x"') !== -1);
  assert.ok(buffer.indexOf('Invalid option "x"') !== -1);
  test.finish();
};

exports['test_formatTags'] = function(test, assert) {
  var i, string, expectedString;
  var strings = [
    'foo',
    '[inextsitent]test[/inextsitent]',
    '[blue]test[/blue]',
    '[blue]test[/red]'
  ];

  var expectedStrings = [
    'foo',
    '[inextsitent]test[/inextsitent]',
    'test',
    '[blue]test[/red]'
  ];

  function replaceFunction(str, p1, p2, p3) {
    return p3;
  }

  for (i = 0; i < strings.length; i++) {
    string = strings[i];
    expectedString = expectedStrings[i];

    assert.equal(terminal.formatTags(string, replaceFunction), expectedString);
  }

  test.finish();
};

exports['test_stylize'] = function(test, assert) {
  var i, string, expectedString;
  var strings = [
    '',
    'foo',
    '[inextsitent]test[/inextsitent]',
    '[blue]test[/blue]',
    '[blue]test[/red]'
  ];

  var expectedStrings = [
    '',
    'foo',
    '[inextsitent]test[/inextsitent]',
    '\u001b[34mtest\u001b[39m',
    '[blue]test[/red]'
  ];

  for (i = 0; i < strings.length; i++) {
    string = strings[i];
    expectedString = expectedStrings[i];

    assert.equal(terminal.stylize(string), expectedString);
  }

  test.finish();
};


exports['test_stripStyles'] = function(test, assert) {
  var i, string, expectedString;
  var strings = [
    'foobar',
    '[blue]foo[/blue]',
    '[bold][blue]foobar[/blue] moo[/bold]'
  ];
  var expectedStrings = [
    'foobar',
    'foo',
    'foobar moo'
  ];

  for (i = 0; i < strings.length; i++) {
    string = strings[i];
    expectedString = expectedStrings[i];

    assert.equal(terminal.stripStyles(string), expectedString);
  }

  test.finish();
};
