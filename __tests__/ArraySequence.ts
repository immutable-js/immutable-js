///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/Immutable.d.ts'/>
jest.autoMockOff();

import Immutable = require('immutable');

describe('ArraySequence', () => {

  it('every is true when predicate is true for all entries', () => {
    expect(Immutable.Sequence([]).every(() => false)).toBe(true);
    expect(Immutable.Sequence([1,2,3]).every(v => v > 0)).toBe(true);
    expect(Immutable.Sequence([1,2,3]).every(v => v < 3)).toBe(false);
  });

  it('some is true when predicate is true for any entry', () => {
    expect(Immutable.Sequence([]).some(() => true)).toBe(false);
    expect(Immutable.Sequence([1,2,3]).some(v => v > 0)).toBe(true);
    expect(Immutable.Sequence([1,2,3]).some(v => v < 3)).toBe(true);
    expect(Immutable.Sequence([1,2,3]).some(v => v > 1)).toBe(true);
    expect(Immutable.Sequence([1,2,3]).some(v => v < 0)).toBe(false);
  });

  it('maps', () => {
    var i = Immutable.Sequence([1,2,3]);
    var m = i.map(x => x + x).toObject();
    expect(m).toEqual([2,4,6]);
  });

  it('reduces', () => {
    var i = Immutable.Sequence([1,2,3]);
    var r = i.reduce<number>((r, x) => r + x);
    expect(r).toEqual(6);
  });

  it('efficiently chains iteration methods', () => {
    var i = Immutable.Sequence('abcdefghijklmnopqrstuvwxyz'.split(''));
    function studly(letter, index) {
      return index % 2 === 0 ? letter : letter.toUpperCase();
    }
    var result = i.reverse().take(10).reverse().take(5).map(studly).toArray().join('');
    expect(result).toBe('qRsTu');
  });

  it('counts from the end of the sequence on negative index', () => {
    var i = Immutable.Sequence(1, 2, 3, 4, 5, 6, 7);
    expect(i.get(-1)).toBe(7);
    expect(i.get(-5)).toBe(3);
    expect(i.get(-9)).toBe(undefined);
    expect(i.get(-999, 1000)).toBe(1000);
  });

  it('slices through sparse arrays', () => {
    var a = [,,1,,2,,3,,4,,5,,,,]; // note: typescript and node eat the last two commas.
    var i = Immutable.Sequence(a);

    expect(i.slice(6).length).toBe(7);
    expect(i.slice(6).toArray().length).toBe(7);
    expect(i.slice(6).toArray()).toEqual([3,,4,,5,,,,]);

    expect(i.slice(6, null, /*maintainIndices*/true).toArray()).toEqual([,,,,,,3,,4,,5,,,,]);

    expect(i.slice(6, null, /*maintainIndices*/true).reverse().reverse().toArray()).toEqual([,,,,,,3,,4,,5,,,,]);

    expect(i.slice(6, null, /*maintainIndices*/true).reverse().reverse(true).entrySeq().toArray()).toEqual([
      [6, 3],
      [5, undefined],
      [4, 4],
      [3, undefined],
      [2, 5],
      [1, undefined],
      [0, undefined]
    ]);

    expect(i.slice(6, null, /*maintainIndices*/true).reverse(true).reverse().entrySeq().toArray()).toEqual([
      [6, 3],
      [5, undefined],
      [4, 4],
      [3, undefined],
      [2, 5],
      [1, undefined],
      [0, undefined]
    ]);

    expect(i.reverse(true).slice(6, null, /*maintainIndices*/true).reverse().entrySeq().toArray()).toEqual([
      [12, undefined],
      [11, undefined],
      [10, 1],
      [9, undefined],
      [8, 2],
      [7, undefined],
      [6, 3]
    ]);

    expect(i.reverse(true).slice(6, null, /*maintainIndices*/true).reverse(true).entrySeq().toArray()).toEqual([
      [0, undefined],
      [1, undefined],
      [2, 1],
      [3, undefined],
      [4, 2],
      [5, undefined],
      [6, 3]
    ]);

    var ii = i;
    ii = ii.reverse();
    expect(ii.toArray()).toEqual([,,5,,4,,3,,2,,1,,,,]);
    expect(ii.entrySeq().toArray()).toEqual([
      [0, undefined],
      [1, undefined],
      [2, 5],
      [3, undefined],
      [4, 4],
      [5, undefined],
      [6, 3],
      [7, undefined],
      [8, 2],
      [9, undefined],
      [10, 1],
      [11, undefined],
      [12, undefined]
    ]);

    ii = ii.reverse(true);
    expect(ii.toArray()).toEqual([,,5,,4,,3,,2,,1,,,,]);
    expect(ii.entrySeq().toArray()).toEqual([
      [12, undefined],
      [11, undefined],
      [10, 1],
      [9, undefined],
      [8, 2],
      [7, undefined],
      [6, 3],
      [5, undefined],
      [4, 4],
      [3, undefined],
      [2, 5],
      [1, undefined],
      [0, undefined]
    ]);

    ii = ii.slice(6, null, true);
    expect(ii.toArray()).toEqual([,,5,,4,,3,,,,,,,,]);
    expect(ii.entrySeq().toArray()).toEqual([
      [6, 3],
      [5, undefined],
      [4, 4],
      [3, undefined],
      [2, 5],
      [1, undefined],
      [0, undefined],
    ]);

    ii = ii.reverse();
    expect(ii.toArray()).toEqual([,,,,,,3,,4,,5,,,,]);
    expect(ii.entrySeq().toArray()).toEqual([
      [12, undefined],
      [11, undefined],
      [10, 5],
      [9, undefined],
      [8, 4],
      [7, undefined],
      [6, 3],
    ]);

    ii = ii.reverse(true);
    expect(ii.toArray()).toEqual([,,,,,,3,,4,,5,,,,]);
    expect(ii.entrySeq().toArray()).toEqual([
      [6, 3],
      [7, undefined],
      [8, 4],
      [9, undefined],
      [10, 5],
      [11, undefined],
      [12, undefined],
    ]);

    expect(i.reverse().reverse(true).slice(6, null, /*maintainIndices*/true).reverse().reverse(true).entrySeq().toArray()).toEqual([
      [6, 3],
      [7, undefined],
      [8, 4],
      [9, undefined],
      [10, 5],
      [11, undefined],
      [12, undefined],
    ]);

    expect(i.reverse(true).reverse().reverse(true).reverse().toArray()).toEqual(a);

    expect(i.slice(6, null, /*maintainIndices*/true).reverse().reverse(true).toArray()).toEqual(
      [,,5,,4,,3,,,,,,,,]
    );
  });

  it('handles trailing holes', () => {
    var a = [1,2,3];
    a.length = 10;
    var seq = Immutable.Sequence(a);
    expect(seq.length).toBe(10);
    expect(seq.toArray().length).toBe(10);
    expect(seq.map(x => x*x).length).toBe(10);
    expect(seq.map(x => x*x).toArray().length).toBe(10);
    expect(seq.skip(2).toArray().length).toBe(8);
    expect(seq.take(2).toArray().length).toBe(2);
    expect(seq.take(5).toArray().length).toBe(5);
    expect(seq.filter(x => x%2==1).toArray().length).toBe(2);
    expect(seq.filter(x => x%2==1, null, true).toArray().length).toBe(10);
    expect(seq.flip().length).toBe(10);
    expect(seq.flip().flip().length).toBe(10);
    expect(seq.flip().flip().toArray().length).toBe(10);
  });

});
