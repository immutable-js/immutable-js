import { expect, test } from 'tstyche';
import {
  Collection,
  List,
  Map,
  OrderedMap,
  OrderedSet,
  Seq,
  Set,
} from 'immutable';

abstract class A {}
class B extends A {}

test('Collection', () => {
  type Indexed<T> = Collection.Indexed<T>;
  type Keyed<K, V> = Collection.Keyed<K, V>;
  type Set<T> = Collection.Set<T>;

  (c: Collection<string, number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<
      [Collection<string, number>, Collection<string, number>]
    >();
  };

  (c: Collection<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [Collection<string, A>, Collection<string, B>]
    >();
  };

  (c: Keyed<string, number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<
      [Keyed<string, number>, Keyed<string, number>]
    >();
  };

  (c: Keyed<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [Keyed<string, A>, Keyed<string, B>]
    >();
  };

  (c: Indexed<number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<
      [Indexed<number>, Indexed<number>]
    >();
  };

  (c: Indexed<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [Indexed<A>, Indexed<B>]
    >();
  };

  (c: Set<number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<[Set<number>, Set<number>]>();
  };

  (c: Set<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [Set<A>, Set<B>]
    >();
  };
});

test('Seq', () => {
  type Indexed<T> = Seq.Indexed<T>;
  type Keyed<K, V> = Seq.Keyed<K, V>;
  type Set<T> = Seq.Set<T>;

  (c: Seq<string, number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<
      [Seq<string, number>, Seq<string, number>]
    >();
  };

  (c: Seq<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [Seq<string, A>, Seq<string, B>]
    >();
  };

  (c: Keyed<string, number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<
      [Keyed<string, number>, Keyed<string, number>]
    >();
  };

  (c: Keyed<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [Keyed<string, A>, Keyed<string, B>]
    >();
  };

  (c: Indexed<number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<
      [Indexed<number>, Indexed<number>]
    >();
  };

  (c: Indexed<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [Indexed<A>, Indexed<B>]
    >();
  };

  (c: Set<number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<[Set<number>, Set<number>]>();
  };

  (c: Set<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [Set<A>, Set<B>]
    >();
  };
});

test('Map', () => {
  (c: Map<string, number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<
      [Map<string, number>, Map<string, number>]
    >();
  };

  (c: Map<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [Map<string, A>, Map<string, B>]
    >();
  };
});

test('OrderedMap', () => {
  (c: OrderedMap<string, number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<
      [OrderedMap<string, number>, OrderedMap<string, number>]
    >();
  };

  (c: OrderedMap<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [OrderedMap<string, A>, OrderedMap<string, B>]
    >();
  };
});

test('List', () => {
  (c: List<number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<
      [List<number>, List<number>]
    >();
  };

  (c: List<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [List<A>, List<B>]
    >();
  };
});

test('Set', () => {
  (c: Set<number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<[Set<number>, Set<number>]>();
  };

  (c: Set<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [Set<A>, Set<B>]
    >();
  };
});

test('OrderedSet', () => {
  (c: OrderedSet<number>) => {
    expect(c.partition(x => x % 2)).type.toEqual<
      [OrderedSet<number>, OrderedSet<number>]
    >();
  };

  (c: OrderedSet<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toEqual<
      [OrderedSet<A>, OrderedSet<B>]
    >();
  };
});
