import { ITERATE_ENTRIES, type IteratorType } from './Iterator';
import { IndexedSeq, KeyedSeq, Seq, SetSeq } from './Seq';
import type ValueObject from './ValueObject';
import { isAssociative } from './predicates/isAssociative';
import { isCollection } from './predicates/isCollection';
import { isIndexed } from './predicates/isIndexed';
import { isKeyed } from './predicates/isKeyed';
import assertNotInfinite from './utils/assertNotInfinite';
import deepEqual from './utils/deepEqual';
import { hashCollection } from './utils/hashCollection';

export function Collection<I extends CollectionImpl<unknown, unknown>>(
  collection: I
): I;
export function Collection<T>(
  collection: Iterable<T> | ArrayLike<T>
): IndexedCollectionImpl<T>;
export function Collection<V>(obj: {
  [key: string]: V;
}): KeyedCollectionImpl<string, V>;
export function Collection<K = unknown, V = unknown>(
  value: never
): CollectionImpl<K, V>;
export function Collection(value: unknown): CollectionImpl<unknown, unknown> {
  return isCollection(value) ? value : Seq(value);
}

export class CollectionImpl<K, V> implements ValueObject {
  private __hash: number | undefined;

  size: number = 0;

  equals(other: unknown): boolean {
    return deepEqual(this, other);
  }

  hashCode() {
    return this.__hash || (this.__hash = hashCollection(this));
  }

  every(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: CollectionImpl<K, V>
  ): boolean {
    assertNotInfinite(this.size);
    let returnValue = true;
    this.__iterate((v, k, c) => {
      if (!predicate.call(context, v, k, c)) {
        returnValue = false;
        return false;
      }
    });
    return returnValue;
  }

  entries() {
    return this.__iterator(ITERATE_ENTRIES);
  }

  __iterate(
    fn: (value: V, index: K, iter: this) => boolean,
    reverse?: boolean
  ): number;
  __iterate(
    fn: (value: V, index: K, iter: this) => void,
    reverse?: boolean
  ): void;
  __iterate(
    fn: (value: V, index: K, iter: this) => boolean | void,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reverse: boolean = false
  ): number | void {
    throw new Error(
      'CollectionImpl does not implement __iterate. Use a subclass instead.'
    );
  }

  __iterator(
    type: IteratorType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reverse: boolean = false
  ): Iterator<K | V | [K, V]> {
    throw new Error(
      'CollectionImpl does not implement __iterator. Use a subclass instead.'
    );
  }
}

/**
 * Always returns a Seq.Keyed, if input is not keyed, expects an
 * collection of [K, V] tuples.
 *
 * Note: `Seq.Keyed` is a conversion function and not a class, and does not
 * use the `new` keyword during construction.
 */
export function KeyedCollection<K, V>(
  collection?: Iterable<[K, V]>
): KeyedCollectionImpl<K, V>;
export function KeyedCollection<V>(obj: {
  [key: string]: V;
}): KeyedCollectionImpl<string, V>;
export function KeyedCollection(
  value: unknown
): KeyedCollectionImpl<unknown, unknown> {
  return isKeyed(value) ? value : KeyedSeq(value);
}

export class KeyedCollectionImpl<K, V> extends CollectionImpl<K, V> {}

export function IndexedCollection<T>(
  value: Iterable<T> | ArrayLike<T>
): IndexedCollectionImpl<T> {
  return isIndexed(value) ? value : IndexedSeq(value);
}

/**
 * Interface representing all oredered collections.
 * This includes `List`, `Stack`, `Map`, `OrderedMap`, `Set`, and `OrderedSet`.
 * return of `isOrdered()` return true in that case.
 */
interface OrderedCollection<T> {
  /**
   * Shallowly converts this collection to an Array.
   */
  toArray(): Array<T>;

  [Symbol.iterator](): IterableIterator<T>;
}

export class IndexedCollectionImpl<T>
  extends CollectionImpl<number, T>
  implements OrderedCollection<T>
{
  declare toArray: () => T[];

  declare [Symbol.iterator]: () => IterableIterator<T>;
}

export function SetCollection<T>(
  value: Iterable<T> | ArrayLike<T>
): SetCollectionImpl<T> {
  return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
}

export class SetCollectionImpl<T> extends CollectionImpl<T, T> {}

Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;
