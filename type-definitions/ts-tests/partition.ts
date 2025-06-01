/* eslint-disable @typescript-eslint/no-unused-expressions */
import {
  Collection,
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Seq,
  Set,
} from 'immutable';
import { expect, test } from 'tstyche';

abstract class A {}
class B extends A {}

test('Collection', () => {
  type Indexed<T> = Collection.Indexed<T>;
  type Keyed<K, V> = Collection.Keyed<K, V>;
  type Set<T> = Collection.Set<T>;

  (c: Collection<string, number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<
      [Collection<string, number>, Collection<string, number>]
    >();
  };

  (c: Collection<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [Collection<string, A>, Collection<string, B>]
    >();
  };

  (c: Keyed<string, number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<
      [Keyed<string, number>, Keyed<string, number>]
    >();
  };

  (c: Keyed<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [Keyed<string, A>, Keyed<string, B>]
    >();
  };

  (c: Indexed<number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<
      [Indexed<number>, Indexed<number>]
    >();
  };

  (c: Indexed<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [Indexed<A>, Indexed<B>]
    >();
  };

  (c: Set<number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<[Set<number>, Set<number>]>();
  };

  (c: Set<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [Set<A>, Set<B>]
    >();
  };
});

test('Seq', () => {
  type Indexed<T> = Seq.Indexed<T>;
  type Keyed<K, V> = Seq.Keyed<K, V>;
  type Set<T> = Seq.Set<T>;

  (c: Seq<string, number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<
      [Seq<string, number>, Seq<string, number>]
    >();
  };

  (c: Seq<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [Seq<string, A>, Seq<string, B>]
    >();
  };

  (c: Keyed<string, number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<
      [Keyed<string, number>, Keyed<string, number>]
    >();
  };

  (c: Keyed<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [Keyed<string, A>, Keyed<string, B>]
    >();
  };

  (c: Indexed<number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<
      [Indexed<number>, Indexed<number>]
    >();
  };

  (c: Indexed<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [Indexed<A>, Indexed<B>]
    >();
  };

  (c: Set<number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<[Set<number>, Set<number>]>();
  };

  (c: Set<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [Set<A>, Set<B>]
    >();
  };
});

test('Map', () => {
  (c: Map<string, number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<
      [Map<string, number>, Map<string, number>]
    >();
  };

  (c: Map<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [Map<string, A>, Map<string, B>]
    >();
  };
});

test('OrderedMap', () => {
  (c: OrderedMap<string, number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<
      [OrderedMap<string, number>, OrderedMap<string, number>]
    >();
  };

  (c: OrderedMap<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [OrderedMap<string, A>, OrderedMap<string, B>]
    >();
  };
});

test('List', () => {
  (c: List<number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<[List<number>, List<number>]>();
  };

  (c: List<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [List<A>, List<B>]
    >();
  };
});

test('Set', () => {
  (c: Set<number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<[Set<number>, Set<number>]>();
  };

  (c: Set<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [Set<A>, Set<B>]
    >();
  };
});

test('OrderedSet', () => {
  (c: OrderedSet<number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<
      [OrderedSet<number>, OrderedSet<number>]
    >();
  };

  (c: OrderedSet<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [OrderedSet<A>, OrderedSet<B>]
    >();
  };
});
