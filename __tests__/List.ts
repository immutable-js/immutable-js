///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import jasmineCheck = require('jasmine-check');
jasmineCheck.install();

import Immutable = require('immutable');
import List = Immutable.List;

function arrayOfSize(s) {
  var a = new Array(s);
  for (var ii = 0; ii < s; ii++) {
    a[ii] = ii;
  }
  return a;
}

describe('List', () => {

  it('of provides initial values', () => {
    var v = List.of('a', 'b', 'c');
    expect(v.get(0)).toBe('a');
    expect(v.get(1)).toBe('b');
    expect(v.get(2)).toBe('c');
  });

  it('toArray provides a JS array', () => {
    var v = List.of('a', 'b', 'c');
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('does not accept a scalar', () => {
    expect(() => {
      Immutable.List(3);
    }).toThrow('Expected Array or iterable object of values: 3');
  });

  it('accepts an array', () => {
    var v = List(['a', 'b', 'c']);
    expect(v.get(1)).toBe('b');
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts an array-like', () => {
    var v = List({ 'length': 3, '1': 'b' });
    expect(v.get(1)).toBe('b');
    expect(v.toArray()).toEqual([undefined, 'b', undefined]);
  });

  it('accepts any array-like iterable, including strings', () => {
    var v = List('abc');
    expect(v.get(1)).toBe('b');
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts an indexed Seq', () => {
    var seq = Immutable.Seq(['a', 'b', 'c']);
    var v = List(seq);
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts a keyed Seq as a list of entries', () => {
    var seq = Immutable.Seq({a:null, b:null, c:null}).flip();
    var v = List(seq);
    expect(v.toArray()).toEqual([[null,'a'], [null,'b'], [null,'c']]);
    // Explicitly getting the values sequence
    var v2 = List(seq.valueSeq());
    expect(v2.toArray()).toEqual(['a','b','c']);
    // toList() does this for you.
    var v3 = seq.toList();
    expect(v3.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('can set and get a value', () => {
    var v = List();
    expect(v.get(0)).toBe(undefined);
    v = v.set(0, 'value');
    expect(v.get(0)).toBe('value');
  });

  it('counts from the end of the list on negative index', () => {
    var i = Immutable.List.of(1, 2, 3, 4, 5, 6, 7);
    expect(i.get(-1)).toBe(7);
    expect(i.get(-5)).toBe(3);
    expect(i.get(-9)).toBe(undefined);
    expect(i.get(-999, 1000)).toBe(1000);
  });

  it('coerces numeric-string keys', () => {
    // Of course, TypeScript protects us from this, so cast to "any" to test.
    var i: any = Immutable.List.of(1, 2, 3, 4, 5, 6);
    expect(i.get('1')).toBe(2);
    expect(i.get('-1')).toBe(6);
    expect(i.set('3', 10).get('-3')).toBe(10);
  });

  it('setting creates a new instance', () => {
    var v0 = List.of('a');
    var v1 = v0.set(0, 'A');
    expect(v0.get(0)).toBe('a');
    expect(v1.get(0)).toBe('A');
  });

  it('size includes the highest index', () => {
    var v0 = List();
    var v1 = v0.set(0, 'a');
    var v2 = v1.set(1, 'b');
    var v3 = v2.set(2, 'c');
    expect(v0.size).toBe(0);
    expect(v1.size).toBe(1);
    expect(v2.size).toBe(2);
    expect(v3.size).toBe(3);
  });

  it('get helpers make for easier to read code', () => {
    var v = List.of('a', 'b', 'c');
    expect(v.first()).toBe('a');
    expect(v.get(1)).toBe('b');
    expect(v.last()).toBe('c');
  });

  it('slice helpers make for easier to read code', () => {
    var v0 = List.of('a', 'b', 'c');
    var v1 = List.of('a', 'b');
    var v2 = List.of('a');
    var v3 = List();

    expect(v0.rest().toArray()).toEqual(['b', 'c']);
    expect(v0.butLast().toArray()).toEqual(['a', 'b']);

    expect(v1.rest().toArray()).toEqual(['b']);
    expect(v1.butLast().toArray()).toEqual(['a']);

    expect(v2.rest().toArray()).toEqual([]);
    expect(v2.butLast().toArray()).toEqual([]);

    expect(v3.rest().toArray()).toEqual([]);
    expect(v3.butLast().toArray()).toEqual([]);
  });

  it('can set at arbitrary indices', () => {
    var v0 = List.of('a', 'b', 'c');
    var v1 = v0.set(1, 'B'); // within existing tail
    var v2 = v1.set(3, 'd'); // at last position
    var v3 = v2.set(31, 'e'); // (testing internal guts)
    var v4 = v3.set(32, 'f'); // (testing internal guts)
    var v5 = v4.set(1023, 'g'); // (testing internal guts)
    var v6 = v5.set(1024, 'h'); // (testing internal guts)
    var v7 = v6.set(32, 'F'); // set within existing tree
    expect(v7.size).toBe(1025);
    var expectedArray = ['a', 'B', 'c', 'd'];
    expectedArray[31] = 'e';
    expectedArray[32] = 'F';
    expectedArray[1023] = 'g';
    expectedArray[1024] = 'h';
    expect(v7.toArray()).toEqual(expectedArray);
  });

  it('can contain a large number of indices', () => {
    var v = Immutable.Range(0,20000).toList();
    var iterations = 0;
    v.forEach(v => {
      expect(v).toBe(iterations);
      iterations++;
    });
  })

  it('describes a dense list', () => {
    var v = List.of('a', 'b', 'c').push('d').set(14, 'o').set(6, undefined).remove(1);
    expect(v.size).toBe(14);
    expect(v.toJS()).toEqual(
      ['a','c','d',,,,,,,,,,,'o']
    );
  });

  it('iterates a dense list', () => {
    var v = List().setSize(11).set(1,1).set(3,3).set(5,5).set(7,7).set(9,9);
    expect(v.size).toBe(11);

    var forEachResults = [];
    v.forEach((val, i) => forEachResults.push([i, val]));
    expect(forEachResults).toEqual([
      [0,undefined],
      [1,1],
      [2,undefined],
      [3,3],
      [4,undefined],
      [5,5],
      [6,undefined],
      [7,7],
      [8,undefined],
      [9,9],
      [10,undefined],
    ]);

    var arrayResults = v.toArray();
    expect(arrayResults).toEqual([
      undefined,
      1,
      undefined,
      3,
      undefined,
      5,
      undefined,
      7,
      undefined,
      9,
      undefined,
    ]);

    var iteratorResults = [];
    var iterator = v.entries();
    var step;
    while (!(step = iterator.next()).done) {
      iteratorResults.push(step.value);
    }
    expect(iteratorResults).toEqual([
      [0,undefined],
      [1,1],
      [2,undefined],
      [3,3],
      [4,undefined],
      [5,5],
      [6,undefined],
      [7,7],
      [8,undefined],
      [9,9],
      [10,undefined],
    ]);
  });

  it('push inserts at highest index', () => {
    var v0 = List.of('a', 'b', 'c');
    var v1 = v0.push('d', 'e', 'f');
    expect(v0.size).toBe(3);
    expect(v1.size).toBe(6);
    expect(v1.toArray()).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  check.it('pushes multiple values to the end', {maxSize: 2000},
    [gen.posInt, gen.posInt], (s1, s2) => {
      var a1 = arrayOfSize(s1);
      var a2 = arrayOfSize(s2);

      var v1 = List(a1);
      var v3 = v1.push.apply(v1, a2);

      var a3 = a1.slice();
      a3.push.apply(a3, a2);

      expect(v3.size).toEqual(a3.length);
      expect(v3.toArray()).toEqual(a3);
    }
  );

  it('pop removes the highest index, decrementing size', () => {
    var v = List.of('a', 'b', 'c').pop();
    expect(v.last()).toBe('b');
    expect(v.toArray()).toEqual(['a','b']);
    v = v.set(1230, 'x');
    expect(v.size).toBe(1231);
    expect(v.last()).toBe('x');
    v = v.pop();
    expect(v.size).toBe(1230);
    expect(v.last()).toBe(undefined);
    v = v.push('X');
    expect(v.size).toBe(1231);
    expect(v.last()).toBe('X');
  });

  check.it('pop removes the highest index, just like array', {maxSize: 2000},
    [gen.posInt], len => {
      var a = arrayOfSize(len);
      var v = List(a);

      while (a.length) {
        expect(v.size).toBe(a.length);
        expect(v.toArray()).toEqual(a);
        v = v.pop();
        a.pop();
      }
      expect(v.size).toBe(a.length);
      expect(v.toArray()).toEqual(a);
    }
  );

  check.it('push adds the next highest index, just like array', {maxSize: 2000},
    [gen.posInt], len => {
      var a = [];
      var v = List();

      for (var ii = 0; ii < len; ii++) {
        expect(v.size).toBe(a.length);
        expect(v.toArray()).toEqual(a);
        v = v.push(ii);
        a.push(ii);
      }
      expect(v.size).toBe(a.length);
      expect(v.toArray()).toEqual(a);
    }
  );

  it('allows popping an empty list', () => {
    var v = List.of('a').pop();
    expect(v.size).toBe(0);
    expect(v.toArray()).toEqual([]);
    v = v.pop().pop().pop().pop().pop();
    expect(v.size).toBe(0);
    expect(v.toArray()).toEqual([]);
  });

  it('remove removes any index', () => {
    var v = List.of('a', 'b', 'c').remove(2).remove(0);
    expect(v.size).toBe(1);
    expect(v.get(0)).toBe('b');
    expect(v.get(1)).toBe(undefined);
    expect(v.get(2)).toBe(undefined);
    expect(v.toArray()).toEqual(['b']);
    v = v.push('d');
    expect(v.size).toBe(2);
    expect(v.get(1)).toBe('d');
    expect(v.toArray()).toEqual(['b','d']);
  });

  it('shifts values from the front', () => {
    var v = List.of('a', 'b', 'c').shift();
    expect(v.first()).toBe('b');
    expect(v.size).toBe(2);
  });

  it('unshifts values to the front', () => {
    var v = List.of('a', 'b', 'c').unshift('x', 'y', 'z');
    expect(v.first()).toBe('x');
    expect(v.size).toBe(6);
    expect(v.toArray()).toEqual(['x', 'y', 'z', 'a', 'b', 'c']);
  });

  check.it('unshifts multiple values to the front', {maxSize: 2000},
    [gen.posInt, gen.posInt], (s1, s2) => {
      var a1 = arrayOfSize(s1);
      var a2 = arrayOfSize(s2);

      var v1 = List(a1);
      var v3 = v1.unshift.apply(v1, a2);

      var a3 = a1.slice();
      a3.unshift.apply(a3, a2);

      expect(v3.size).toEqual(a3.length);
      expect(v3.toArray()).toEqual(a3);
    }
  );

  it('finds values using indexOf', () => {
    var v = List.of('a', 'b', 'c', 'b', 'a');
    expect(v.indexOf('b')).toBe(1);
    expect(v.indexOf('c')).toBe(2);
    expect(v.indexOf('d')).toBe(-1);
  });

  it('finds values using findIndex', () => {
    var v = List.of('a', 'b', 'c', 'B', 'a');
    expect(v.findIndex(value => value.toUpperCase() === value)).toBe(3);
    expect(v.findIndex(value => value.length > 1)).toBe(-1);
  });

  it('finds values using findEntry', () => {
    var v = List.of('a', 'b', 'c', 'B', 'a');
    expect(v.findEntry(value => value.toUpperCase() === value)).toEqual([3, 'B']);
    expect(v.findEntry(value => value.length > 1)).toBe(undefined);
  });

  it('maps values', () => {
    var v = List.of('a', 'b', 'c');
    var r = v.map(value => value.toUpperCase());
    expect(r.toArray()).toEqual(['A', 'B', 'C']);
  });

  it('filters values', () => {
    var v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    var r = v.filter((value, index) => index % 2 === 1);
    expect(r.toArray()).toEqual(['b', 'd', 'f']);
  });

  it('reduces values', () => {
    var v = List.of(1,10,100);
    var r = v.reduce<number>((reduction, value) => reduction + value);
    expect(r).toEqual(111);
  });

  it('reduces from the right', () => {
    var v = List.of('a','b','c');
    var r = v.reduceRight((reduction, value) => reduction + value);
    expect(r).toEqual('cba');
  });

  it('takes and skips values', () => {
    var v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    var r = v.skip(2).take(2);
    expect(r.toArray()).toEqual(['c', 'd']);
  });

  it('efficiently chains array methods', () => {
    var v = List.of(1,2,3,4,5,6,7,8,9,10,11,12,13,14);

    var r = v
      .filter(x => x % 2 == 0)
      .skip(2)
      .map(x => x * x)
      .take(3)
      .reduce((a: number, b: number) => a + b, 0);

    expect(r).toEqual(200);
  });

  it('can convert to a map', () => {
    var v = List.of('a', 'b', 'c');
    var m = v.toMap();
    expect(m.size).toBe(3);
    expect(m.get(1)).toBe('b');
  });

  it('reverses', () => {
    var v = List.of('a', 'b', 'c');
    expect(v.reverse().toArray()).toEqual(['c', 'b', 'a']);
  });

  it('ensures equality', () => {
    // Make a sufficiently long list.
    var a = Array(100).join('abcdefghijklmnopqrstuvwxyz').split('');
    var v1 = List(a);
    var v2 = List(a);
    expect(v1 == v2).not.toBe(true);
    expect(v1 === v2).not.toBe(true);
    expect(v1.equals(v2)).toBe(true);
  });

  // TODO: assert that findIndex only calls the function as much as it needs to.

  // TODO: assert that forEach iterates in the correct order and is only called as much as it needs to be.

  it('concat works like Array.prototype.concat', () => {
    var v1 = List.of(1, 2, 3);
    var v2 = v1.concat(4, List.of(5, 6), [7, 8], Immutable.Seq({a:9,b:10}), Immutable.Set.of(11,12), null);
    expect(v1.toArray()).toEqual([1, 2, 3]);
    expect(v2.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, null]);
  });

  it('allows chained mutations', () => {
    var v1 = List();
    var v2 = v1.push(1);
    var v3 = v2.withMutations(v => v.push(2).push(3).push(4));
    var v4 = v3.push(5);

    expect(v1.toArray()).toEqual([]);
    expect(v2.toArray()).toEqual([1]);
    expect(v3.toArray()).toEqual([1,2,3,4]);
    expect(v4.toArray()).toEqual([1,2,3,4,5]);
  });

  it('allows chained mutations using alternative API', () => {
    var v1 = List();
    var v2 = v1.push(1);
    var v3 = v2.asMutable().push(2).push(3).push(4).asImmutable();
    var v4 = v3.push(5);

    expect(v1.toArray()).toEqual([]);
    expect(v2.toArray()).toEqual([1]);
    expect(v3.toArray()).toEqual([1,2,3,4]);
    expect(v4.toArray()).toEqual([1,2,3,4,5]);
  });

  it('allows size to be set', () => {
    var v1 = Immutable.Range(0,2000).toList();
    var v2 = v1.setSize(1000);
    var v3 = v2.setSize(1500);
    expect(v1.size).toBe(2000);
    expect(v2.size).toBe(1000);
    expect(v3.size).toBe(1500);
    expect(v1.get(900)).toBe(900);
    expect(v1.get(1300)).toBe(1300);
    expect(v1.get(1800)).toBe(1800);
    expect(v2.get(900)).toBe(900);
    expect(v2.get(1300)).toBe(undefined);
    expect(v2.get(1800)).toBe(undefined);
    expect(v3.get(900)).toBe(900);
    expect(v3.get(1300)).toBe(undefined);
    expect(v3.get(1800)).toBe(undefined);
  });

  it('can be efficiently sliced', () => {
    var v1 = Immutable.Range(0,2000).toList();
    var v2 = v1.slice(100,-100).toList();
    expect(v1.size).toBe(2000)
    expect(v2.size).toBe(1800);
    expect(v2.first()).toBe(100);
    expect(v2.rest().size).toBe(1799);
    expect(v2.last()).toBe(1899);
    expect(v2.butLast().size).toBe(1799);
  });

  describe('Iterator', () => {

    var pInt = gen.posInt;

    check.it('iterates through List', [pInt, pInt], (start, len) => {
      var l = Immutable.Range(0, start + len).toList();
      l = <List<number>> l.slice(start, start + len);
      expect(l.size).toBe(len);
      var valueIter = l.values();
      var keyIter = l.keys();
      var entryIter = l.entries();
      for (var ii = 0; ii < len; ii++) {
        expect(valueIter.next().value).toBe(start + ii);
        expect(keyIter.next().value).toBe(ii);
        expect(entryIter.next().value).toEqual([ii, start + ii]);
      }
    });

    check.it('iterates through List in reverse', [pInt, pInt], (start, len) => {
      var l = Immutable.Range(0, start + len).toList();
      l = <List<number>> l.slice(start, start + len);
      var s = l.toSeq().reverse(); // impl calls List.__iterator(REVERSE)
      expect(s.size).toBe(len);
      var valueIter = s.values();
      var keyIter = s.keys();
      var entryIter = s.entries();
      for (var ii = 0; ii < len; ii++) {
        expect(valueIter.next().value).toBe(start + len - 1 - ii);
        expect(keyIter.next().value).toBe(ii);
        expect(entryIter.next().value).toEqual([ii, start + len - 1 - ii]);
      }
    });

  });

});
