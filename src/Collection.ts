import { reduce } from './CollectionHelperMethods';
import {
  ITERATE_ENTRIES,
  ITERATE_KEYS,
  ITERATE_VALUES,
  type IteratorType,
} from './Iterator';
import { IndexedSeq, KeyedSeq, Seq, SetSeq } from './Seq';
import { NOT_SET, returnTrue, wrapIndex } from './TrieUtils';
import type ValueObject from './ValueObject';
import { is } from './is';
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

  entries(): IterableIterator<[K, V]> {
    return this.__iterator(ITERATE_ENTRIES);
  }

  keys(): IterableIterator<K> {
    return this.__iterator(ITERATE_KEYS);
  }

  values(): IterableIterator<V> {
    return this.__iterator(ITERATE_VALUES);
  }

  some(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): boolean {
    assertNotInfinite(this.size);
    let returnValue = false;

    this.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        returnValue = true;
        return false;
      }
    });

    return returnValue;
  }

  forEach(
    sideEffect: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): number {
    assertNotInfinite(this.size);

    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
  }

  findEntry(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): [K, V] | undefined {
    let found = notSetValue as [K, V] | undefined;

    this.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        found = [k, v];

        return false;
      }
    });

    return found;
  }

  find(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): V | undefined {
    const entry = this.findEntry(predicate, context);

    return entry ? entry[1] : notSetValue;
  }

  findKey(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): K | undefined {
    const entry = this.findEntry(predicate, context);

    return entry && entry[0];
  }

  keyOf(searchValue: V): K | undefined {
    return this.findKey((value) => is(value, searchValue));
  }

  first<NSV>(notSetValue: NSV): V | NSV;
  first(): V | undefined;
  first(notSetValue?: unknown): unknown {
    return this.find(returnTrue, null, notSetValue as V | undefined);
  }

  get<NSV>(searchKey: K, notSetValue: NSV): V | NSV;
  get(searchKey: K): V | undefined;
  get(searchKey: K, notSetValue?: unknown): unknown {
    return this.find(
      (_, key) => is(key, searchKey),
      undefined,
      notSetValue as V | undefined
    );
  }

  has(searchKey: K): boolean {
    return (
      this.get(searchKey, NOT_SET as unknown as V) !== (NOT_SET as unknown as V)
    );
  }

  includes(searchValue: V): boolean {
    return this.some((value) => is(value, searchValue));
  }

  isEmpty(): boolean {
    return this.size !== undefined ? this.size === 0 : !this.some(returnTrue);
  }

  isSubset(iter: Iterable<V>): boolean {
    // TODO better types !
    const c =
      typeof (iter as unknown as { includes?: unknown })?.includes ===
      'function'
        ? (iter as unknown as CollectionImpl<unknown, V>)
        : (Collection(iter as never) as unknown as CollectionImpl<unknown, V>);

    return this.every((value) => c.includes(value));
  }

  isSuperset(iter: Iterable<V>): boolean {
    // TODO better types !
    const c =
      typeof (iter as unknown as { isSubset?: unknown })?.isSubset ===
      'function'
        ? (iter as unknown as CollectionImpl<unknown, V>)
        : (Collection(iter as never) as unknown as CollectionImpl<unknown, V>);

    return c.isSubset(this as unknown as Iterable<V>);
  }

  join(separator?: string): string {
    assertNotInfinite(this.size);
    const sep = separator !== undefined ? '' + separator : ',';
    let joined = '';
    let isFirst = true;

    this.__iterate((v) => {
      if (isFirst) {
        isFirst = false;
      } else {
        joined += sep;
      }
      joined += v !== null && v !== undefined ? v.toString() : '';
    });

    return joined;
  }

  reduce<R>(
    reducer: (reduction: R, value: V, key: K, iter: this) => R,
    initialReduction: R,
    context?: unknown
  ): R;
  reduce<R>(reducer: (reduction: V | R, value: V, key: K, iter: this) => R): R;
  reduce<R>(
    reducer: (reduction: V | R, value: V, key: K, iter: this) => R,
    initialReduction?: R,
    context?: unknown
  ): R {
    return reduce(
      this,
      // @ts-expect-error reducer is (reduction: V | R, value: V, key: K, iter: this) => R, but CollectionImpl<unknown, unknown> is expected
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      false
    ) as R; // TODO need better types for `reduce`
  }

  reduceRight<R>(
    reducer: (reduction: R, value: V, key: K, iter: this) => R,
    initialReduction: R,
    context?: unknown
  ): R;
  reduceRight<R>(
    reducer: (reduction: V | R, value: V, key: K, iter: this) => R
  ): R;
  reduceRight<R>(
    reducer: (reduction: V | R, value: V, key: K, iter: this) => R,
    initialReduction?: R,
    context?: unknown
  ): R {
    return reduce(
      this,
      // @ts-expect-error reducer is (reduction: V | R, value: V, key: K, iter: this) => R, but CollectionImpl<unknown, unknown> is expected
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      true
    ) as R; // TODO need better types for `reduceRight`
  }

  update<R>(updater: (value: this) => R): R {
    return updater(this);
  }

  __iterate(
    fn: (value: V, index: K, iter: this) => unknown,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reverse: boolean = false
  ): number {
    throw new Error(
      'CollectionImpl does not implement __iterate. Use a subclass instead.'
    );
  }

  __iterator(
    type: typeof ITERATE_ENTRIES,
    reverse?: boolean
  ): IterableIterator<[K, V]>;
  __iterator(type: typeof ITERATE_KEYS, reverse?: boolean): IterableIterator<K>;
  __iterator(
    type: typeof ITERATE_VALUES,
    reverse?: boolean
  ): IterableIterator<V>;
  __iterator(
    type: IteratorType,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reverse: boolean = false
  ): IterableIterator<K | V | [K, V]> {
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
  return isIndexed<T>(value) ? value : IndexedSeq(value);
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

  findIndex(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): number {
    const entry = this.findEntry(predicate, context);
    return entry ? entry[0] : -1;
  }

  indexOf(searchValue: T): number {
    const key = this.keyOf(searchValue);
    return key === undefined ? -1 : key;
  }

  override first<NSV>(notSetValue: NSV): T | NSV;
  override first(): T | undefined;
  override first(notSetValue?: unknown): unknown {
    return this.get(0, notSetValue as T | undefined);
  }

  last<NSV>(notSetValue: NSV): T | NSV;
  last(): T | undefined;
  last(notSetValue?: unknown): unknown {
    return this.get(-1, notSetValue as T | undefined);
  }

  override get<NSV>(index: number, notSetValue: NSV): T | NSV;
  override get(index: number): T | undefined;
  override get(index: number, notSetValue?: unknown): unknown {
    index = wrapIndex(this, index);
    return index < 0 ||
      this.size === Infinity ||
      (this.size !== undefined && index > this.size)
      ? notSetValue
      : this.find(
          (_, key) => key === index,
          undefined,
          notSetValue as T | undefined
        );
  }

  override has(index: number): boolean {
    index = wrapIndex(this, index);
    return (
      index >= 0 &&
      (this.size !== undefined
        ? this.size === Infinity || index < this.size
        : this.indexOf(index as unknown as T) !== -1)
    );
  }
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
