// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.
// The source does not emit the public type names (`Collection.Keyed<K, V>`, …)
// yet, so the assertions reference the internal `*Impl` classes imported
// straight from the source; switch back to the public names once they exist.

/* eslint-disable @typescript-eslint/no-unused-expressions */
import { List, Map, OrderedMap, OrderedSet, Set } from 'immutable';
import { expect, test } from 'tstyche';
import type {
  CollectionImpl,
  IndexedCollectionImpl,
  KeyedCollectionImpl,
  SetCollectionImpl,
} from '../../src/Collection';
import type {
  IndexedSeqImpl,
  KeyedSeqImpl,
  SeqImpl,
  SetSeqImpl,
} from '../../src/Seq';

abstract class A {}
class B extends A {}

test('Collection', () => {
  type Indexed<T> = IndexedCollectionImpl<T>;
  type Keyed<K, V> = KeyedCollectionImpl<K, V>;
  type Set<T> = SetCollectionImpl<T>;

  (c: CollectionImpl<string, number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<
      [CollectionImpl<string, number>, CollectionImpl<string, number>]
    >();
  };

  (c: CollectionImpl<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [CollectionImpl<string, A>, CollectionImpl<string, B>]
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
  type Indexed<T> = IndexedSeqImpl<T>;
  type Keyed<K, V> = KeyedSeqImpl<K, V>;
  type Set<T> = SetSeqImpl<T>;

  (c: SeqImpl<string, number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<
      [SeqImpl<string, number>, SeqImpl<string, number>]
    >();
  };

  (c: SeqImpl<string, A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [SeqImpl<string, A>, SeqImpl<string, B>]
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

test.skip('Map', () => {
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

test.skip('OrderedMap', () => {
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

test.skip('List', () => {
  (c: List<number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<[List<number>, List<number>]>();
  };

  (c: List<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [List<A>, List<B>]
    >();
  };
});

test.skip('Set', () => {
  (c: Set<number>) => {
    expect(c.partition((x) => x % 2)).type.toBe<[Set<number>, Set<number>]>();
  };

  (c: Set<A>) => {
    expect(c.partition((x): x is B => x instanceof B)).type.toBe<
      [Set<A>, Set<B>]
    >();
  };
});

test.skip('OrderedSet', () => {
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
