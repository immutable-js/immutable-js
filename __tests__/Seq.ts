///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');

describe('Seq', () => {

  it('can be empty', () => {
    expect(Immutable.Seq().size).toBe(0);
  });

  it('accepts an array', () => {
    expect(Immutable.Seq([1,2,3]).size).toBe(3);
  });

  it('accepts an object', () => {
    expect(Immutable.Seq({a:1,b:2,c:3}).size).toBe(3);
  });

  it('accepts an iterable string', () => {
    expect(Immutable.Seq('foo').size).toBe(3);
  });

  it('accepts arbitrary objects', () => {
    function Foo() {
      this.bar = 'bar';
      this.baz = 'baz';
    }
    expect(Immutable.Seq(new Foo()).size).toBe(2);
  });

  it('of accepts varargs', () => {
    expect(Immutable.Seq.of(1,2,3).size).toBe(3);
  });

  it('accepts another sequence', () => {
    var seq = Immutable.Seq.of(1,2,3);
    expect(Immutable.Seq(seq).size).toBe(3);
  });

  it('accepts a string', () => {
    var seq = Immutable.Seq('abc');
    expect(seq.size).toBe(3);
    expect(seq.get(1)).toBe('b');
    expect(seq.join('')).toBe('abc');
  });

  it('accepts an array-like', () => {
    var alike = { length: 2, 0: 'a', 1: 'b' };
    var seq = Immutable.Seq(alike);
    expect(Immutable.Iterable.isIndexed(seq)).toBe(true);
    expect(seq.size).toBe(2);
    expect(seq.get(1)).toBe('b');
  });

  it('does not accept a scalar', () => {
    expect(() => {
      Immutable.Seq(3);
    }).toThrow('Expected Array or iterable object of values, or keyed object: 3');
  });

  it('temporarily warns about iterable length', function () {
    this.spyOn(console, 'warn');

    var seq = Immutable.Seq.of(1,2,3);

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
    var seq = Immutable.Seq.of(1,2,3);
    expect(Immutable.Seq.isSeq(seq)).toBe(true);
    expect(Immutable.Iterable.isIterable(seq)).toBe(true);
  });

});
