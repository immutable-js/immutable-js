/**
 * Copyright 2013 Facebook, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @emails dmitrys@fb.com javascript@lists.facebook.com
 */

/*jshint evil:true*/

require('mock-modules').autoMockOff();

describe('es6-object-short-notation-visitors', function() {
  var transformFn;
  var visitors;

  beforeEach(function() {
    require('mock-modules').dumpCache();
    visitors = require('../es6-object-short-notation-visitors').visitorList;
    transformFn = require('../../jstransform').transform;
  });

  function transform(code) {
    return transformFn(visitors, code).code;
  }

  function expectTransform(code, result) {
    expect(transform(code)).toEqual(result);
  }

  // Functional tests.

  it('should transform short notation and return 5', function() {
    var code = transform([
      '(function(x, y) {',
      '  var data = {x, y};',
      '  return data.x + data.y;',
      '})(2, 3);'
    ].join('\n'));

    expect(eval(code)).toEqual(5);
  });

  // Source code tests.
  it('should transform simple short notation', function() {

    // Should transform simple short notation.
    expectTransform(
      'function foo(x, y) { return {x, y}; }',
      'function foo(x, y) { return {x:x, y:y}; }'
    );

    // Should transform: short notation in complex object pattern.
    expectTransform([
      'function init({name, points: [{x, y}, {z, q}]}) {',
      '  return function([{data: {value, score}}]) {',
      '    return {z, q, score, name};',
      '  };',
      '}'
    ].join('\n'), [
      'function init({name:name, points: [{x:x, y:y}, {z:z, q:q}]}) {',
      '  return function([{data: {value:value, score:score}}]) {',
      '    return {z:z, q:q, score:score, name:name};',
      '  };',
      '}'
    ].join('\n'));

    // Should preserve lines transforming ugly code.
    expectTransform([
      'function',
      '',
      'foo    ({',
      '    x,',
      '          y',
      '',
      '})',
      '',
      '        {',
      ' return         {',
      '          x,',
      '  y};',
      '}'
    ].join('\n'), [
      'function',
      '',
      'foo    ({',
      '    x:x,',
      '          y:y',
      '',
      '})',
      '',
      '        {',
      ' return         {',
      '          x:x,',
      '  y:y};',
      '}'
    ].join('\n'));
  });

});


