import { IndexedSeq, KeyedSeq, KeyedSeqImpl, Seq, SetSeq } from './Seq';
import type ValueObject from './ValueObject';
import { isAssociative } from './predicates/isAssociative';
import { isCollection } from './predicates/isCollection';
import { isIndexed } from './predicates/isIndexed';
import { isKeyed } from './predicates/isKeyed';

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

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export class CollectionImpl<K, V> implements ValueObject {
  declare equals: (other: unknown) => boolean;

  declare hashCode: () => number;
}

/**
 * Always returns a Seq.Keyed, if input is not keyed, expects an
 * collection of [K, V] tuples.
 *
 * Note: `Seq.Keyed` is a conversion function and not a class, and does not
 * use the `new` keyword during construction.
 */
export function Keyed<K, V>(
  collection?: Iterable<[K, V]>
): KeyedCollectionImpl<K, V>;
export function Keyed<V>(obj: {
  [key: string]: V;
}): KeyedCollectionImpl<string, V>;
export function Keyed(value: unknown): KeyedCollectionImpl<unknown, unknown> {
  return isKeyed(value) ? value : KeyedSeq(value);
}

export class KeyedCollectionImpl<K, V> extends CollectionImpl<K, V> {}

export function IndexedCollection(value) {
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

export function SetCollection(value) {
  return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
}

export class SetCollectionImpl<T> extends CollectionImpl<T, T> {}

Collection.Keyed = Keyed;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;
