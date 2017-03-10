///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { fromJS, List, Map, Range, Seq, Set } from '../';

function arrayOfSize(s) {
  let a = new Array(s);
  for (let ii = 0; ii < s; ii++) {
    a[ii] = ii;
  }
  return a;
}

describe('List', () => {

  it('determines assignment of unspecified value types', () => {
    interface Test {
      list: List<string>;
    }

    let t: Test = {
      list: List(),
    };

    expect(t.list.size).toBe(0);
  });

  it('of provides initial values', () => {
    let v = List.of('a', 'b', 'c');
    expect(v.get(0)).toBe('a');
    expect(v.get(1)).toBe('b');
    expect(v.get(2)).toBe('c');
  });

  it('toArray provides a JS array', () => {
    let v = List.of('a', 'b', 'c');
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('does not accept a scalar', () => {
    expect(() => {
      List(3 as any);
    }).toThrow('Expected Array or iterable object of values: 3');
  });

  it('accepts an array', () => {
    let v = List(['a', 'b', 'c']);
    expect(v.get(1)).toBe('b');
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts an array-like', () => {
    let v = List({ length: 3, 1: 'b' } as any);
    expect(v.get(1)).toBe('b');
    expect(v.toArray()).toEqual([undefined, 'b', undefined]);
  });

  it('accepts any array-like iterable, including strings', () => {
    let v = List('abc');
    expect(v.get(1)).toBe('b');
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts an indexed Seq', () => {
    let seq = Seq(['a', 'b', 'c']);
    let v = List(seq);
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts a keyed Seq as a list of entries', () => {
    let seq = Seq({a: null, b: null, c: null}).flip();
    let v = List(seq);
    expect(v.toArray()).toEqual([[null, 'a'], [null, 'b'], [null, 'c']]);
    // Explicitly getting the values sequence
    let v2 = List(seq.valueSeq());
    expect(v2.toArray()).toEqual(['a', 'b', 'c']);
    // toList() does this for you.
    let v3 = seq.toList();
    expect(v3.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('can set and get a value', () => {
    let v = List();
    expect(v.get(0)).toBe(undefined);
    v = v.set(0, 'value');
    expect(v.get(0)).toBe('value');
  });

  it('can setIn and getIn a deep value', () => {
    let v = List([
      Map({
        aKey: List([
          "bad",
          "good",
        ]),
      }),
    ]);
    expect(v.getIn([0, 'aKey', 1])).toBe("good");
    v = v.setIn([0, 'aKey', 1], "great");
    expect(v.getIn([0, 'aKey', 1])).toBe("great");
  });

  it('can update a value', () => {
    let l = List.of(5);
    expect(l.update(0, v => v * v).toArray()).toEqual([25]);
  });

  it('can updateIn a deep value', () => {
    let l = List([
      Map({
        aKey: List([
          "bad",
          "good",
        ]),
      }),
    ]);
    l = l.updateIn([0, 'aKey', 1], v => v + v);
    expect(l.toJS()).toEqual([
      {
        aKey: [
          'bad',
          'goodgood',
        ],
      },
    ]);
  });

  it('returns undefined when getting a null value', () => {
    let v = List([1, 2, 3]);
    expect(v.get(null)).toBe(undefined);

    let o = List([{ a: 1 }, { b: 2 }, { c: 3 }]);
    expect(o.get(null)).toBe(undefined);
  });

  it('counts from the end of the list on negative index', () => {
    let i = List.of(1, 2, 3, 4, 5, 6, 7);
    expect(i.get(-1)).toBe(7);
    expect(i.get(-5)).toBe(3);
    expect(i.get(-9)).toBe(undefined);
    expect(i.get(-999, 1000)).toBe(1000);
  });

  it('coerces numeric-string keys', () => {
    // Of course, TypeScript protects us from this, so cast to "any" to test.
    let i: any = List.of(1, 2, 3, 4, 5, 6);
    expect(i.get('1')).toBe(2);
    expect(i.set('3', 10).get('3')).toBe(10);
    // Like array, string negative numbers do not qualify
    expect(i.get('-1')).toBe(undefined);
    // Like array, string floating point numbers do not qualify
    expect(i.get('1.0')).toBe(undefined);
  });

  it('uses not set value for string index', () => {
    let list: any = List();
    expect(list.get('stringKey', 'NOT-SET')).toBe('NOT-SET');
  });

  it('uses not set value for index {}', () => {
    let list: any = List.of(1, 2, 3, 4, 5);
    expect(list.get({}, 'NOT-SET')).toBe('NOT-SET');
  });

  it('uses not set value for index void 0', () => {
    let list: any = List.of(1, 2, 3, 4, 5);
    expect(list.get(void 0, 'NOT-SET')).toBe('NOT-SET');
  });

  it('uses not set value for index undefined', () => {
    let list: any = List.of(1, 2, 3, 4, 5);
    expect(list.get(undefined, 'NOT-SET')).toBe('NOT-SET');
  });

  it('doesnt coerce empty strings to index 0', () => {
    let list: any = List.of(1, 2, 3);
    expect(list.has('')).toBe(false);
  });

  it('doesnt contain elements at non-empty string keys', () => {
    let list: any = List.of(1, 2, 3, 4, 5);
    expect(list.has('str')).toBe(false);
  });

  it('hasIn doesnt contain elements at non-empty string keys', () => {
    let list: any = List.of(1, 2, 3, 4, 5);
    expect(list.hasIn(['str'])).toBe(false);
  });

  it('setting creates a new instance', () => {
    let v0 = List.of('a');
    let v1 = v0.set(0, 'A');
    expect(v0.get(0)).toBe('a');
    expect(v1.get(0)).toBe('A');
  });

  it('size includes the highest index', () => {
    let v0 = List();
    let v1 = v0.set(0, 'a');
    let v2 = v1.set(1, 'b');
    let v3 = v2.set(2, 'c');
    expect(v0.size).toBe(0);
    expect(v1.size).toBe(1);
    expect(v2.size).toBe(2);
    expect(v3.size).toBe(3);
  });

  it('get helpers make for easier to read code', () => {
    let v = List.of('a', 'b', 'c');
    expect(v.first()).toBe('a');
    expect(v.get(1)).toBe('b');
    expect(v.last()).toBe('c');
  });

  it('slice helpers make for easier to read code', () => {
    let v0 = List.of('a', 'b', 'c');
    let v1 = List.of('a', 'b');
    let v2 = List.of('a');
    let v3 = List();

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
    let v0 = List.of('a', 'b', 'c');
    let v1 = v0.set(1, 'B'); // within existing tail
    let v2 = v1.set(3, 'd'); // at last position
    let v3 = v2.set(31, 'e'); // (testing internal guts)
    let v4 = v3.set(32, 'f'); // (testing internal guts)
    let v5 = v4.set(1023, 'g'); // (testing internal guts)
    let v6 = v5.set(1024, 'h'); // (testing internal guts)
    let v7 = v6.set(32, 'F'); // set within existing tree
    expect(v7.size).toBe(1025);
    let expectedArray = ['a', 'B', 'c', 'd'];
    expectedArray[31] = 'e';
    expectedArray[32] = 'F';
    expectedArray[1023] = 'g';
    expectedArray[1024] = 'h';
    expect(v7.toArray()).toEqual(expectedArray);
  });

  it('can contain a large number of indices', () => {
    let r = Range(0, 20000).toList();
    let iterations = 0;
    r.forEach(v => {
      expect(v).toBe(iterations);
      iterations++;
    });
  });

  it('describes a dense list', () => {
    let v = List.of('a', 'b', 'c').push('d').set(14, 'o').set(6, undefined).remove(1);
    expect(v.size).toBe(14);
    expect(v.toJS()).toEqual(
      ['a', 'c', 'd', , , , , , , , , , , 'o'],
    );
  });

  it('iterates a dense list', () => {
    let v = List().setSize(11).set(1, 1).set(3, 3).set(5, 5).set(7, 7).set(9, 9);
    expect(v.size).toBe(11);

    let forEachResults = [];
    v.forEach((val, i) => forEachResults.push([i, val]));
    expect(forEachResults).toEqual([
      [0, undefined],
      [1, 1],
      [2, undefined],
      [3, 3],
      [4, undefined],
      [5, 5],
      [6, undefined],
      [7, 7],
      [8, undefined],
      [9, 9],
      [10, undefined],
    ]);

    let arrayResults = v.toArray();
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

    let iteratorResults = [];
    let iterator = v.entries();
    let step;
    while (!(step = iterator.next()).done) {
      iteratorResults.push(step.value);
    }
    expect(iteratorResults).toEqual([
      [0, undefined],
      [1, 1],
      [2, undefined],
      [3, 3],
      [4, undefined],
      [5, 5],
      [6, undefined],
      [7, 7],
      [8, undefined],
      [9, 9],
      [10, undefined],
    ]);
  });

  it('push inserts at highest index', () => {
    let v0 = List.of('a', 'b', 'c');
    let v1 = v0.push('d', 'e', 'f');
    expect(v0.size).toBe(3);
    expect(v1.size).toBe(6);
    expect(v1.toArray()).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  check.it('pushes multiple values to the end', {maxSize: 2000},
    [gen.posInt, gen.posInt], (s1, s2) => {
      let a1 = arrayOfSize(s1);
      let a2 = arrayOfSize(s2);

      let v1 = List(a1);
      let v3 = v1.push.apply(v1, a2);

      let a3 = a1.slice();
      a3.push.apply(a3, a2);

      expect(v3.size).toEqual(a3.length);
      expect(v3.toArray()).toEqual(a3);
    },
  );

  it('pop removes the highest index, decrementing size', () => {
    let v = List.of('a', 'b', 'c').pop();
    expect(v.last()).toBe('b');
    expect(v.toArray()).toEqual(['a', 'b']);
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
      let a = arrayOfSize(len);
      let v = List(a);

      while (a.length) {
        expect(v.size).toBe(a.length);
        expect(v.toArray()).toEqual(a);
        v = v.pop();
        a.pop();
      }
      expect(v.size).toBe(a.length);
      expect(v.toArray()).toEqual(a);
    },
  );

  check.it('push adds the next highest index, just like array', {maxSize: 2000},
    [gen.posInt], len => {
      let a = [];
      let v = List();

      for (let ii = 0; ii < len; ii++) {
        expect(v.size).toBe(a.length);
        expect(v.toArray()).toEqual(a);
        v = v.push(ii);
        a.push(ii);
      }
      expect(v.size).toBe(a.length);
      expect(v.toArray()).toEqual(a);
    },
  );

  it('allows popping an empty list', () => {
    let v = List.of('a').pop();
    expect(v.size).toBe(0);
    expect(v.toArray()).toEqual([]);
    v = v.pop().pop().pop().pop().pop();
    expect(v.size).toBe(0);
    expect(v.toArray()).toEqual([]);
  });

  it('remove removes any index', () => {
    let v = List.of('a', 'b', 'c').remove(2).remove(0);
    expect(v.size).toBe(1);
    expect(v.get(0)).toBe('b');
    expect(v.get(1)).toBe(undefined);
    expect(v.get(2)).toBe(undefined);
    expect(v.toArray()).toEqual(['b']);
    v = v.push('d');
    expect(v.size).toBe(2);
    expect(v.get(1)).toBe('d');
    expect(v.toArray()).toEqual(['b', 'd']);
  });

  it('shifts values from the front', () => {
    let v = List.of('a', 'b', 'c').shift();
    expect(v.first()).toBe('b');
    expect(v.size).toBe(2);
  });

  it('unshifts values to the front', () => {
    let v = List.of('a', 'b', 'c').unshift('x', 'y', 'z');
    expect(v.first()).toBe('x');
    expect(v.size).toBe(6);
    expect(v.toArray()).toEqual(['x', 'y', 'z', 'a', 'b', 'c']);
  });

  check.it('unshifts multiple values to the front', {maxSize: 2000},
    [gen.posInt, gen.posInt], (s1, s2) => {
      let a1 = arrayOfSize(s1);
      let a2 = arrayOfSize(s2);

      let v1 = List(a1);
      let v3 = v1.unshift.apply(v1, a2);

      let a3 = a1.slice();
      a3.unshift.apply(a3, a2);

      expect(v3.size).toEqual(a3.length);
      expect(v3.toArray()).toEqual(a3);
    },
  );

  it('finds values using indexOf', () => {
    let v = List.of('a', 'b', 'c', 'b', 'a');
    expect(v.indexOf('b')).toBe(1);
    expect(v.indexOf('c')).toBe(2);
    expect(v.indexOf('d')).toBe(-1);
  });

  it('finds values using lastIndexOf', () => {
    let v = List.of('a', 'b', 'c', 'b', 'a');
    expect(v.lastIndexOf('b')).toBe(3);
    expect(v.lastIndexOf('c')).toBe(2);
    expect(v.lastIndexOf('d')).toBe(-1);
  });

  it('finds values using findIndex', () => {
    let v = List.of('a', 'b', 'c', 'B', 'a');
    expect(v.findIndex(value => value.toUpperCase() === value)).toBe(3);
    expect(v.findIndex(value => value.length > 1)).toBe(-1);
  });

  it('finds values using findEntry', () => {
    let v = List.of('a', 'b', 'c', 'B', 'a');
    expect(v.findEntry(value => value.toUpperCase() === value)).toEqual([3, 'B']);
    expect(v.findEntry(value => value.length > 1)).toBe(undefined);
  });

  it('maps values', () => {
    let v = List.of('a', 'b', 'c');
    let r = v.map(value => value.toUpperCase());
    expect(r.toArray()).toEqual(['A', 'B', 'C']);
  });

  it('filters values', () => {
    let v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    let r = v.filter((value, index) => index % 2 === 1);
    expect(r.toArray()).toEqual(['b', 'd', 'f']);
  });

  it('reduces values', () => {
    let v = List.of(1, 10, 100);
    let r = v.reduce<number>((reduction, value) => reduction + value);
    expect(r).toEqual(111);
    let r2 = v.reduce((reduction, value) => reduction + value, 1000);
    expect(r2).toEqual(1111);
  });

  it('reduces from the right', () => {
    let v = List.of('a', 'b', 'c');
    let r = v.reduceRight((reduction, value) => reduction + value);
    expect(r).toEqual('cba');
    let r2 = v.reduceRight((reduction, value) => reduction + value, 'x');
    expect(r2).toEqual('xcba');
  });

  it('takes maximum number', () => {
    let v = List.of('a', 'b', 'c');
    let r = v.take(Number.MAX_SAFE_INTEGER);
    expect(r).toBe(v);
  });

  it('takes and skips values', () => {
    let v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    let r = v.skip(2).take(2);
    expect(r.toArray()).toEqual(['c', 'd']);
  });

  it('takes and skips no-ops return same reference', () => {
    let v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    let r = v.skip(0).take(6);
    expect(r).toBe(v);
  });

  it('takeLast and skipLast values', () => {
    let v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    let r = v.skipLast(1).takeLast(2);
    expect(r.toArray()).toEqual(['d', 'e']);
  });

  it('takeLast and skipLast no-ops return same reference', () => {
    let v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    let r = v.skipLast(0).takeLast(6);
    expect(r).toBe(v);
  });

  it('efficiently chains array methods', () => {
    let v = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);

    let r = v
      .filter(x => x % 2 === 0)
      .skip(2)
      .map(x => x * x)
      .take(3)
      .reduce((a: number, b: number) => a + b, 0);

    expect(r).toEqual(200);
  });

  it('can convert to a map', () => {
    let v = List.of('a', 'b', 'c');
    let m = v.toMap();
    expect(m.size).toBe(3);
    expect(m.get(1)).toBe('b');
  });

  it('reverses', () => {
    let v = List.of('a', 'b', 'c');
    expect(v.reverse().toArray()).toEqual(['c', 'b', 'a']);
  });

  it('ensures equality', () => {
    // Make a sufficiently long list.
    let a = Array(100).join('abcdefghijklmnopqrstuvwxyz').split('');
    let v1 = List(a);
    let v2 = List(a);
    // tslint:disable-next-line: triple-equals
    expect(v1 == v2).not.toBe(true);
    expect(v1 === v2).not.toBe(true);
    expect(v1.equals(v2)).toBe(true);
  });

  it('works with insert', () => {
    let v = List.of('a', 'b', 'c');
    let m = v.insert(1, 'd');
    expect(m.size).toBe(4);
    expect(m.get(1)).toBe('d');

    // Works when index is greater than size of array.
    let n = v.insert(10, 'e');
    expect(n.size).toBe(4);
    expect(n.get(3)).toBe('e');

    // Works when index is negative.
    let o = v.insert(-4, 'f');
    expect(o.size).toBe(4);
    expect(o.get(0)).toBe('f');
  });

  // TODO: assert that findIndex only calls the function as much as it needs to.

  it('forEach iterates in the correct order', () => {
    let n = 0;
    let a = [];
    let v = List.of(0, 1, 2, 3, 4);
    v.forEach(x => {
      a.push(x);
      n++;
    });
    expect(n).toBe(5);
    expect(a.length).toBe(5);
    expect(a).toEqual([0, 1, 2, 3, 4]);
  });

  it('forEach iteration terminates when callback returns false', () => {
    let a = [];
    function count(x) {
      if (x > 2) {
        return false;
      }
      a.push(x);
    }
    let v = List.of(0, 1, 2, 3, 4);
    v.forEach(count);
    expect(a).toEqual([0, 1, 2]);
  });

  it('concat works like Array.prototype.concat', () => {
    let v1 = List.of(1, 2, 3);
    let v2 = v1.concat(4, List.of(5, 6), [7, 8], Seq({a: 9, b: 10}), Set.of(11, 12), null);
    expect(v1.toArray()).toEqual([1, 2, 3]);
    expect(v2.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, null]);
  });

  it('allows chained mutations', () => {
    let v1 = List();
    let v2 = v1.push(1);
    let v3 = v2.withMutations(v => v.push(2).push(3).push(4));
    let v4 = v3.push(5);

    expect(v1.toArray()).toEqual([]);
    expect(v2.toArray()).toEqual([1]);
    expect(v3.toArray()).toEqual([1, 2, 3, 4]);
    expect(v4.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('allows chained mutations using alternative API', () => {
    let v1 = List();
    let v2 = v1.push(1);
    let v3 = v2.asMutable().push(2).push(3).push(4).asImmutable();
    let v4 = v3.push(5);

    expect(v1.toArray()).toEqual([]);
    expect(v2.toArray()).toEqual([1]);
    expect(v3.toArray()).toEqual([1, 2, 3, 4]);
    expect(v4.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('chained mutations does not result in new empty list instance', () => {
    let v1 = List(['x']);
    let v2 = v1.withMutations(v => v.push('y').pop().pop());
    expect(v2).toBe(List());
  });

  it('allows size to be set', () => {
    let v1 = Range(0, 2000).toList();
    let v2 = v1.setSize(1000);
    let v3 = v2.setSize(1500);
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

  it('discards truncated elements when using slice', () => {
    let list = [1, 2, 3, 4, 5, 6];
    let v1 = fromJS(list);
    let v2 = v1.slice(0, 3);
    let v3 = v2.setSize(6);

    expect(v2.toArray()).toEqual(list.slice(0, 3));
    expect(v3.toArray()).toEqual(
      list.slice(0, 3).concat([undefined, undefined, undefined]),
    );
  });

  it('discards truncated elements when using setSize', () => {
    let list = [1, 2, 3, 4, 5, 6];
    let v1 = fromJS(list);
    let v2 = v1.setSize(3);
    let v3 = v2.setSize(6);

    expect(v2.toArray()).toEqual(list.slice(0, 3));
    expect(v3.toArray()).toEqual(
      list.slice(0, 3).concat([undefined, undefined, undefined]),
    );
  });

  it('can be efficiently sliced', () => {
    let v1 = Range(0, 2000).toList();
    let v2 = v1.slice(100, -100).toList();
    let v3 = v2.slice(0, Infinity);
    expect(v1.size).toBe(2000);
    expect(v2.size).toBe(1800);
    expect(v3.size).toBe(1800);
    expect(v2.first()).toBe(100);
    expect(v2.rest().size).toBe(1799);
    expect(v2.last()).toBe(1899);
    expect(v2.butLast().size).toBe(1799);
  });

  [NaN, Infinity, -Infinity].forEach(zeroishValue => {
    it(`treats ${zeroishValue} like zero when setting size`, () => {
      let v1 = List.of('a', 'b', 'c');
      let v2 = v1.setSize(zeroishValue);
      expect(v2.size).toBe(0);
    });
  });

  it('Does not infinite loop when sliced with NaN #459', () => {
    let list = List([1, 2, 3, 4, 5]);
    let newList = list.slice(0, NaN);
    expect(newList.toJS()).toEqual([]);
  });

  it('Accepts NaN for slice and concat #602', () => {
    let list = List().slice(0, NaN).concat(NaN);
    // toEqual([ NaN ])
    expect(list.size).toBe(1);
    expect(isNaNValue(list.get(0))).toBe(true);
  });

  // Note: NaN is the only value not equal to itself. The isNaN() built-in
  // function returns true for any non-numeric value, not just the NaN value.
  function isNaNValue(value) {
    return value !== value;
  }

  describe('when slicing', () => {
    [NaN, -Infinity].forEach(zeroishValue => {
      it(`considers a ${zeroishValue} begin argument to be zero`, () => {
        let v1 = List.of('a', 'b', 'c');
        let v2 = v1.slice(zeroishValue, 3);
        expect(v2.size).toBe(3);
      });
      it(`considers a ${zeroishValue} end argument to be zero`, () => {
        let v1 = List.of('a', 'b', 'c');
        let v2 = v1.slice(0, zeroishValue);
        expect(v2.size).toBe(0);
      });
      it(`considers ${zeroishValue} begin and end arguments to be zero`, () => {
        let v1 = List.of('a', 'b', 'c');
        let v2 = v1.slice(zeroishValue, zeroishValue);
        expect(v2.size).toBe(0);
      });
    });
  });

  describe('Iterator', () => {

    let pInt = gen.posInt;

    check.it('iterates through List', [pInt, pInt], (start, len) => {
      let l = Range(0, start + len).toList();
      l = <List<number>> l.slice(start, start + len);
      expect(l.size).toBe(len);
      let valueIter = l.values();
      let keyIter = l.keys();
      let entryIter = l.entries();
      for (let ii = 0; ii < len; ii++) {
        expect(valueIter.next().value).toBe(start + ii);
        expect(keyIter.next().value).toBe(ii);
        expect(entryIter.next().value).toEqual([ii, start + ii]);
      }
    });

    check.it('iterates through List in reverse', [pInt, pInt], (start, len) => {
      let l = Range(0, start + len).toList();
      l = <List<number>> l.slice(start, start + len);
      let s = l.toSeq().reverse(); // impl calls List.__iterator(REVERSE)
      expect(s.size).toBe(len);
      let valueIter = s.values();
      let keyIter = s.keys();
      let entryIter = s.entries();
      for (let ii = 0; ii < len; ii++) {
        expect(valueIter.next().value).toBe(start + len - 1 - ii);
        expect(keyIter.next().value).toBe(ii);
        expect(entryIter.next().value).toEqual([ii, start + len - 1 - ii]);
      }
    });

  });

});
