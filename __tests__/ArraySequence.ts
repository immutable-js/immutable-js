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
    var r = i.reduce<number>((r, x) => r + x, 0);
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

  it('slices through sparse arrays', () => {
    var a = [,,1,,2,,3,,4,,5,,,,]; // note: typescript and node eat the last two commas.
    var i = Immutable.Sequence(a);

    expect(i.slice(6).length).toBe(7);
    expect(i.slice(6).toArray().length).toBe(7);
    expect(i.slice(6).toArray()).toEqual([3,,4,,5,,,,]);

    expect(i.slice(6, null, /*maintainIndices*/true).toArray()).toEqual([,,,,,,3,,4,,5,,,,]);

    expect(i.slice(6, null, /*maintainIndices*/true).reverse().reverse().toArray()).toEqual([,,,,,,3,,4,,5,,,,]);

    expect(i.slice(6, null, /*maintainIndices*/true).reverse().reverse(true).entries().toArray()).toEqual(
      [[6,3], [4,4], [2,5]]
    );

    expect(i.slice(6, null, /*maintainIndices*/true).reverse(true).reverse().entries().toArray()).toEqual(
      [[6,3], [4,4], [2,5]]
    );

    expect(i.reverse(true).slice(6, null, /*maintainIndices*/true).reverse().entries().toArray()).toEqual(
      [[10,1], [8,2], [6,3]]
    );

    expect(i.reverse(true).slice(6, null, /*maintainIndices*/true).reverse(true).entries().toArray()).toEqual(
      [[2,1], [4,2], [6,3]]
    );

    var ii = i;
    ii = ii.reverse();
    expect(ii.toArray()).toEqual([,,5,,4,,3,,2,,1,,,,]);
    expect(ii.entries().toArray()).toEqual([[2,5],[4,4],[6,3],[8,2],[10,1]]);
    ii = ii.reverse(true);
    expect(ii.toArray()).toEqual([,,5,,4,,3,,2,,1,,,,]);
    expect(ii.entries().toArray()).toEqual([[10,1],[8,2],[6,3],[4,4],[2,5]]);
    ii = ii.slice(6, null, true);
    expect(ii.toArray()).toEqual([,,5,,4,,3,,,,,,,,]);
    expect(ii.entries().toArray()).toEqual([[6,3],[4,4],[2,5]]);
    ii = ii.reverse();
    expect(ii.toArray()).toEqual([,,,,,,3,,4,,5,,,,]);
    expect(ii.entries().toArray()).toEqual([[10,5],[8,4],[6,3]]);
    ii = ii.reverse(true);
    expect(ii.toArray()).toEqual([,,,,,,3,,4,,5,,,,]);
    expect(ii.entries().toArray()).toEqual([[6,3],[8,4],[10,5]]);


    expect(i.reverse().reverse(true).slice(6, null, /*maintainIndices*/true).reverse().reverse(true).entries().toArray()).toEqual(
      [[6,3],[8,4],[10,5]]
    );

    expect(i.reverse(true).reverse().reverse(true).reverse().toArray()).toEqual(a);

    expect(i.slice(6, null, /*maintainIndices*/true).reverse().reverse(true).toArray()).toEqual([,,5,,4,,3,,,,,,,,]);

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
    expect(seq.take(3).toArray().length).toBe(10);
    expect(seq.filter(x => x%2==1).toArray().length).toBe(2);
    expect(seq.filter(x => x%2==1, null, true).toArray().length).toBe(10);
    expect(seq.flip().length).toBe(10);
    expect(seq.flip().flip().length).toBe(10);
    expect(seq.flip().flip().toArray().length).toBe(10);
  });

});
