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

describe('es6ArrowFunctionsTransform', function() {
  var transformFn;
  var visitors;

  beforeEach(function() {
    require('mock-modules').dumpCache();
    visitors = require('../es6-arrow-function-visitors').visitorList;
    transformFn = require('../../jstransform').transform;
  });

  function transform(code) {
    return transformFn(visitors, code).code;
  }

  function expectTransform(code, result) {
    expect(transform(code)).toEqual(result);
  }

  it('should capture correct this value at different levels', function() {

    var code = transform([
      'var foo = {',
      '  createFooGetter: function() {',
      '    return (x) => [x, this];', // captures foo
      '  },',
      '  getParentThis: () => this', // captures parent this
      '};'
    ].join('\n'));

    eval(code);

    expect(typeof foo.createFooGetter).toBe('function');
    expect(typeof foo.createFooGetter()).toBe('function');
    expect(typeof foo.getParentThis).toBe('function');

    expect(foo.getParentThis()).toEqual(this);
    expect(foo.createFooGetter()(10)).toEqual([10, foo]);
  });

  it('should map an array using arrow capturing this value', function() {
    this.factor = 10;

    var code = transform(
      '[1, 2, 3].map(x => x * x * this.factor);'
    );

    expect(eval(code)).toEqual([10, 40, 90]);
  });

  it('should filter an array using arrow with two params', function() {
    this.factor = 0;

    var code = transform([
      '[1, 2, 3].filter((v, idx) => {',
      '  if (idx > 1 && this.factor > 0) {',
      '    return true;',
      '  }',
      '  this.factor++;',
      '  return false;',
      '});'
    ].join('\n'));

    expect(eval(code)).toEqual([3]);
  });

  it('should fetch this value data from nested arrow', function() {
    var code = transform([
      '({',
      '  bird: 22,',
      '  run: function() {',
      '    return () => () => this.bird;',
      '  }',
      '}).run()()();'
    ].join('\n'));

    expect(eval(code)).toEqual(22);
  });

  // Syntax tests.

  it('should correctly transform arrows', function() {

    // 0 params, expression.
    expectTransform(
      '() => this.value;',
      'function()  {return this.value;}.bind(this);'
    );

    // 1 param, no-parens, expression, no this.
    expectTransform(
      'x => x * x;',
      'function(x)  {return x * x;};'
    );

    // 1 param, parens, expression, as argument, no this.
    expectTransform(
      'map((x) => x * x);',
      'map(function(x)  {return x * x;});'
    );

    // 2 params, block, as argument, nested.
    expectTransform(
      'makeRequest((response, error) => {'.concat(
      '  return this.update(data => this.onData(data), response);',
      '});'),
      'makeRequest(function(response, error)  {'.concat(
      '  return this.update(function(data)  {return this.onData(data);}.bind(this), response);',
      '}.bind(this));')
    );

    // Assignment to a var, simple, 1 param.
    expectTransform(
      'var action = (value) => this.performAction(value);',
      'var action = function(value)  {return this.performAction(value);}.bind(this);'
    );

    // Preserve lines transforming ugly code.
    expectTransform([
      '(',
      '',
      '',
      '    x,',
      ' y',
      '',
      ')',
      '',
      '         =>',
      '',
      '        {',
      ' return         x + y;',
      '};'
    ].join('\n'), [
      'function(',
      '',
      '',
      '    x,',
      ' y)',
      '',
      '',
      '',
      '         ',
      '',
      '        {',
      ' return         x + y;',
      '};'
    ].join('\n'));

    // Preserve line numbers with single parens-free param ugly code.
    expectTransform([
      'x',
      '',
      '     =>',
      '   x;'
    ].join('\n'), [
      'function(x)',
      '',
      '     ',
      '   {return x;};'
    ].join('\n'));

    // Preserve line numbers with single parens param ugly code.
    expectTransform([
      '(',
      '',
      '   x',
      '',
      ')',
      '',
      '     =>',
      '   x;'
    ].join('\n'), [
      'function(',
      '',
      '   x)',
      '',
      '',
      '',
      '     ',
      '   {return x;};'
    ].join('\n'));

    // Preserve typechecker annotation.
    expectTransform(
      '(/*string*/foo, /*bool*/bar) => foo;',
      'function(/*string*/foo, /*bool*/bar)  {return foo;};'
    );

  });
});

