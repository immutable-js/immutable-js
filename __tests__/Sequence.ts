///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');

describe('LazySequence', () => {

  it('can be empty', () => {
    expect(Immutable.LazySequence().size).toBe(0);
  });

  it('accepts an array', () => {
    expect(Immutable.LazySequence([1,2,3]).size).toBe(3);
  });

  it('accepts an object', () => {
    expect(Immutable.LazySequence({a:1,b:2,c:3}).size).toBe(3);
  });

  it('accepts a scalar', () => {
    expect(Immutable.LazySequence('foo').size).toBe(1);
  });

  it('accepts a class', () => {
    function Foo() {
      this.bar = 'bar';
      this.baz = 'baz';
    }
    expect(Immutable.LazySequence(new Foo()).size).toBe(1);
  });

  it('empty returns an empty LazySequence.', () => {
    var e1 = Immutable.LazySequence.empty();
    var e2 = Immutable.LazySequence.empty();
    expect(e1.size).toBe(0);
    expect(e1).toBe(e2);
  });

  it('of accepts varargs', () => {
    expect(Immutable.LazySequence.of(1,2,3).size).toBe(3);
  });

  it('from accepts another sequence', () => {
    var seq = Immutable.LazySequence.of(1,2,3);
    expect(Immutable.LazySequence.from(seq).size).toBe(3);
  });

  it('from accepts a string', () => {
    var seq = Immutable.LazySequence.from('abc');
    expect(seq.size).toBe(3);
    expect(seq.get(1)).toBe('b');
    expect(seq.join('')).toBe('abc');
  });

  it('from accepts an array-like', () => {
    var alike = { length: 2, 0: 'a', 1: 'b' };
    var seq = Immutable.LazySequence.from(alike);
    expect(Immutable.Iterable.isIndexed(seq)).toBe(true);
    expect(seq.size).toBe(2);
    expect(seq.get(1)).toBe('b');
  });

  it('from does not accept a scalar', () => {
    expect(() => {
      Immutable.LazySequence.from(3);
    }).toThrow('Expected iterable: 3');
  });

  it('temporarily warns about iterable length', function () {
    this.spyOn(console, 'warn');

    var seq = Immutable.LazySequence.of(1,2,3);

    // Note: `length` has been removed from the type definitions.
    var length = (<any>seq).length;

    expect((<any>console).warn.mostRecentCall.args[0]).toContain(
      'iterable.length has been deprecated, '+
      'use iterable.size or iterable.count(). '+
      'This warning will become a silent error in a future version.'
    );

    expect(length).toBe(3);
  });

  it('detects sequences', () => {
    var seq = Immutable.LazySequence.of(1,2,3);
    expect(Immutable.LazySequence.isLazy(seq)).toBe(true);
    expect(Immutable.Iterable.isIterable(seq)).toBe(true);
  });

});
