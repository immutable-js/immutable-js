///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

import { Iterable, Seq } from 'immutable';

describe('Seq', () => {

  it('can be empty', () => {
    expect(Seq().size).toBe(0);
  });

  it('accepts an array', () => {
    expect(Seq([1,2,3]).size).toBe(3);
  });

  it('accepts an object', () => {
    expect(Seq({a:1,b:2,c:3}).size).toBe(3);
  });

  it('accepts an iterable string', () => {
    expect(Seq('foo').size).toBe(3);
  });

  it('accepts arbitrary objects', () => {
    function Foo() {
      this.bar = 'bar';
      this.baz = 'baz';
    }
    expect(Seq(new Foo()).size).toBe(2);
  });

  it('of accepts varargs', () => {
    expect(Seq.of(1,2,3).size).toBe(3);
  });

  it('accepts another sequence', () => {
    var seq = Seq.of(1,2,3);
    expect(Seq(seq).size).toBe(3);
  });

  it('accepts a string', () => {
    var seq = Seq('abc');
    expect(seq.size).toBe(3);
    expect(seq.get(1)).toBe('b');
    expect(seq.join('')).toBe('abc');
  });

  it('accepts an array-like', () => {
    var alike = { length: 2, 0: 'a', 1: 'b' };
    var seq = Seq(alike);
    expect(Iterable.isIndexed(seq)).toBe(true);
    expect(seq.size).toBe(2);
    expect(seq.get(1)).toBe('b');
  });

  it('does not accept a scalar', () => {
    expect(() => {
      Seq(3);
    }).toThrow('Expected Array or iterable object of values, or keyed object: 3');
  });

  it('detects sequences', () => {
    var seq = Seq.of(1,2,3);
    expect(Seq.isSeq(seq)).toBe(true);
    expect(Iterable.isIterable(seq)).toBe(true);
  });

  it('Does not infinite loop when sliced with NaN', () => {
    var list = Seq([1, 2, 3, 4, 5]);
    expect(list.slice(0, NaN).toJS()).toEqual([]);
    expect(list.slice(NaN).toJS()).toEqual([1, 2, 3, 4, 5]);
  });

  it('Does not infinite loop when spliced with negative number #559', () => {
    var dog = Seq(['d', 'o', 'g']);
    var dg = dog.filter(c => c !== 'o');
    var dig = (<any>dg).splice(-1, 0, 'i');
    expect(dig.toJS()).toEqual(['d', 'i', 'g']);
  });

  it('Does not infinite loop when an undefined number is passed to take', () => {
    var list = Seq([1, 2, 3, 4, 5]);
    expect(list.take(NaN).toJS()).toEqual([]);
  });

});
