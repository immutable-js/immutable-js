///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/Immutable.d.ts'/>

jest.autoMockOff();

import Immutable = require('immutable');

describe('ObjectSequence', () => {

  it('maps', () => {
    var i = Immutable.Sequence({'a': 'A', 'b': 'B', 'c': 'C'});
    var m = i.map(x => x + x).toObject();
    expect(m).toEqual({'a': 'AA', 'b': 'BB', 'c': 'CC'});
  });

  it('reduces', () => {
    var i = Immutable.Sequence({'a': 'A', 'b': 'B', 'c': 'C'});
    var r = i.reduce<string>((r, x) => r + x, '');
    expect(r).toEqual('ABC');
  });

  it('extracts keys', () => {
    var i = Immutable.Sequence({'a': 'A', 'b': 'B', 'c': 'C'});
    var k = i.keySeq().toArray();
    expect(k).toEqual(['a', 'b', 'c']);
  });

  it('is reversable', () => {
    var i = Immutable.Sequence({'a': 'A', 'b': 'B', 'c': 'C'});
    var k = i.reverse().toArray();
    expect(k).toEqual(['C', 'B', 'A']);
  });

  it('can double reversable', () => {
    var i = Immutable.Sequence({'a': 'A', 'b': 'B', 'c': 'C'});
    var k = i.reverse().reverse().toArray();
    expect(k).toEqual(['A', 'B', 'C']);
  });

  it('can be iterated', () => {
    var obj = { a: 1, b: 2, c: 3 };
    var seq = Immutable.Sequence(obj);
    var entries = seq.entries();
    expect(entries.next()).toEqual({ value: ['a', 1], done: false });
    expect(entries.next()).toEqual({ value: ['b', 2], done: false });
    expect(entries.next()).toEqual({ value: ['c', 3], done: false });
    expect(entries.next()).toEqual({ value: undefined, done: true });
  });

});
