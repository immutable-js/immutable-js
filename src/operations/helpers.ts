import {
  IndexedCollection,
  KeyedCollection,
  SetCollection,
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
 * Reconstructs a concrete collection of the same kind as `iter` from a lazy
 * `seq`. When `iter` is itself a `Seq`, the lazy sequence is returned as-is.
 */
export function reify<C extends CollectionImpl<unknown, unknown>>(
  iter: C,
  seq: CollectionImpl<unknown, unknown>
): C {
  if (iter === seq) {
    return iter;
  }
  if (isSeq(iter)) {
    // `iter` is lazy: the reified result is the sequence itself.
    return seq as C;
  }
  // Dynamic reconstruction through `create`/`constructor` is opaque to the
  // type system; the runtime guarantees the result is of the same kind as `C`.
  const factory = iter as unknown as Reifiable<C>;
  return factory.create ? factory.create(seq) : factory.constructor(seq);
}

/**
 * Creates a bare `Seq` instance of the same kind (keyed, indexed or set) as
 * `collection`, to be populated by the calling operation factory.
 */
export function makeSequence(
  collection: CollectionImpl<unknown, unknown>
): CollectionImpl<unknown, unknown> {
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
export function collectionClass(
  collection: CollectionImpl<unknown, unknown>
): typeof KeyedCollection | typeof IndexedCollection | typeof SetCollection {
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
  const x = a as number | string;
  const y = b as number | string;
  return x > y ? 1 : x < y ? -1 : 0;
}
