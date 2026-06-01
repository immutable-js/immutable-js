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

  /**
   * True if this and the other Collection have value equality, as defined
   * by `Immutable.is()`.
   *
   * Note: This is equivalent to `Immutable.is(this, other)`, but provided to
   * allow for chained expressions.
   */
  equals(other: unknown): boolean {
    return deepEqual(this, other);
  }

  /**
   * Computes and returns the hashed identity for this Collection.
   *
   * The `hashCode` of a Collection is used to determine potential equality,
   * and is used when adding this to a `Set` or as a key in a `Map`, enabling
   * lookup via a different instance.
   *
   * If two values have the same `hashCode`, they are [not guaranteed
   * to be equal][Hash Collision]. If two values have different `hashCode`s,
   * they must not be equal.
   *
   * [Hash Collision]: https://en.wikipedia.org/wiki/Collision_(computer_science)
   */
  hashCode() {
    return this.__hash || (this.__hash = hashCollection(this));
  }

  /**
   * True if `predicate` returns true for all entries in the Collection.
   */
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

  /**
   * An iterator of this `Collection`'s entries as `[ key, value ]` tuples.
   *
   * Note: this will return an ES6 iterator which does not support
   * Immutable.js sequence algorithms. Use `entrySeq` instead, if this is
   * what you want.
   */
  entries(): IterableIterator<[K, V]> {
    return this.__iterator(ITERATE_ENTRIES);
  }

  /**
   * An iterator of this `Collection`'s keys.
   *
   * Note: this will return an ES6 iterator which does not support
   * Immutable.js sequence algorithms. Use `keySeq` instead, if this is
   * what you want.
   */
  keys(): IterableIterator<K> {
    return this.__iterator(ITERATE_KEYS);
  }

  /**
   * An iterator of this `Collection`'s values.
   *
   * Note: this will return an ES6 iterator which does not support
   * Immutable.js sequence algorithms. Use `valueSeq` instead, if this is
   * what you want.
   */
  values(): IterableIterator<V> {
    return this.__iterator(ITERATE_VALUES);
  }

  /**
   * True if `predicate` returns true for any entry in the Collection.
   */
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

  /**
   * The `sideEffect` is executed for every entry in the Collection.
   *
   * Unlike `Array#forEach`, if any call of `sideEffect` returns
   * `false`, the iteration will stop. Returns the number of entries iterated
   * (including the last iteration which returned false).
   */
  forEach(
    sideEffect: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): number {
    assertNotInfinite(this.size);

    return this.__iterate(context ? sideEffect.bind(context) : sideEffect);
  }

  /**
   * Returns the first [key, value] entry for which the `predicate` returns true.
   */
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

  /**
   * Returns the first value for which the `predicate` returns true.
   */
  find(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): V | undefined {
    const entry = this.findEntry(predicate, context);

    return entry ? entry[1] : notSetValue;
  }

  /**
   * Returns the key for which the `predicate` returns true.
   */
  findKey(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): K | undefined {
    const entry = this.findEntry(predicate, context);

    return entry && entry[0];
  }

  /**
   * Returns the key associated with the search value, or undefined.
   */
  keyOf(searchValue: V): K | undefined {
    return this.findKey((value) => is(value, searchValue));
  }

  /**
   * In case the `Collection` is not empty returns the first element of the
   * `Collection`.
   * In case the `Collection` is empty returns the optional default
   * value if provided, if no default value is provided returns undefined.
   */
  first<NSV>(notSetValue: NSV): V | NSV;
  first(): V | undefined;
  first(notSetValue?: unknown): unknown {
    return this.find(returnTrue, null, notSetValue as V | undefined);
  }

  /**
   * Returns the value associated with the provided key, or notSetValue if
   * the Collection does not contain this key.
   *
   * Note: it is possible a key may be associated with an `undefined` value,
   * so if `notSetValue` is not provided and this method returns `undefined`,
   * that does not guarantee the key was not found.
   */
  get<NSV>(searchKey: K, notSetValue: NSV): V | NSV;
  get(searchKey: K): V | undefined;
  get(searchKey: K, notSetValue?: unknown): unknown {
    return this.find(
      (_, key) => is(key, searchKey),
      undefined,
      notSetValue as V | undefined
    );
  }

  /**
   * True if a key exists within this `Collection`, using `Immutable.is`
   * to determine equality
   */
  has(searchKey: K): boolean {
    return (
      this.get(searchKey, NOT_SET as unknown as V) !== (NOT_SET as unknown as V)
    );
  }

  /**
   * True if a value exists within this `Collection`, using `Immutable.is`
   * to determine equality
   * @alias contains
   */
  includes(searchValue: V): boolean {
    return this.some((value) => is(value, searchValue));
  }

  /**
   * Returns true if this Collection includes no values.
   *
   * For some lazy `Seq`, `isEmpty` might need to iterate to determine
   * emptiness. At most one iteration will occur.
   */
  isEmpty(): boolean {
    return this.size !== undefined ? this.size === 0 : !this.some(returnTrue);
  }

  /**
   * True if `iter` includes every value in this Collection.
   */
  isSubset(iter: Iterable<V>): boolean {
    // TODO better types !
    const c =
      typeof (iter as unknown as { includes?: unknown })?.includes ===
      'function'
        ? (iter as unknown as CollectionImpl<unknown, V>)
        : (Collection(iter as never) as unknown as CollectionImpl<unknown, V>);

    return this.every((value) => c.includes(value));
  }

  /**
   * True if this Collection includes every value in `iter`.
   */
  isSuperset(iter: Iterable<V>): boolean {
    // TODO better types !
    const c =
      typeof (iter as unknown as { isSubset?: unknown })?.isSubset ===
      'function'
        ? (iter as unknown as CollectionImpl<unknown, V>)
        : (Collection(iter as never) as unknown as CollectionImpl<unknown, V>);

    return c.isSubset(this as unknown as Iterable<V>);
  }

  /**
   * Joins values together as a string, inserting a separator between each.
   * The default separator is `","`.
   */
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

  /**
   * Reduces the Collection to a value by calling the `reducer` for every entry
   * in the Collection and passing along the reduced value.
   *
   * If `initialReduction` is not provided, the first item in the
   * Collection will be used.
   *
   * @see `Array#reduce`.
   */
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

  /**
   * Reduces the Collection in reverse (from the right side).
   *
   * Note: Similar to this.reverse().reduce(), and provided for parity
   * with `Array#reduceRight`.
   */
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

  /**
   * This can be very useful as a way to "chain" a normal function into a
   * sequence of methods. RxJS calls this "let" and lodash calls it "thru".
   *
   * For example, to sum a Seq after mapping and filtering:
   */
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

  /**
   * Returns the first index in the Collection where a value satisfies the
   * provided predicate function. Otherwise -1 is returned.
   */
  findIndex(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): number {
    const entry = this.findEntry(predicate, context);
    return entry ? entry[0] : -1;
  }

  /**
   * Returns the first index at which a given value can be found in the
   * Collection, or -1 if it is not present.
   */
  indexOf(searchValue: T): number {
    const key = this.keyOf(searchValue);
    return key === undefined ? -1 : key;
  }

  /**
   * In case the `Collection` is not empty returns the first element of the
   * `Collection`.
   * In case the `Collection` is empty returns the optional default
   * value if provided, if no default value is provided returns undefined.
   */
  override first<NSV>(notSetValue: NSV): T | NSV;
  override first(): T | undefined;
  override first(notSetValue?: unknown): unknown {
    return this.get(0, notSetValue as T | undefined);
  }

  /**
   * In case the `Collection` is not empty returns the last element of the
   * `Collection`.
   * In case the `Collection` is empty returns the optional default
   * value if provided, if no default value is provided returns undefined.
   */
  last<NSV>(notSetValue: NSV): T | NSV;
  last(): T | undefined;
  last(notSetValue?: unknown): unknown {
    return this.get(-1, notSetValue as T | undefined);
  }

  /**
   * Returns the value associated with the provided index, or notSetValue if
   * the index is beyond the bounds of the Collection.
   *
   * `index` may be a negative number, which indexes back from the end of the
   * Collection. `s.get(-1)` gets the last item in the Collection.
   */
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

  /**
   * True if a key exists within this `Collection`, using `Immutable.is`
   * to determine equality
   */
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
