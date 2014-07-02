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
 *
 * @emails jeffmo@fb.com javascript@lists.facebook.com
 */

/*jshint evil:true*/

require('mock-modules').autoMockOff();

describe('es6-classes', function() {
  var transformFn;
  var visitors;

  beforeEach(function() {
    require('mock-modules').dumpCache();
    visitors = require('../es6-class-visitors').visitorList;
    transformFn = require('../../jstransform').transform;
  });

  function transform(code, opts) {
    return transformFn(visitors, code, opts).code;
  }

  describe('ClassDeclarations', function() {
    describe('preserves line numbers', function() {
      it('does not add "use strict" unless necessary', function() {
        var code = [
          'function strictStuff() {',
          '  "use strict";',
          '  class A {',
          '    foo() {}',
          '  }',
          '}',
          'class B {',
          '  bar() {}',
          '}'
        ].join('\n');

        var expected = [
          'function strictStuff() {',
          '  "use strict";',
          '  function A(){}',
          '    A.prototype.foo=function() {};',
          '  ',
          '}',
          'function B(){"use strict";}',
          '  B.prototype.bar=function() {"use strict";};',
          ''
        ].join('\n');

        expect(transform(code)).toBe(expected);
      });

      it('preserves lines with no inheritance', function() {
        var code = [
          '"use strict";',
          'class Foo {',
          '  foo() {',
          '    ',
          '    ',
          '  }',
          '',
          '  constructor(p1,',
          '              p2) {',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '',
          '  bar(){}',
          '  static baz() {',
          '}',
          '}'
        ].join('\n');

        var expected = [
          '"use strict";',
          '',
          '  Foo.prototype.foo=function() {',
          '    ',
          '    ',
          '  };',
          '',
          '  function Foo(p1,',
          '              p2) {',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '',
          '  Foo.prototype.bar=function(){};',
          '  Foo.baz=function() {',
          '};',
          ''
        ].join('\n');

        expect(transform(code)).toBe(expected);
      });

      it('preserves lines with inheritance from identifier', function() {
        var code = [
          'class Foo extends Bar {',
          '  foo() {',
          '    ',
          '    ',
          '    super(p1,',
          '          p2);',
          '  }',
          '',
          '  constructor(p1,',
          '              p2) {',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '    super.blah(p1,',
          '               p2);',
          '  }',
          '',
          '  bar(){}',
          '  static baz() {',
          '}',
          '}'
        ].join('\n');

        var expected = [
          'for(var Bar____Key in Bar){' +
            'if(Bar.hasOwnProperty(Bar____Key)){' +
              'Foo[Bar____Key]=Bar[Bar____Key];' +
            '}' +
          '}' +
          'var ____SuperProtoOfBar=' +
            'Bar===null' +
              '?null:' +
              'Bar.prototype;' +
          'Foo.prototype=Object.create(____SuperProtoOfBar);' +
          'Foo.prototype.constructor=Foo;' +
          'Foo.__superConstructor__=Bar;',

          '  Foo.prototype.foo=function() {"use strict";',
          '    ',
          '    ',
          '    Bar.call(this,p1,',
          '          p2);',
          '  };',
          '',
          '  function Foo(p1,',
          '              p2) {"use strict";',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '    ____SuperProtoOfBar.blah.call(this,p1,',
          '               p2);',
          '  }',
          '',
          '  Foo.prototype.bar=function(){"use strict";};',
          '  Foo.baz=function() {"use strict";',
          '};',
          ''
        ].join('\n');

        expect(transform(code)).toBe(expected);
      });

      it('preserves lines with inheritance from expression', function() {
        var code = [
          'class Foo extends mixin(Bar, Baz) {',
          '  foo() {',
          '    ',
          '    ',
          '  }',
          '',
          '  constructor(p1,',
          '              p2) {',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '',
          '  bar(){}',
          '  static baz() {',
          '}',
          '}'
        ].join('\n');

        var expected = [
          'var ____Class0=mixin(Bar, Baz);' +
          'for(var ____Class0____Key in ____Class0){' +
            'if(____Class0.hasOwnProperty(____Class0____Key)){' +
              'Foo[____Class0____Key]=____Class0[____Class0____Key];' +
            '}' +
          '}' +
          'var ____SuperProtoOf____Class0=' +
            '____Class0===null' +
              '?null' +
              ':____Class0.prototype;' +
          'Foo.prototype=Object.create(____SuperProtoOf____Class0);' +
          'Foo.prototype.constructor=Foo;' +
          'Foo.__superConstructor__=____Class0;',

          '  Foo.prototype.foo=function() {"use strict";',
          '    ',
          '    ',
          '  };',
          '',
          '  function Foo(p1,',
          '              p2) {"use strict";',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '',
          '  Foo.prototype.bar=function(){"use strict";};',
          '  Foo.baz=function() {"use strict";',
          '};',
          ''
        ].join('\n');

        expect(transform(code)).toBe(expected);
      });
    });

    describe('functional tests', function() {
      it('handles an empty body', function() {
        var code = transform(
          'class Foo {}'
        );

        eval(code);

        var fooInst = new Foo();
        expect(fooInst instanceof Foo).toBe(true);
      });

      it('handles constructors without params', function() {
        var code = transform([
          'class Foo {',
          '  constructor() {',
          '    this.test = "testValue";',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        expect(fooInst.test).toBe('testValue');
      });

      it('handles constructors with params', function() {
        var code = transform([
          'class Foo {',
          '  constructor(p1, p2) {',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo('a', 'b');
        expect(fooInst.p1).toBe('a');
        expect(fooInst.p2).toBe('b');
      });

      it('handles prototype methods without params', function() {
        var code = transform([
          'class Foo {',
          '  bar() {',
          '    return "stuff";',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        expect(fooInst.bar()).toBe('stuff');
      });

      it('handles prototype methods with params', function() {
        var code = transform([
          'class Foo {',
          '  bar(p1, p2) {',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        fooInst.bar('a', 'b');
        expect(fooInst.p1).toBe('a');
        expect(fooInst.p2).toBe('b');
      });

      it('handles static methods without params', function() {
        var code = transform([
          'class Foo {',
          '  static bar() {',
          '    return "stuff";',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        expect(Foo.bar()).toBe('stuff');
        var fooInst = new Foo();
        expect(fooInst.bar).toBe(undefined);
      });

      it('handles static methods with params', function() {
        var code = transform([
          'class Foo {',
          '  static bar(p1, p2) {',
          '    return [p1, p2];',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        expect(Foo.bar('a', 'b')).toEqual(['a', 'b']);
        var fooInst = new Foo();
        expect(fooInst.bar).toBe(undefined);
      });

      it('handles extension from an identifier', function() {
        var code = transform([
          'function Parent() {}',
          'Parent.prototype.protoProp = "protoProp";',
          'Parent.staticProp = "staticProp";',

          'class Child extends Parent {}'
        ].join('\n'));

        eval(code);

        expect(Child.protoProp).toBe(undefined);
        expect(Child.staticProp).toBe('staticProp');
        var childInst = new Child();
        expect(childInst instanceof Child).toBe(true);
        expect(childInst instanceof Parent).toBe(true);
        expect(childInst.protoProp).toBe('protoProp');
      });

      it('handles extension from an expression', function() {
        var code = transform([
          'function Parent1() {}',
          'Parent1.prototype.protoProp = "protoProp";',
          'Parent1.staticProp = "staticProp";',

          'function Parent2() {}',

          'class Child extends true ? Parent1 : Parent2 {}'
        ].join('\n'));

        eval(code);

        expect(Child.protoProp).toBe(undefined);
        expect(Child.staticProp).toBe('staticProp');
        var childInst = new Child();
        expect(childInst instanceof Child).toBe(true);
        expect(childInst instanceof Parent1).toBe(true);
        expect(childInst.protoProp).toBe('protoProp');
        expect(childInst.staticProp).toBe(undefined);
      });

      it('runs parent constructor when child constructor absent', function() {
        var code = transform([
          'class Parent {',
          '  constructor(p1, p2) {',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '}',

          'class Child extends Parent {}'
        ].join('\n'));

        eval(code);

        var childInst = new Child('a', 'b');
        expect(childInst.p1).toBe('a');
        expect(childInst.p2).toBe('b');
      });

      it('sets constructor property to point at constructor func', function() {
        var code = transform([
          'class Parent {}',
          'class Child extends Parent {}'
        ].join('\n'));

        eval(code);

        var childInst = new Child();
        expect(childInst.constructor).toBe(Child);
      });

      it('handles super CallExpressions within constructors', function() {
        var code = transform([
          'class Parent {',
          '  constructor(p1, p2) {',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '}',

          'class Child extends Parent {',
          '  constructor() {',
          '    super("a", "b");',
          '    this.childRan = true;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var childInst = new Child();
        expect(childInst.p1).toBe('a');
        expect(childInst.p2).toBe('b');
        expect(childInst.childRan).toBe(true);
      });

      it('handles super CallExpressions within proto methods', function() {
        var code = transform([
          'class Parent {',
          '  constructor(p1, p2) {',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '}',

          'class Child extends Parent {',
          '  constructor() {}',
          '  bar() {',
          '    super("a", "b");',
          '    this.barRan = true;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var childInst = new Child();
        expect(childInst.p1).toBe(undefined);
        expect(childInst.p2).toBe(undefined);
        expect(childInst.barRan).toBe(undefined);
        childInst.bar();
        expect(childInst.p1).toBe('a');
        expect(childInst.p2).toBe('b');
        expect(childInst.barRan).toBe(true);
      });

      it('handles computed super MemberExpressions',
         function() {
        var code = transform([
          'class Parent {',
          '  constructor() {',
          '    this.counter = 0;',
          '  }',
          '  incrementCounter(amount) {',
          '    this.counter += amount;',
          '  }',
          '}',

          'class Child extends Parent {',
          '  childIncrement() {',
          '    super["increment" + "Counter"](2);',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var childInst = new Child();
        expect(childInst.counter).toBe(0);
        childInst.childIncrement();
        expect(childInst.counter).toBe(2);
      });

      it('handles simple super MemberExpression access', function() {
        var code = transform([
          'class Parent {',
          '  getFoo(p) {',
          '    return "foo" + p;',
          '  }',
          '}',

          'class Child extends Parent {',
          '  getChildFoo() {',
          '    var x = super.getFoo;',
          '    return x("bar");',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var childInst = new Child();
        expect(childInst.getChildFoo()).toBe('foobar');
      });

      it('handles CallExpression on a super MemberExpression', function() {
        var code = transform([
          'class Parent {',
          '  getFoo(p) {',
          '    this.fooValue = "foo";',
          '    return this.fooValue + p;',
          '  }',
          '}',

          'class Child extends Parent {',
          '  getChildFoo() {',
          '    return super.getFoo.call(this, "bar");',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var childInst = new Child();
        expect(childInst.getChildFoo()).toBe('foobar');
        expect(childInst.fooValue).toBe('foo');
      });

      it('handles super MemberExpressions within constructors', function() {
        var code = transform([
          'class Parent {',
          '  setParams(p1, p2) {',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '}',

          'class Child extends Parent {',
          '  constructor() {',
          '    super.setParams("a", "b");',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var childInst = new Child();
        expect(childInst.p1).toBe('a');
        expect(childInst.p2).toBe('b');
      });

      it('handles super MemberExpressions within proto methods', function() {
        var code = transform([
          'class Parent {',
          '  setParams(p1, p2) {',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '}',

          'class Child extends Parent {',
          '  bar() {',
          '    super.setParams("a", "b");',
          '    this.barRan = true;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var childInst = new Child();
        expect(childInst.p1).toBe(undefined);
        expect(childInst.p2).toBe(undefined);
        expect(childInst.barRan).toBe(undefined);
        childInst.bar();
        expect(childInst.p1).toBe('a');
        expect(childInst.p2).toBe('b');
        expect(childInst.barRan).toBe(true);
      });

      it('consistently munges private property identifiers', function() {
        var code = transform([
          'class Foo {',
          '  constructor(p1) {',
          '    this._p1 = p1;',
          '  }',
          '  getP1() {',
          '    return this._p1;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo('a');
        expect(fooInst._p1).toBe(undefined);
        expect(fooInst.getP1()).toBe('a');
      });

      it('stores munged private properties on the instance', function() {
        // Protects against subtle transform bugs like:
        //   `this._p1 = 42` -> `this$Foo_p1 = 42`
        var code = transform([
          'class Foo {',
          '  constructor(p1) {',
          '    this._p1 = p1;',
          '  }',
          '  getP1() {',
          '    return this._p1;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst1 = new Foo('a');
        var fooInst2 = new Foo('b');
        expect(fooInst1.getP1()).toBe('a');
        expect(fooInst2.getP1()).toBe('b');
      });

      it('consistently munges nested private property identifiers', function() {
        var code = transform([
          'class Foo {',
          '  constructor(p1) {',
          '    this._data = {_p1: null};',
          '    this._data._p1 = p1;',
          '  }',
          '  getData() {',
          '    return this._data;',
          '  }',
          '  getP1() {',
          '    return this._data._p1;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo('a');
        expect(fooInst.getData()._p1).toBe(undefined);
        expect(fooInst.getP1()).toBe('a');
      });

      it('consistently munges private method identifiers', function() {
        var code = transform([
          'class Foo {',
          '  getBar() {',
          '    return this._getBar();',
          '  }',
          '  _getBar() {',
          '    return 42;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        expect(fooInst._getBar).toBe(undefined);
        expect(fooInst.getBar()).toBe(42);
      });

      it('consistently munges private method params', function() {
        var code = transform([
          'class Foo {',
          '  bar(_counter, _function) {',
          '    this.counter = _counter;',
          '    _function();',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        var callbackCalled = false;
        fooInst.bar(42, function() { callbackCalled = true; });
        expect(fooInst.counter).toBe(42);
        expect(callbackCalled).toBe(true);
      });

      it('consistently munges private idents in super call params', function() {
        var code = transform([
          'class Parent {',
          '  constructor(foo) {',
          '    this.foo = foo;',
          '  }',
          '  setBar(bar) {',
          '    this.bar = bar;',
          '  }',
          '}',
          'class Child extends Parent {',
          '  constructor(_foo, _bar) {',
          '    super(_foo);',
          '    super.setBar(_bar);',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var childInst = new Child('foo', 'bar');
        expect(childInst.foo).toBe('foo');
        expect(childInst.bar).toBe('bar');
      });

      it('consistently munges private idents in nested funcs', function() {
        var code = transform([
          'class Foo {',
          '  bar(_p1, p2) {',
          '    return function(_a) {',
          '      return [_p1, p2, _a];',
          '    };',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        expect(fooInst.bar('a', 'b')('c')).toEqual(['a', 'b', 'c']);
      });

      it('does not munge dunder-scored properties', function() {
        var code = transform([
          'class Foo {',
          '  constructor(p1) {',
          '    this.__p1 = p1;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo('a');
        expect(fooInst.__p1).toBe('a');
      });

      it('does not munge dunder-scored methods', function() {
        var code = transform([
          'class Foo {',
          '  __getBar() {',
          '    return 42;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        expect(fooInst.__getBar()).toBe(42);
      });

      it('properly handles private vars declared in outer scope', function() {
        var code = transform([
          'var _bar = "outer";',
          'class Foo {',
          '  getOuterBar() {',
          '    return _bar;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        expect(fooInst.getOuterBar()).toBe('outer');
      });

      it('does not munge outer-declared private vars when used to calculate ' +
         'a computed member expression', function() {
        var code = transform([
          'var _privateObjKey = "pvt";',
          'var outerDataStore = {pvt: 42};',
          'class Foo {',
          '  getStuff() {',
          '    return outerDataStore[_privateObjKey];',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        expect(fooInst.getStuff()).toBe(42);
      });

      it('properly handles private vars declared in inner scope', function() {
        var code = transform([
          'var _bar = {_private: 42};',
          'class Foo {',
          '  getBarPrivate(p1) {',
          '    var _bar = {_private: p1};',
          '    return _bar._private;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        expect(fooInst.getBarPrivate('a')).toBe('a');
      });

      it('munges properties of private vars declared out of scope', function() {
        var code = transform([
          'var _bar = {_private: 42}',
          'class Foo {',
          '  getOuterPrivate() {',
          '    return _bar._private;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        expect(_bar._private).toBe(42);
        expect(fooInst.getOuterPrivate()).toBe(undefined);
      });

      it('does not munge when @preventMunge is specified', function() {
        var code = transform([
          '/**',
          ' * @preventMunge',
          ' */',
          'class Foo {',
          '  constructor(p1) {',
          '    this._p1 = p1;',
          '  }',
          '  _privateMethod() {',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo('a');
        expect(fooInst._p1).toBe('a');
        expect(fooInst._privateMethod).not.toBe(undefined);
      });

      it('minifies private properties when minify opt is set', function() {
        var code = transform([
          'class Foo {',
          '  constructor(p1) {',
          '    this._p1 = p1;',
          '  }',
          '}'
        ].join('\n'), {minify: true});

        eval(code);

        var fooInst = new Foo('a');
        expect(fooInst.$Foo0).toBe('a');
      });

      it('minifies private methods when minify opt is set', function() {
        var code = transform([
          'class Foo {',
          '  _bar() {',
          '    return 42;',
          '  }',
          '}'
        ].join('\n'), {minify: true});

        eval(code);

        var fooInst = new Foo();
        expect(fooInst.$Foo0()).toBe(42);
      });

      it('munges child class different from parent in same file', function() {
        var code = transform([
          'class Parent {',
          '  setParentFoo(foo) {',
          '    this._foo = foo;',
          '  }',
          '  getParentFoo() {',
          '    return this._foo;',
          '  }',
          '}',

          'class Child extends Parent {',
          '  setChildFoo(foo) {',
          '    this._foo = foo;',
          '  }',
          '  getChildFoo() {',
          '    return this._foo;',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var childInst = new Child();
        childInst.setParentFoo('parent');
        childInst.setChildFoo('child');
        expect(childInst.getParentFoo()).toBe('parent');
        expect(childInst.getChildFoo()).toBe('child');
      });

      it('munges child class different from parent in other file', function() {
        var code1 = transform([
          'class Parent {',
          '  setParentFoo(foo) {',
          '    this._foo = foo;',
          '  }',
          '  getParentFoo() {',
          '    return this._foo;',
          '  }',
          '}'
        ].join('\n'));

        var code2 = transform([
          'class Child extends Parent {',
          '  setChildFoo(foo) {',
          '    this._foo = foo;',
          '  }',
          '  getChildFoo() {',
          '    return this._foo;',
          '  }',
          '}'
        ].join('\n'));

        eval(code1);
        eval(code2);

        var childInst = new Child();
        childInst.setParentFoo('parent');
        childInst.setChildFoo('child');
        expect(childInst.getParentFoo()).toBe('parent');
        expect(childInst.getChildFoo()).toBe('child');
      });

      it('makes class methods implicitly "use strict"', function() {
        var code = transform([
          'class Foo {',
          '  constructor() {',
          '    this.constructorIsStrict = ' +
                 '(function() {return this === undefined;})();',
          '  }',
          '  protoFn() {',
          '    return (function() {return this === undefined;})();',
          '  }',
          '  static staticFn() {',
          '    return (function() {return this === undefined;})();',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        expect(fooInst.constructorIsStrict).toBe(true);
        expect(fooInst.protoFn()).toBe(true);
        expect(Foo.staticFn()).toBe(true);
      });
    });
  });

  describe('ClassExpressions', function() {
    describe('preserves line numbers', function() {
      it('preserves lines with no inheritance', function() {
        var code = [
          'var Foo = class {',
          '  foo() {',
          '    ',
          '    ',
          '  }',
          '',
          '  constructor(p1,',
          '              p2) {',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '',
          '  bar(){}',
          '  static baz() {',
          '}',
          '}'
        ].join('\n');

        var expected = [
          'var Foo = (function(){',
          '  ____Class0.prototype.foo=function() {"use strict";',
          '    ',
          '    ',
          '  };',
          '',
          '  function ____Class0(p1,',
          '              p2) {"use strict";',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '',
          '  ____Class0.prototype.bar=function(){"use strict";};',
          '  ____Class0.baz=function() {"use strict";',
          '};',
          'return ____Class0;})()'
        ].join('\n');

        expect(transform(code)).toBe(expected);
      });

      it('preserves lines with inheritance from identifier', function() {
        var code = [
          'var Foo = class extends Bar {',
          '  foo() {',
          '    ',
          '    ',
          '    super(p1,',
          '          p2);',
          '  }',
          '',
          '  constructor(p1,',
          '              p2) {',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '    super.blah(p1,',
          '               p2);',
          '  }',
          '',
          '  bar(){}',
          '  static baz() {',
          '}',
          '}'
        ].join('\n');

        var expected = [
          'var Foo = (function(){' +
          'for(var Bar____Key in Bar){' +
            'if(Bar.hasOwnProperty(Bar____Key)){' +
              '____Class0[Bar____Key]=Bar[Bar____Key];' +
            '}' +
          '}' +
          'var ____SuperProtoOfBar=' +
            'Bar===null' +
              '?null' +
              ':Bar.prototype;' +
          '____Class0.prototype=Object.create(____SuperProtoOfBar);' +
          '____Class0.prototype.constructor=____Class0;' +
          '____Class0.__superConstructor__=Bar;',

          '  ____Class0.prototype.foo=function() {"use strict";',
          '    ',
          '    ',
          '    Bar.call(this,p1,',
          '          p2);',
          '  };',
          '',
          '  function ____Class0(p1,',
          '              p2) {"use strict";',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '    ____SuperProtoOfBar.blah.call(this,p1,',
          '               p2);',
          '  }',
          '',
          '  ____Class0.prototype.bar=function(){"use strict";};',
          '  ____Class0.baz=function() {"use strict";',
          '};',
          'return ____Class0;})()'
        ].join('\n');

        expect(transform(code)).toBe(expected);
      });

      it('preserves lines with inheritance from expression', function() {
        var code = [
          'var Foo = class extends mixin(Bar, Baz) {',
          '  foo() {',
          '    ',
          '    ',
          '  }',
          '',
          '  constructor(p1,',
          '              p2) {',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '',
          '  bar(){}',
          '  static baz() {',
          '}',
          '}'
        ].join('\n');

        var expected = [
          'var Foo = (function(){' +
          'var ____Class1=mixin(Bar, Baz);' +
          'for(var ____Class1____Key in ____Class1){' +
            'if(____Class1.hasOwnProperty(____Class1____Key)){' +
              '____Class0[____Class1____Key]=____Class1[____Class1____Key];' +
            '}' +
          '}' +
          'var ____SuperProtoOf____Class1=' +
            '____Class1===null' +
              '?null' +
              ':____Class1.prototype;' +
          '____Class0.prototype=Object.create(____SuperProtoOf____Class1);' +
          '____Class0.prototype.constructor=____Class0;' +
          '____Class0.__superConstructor__=____Class1;',

          '  ____Class0.prototype.foo=function() {"use strict";',
          '    ',
          '    ',
          '  };',
          '',
          '  function ____Class0(p1,',
          '              p2) {"use strict";',
          '',
          '    this.p1 = p1;',
          '    this.p2 = p2;',
          '  }',
          '',
          '  ____Class0.prototype.bar=function(){"use strict";};',
          '  ____Class0.baz=function() {"use strict";',
          '};',
          'return ____Class0;})()'
        ].join('\n');

        expect(transform(code)).toBe(expected);
      });
    });

    describe('functional tests', function() {
      it('scopes each anonymous class separately', function() {
        var code = transform([
          'var Foo = class {',
          '  constructor() {',
          '    this._name = "foo";',
          '    var properties = [];',
          '    for (var key in this) {',
          '      properties.push(key);',
          '    }',
          '    this.properties = properties',
          '  }',
          '};',

          'var Bar = class {',
          '  constructor() {',
          '    this._name = "bar";',
          '    var properties = [];',
          '    for (var key in this) {',
          '      properties.push(key);',
          '    }',
          '    this.properties = properties',
          '  }',
          '}'
        ].join('\n'));

        eval(code);

        var fooInst = new Foo();
        var barInst = new Bar();
        expect(fooInst.properties).not.toEqual(barInst.properties);
        expect(fooInst[fooInst.properties[0]]).toBe('foo');
        expect(barInst[barInst.properties[0]]).toBe('bar');
      });
    });
  });
});
