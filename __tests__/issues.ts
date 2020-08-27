/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

declare var Symbol: any;
import { List, OrderedMap, OrderedSet, Record, Seq, Set } from '../';

describe('Issue #1175', () => {
  it('invalid hashCode() response should not infinitly recurse', () => {
    class BadHash {
      equals() {
        return false;
      }
      hashCode() {
        return 2 ** 32;
      }
    }

    const set = Set([new BadHash()]);
    expect(set.size).toEqual(1);
  });
});

describe('Issue #1188', () => {
  it('Removing items from OrderedSet should return OrderedSet', () => {
    const orderedSet = OrderedSet(['one', 'two', 'three']);
    const emptyOrderedSet = orderedSet.subtract(['two', 'three', 'one']);
    expect(OrderedSet.isOrderedSet(emptyOrderedSet)).toBe(true);
  });
});

describe('Issue #1220 : Seq.rest() throws an exception when invoked on a single item sequence ', () => {
  it('should be iterable', () => {
    // Helper for this test
    const ITERATOR_SYMBOL =
      (typeof Symbol === 'function' && Symbol.iterator) || '@@iterator';

    const r = Seq([1]).rest();
    const i = r[ITERATOR_SYMBOL]();
    expect(i.next()).toEqual({ value: undefined, done: true });
  });
});

describe('Issue #1245', () => {
  it('should return empty collection after takeLast(0)', () => {
    const size = List(['a', 'b', 'c']).takeLast(0).size;
    expect(size).toEqual(0);
  });
});

describe('Issue #1262', () => {
  it('Set.subtract should accept an array', () => {
    const MyType = Record({ val: 1 });
    const set1 = Set([
      MyType({ val: 1 }),
      MyType({ val: 2 }),
      MyType({ val: 3 }),
    ]);
    const set2 = set1.subtract([MyType({ val: 2 })]);
    const set3 = set1.subtract(List([MyType({ val: 2 })]));
    expect(set2).toEqual(set3);
  });
});

describe('Issue #1287', () => {
  it('should skip all items in OrderedMap when skipping Infinity', () => {
    const size = OrderedMap([['a', 1]]).skip(Infinity).size;
    expect(size).toEqual(0);
  });
});

describe('Issue #1247', () => {
  it('Records should not be considered altered after creation', () => {
    const R = Record({ a: 1 });
    const r = new R();
    expect(r.wasAltered()).toBe(false);
  });
});

describe('Issue #1252', () => {
  it('should be toString-able even if it contains a value which is not', () => {
    const prototypelessObj = Object.create(null);
    const list = List([prototypelessObj]);
    expect(list.toString()).toBe('List [ {} ]');
  });
});

describe('Issue #1293', () => {
  it('merge() should not deeply coerce values', () => {
    const State = Record({ foo: 'bar' as any, biz: 'baz' });
    const deepObject = { qux: 'quux' };

    const firstState = State({ foo: deepObject });
    const secondState = State().merge({ foo: deepObject });

    expect(secondState).toEqual(firstState);
  });
});

describe('Issue #1643', () => {
  [
    ['a string', 'test'],
    ['a number', 5],
    ['null', null],
    ['undefined', undefined],
    ['a boolean', true],
    ['an object', {}],
    ['an array', []],
    ['a function', () => null],
  ].forEach(([label, value]) => {
    class MyClass {
      valueOf() {
        return value;
      }
    }

    it(`Collection#hashCode() should handle objects that return ${label} for valueOf`, () => {
      const set = Set().add(new MyClass());
      set.hashCode();
    });
  });
});
