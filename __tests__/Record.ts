/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>

import { isKeyed, List, Map, Record, Seq } from 'immutable';

describe('Record', () => {
  it('defines a constructor', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });

    const t1 = MyType();
    const t2 = t1.set('a', 10);

    expect(t1 instanceof Record).toBe(true);
    expect(t1 instanceof MyType).toBe(true);

    expect(t2 instanceof Record).toBe(true);
    expect(t2 instanceof MyType).toBe(true);

    expect(t1.get('a')).toBe(1);
    expect(t2.get('a')).toBe(10);
  });

  it('allows for a descriptive name', () => {
    const Person = Record({ name: null as string | null }, 'Person');

    const me = Person({ name: 'My Name' });
    expect(me.toString()).toEqual('Person { name: "My Name" }');
    expect(Record.getDescriptiveName(me)).toEqual('Person');
    expect(Person.displayName).toBe('Person');
  });

  it('passes through records of the same type', () => {
    const P2 = Record({ x: 0, y: 0 });
    const P3 = Record({ x: 0, y: 0, z: 0 });
    const p2 = P2();
    const p3 = P3();
    expect(P3(p2) instanceof P3).toBe(true);
    expect(P2(p3) instanceof P2).toBe(true);
    expect(P2(p2)).toBe(p2);
    expect(P3(p3)).toBe(p3);
  });

  it('setting an unknown key is a no-op', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });

    const t1 = MyType({ a: 10, b: 20 });
    const t2 = t1.set('d' as any, 4);

    expect(t2).toBe(t1);
  });

  it('falls back to default values when deleted or cleared', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });
    const t1 = MyType({ a: 10, b: 20 });
    const t2 = MyType({ b: 20 });
    const t3 = t1.delete('a');
    const t4 = t3.clear();

    expect(t1.get('a')).toBe(10);
    expect(t2.get('a')).toBe(1);
    expect(t3.get('a')).toBe(1);
    expect(t4.get('b')).toBe(2);

    expect(t2.equals(t3)).toBe(true);
    expect(t2.equals(t4)).toBe(false);
    expect(t4.equals(MyType())).toBe(true);
  });

  it('allows deletion of values deep within a tree', () => {
    const AType = Record({ a: 1 });
    const BType = Record({ b: AType({ a: 2 }) });
    const t1 = BType();
    const t2 = t1.deleteIn(['b', 'a']);

    expect(t1.get('b').get('a')).toBe(2);
    expect(t2.get('b').get('a')).toBe(1);
  });

  it('is a value type and equals other similar Records', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });
    const t1 = MyType({ a: 10 });
    const t2 = MyType({ a: 10, b: 2 });
    expect(t1.equals(t2));
  });

  it('if compared against undefined or null should return false', () => {
    const MyType = Record({ a: 1, b: 2 });
    const t1 = MyType();
    expect(t1.equals(undefined)).toBeFalsy();
    expect(t1.equals(null)).toBeFalsy();
  });

  it('merges in Objects and other Records', () => {
    const Point2 = Record({ x: 0, y: 0 });
    const Point3 = Record({ x: 0, y: 0, z: 0 });

    const p2 = Point2({ x: 20, y: 20 });
    const p3 = Point3({ x: 10, y: 10, z: 10 });

    expect(p3.merge(p2).toObject()).toEqual({ x: 20, y: 20, z: 10 });

    expect(p2.merge({ y: 30 }).toObject()).toEqual({ x: 20, y: 30 });
    expect(p3.merge({ y: 30, z: 30 }).toObject()).toEqual({
      x: 10,
      y: 30,
      z: 30,
    });
  });

  it('converts sequences to records', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });
    const seq = Seq({ a: 10, b: 20 });
    const t = MyType(seq);
    expect(t.toObject()).toEqual({ a: 10, b: 20, c: 3 });
  });

  it('allows for functional construction', () => {
    const MyType = Record({ a: 1, b: 2, c: 3 });
    const seq = Seq({ a: 10, b: 20 });
    const t = MyType(seq);
    expect(t.toObject()).toEqual({ a: 10, b: 20, c: 3 });
  });

  it('skips unknown keys', () => {
    const MyType = Record({ a: 1, b: 2 });
    const seq = Seq({ b: 20, c: 30 });
    const t = MyType(seq);

    expect(t.get('a')).toEqual(1);
    expect(t.get('b')).toEqual(20);
    expect((t as any).get('c')).toBeUndefined();
  });

  it('returns itself when setting identical values', () => {
    const MyType = Record({ a: 1, b: 2 });
    const t1 = MyType();
    const t2 = MyType({ a: 1 });
    const t3 = t1.set('a', 1);
    const t4 = t2.set('a', 1);
    expect(t3).toBe(t1);
    expect(t4).toBe(t2);
  });

  it('returns record when setting values', () => {
    const MyType = Record({ a: 1, b: 2 });
    const t1 = MyType();
    const t2 = MyType({ a: 1 });
    const t3 = t1.set('a', 3);
    const t4 = t2.set('a', 3);
    expect(t3).not.toBe(t1);
    expect(t4).not.toBe(t2);
  });

  it('allows for readonly property access', () => {
    const MyType = Record({ a: 1, b: 'foo' });
    const t1 = MyType();
    const a: number = t1.a;
    const b: string = t1.b;
    expect(a).toEqual(1);
    expect(b).toEqual('foo');
    expect(() => ((t1 as any).a = 2)).toThrow(
      'Cannot set on an immutable record.'
    );
  });

  it('allows for class extension', () => {
    class ABClass extends Record({ a: 1, b: 2 }) {
      setA(aVal: number) {
        return this.set('a', aVal);
      }

      setB(bVal: number) {
        return this.set('b', bVal);
      }
    }

    // Note: `new` is only used because of `class`
    const t1 = new ABClass({ a: 1 });
    const t2 = t1.setA(3);
    const t3 = t2.setB(10);

    const a: number = t3.a;
    expect(a).toEqual(3);
    expect(t3.toObject()).toEqual({ a: 3, b: 10 });
  });

  it('does not allow overwriting property names', () => {
    const realWarn = console.warn;

    try {
      const warnings: Array<any> = [];
      console.warn = (w) => warnings.push(w);

      // size is a safe key to use
      const MyType1 = Record({ size: 123 });
      const t1 = MyType1();
      expect(warnings.length).toBe(0);
      expect(t1.size).toBe(123);

      // get() is not safe to use
      const MyType2 = Record({ get: 0 });
      const t2 = MyType2();
      expect(warnings.length).toBe(1);
      expect(warnings[0]).toBe(
        'Cannot define Record with property "get" since that property name is part of the Record API.'
      );
    } finally {
      console.warn = realWarn;
    }
  });

  it('can be converted to a keyed sequence', () => {
    const MyType = Record({ a: 0, b: 0 });
    const t1 = MyType({ a: 10, b: 20 });

    const seq1 = t1.toSeq();
    expect(isKeyed(seq1)).toBe(true);
    expect(seq1.toJS()).toEqual({ a: 10, b: 20 });

    const seq2 = Seq(t1);
    expect(isKeyed(seq2)).toBe(true);
    expect(seq2.toJS()).toEqual({ a: 10, b: 20 });

    const seq3 = Seq.Keyed(t1);
    expect(isKeyed(seq3)).toBe(true);
    expect(seq3.toJS()).toEqual({ a: 10, b: 20 });

    const seq4 = Seq.Indexed(t1);
    expect(isKeyed(seq4)).toBe(false);
    expect(seq4.toJS()).toEqual([
      ['a', 10],
      ['b', 20],
    ]);
  });

  it('can be iterated over', () => {
    const MyType = Record({ a: 0, b: 0 });
    const t1 = MyType({ a: 10, b: 20 });

    const entries: Array<any> = [];
    for (const entry of t1) {
      entries.push(entry);
    }

    expect(entries).toEqual([
      ['a', 10],
      ['b', 20],
    ]);
  });

  it('calling `equals` between two instance of factories with same properties and same value should return true', () => {
    const factoryA = Record({ id: '' });
    const factoryB = Record({ id: '' });

    expect(factoryA().equals(factoryA())).toBe(true);
    expect(factoryA().equals(factoryB())).toBe(true);
  });

  it('check that reset does reset the record. See https://github.com/immutable-js-oss/immutable-js/issues/85 ', () => {
    type UserType = {
      name: string;
      roles: List<string> | Array<string>;
    };

    const User = Record<UserType>({
      name: 'default name',
      roles: List<string>(),
    });

    const user0 = new User({
      name: 'John',
      roles: ['superuser', 'admin'],
    });
    const user1 = user0.clear();

    expect(user1.name).toBe('default name');
    expect(user1.roles).toEqual(List());

    const user2 = user0.withMutations((mutable: Record<UserType>) => {
      mutable.clear();
    });

    expect(user2.name).toBe('default name');
    expect(user2.roles).toEqual(List());
  });

  it('does not accept a Record as constructor', () => {
    const Foo = Record({ foo: 'bar' });
    const fooInstance = Foo();
    expect(() => {
      Record(fooInstance);
    }).toThrowErrorMatchingSnapshot();
  });

  it('does not accept a non object as constructor', () => {
    const defaultValues = null;
    expect(() => {
      Record(defaultValues);
    }).toThrowErrorMatchingSnapshot();
  });

  it('does not accept an immutable object that is not a Record as constructor', () => {
    const defaultValues = Map({ foo: 'bar' });
    expect(() => {
      Record(defaultValues);
    }).toThrowErrorMatchingSnapshot();
  });
});
