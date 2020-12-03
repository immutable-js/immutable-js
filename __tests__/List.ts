/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { fromJS, List, Map, Range, Seq, Set } from '../';

function arrayOfSize(s) {
  const a = new Array(s);
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

    const t: Test = {
      list: List(),
    };

    expect(t.list.size).toBe(0);
  });

  it('of provides initial values', () => {
    const v = List.of('a', 'b', 'c');
    expect(v.get(0)).toBe('a');
    expect(v.get(1)).toBe('b');
    expect(v.get(2)).toBe('c');
  });

  it('toArray provides a JS array', () => {
    const v = List.of('a', 'b', 'c');
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('does not accept a scalar', () => {
    expect(() => {
      List(3 as any);
    }).toThrow('Expected Array or collection object of values: 3');
  });

  it('accepts an array', () => {
    const v = List(['a', 'b', 'c']);
    expect(v.get(1)).toBe('b');
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts an array-like', () => {
    const v = List({ length: 3, 2: 'c' } as any);
    expect(v.get(2)).toBe('c');
    expect(v.toArray()).toEqual([undefined, undefined, 'c']);
  });

  it('accepts any array-like collection, including strings', () => {
    const v = List('abc');
    expect(v.get(1)).toBe('b');
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts an indexed Seq', () => {
    const seq = Seq(['a', 'b', 'c']);
    const v = List(seq);
    expect(v.toArray()).toEqual(['a', 'b', 'c']);
  });

  it('accepts a keyed Seq as a list of entries', () => {
    const seq = Seq({ a: null, b: null, c: null }).flip();
    const v = List(seq);
    expect(v.toArray()).toEqual([
      [null, 'a'],
      [null, 'b'],
      [null, 'c'],
    ]);
    // Explicitly getting the values sequence
    const v2 = List(seq.valueSeq());
    expect(v2.toArray()).toEqual(['a', 'b', 'c']);
    // toList() does this for you.
    const v3 = seq.toList();
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
        aKey: List(['bad', 'good']),
      }),
    ]);
    expect(v.getIn([0, 'aKey', 1])).toBe('good');
    v = v.setIn([0, 'aKey', 1], 'great');
    expect(v.getIn([0, 'aKey', 1])).toBe('great');
  });

  it('can setIn on an inexistant index', () => {
    const myMap = Map({ a: [], b: [] });
    const out = myMap.setIn(['a', 0], 'v').setIn(['c', 0], 'v');

    expect(out.getIn(['a', 0])).toEqual('v');
    expect(out.getIn(['c', 0])).toEqual('v');
    expect(out.get('a')).toBeInstanceOf(Array);
    expect(out.get('b')).toBeInstanceOf(Array);
    expect(out.get('c')).toBeInstanceOf(Map);
    expect(out.get('c').keySeq().first()).toBe(0);
  });

  it('throw when calling setIn on a non data structure', () => {
    const avengers = [
      'ironMan', // index [0]
      [
        'captainAmerica', // index [1][0]
        [
          'blackWidow', // index [1][1][0]
          ['theHulk'], // index [1][1][1][0]
        ],
      ],
    ];

    const avengersList = fromJS(avengers);

    // change theHulk to scarletWitch
    const out1 = avengersList.setIn([1, 1, 1, 0], 'scarletWitch');
    expect(out1.getIn([1, 1, 1, 0])).toEqual('scarletWitch');

    const out2 = avengersList.setIn([1, 1, 1, 3], 'scarletWitch');
    expect(out2.getIn([1, 1, 1, 3])).toEqual('scarletWitch');

    expect(() => {
      avengersList.setIn([0, 1], 'scarletWitch');
    }).toThrow(
      'Cannot update within non-data-structure value in path [0]: ironMan'
    );
  });

  it('can update a value', () => {
    const l = List.of(5);
    expect(l.update(0, (v) => v * v).toArray()).toEqual([25]);
  });

  it('can updateIn a deep value', () => {
    let l = List([
      Map({
        aKey: List(['bad', 'good']),
      }),
    ]);
    l = l.updateIn([0, 'aKey', 1], (v) => v + v);
    expect(l.toJS()).toEqual([
      {
        aKey: ['bad', 'goodgood'],
      },
    ]);
  });

  it('returns undefined when getting a null value', () => {
    const v = List([1, 2, 3]);
    expect(v.get(null as any)).toBe(undefined);

    const o = List([{ a: 1 }, { b: 2 }, { c: 3 }]);
    expect(o.get(null as any)).toBe(undefined);
  });

  it('counts from the end of the list on negative index', () => {
    const i = List.of(1, 2, 3, 4, 5, 6, 7);
    expect(i.get(-1)).toBe(7);
    expect(i.get(-5)).toBe(3);
    expect(i.get(-9)).toBe(undefined);
    expect(i.get(-999, 1000)).toBe(1000);
  });

  it('coerces numeric-string keys', () => {
    // Of course, TypeScript protects us from this, so cast to "any" to test.
    const i: any = List.of(1, 2, 3, 4, 5, 6);
    expect(i.get('1')).toBe(2);
    expect(i.set('3', 10).get('3')).toBe(10);
    // Like array, string negative numbers do not qualify
    expect(i.get('-1')).toBe(undefined);
    // Like array, string floating point numbers do not qualify
    expect(i.get('1.0')).toBe(undefined);
  });

  it('uses not set value for string index', () => {
    const list: any = List();
    expect(list.get('stringKey', 'NOT-SET')).toBe('NOT-SET');
  });

  it('uses not set value for index {}', () => {
    const list: any = List.of(1, 2, 3, 4, 5);
    expect(list.get({}, 'NOT-SET')).toBe('NOT-SET');
  });

  it('uses not set value for index void 0', () => {
    const list: any = List.of(1, 2, 3, 4, 5);
    expect(list.get(void 0, 'NOT-SET')).toBe('NOT-SET');
  });

  it('uses not set value for index undefined', () => {
    const list: any = List.of(1, 2, 3, 4, 5);
    expect(list.get(undefined, 'NOT-SET')).toBe('NOT-SET');
  });

  it('doesnt coerce empty strings to index 0', () => {
    const list: any = List.of(1, 2, 3);
    expect(list.has('')).toBe(false);
  });

  it('doesnt contain elements at non-empty string keys', () => {
    const list: any = List.of(1, 2, 3, 4, 5);
    expect(list.has('str')).toBe(false);
  });

  it('hasIn doesnt contain elements at non-empty string keys', () => {
    const list: any = List.of(1, 2, 3, 4, 5);
    expect(list.hasIn(['str'])).toBe(false);
  });

  it('hasIn doesnt throw for bad key-path', () => {
    const list = List.of(1, 2, 3, 4, 5);
    expect(list.hasIn([1, 2, 3])).toBe(false);

    const list2 = List([{}]);
    expect(list2.hasIn([0, 'bad'])).toBe(false);
  });

  it('setting creates a new instance', () => {
    const v0 = List.of('a');
    const v1 = v0.set(0, 'A');
    expect(v0.get(0)).toBe('a');
    expect(v1.get(0)).toBe('A');
  });

  it('size includes the highest index', () => {
    const v0 = List();
    const v1 = v0.set(0, 'a');
    const v2 = v1.set(1, 'b');
    const v3 = v2.set(2, 'c');
    expect(v0.size).toBe(0);
    expect(v1.size).toBe(1);
    expect(v2.size).toBe(2);
    expect(v3.size).toBe(3);
  });

  it('get helpers make for easier to read code', () => {
    const v = List.of('a', 'b', 'c');
    expect(v.first()).toBe('a');
    expect(v.get(1)).toBe('b');
    expect(v.last()).toBe('c');
  });

  it('slice helpers make for easier to read code', () => {
    const v0 = List.of('a', 'b', 'c');
    const v1 = List.of('a', 'b');
    const v2 = List.of('a');
    const v3 = List();

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
    const v0 = List.of('a', 'b', 'c');
    const v1 = v0.set(1, 'B'); // within existing tail
    const v2 = v1.set(3, 'd'); // at last position
    const v3 = v2.set(31, 'e'); // (testing internal guts)
    const v4 = v3.set(32, 'f'); // (testing internal guts)
    const v5 = v4.set(1023, 'g'); // (testing internal guts)
    const v6 = v5.set(1024, 'h'); // (testing internal guts)
    const v7 = v6.set(32, 'F'); // set within existing tree
    expect(v7.size).toBe(1025);
    const expectedArray = ['a', 'B', 'c', 'd'];
    expectedArray[31] = 'e';
    expectedArray[32] = 'F';
    expectedArray[1023] = 'g';
    expectedArray[1024] = 'h';
    expect(v7.toArray()).toEqual(expectedArray);
  });

  it('can contain a large number of indices', () => {
    const r = Range(0, 20000).toList();
    let iterations = 0;
    r.forEach((v) => {
      expect(v).toBe(iterations);
      iterations++;
    });
  });

  it('describes a dense list', () => {
    const v = List.of<string | undefined>('a', 'b', 'c')
      .push('d')
      .set(14, 'o')
      .set(6, undefined)
      .remove(1);
    expect(v.size).toBe(14);
    expect(v.toJS()).toEqual(['a', 'c', 'd', , , , , , , , , , , 'o']);
  });

  it('iterates a dense list', () => {
    const v = List()
      .setSize(11)
      .set(1, 1)
      .set(3, 3)
      .set(5, 5)
      .set(7, 7)
      .set(9, 9);
    expect(v.size).toBe(11);

    const forEachResults: Array<any> = [];
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

    const arrayResults = v.toArray();
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

    const iteratorResults: Array<any> = [];
    const iterator = v.entries();
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
    const v0 = List.of('a', 'b', 'c');
    const v1 = v0.push('d', 'e', 'f');
    expect(v0.size).toBe(3);
    expect(v1.size).toBe(6);
    expect(v1.toArray()).toEqual(['a', 'b', 'c', 'd', 'e', 'f']);
  });

  check.it(
    'pushes multiple values to the end',
    { maxSize: 2000 },
    [gen.posInt, gen.posInt],
    (s1, s2) => {
      const a1 = arrayOfSize(s1);
      const a2 = arrayOfSize(s2);

      const v1 = List(a1);
      const v3 = v1.push.apply(v1, a2);

      const a3 = a1.slice();
      a3.push.apply(a3, a2);

      expect(v3.size).toEqual(a3.length);
      expect(v3.toArray()).toEqual(a3);
    }
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

  check.it(
    'pop removes the highest index, just like array',
    { maxSize: 2000 },
    [gen.posInt],
    (len) => {
      const a = arrayOfSize(len);
      let v = List(a);

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

  check.it(
    'push adds the next highest index, just like array',
    { maxSize: 2000 },
    [gen.posInt],
    (len) => {
      const a: Array<any> = [];
      let v = List();

      for (let ii = 0; ii < len; ii++) {
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
    let v = List.of('a').pop();
    expect(v.size).toBe(0);
    expect(v.toArray()).toEqual([]);
    v = v.pop().pop().pop().pop().pop();
    expect(v.size).toBe(0);
    expect(v.toArray()).toEqual([]);
  });

  it.each(['remove', 'delete'])('remove removes any index', (fn) => {
    let v = List.of('a', 'b', 'c')[fn](2)[fn](0);
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
    const v = List.of('a', 'b', 'c').shift();
    expect(v.first()).toBe('b');
    expect(v.size).toBe(2);
  });

  it('unshifts values to the front', () => {
    const v = List.of('a', 'b', 'c').unshift('x', 'y', 'z');
    expect(v.first()).toBe('x');
    expect(v.size).toBe(6);
    expect(v.toArray()).toEqual(['x', 'y', 'z', 'a', 'b', 'c']);
  });

  check.it(
    'unshifts multiple values to the front',
    { maxSize: 2000 },
    [gen.posInt, gen.posInt],
    (s1, s2) => {
      const a1 = arrayOfSize(s1);
      const a2 = arrayOfSize(s2);

      const v1 = List(a1);
      const v3 = v1.unshift.apply(v1, a2);

      const a3 = a1.slice();
      a3.unshift.apply(a3, a2);

      expect(v3.size).toEqual(a3.length);
      expect(v3.toArray()).toEqual(a3);
    }
  );

  it('finds values using indexOf', () => {
    const v = List.of('a', 'b', 'c', 'b', 'a');
    expect(v.indexOf('b')).toBe(1);
    expect(v.indexOf('c')).toBe(2);
    expect(v.indexOf('d')).toBe(-1);
  });

  it('finds values using lastIndexOf', () => {
    const v = List.of('a', 'b', 'c', 'b', 'a');
    expect(v.lastIndexOf('b')).toBe(3);
    expect(v.lastIndexOf('c')).toBe(2);
    expect(v.lastIndexOf('d')).toBe(-1);
  });

  it('finds values using findIndex', () => {
    const v = List.of('a', 'b', 'c', 'B', 'a');
    expect(v.findIndex((value) => value.toUpperCase() === value)).toBe(3);
    expect(v.findIndex((value) => value.length > 1)).toBe(-1);
  });

  it('finds values using findEntry', () => {
    const v = List.of('a', 'b', 'c', 'B', 'a');
    expect(v.findEntry((value) => value.toUpperCase() === value)).toEqual([
      3,
      'B',
    ]);
    expect(v.findEntry((value) => value.length > 1)).toBe(undefined);
  });

  it('maps values', () => {
    const v = List.of('a', 'b', 'c');
    const r = v.map((value) => value.toUpperCase());
    expect(r.toArray()).toEqual(['A', 'B', 'C']);
  });

  it('map no-ops return the same reference', () => {
    const v = List.of('a', 'b', 'c');
    const r = v.map((value) => value);
    expect(r).toBe(v);
  });

  it('ensures iter is unmodified', () => {
    const v = List.of(1, 2, 3);
    const r = v.map((value, index, iter) => {
      return iter.get(index - 1);
    });
    expect(r.toArray()).toEqual([3, 1, 2]);
  });

  it('filters values', () => {
    const v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    const r = v.filter((value, index) => index % 2 === 1);
    expect(r.toArray()).toEqual(['b', 'd', 'f']);
  });

  it('filters values based on type', () => {
    class A {}
    class B extends A {
      b(): void {
        return;
      }
    }
    class C extends A {
      c(): void {
        return;
      }
    }
    const l1 = List<A>([new B(), new C(), new B(), new C()]);
    // tslint:disable-next-line:arrow-parens
    const l2: List<C> = l1.filter((v): v is C => v instanceof C);
    expect(l2.size).toEqual(2);
    expect(l2.every((v) => v instanceof C)).toBe(true);
  });

  it('reduces values', () => {
    const v = List.of(1, 10, 100);
    const r = v.reduce<number>((reduction, value) => reduction + value);
    expect(r).toEqual(111);
    const r2 = v.reduce((reduction, value) => reduction + value, 1000);
    expect(r2).toEqual(1111);
  });

  it('reduces from the right', () => {
    const v = List.of('a', 'b', 'c');
    const r = v.reduceRight((reduction, value) => reduction + value);
    expect(r).toEqual('cba');
    const r2 = v.reduceRight((reduction, value) => reduction + value, 'x');
    expect(r2).toEqual('xcba');
  });

  it('takes maximum number', () => {
    const v = List.of('a', 'b', 'c');
    const r = v.take(Number.MAX_SAFE_INTEGER);
    expect(r).toBe(v);
  });

  it('takes and skips values', () => {
    const v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    const r = v.skip(2).take(2);
    expect(r.toArray()).toEqual(['c', 'd']);
  });

  it('takes and skips no-ops return same reference', () => {
    const v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    const r = v.skip(0).take(6);
    expect(r).toBe(v);
  });

  it('takeLast and skipLast values', () => {
    const v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    const r = v.skipLast(1).takeLast(2);
    expect(r.toArray()).toEqual(['d', 'e']);
  });

  it('takeLast and skipLast no-ops return same reference', () => {
    const v = List.of('a', 'b', 'c', 'd', 'e', 'f');
    const r = v.skipLast(0).takeLast(6);
    expect(r).toBe(v);
  });

  it('efficiently chains array methods', () => {
    const v = List.of(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14);

    const r = v
      .filter((x) => x % 2 === 0)
      .skip(2)
      .map((x) => x * x)
      .take(3)
      .reduce((a: number, b: number) => a + b, 0);

    expect(r).toEqual(200);
  });

  it('can convert to a map', () => {
    const v = List.of('a', 'b', 'c');
    const m = v.toMap();
    expect(m.size).toBe(3);
    expect(m.get(1)).toBe('b');
  });

  it('reverses', () => {
    const v = List.of('a', 'b', 'c');
    expect(v.reverse().toArray()).toEqual(['c', 'b', 'a']);
  });

  it('ensures equality', () => {
    // Make a sufficiently long list.
    const a = Array(100).join('abcdefghijklmnopqrstuvwxyz').split('');
    const v1 = List(a);
    const v2 = List(a);
    // tslint:disable-next-line: triple-equals
    expect(v1 == v2).not.toBe(true);
    expect(v1 === v2).not.toBe(true);
    expect(v1.equals(v2)).toBe(true);
  });

  it('works with insert', () => {
    const v = List.of('a', 'b', 'c');
    const m = v.insert(1, 'd');
    expect(m.size).toBe(4);
    expect(m.get(1)).toBe('d');

    // Works when index is greater than size of array.
    const n = v.insert(10, 'e');
    expect(n.size).toBe(4);
    expect(n.get(3)).toBe('e');

    // Works when index is negative.
    const o = v.insert(-4, 'f');
    expect(o.size).toBe(4);
    expect(o.get(0)).toBe('f');
  });

  // TODO: assert that findIndex only calls the function as much as it needs to.

  it('forEach iterates in the correct order', () => {
    let n = 0;
    const a: Array<any> = [];
    const v = List.of(0, 1, 2, 3, 4);
    v.forEach((x) => {
      a.push(x);
      n++;
    });
    expect(n).toBe(5);
    expect(a.length).toBe(5);
    expect(a).toEqual([0, 1, 2, 3, 4]);
  });

  it('forEach iteration terminates when callback returns false', () => {
    const a: Array<any> = [];
    function count(x) {
      if (x > 2) {
        return false;
      }
      a.push(x);
    }
    const v = List.of(0, 1, 2, 3, 4);
    v.forEach(count);
    expect(a).toEqual([0, 1, 2]);
  });

  it('concat works like Array.prototype.concat', () => {
    const v1 = List([1, 2, 3]);
    const v2 = v1.concat(
      4,
      List([5, 6]),
      [7, 8],
      Seq([9, 10]),
      Set.of(11, 12),
      null as any
    );
    expect(v1.toArray()).toEqual([1, 2, 3]);
    expect(v2.toArray()).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, null]);
  });

  it('concat returns self when no changes', () => {
    const v1 = List([1, 2, 3]);
    expect(v1.concat([])).toBe(v1);
  });

  it('concat returns arg when concat to empty', () => {
    const v1 = List([1, 2, 3]);
    expect(List().concat(v1)).toBe(v1);
  });

  it('concats a single value', () => {
    const v1 = List([1, 2, 3]);
    expect(v1.concat(4)).toEqual(List([1, 2, 3, 4]));
  });

  it('concat returns List-coerced arg when concat to empty', () => {
    expect(List().concat([1, 2, 3])).toEqual(List([1, 2, 3]));
  });

  it('concat does not spread in string characters', () => {
    const v1 = List([1, 2, 3]);
    expect(v1.concat('abcdef')).toEqual(List([1, 2, 3, 'abcdef']));
  });

  it('allows chained mutations', () => {
    const v1 = List();
    const v2 = v1.push(1);
    const v3 = v2.withMutations((v) => v.push(2).push(3).push(4));
    const v4 = v3.push(5);

    expect(v1.toArray()).toEqual([]);
    expect(v2.toArray()).toEqual([1]);
    expect(v3.toArray()).toEqual([1, 2, 3, 4]);
    expect(v4.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('allows chained mutations using alternative API', () => {
    const v1 = List();
    const v2 = v1.push(1);
    const v3 = v2.asMutable().push(2).push(3).push(4).asImmutable();
    const v4 = v3.push(5);

    expect(v1.toArray()).toEqual([]);
    expect(v2.toArray()).toEqual([1]);
    expect(v3.toArray()).toEqual([1, 2, 3, 4]);
    expect(v4.toArray()).toEqual([1, 2, 3, 4, 5]);
  });

  it('chained mutations does not result in new empty list instance', () => {
    const v1 = List(['x']);
    const v2 = v1.withMutations((v) => v.push('y').pop().pop());
    expect(v2).toBe(List());
  });

  it('calling `clear` and `setSize` should set all items to undefined', () => {
    const l = List(['a', 'b']);
    const l2 = l.clear().setSize(3);

    expect(l2.get(0)).toBeUndefined();
    expect(l2.get(1)).toBeUndefined();
    expect(l2.get(2)).toBeUndefined();
  });

  it('calling `clear` and `setSize` while mutating should set all items to undefined', () => {
    const l = List(['a', 'b']);
    const l2 = l.withMutations((innerList) => {
      innerList.clear().setSize(3);
    });
    expect(l2.get(0)).toBeUndefined();
    expect(l2.get(1)).toBeUndefined();
    expect(l2.get(2)).toBeUndefined();
  });

  it('allows size to be set', () => {
    const v1 = Range(0, 2000).toList();
    const v2 = v1.setSize(1000);
    const v3 = v2.setSize(1500);
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
    const list = [1, 2, 3, 4, 5, 6];
    const v1 = fromJS(list);
    const v2 = v1.slice(0, 3);
    const v3 = v2.setSize(6);

    expect(v2.toArray()).toEqual(list.slice(0, 3));
    expect(v3.toArray()).toEqual(
      list.slice(0, 3).concat([undefined, undefined, undefined] as any)
    );
  });

  it('discards truncated elements when using setSize', () => {
    const list = [1, 2, 3, 4, 5, 6];
    const v1 = fromJS(list);
    const v2 = v1.setSize(3);
    const v3 = v2.setSize(6);

    expect(v2.toArray()).toEqual(list.slice(0, 3));
    expect(v3.toArray()).toEqual(
      list.slice(0, 3).concat([undefined, undefined, undefined] as any)
    );
  });

  it('can be efficiently sliced', () => {
    const v1 = Range(0, 2000).toList();
    const v2 = v1.slice(100, -100).toList();
    const v3 = v2.slice(0, Infinity);
    expect(v1.size).toBe(2000);
    expect(v2.size).toBe(1800);
    expect(v3.size).toBe(1800);
    expect(v2.first()).toBe(100);
    expect(v2.rest().size).toBe(1799);
    expect(v2.last()).toBe(1899);
    expect(v2.butLast().size).toBe(1799);
  });

  [NaN, Infinity, -Infinity].forEach((zeroishValue) => {
    it(`treats ${zeroishValue} like zero when setting size`, () => {
      const v1 = List.of('a', 'b', 'c');
      const v2 = v1.setSize(zeroishValue);
      expect(v2.size).toBe(0);
    });
  });

  it('Does not infinite loop when sliced with NaN #459', () => {
    const list = List([1, 2, 3, 4, 5]);
    const newList = list.slice(0, NaN);
    expect(newList.toJS()).toEqual([]);
  });

  it('Accepts NaN for slice and concat #602', () => {
    const list = List().slice(0, NaN).concat(NaN);
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
    [NaN, -Infinity].forEach((zeroishValue) => {
      it(`considers a ${zeroishValue} begin argument to be zero`, () => {
        const v1 = List.of('a', 'b', 'c');
        const v2 = v1.slice(zeroishValue, 3);
        expect(v2.size).toBe(3);
      });
      it(`considers a ${zeroishValue} end argument to be zero`, () => {
        const v1 = List.of('a', 'b', 'c');
        const v2 = v1.slice(0, zeroishValue);
        expect(v2.size).toBe(0);
      });
      it(`considers ${zeroishValue} begin and end arguments to be zero`, () => {
        const v1 = List.of('a', 'b', 'c');
        const v2 = v1.slice(zeroishValue, zeroishValue);
        expect(v2.size).toBe(0);
      });
    });
  });

  describe('Iterator', () => {
    const pInt = gen.posInt;

    check.it('iterates through List', [pInt, pInt], (start, len) => {
      const l1 = Range(0, start + len).toList();
      const l2: List<number> = l1.slice(start, start + len);
      expect(l2.size).toBe(len);
      const valueIter = l2.values();
      const keyIter = l2.keys();
      const entryIter = l2.entries();
      for (let ii = 0; ii < len; ii++) {
        expect(valueIter.next().value).toBe(start + ii);
        expect(keyIter.next().value).toBe(ii);
        expect(entryIter.next().value).toEqual([ii, start + ii]);
      }
    });

    check.it('iterates through List in reverse', [pInt, pInt], (start, len) => {
      const l1 = Range(0, start + len).toList();
      const l2: List<number> = l1.slice(start, start + len);
      const s = l2.toSeq().reverse(); // impl calls List.__iterator(REVERSE)
      expect(s.size).toBe(len);
      const valueIter = s.values();
      const keyIter = s.keys();
      const entryIter = s.entries();
      for (let ii = 0; ii < len; ii++) {
        expect(valueIter.next().value).toBe(start + len - 1 - ii);
        expect(keyIter.next().value).toBe(ii);
        expect(entryIter.next().value).toEqual([ii, start + len - 1 - ii]);
      }
    });
  });
});
