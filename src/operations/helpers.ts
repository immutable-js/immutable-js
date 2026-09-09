import {
  IndexedCollection,
  IndexedCollectionImpl,
  KeyedCollection,
  KeyedCollectionImpl,
  SetCollection,
  SetCollectionImpl,
  type CollectionImpl,
} from '../Collection';
import { IndexedSeqImpl, KeyedSeqImpl, SeqImpl, SetSeqImpl } from '../Seq';
import { isIndexed } from '../predicates/isIndexed';
import { isKeyed } from '../predicates/isKeyed';
import { isSeq } from '../predicates/isSeq';

// A concrete collection (List, Map, …) exposes a `create` factory used to
// rebuild an instance from a reified sequence; a lazy Seq does not.
interface Reifiable<C> {
  create?: (seq: CollectionImpl<unknown, unknown>) => C;
  constructor: (seq: CollectionImpl<unknown, unknown>) => C;
}

/**
 * Reconstructs a collection from the lazy `seq`, keeping the concrete kind of
 * `iter` but the type of `seq` — operation factories produce a `seq` already
 * typed with the resulting key/value types, so the result follows `seq`. When
 * `iter` is itself a `Seq`, the lazy sequence is returned as-is.
 */
export function reify<S extends CollectionImpl<unknown, unknown>>(
  iter: CollectionImpl<unknown, unknown>,
  seq: S
): S {
  if (iter === seq || isSeq(iter)) {
    return seq;
  }

  // Dynamic reconstruction through `create`/`constructor` is opaque to the
  // type system; the runtime guarantees the result matches `seq`'s types.
  // TODO in 6.0: change to `factory: Reifiable<S>` and remove the `as unknown` cast
  const factory = iter as unknown as Reifiable<S>;

  return factory.create ? factory.create(seq) : factory.constructor(seq);
}

/**
 * Creates a bare `Seq` instance of the same kind (keyed, indexed or set) as
 * `collection`, to be populated by the calling operation factory.
 */
export function makeSequence<K, V>(
  collection: KeyedCollectionImpl<K, V>
): KeyedSeqImpl<K, V>;
export function makeSequence<T>(
  collection: IndexedCollectionImpl<T>
): IndexedSeqImpl<T>;
export function makeSequence<T>(
  collection: SetCollectionImpl<T>
): SetSeqImpl<T>;
// Unknown-kind collection: the seq kind is only known at runtime.
export function makeSequence(
  collection: CollectionImpl<unknown, unknown>
): SeqImpl<unknown, unknown>;
export function makeSequence(
  collection: CollectionImpl<unknown, unknown>
): SeqImpl<unknown, unknown> {
  return Object.create(
    (isKeyed(collection)
      ? KeyedSeqImpl
      : isIndexed(collection)
        ? IndexedSeqImpl
        : SetSeqImpl
    ).prototype
  );
}

/**
 * Returns the public collection factory matching the kind of `collection`.
 */

export function collectionClass<K, V>(
  collection: KeyedCollectionImpl<K, V>
): typeof KeyedCollection;
export function collectionClass<T>(
  collection: IndexedCollectionImpl<T>
): typeof IndexedCollection<T>;
export function collectionClass<T>(
  collection: SetCollectionImpl<T>
): typeof SetCollection<T>;
// Unknown-kind collection: the factory kind is only known at runtime.
export function collectionClass<K, V>(
  collection: CollectionImpl<K, V>
):
  | typeof KeyedCollection<K, V>
  | typeof IndexedCollection<V>
  | typeof SetCollection<V>;
export function collectionClass<K, V>(
  collection: CollectionImpl<K, V>
):
  | typeof KeyedCollection<K, V>
  | typeof IndexedCollection<V>
  | typeof SetCollection<V> {
  return isKeyed(collection)
    ? KeyedCollection
    : isIndexed(collection)
      ? IndexedCollection
      : SetCollection;
}

/**
 * `cacheResult` implementation shared by operation sequences that wrap another
 * iterable through `_iter`: caching the wrapped iterable also fixes this
 * sequence's `size`.
 */
export function cacheResultThrough(this: {
  _iter: CollectionImpl<unknown, unknown> & { cacheResult?: () => void };
  size: number | undefined;
}): unknown {
  if (this._iter.cacheResult) {
    this._iter.cacheResult();
    this.size = this._iter.size;

    return this;
  }

  return SeqImpl.prototype.cacheResult.call(this);
}

/**
 * Default ordering comparator: sorts with `<`/`>`, placing `undefined` last.
 * Accepts `unknown` so it is usable as a fallback comparator for any value type.
 */
export function defaultComparator(a: unknown, b: unknown): number {
  if (a === undefined && b === undefined) {
    return 0;
  }

  if (a === undefined) {
    return 1;
  }

  if (b === undefined) {
    return -1;
  }

  const x = a ?? 0;
  const y = b ?? 0;

  return x > y ? 1 : x < y ? -1 : 0;
}
