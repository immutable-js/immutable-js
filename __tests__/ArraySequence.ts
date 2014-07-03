///<reference path='../resources/jest.d.ts'/>
jest.autoMockOff();
import Persistent = require('../build/Persistent');

describe('ArraySequence', function() {

  it('every is true when predicate is true for all entries', function() {
    expect(Persistent.Sequence([]).every(() => false)).toBe(true);
    expect(Persistent.Sequence([1,2,3]).every(v => v > 0)).toBe(true);
    expect(Persistent.Sequence([1,2,3]).every(v => v < 3)).toBe(false);
  });

  it('some is true when predicate is true for any entry', function() {
    expect(Persistent.Sequence([]).some(() => true)).toBe(false);
    expect(Persistent.Sequence([1,2,3]).some(v => v > 0)).toBe(true);
    expect(Persistent.Sequence([1,2,3]).some(v => v < 3)).toBe(true);
    expect(Persistent.Sequence([1,2,3]).some(v => v > 1)).toBe(true);
    expect(Persistent.Sequence([1,2,3]).some(v => v < 0)).toBe(false);
  });

  it('maps', function() {
    var i = Persistent.Sequence([1,2,3]);
    var m = i.map(x => x + x).toObject();
    expect(m).toEqual([2,4,6]);
  });

  it('reduces', function() {
    var i = Persistent.Sequence([1,2,3]);
    var r = i.reduce<number>((r, x) => r + x, 0);
    expect(r).toEqual(6);
  });

  it('efficiently chains iteration methods', function() {
    var i = Persistent.Sequence('abcdefghijklmnopqrstuvwxyz'.split(''));
    function studly(letter, index) {
      return index % 2 === 0 ? letter : letter.toUpperCase();
    }
    var result = i.reverse().take(10).reverse().take(5).map(studly).toArray().join('');
    expect(result).toBe('qRsTu');
  });

  it('skips through sparse arrays', function() {
    var i = Persistent.Sequence([,,1,,2,,3,,4,,5]);
    expect(i.skip(2).toArray()).toEqual([3,,4,,5]);
    expect(i.skip(2, /*maintainIndices*/true).toArray()).toEqual([,,,,,,3,,4,,5]);
  });

});
