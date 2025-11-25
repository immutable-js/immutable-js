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
export function Collection<T>(
  value: Iterable<T> | ArrayLike<T> | { [key: string]: T } | never
): CollectionImpl<number, T> | CollectionImpl<string, T> {
  return isCollection<number, T>(value) ? value : Seq(value);
}

/**
 * The `Collection` is a set of (key, value) entries which can be iterated, and
 * is the base class for all collections in `immutable`, allowing them to
 * make use of all the Collection methods (such as `map` and `filter`).
 *
 * Note: A collection is always iterated in the same order, however that order
 * may not always be well defined, as is the case for the `Map` and `Set`.
 *
 * Collection is the abstract base class for concrete data structures. It
 * cannot be constructed directly.
 *
 * Implementations should extend one of the subclasses, `Collection.Keyed`,
 * `Collection.Indexed`, or `Collection.Set`.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CollectionImpl<K, V> {
  // Value equality

  /**
   * True if this and the other Collection have value equality, as defined
   * by `Immutable.is()`.
   *
   * Note: This is equivalent to `Immutable.is(this, other)`, but provided to
   * allow for chained expressions.
   */
  equals(other: unknown): boolean;

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
  hashCode(): number;

  // Reading values

  /**
   * Returns the value associated with the provided key, or notSetValue if
   * the Collection does not contain this key.
   *
   * Note: it is possible a key may be associated with an `undefined` value,
   * so if `notSetValue` is not provided and this method returns `undefined`,
   * that does not guarantee the key was not found.
   */
  get<NSV>(key: K, notSetValue: NSV): V | NSV;
  get(key: K): V | undefined;

  /**
   * True if a key exists within this `Collection`, using `Immutable.is`
   * to determine equality
   */
  has(key: K): boolean;

  /**
   * True if a value exists within this `Collection`, using `Immutable.is`
   * to determine equality
   * @alias contains
   */
  includes(value: V): boolean;
  contains(value: V): boolean;

  /**
   * In case the `Collection` is not empty returns the first element of the
   * `Collection`.
   * In case the `Collection` is empty returns the optional default
   * value if provided, if no default value is provided returns undefined.
   */
  first<NSV>(notSetValue: NSV): V | NSV;
  first(): V | undefined;

  /**
   * In case the `Collection` is not empty returns the last element of the
   * `Collection`.
   * In case the `Collection` is empty returns the optional default
   * value if provided, if no default value is provided returns undefined.
   */
  last<NSV>(notSetValue: NSV): V | NSV;
  last(): V | undefined;

  // Reading deep values

  /**
   * Returns the value found by following a path of keys or indices through
   * nested Collections.
   *
   * Plain JavaScript Object or Arrays may be nested within an Immutable.js
   * Collection, and getIn() can access those values as well:
   */
  getIn(searchKeyPath: Iterable<unknown>, notSetValue?: unknown): unknown;

  /**
   * True if the result of following a path of keys or indices through nested
   * Collections results in a set value.
   */
  hasIn(searchKeyPath: Iterable<unknown>): boolean;

  // Persistent changes

  /**
   * This can be very useful as a way to "chain" a normal function into a
   * sequence of methods. RxJS calls this "let" and lodash calls it "thru".
   *
   * For example, to sum a Seq after mapping and filtering:
   */
  update<R>(updater: (value: this) => R): R;

  // Conversion to JavaScript types

  /**
   * Deeply converts this Collection to equivalent native JavaScript Array or Object.
   *
   * `Collection.Indexed`, and `Collection.Set` become `Array`, while
   * `Collection.Keyed` become `Object`, converting keys to Strings.
   */
  toJS(): Array<any> | { [key in PropertyKey]: any };

  /**
   * Shallowly converts this Collection to equivalent native JavaScript Array or Object.
   *
   * `Collection.Indexed`, and `Collection.Set` become `Array`, while
   * `Collection.Keyed` become `Object`, converting keys to Strings.
   */
  toJSON(): Array<V> | { [key in PropertyKey]: V };

  /**
   * Shallowly converts this collection to an Array.
   *
   * `Collection.Indexed`, and `Collection.Set` produce an Array of values.
   * `Collection.Keyed` produce an Array of [key, value] tuples.
   */
  toArray(): Array<V> | Array<[K, V]>;

  /**
   * Shallowly converts this Collection to an Object.
   *
   * Converts keys to Strings.
   */
  toObject(): { [key: string]: V };

  // Conversion to Collections
  toMap(): any;
  toOrderedMap(): any;
  toSet(): any;
  toOrderedSet(): any;
  toList(): any;
  toStack(): any;

  // Conversion to Seq
  toSeq(): any;
  toKeyedSeq(): any;
  toIndexedSeq(): any;
  toSetSeq(): any;

  // Iterators
  keys(): IterableIterator<K>;
  values(): IterableIterator<V>;
  entries(): IterableIterator<[K, V]>;
  [Symbol.iterator](): IterableIterator<unknown>;

  // Collections (Seq)
  keySeq(): any;
  valueSeq(): any;
  entrySeq(): any;

  // Sequence algorithms
  map<M>(mapper: (value: V, key: K, iter: this) => M, context?: unknown): any;
  map(...args: Array<never>): unknown;
  filter<F extends V>(
    predicate: (value: V, key: K, iter: this) => value is F,
    context?: unknown
  ): CollectionImpl<K, F>;
  filter(
    predicate: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): this;
  filterNot(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this;
  partition<F extends V, C>(
    predicate: (this: C, value: V, key: K, iter: this) => value is F,
    context?: C
  ): [CollectionImpl<K, V>, CollectionImpl<K, F>];
  partition<C>(
    predicate: (this: C, value: V, key: K, iter: this) => unknown,
    context?: C
  ): [this, this];
  reverse(): this;
  sort(comparator?: (valueA: V, valueB: V) => number): this;
  sortBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: (valueA: C, valueB: C) => number
  ): this;
  groupBy<G>(
    grouper: (value: V, key: K, iter: this) => G,
    context?: unknown
  ): any;

  // Side effects
  forEach(
    sideEffect: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): number;

  // Creating subsets
  slice(begin?: number, end?: number): this;
  rest(): this;
  butLast(): this;
  skip(amount: number): this;
  skipLast(amount: number): this;
  skipWhile(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this;
  skipUntil(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this;
  take(amount: number): this;
  takeLast(amount: number): this;
  takeWhile(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this;
  takeUntil(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this;

  // Combination
  concat(
    ...valuesOrCollections: Array<unknown>
  ): CollectionImpl<unknown, unknown>;
  flatten(depth?: number): CollectionImpl<unknown, unknown>;
  flatten(shallow?: boolean): CollectionImpl<unknown, unknown>;
  flatMap<M>(
    mapper: (value: V, key: K, iter: this) => Iterable<M>,
    context?: unknown
  ): CollectionImpl<K, M>;
  flatMap<KM, VM>(
    mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
    context?: unknown
  ): CollectionImpl<KM, VM>;

  // Reducing a value
  reduce<R>(
    reducer: (reduction: R, value: V, key: K, iter: this) => R,
    initialReduction: R,
    context?: unknown
  ): R;
  reduce<R>(reducer: (reduction: V | R, value: V, key: K, iter: this) => R): R;
  reduceRight<R>(
    reducer: (reduction: R, value: V, key: K, iter: this) => R,
    initialReduction: R,
    context?: unknown
  ): R;
  reduceRight<R>(
    reducer: (reduction: V | R, value: V, key: K, iter: this) => R
  ): R;
  every(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): boolean;
  some(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): boolean;
  join(separator?: string): string;
  isEmpty(): boolean;
  count(): number;
  count(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): number;
  countBy<G>(
    grouper: (value: V, key: K, iter: this) => G,
    context?: unknown
  ): any;

  // Search for value
  find(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): V | undefined;
  findLast(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): V | undefined;
  findEntry(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): [K, V] | undefined;
  findLastEntry(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): [K, V] | undefined;
  findKey(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): K | undefined;
  findLastKey(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): K | undefined;
  keyOf(searchValue: V): K | undefined;
  lastKeyOf(searchValue: V): K | undefined;
  max(comparator?: (valueA: V, valueB: V) => number): V | undefined;
  maxBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: (valueA: C, valueB: C) => number
  ): V | undefined;
  min(comparator?: (valueA: V, valueB: V) => number): V | undefined;
  minBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: (valueA: C, valueB: C) => number
  ): V | undefined;

  // Comparison
  isSubset(iter: Iterable<V>): boolean;
  isSuperset(iter: Iterable<V>): boolean;

  // Internal methods (not in public d.ts but needed for implementation)
  toString(): string;
  __toString(head: string, tail: string): string;
  __toStringMapper(v: unknown, k?: unknown): string;
  fromEntrySeq(): any;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- as all methods are injected with a mixin
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

/**
 * Keyed Collections have discrete keys tied to each value.
 *
 * When iterating `Collection.Keyed`, each iteration will yield a `[K, V]`
 * tuple, in other words, `Collection#entries` is the default iterator for
 * Keyed Collections.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface KeyedCollectionImpl<K, V> {
  // Conversion to JavaScript types

  /**
   * Deeply converts this Keyed collection to equivalent native JavaScript Object.
   *
   * Converts keys to Strings.
   */
  toJS(): { [key in PropertyKey]: any };

  /**
   * Shallowly converts this Keyed collection to equivalent native JavaScript Object.
   *
   * Converts keys to Strings.
   */
  toJSON(): { [key in PropertyKey]: V };

  /**
   * Shallowly converts this collection to an Array.
   */
  toArray(): Array<[K, V]>;

  // Conversion to Seq

  /**
   * Returns Seq.Keyed.
   * @override
   */
  toSeq(): any;

  // Sequence functions

  /**
   * Returns a new Collection.Keyed of the same type where the keys and values
   * have been flipped.
   */
  flip(): KeyedCollectionImpl<V, K>;
  concat<KC, VC>(
    ...collections: Array<Iterable<[KC, VC]>>
  ): KeyedCollectionImpl<K | KC, V | VC>;
  concat<C>(
    ...collections: Array<{ [key: string]: C }>
  ): KeyedCollectionImpl<K | string, V | C>;
  map<M>(
    mapper: (value: V, key: K, iter: this) => M,
    context?: unknown
  ): KeyedCollectionImpl<K, M>;
  mapKeys<M>(
    mapper: (key: K, value: V, iter: this) => M,
    context?: unknown
  ): KeyedCollectionImpl<M, V>;
  mapEntries<KM, VM>(
    mapper: (entry: [K, V], index: number, iter: this) => [KM, VM] | undefined,
    context?: unknown
  ): KeyedCollectionImpl<KM, VM>;
  flatMap<KM, VM>(
    mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
    context?: unknown
  ): KeyedCollectionImpl<KM, VM>;
  filter<F extends V>(
    predicate: (value: V, key: K, iter: this) => value is F,
    context?: unknown
  ): KeyedCollectionImpl<K, F>;
  filter(
    predicate: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): this;
  partition<F extends V, C>(
    predicate: (this: C, value: V, key: K, iter: this) => value is F,
    context?: C
  ): [KeyedCollectionImpl<K, V>, KeyedCollectionImpl<K, F>];
  partition<C>(
    predicate: (this: C, value: V, key: K, iter: this) => unknown,
    context?: C
  ): [this, this];

  [Symbol.iterator](): IterableIterator<[K, V]>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- as all methods are injected with a mixin
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

/**
 * Indexed Collections have incrementing numeric keys. They exhibit
 * slightly different behavior than `Collection.Keyed` for some methods in order
 * to better mirror the behavior of JavaScript's `Array`, and add methods
 * which do not make sense on non-indexed Collections such as `indexOf`.
 *
 * Unlike JavaScript arrays, `Collection.Indexed`s are always dense. "Unset"
 * indices and `undefined` indices are indistinguishable, and all indices from
 * 0 to `size` are visited when iterated.
 *
 * All Collection.Indexed methods return re-indexed Collections. In other words,
 * indices always start at 0 and increment until size. If you wish to
 * preserve indices, using them as keys, convert to a Collection.Keyed by
 * calling `toKeyedSeq`.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IndexedCollectionImpl<T> {
  // Conversion to JavaScript types

  /**
   * Deeply converts this Indexed collection to equivalent native JavaScript Array.
   */
  toJS(): Array<any>;

  /**
   * Shallowly converts this Indexed collection to equivalent native JavaScript Array.
   */
  toJSON(): Array<T>;

  /**
   * Shallowly converts this collection to an Array.
   */
  toArray(): Array<T>;

  // Reading values

  /**
   * Returns the value associated with the provided index, or notSetValue if
   * the index is beyond the bounds of the Collection.
   *
   * `index` may be a negative number, which indexes back from the end of the
   * Collection. `s.get(-1)` gets the last item in the Collection.
   */
  get<NSV>(index: number, notSetValue: NSV): T | NSV;
  get(index: number): T | undefined;

  // Conversion to Seq

  /**
   * Returns Seq.Indexed.
   * @override
   */
  toSeq(): any;
  fromEntrySeq(): any;

  // Combination
  interpose(separator: T): this;
  interleave(...collections: Array<CollectionImpl<unknown, T>>): this;
  splice(index: number, removeNum: number, ...values: Array<T>): this;
  zip<U>(other: CollectionImpl<unknown, U>): IndexedCollectionImpl<[T, U]>;
  zip<U, V>(
    other: CollectionImpl<unknown, U>,
    other2: CollectionImpl<unknown, V>
  ): IndexedCollectionImpl<[T, U, V]>;
  zip(
    ...collections: Array<CollectionImpl<unknown, unknown>>
  ): IndexedCollectionImpl<unknown>;
  zipAll<U>(other: CollectionImpl<unknown, U>): IndexedCollectionImpl<[T, U]>;
  zipAll<U, V>(
    other: CollectionImpl<unknown, U>,
    other2: CollectionImpl<unknown, V>
  ): IndexedCollectionImpl<[T, U, V]>;
  zipAll(
    ...collections: Array<CollectionImpl<unknown, unknown>>
  ): IndexedCollectionImpl<unknown>;
  zipWith<U, Z>(
    zipper: (value: T, otherValue: U) => Z,
    otherCollection: CollectionImpl<unknown, U>
  ): IndexedCollectionImpl<Z>;
  zipWith<U, V, Z>(
    zipper: (value: T, otherValue: U, thirdValue: V) => Z,
    otherCollection: CollectionImpl<unknown, U>,
    thirdCollection: CollectionImpl<unknown, V>
  ): IndexedCollectionImpl<Z>;
  zipWith<Z>(
    zipper: (...values: Array<unknown>) => Z,
    ...collections: Array<CollectionImpl<unknown, unknown>>
  ): IndexedCollectionImpl<Z>;

  // Search for value
  indexOf(searchValue: T): number;
  lastIndexOf(searchValue: T): number;
  findIndex(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): number;
  findLastIndex(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): number;

  // Sequence algorithms
  concat<C>(
    ...valuesOrCollections: Array<Iterable<C> | C>
  ): IndexedCollectionImpl<T | C>;
  map<M>(
    mapper: (value: T, key: number, iter: this) => M,
    context?: unknown
  ): IndexedCollectionImpl<M>;
  flatMap<M>(
    mapper: (value: T, key: number, iter: this) => Iterable<M>,
    context?: unknown
  ): IndexedCollectionImpl<M>;
  filter<F extends T>(
    predicate: (value: T, index: number, iter: this) => value is F,
    context?: unknown
  ): IndexedCollectionImpl<F>;
  filter(
    predicate: (value: T, index: number, iter: this) => unknown,
    context?: unknown
  ): this;
  partition<F extends T, C>(
    predicate: (this: C, value: T, index: number, iter: this) => value is F,
    context?: C
  ): [IndexedCollectionImpl<T>, IndexedCollectionImpl<F>];
  partition<C>(
    predicate: (this: C, value: T, index: number, iter: this) => unknown,
    context?: C
  ): [this, this];

  [Symbol.iterator](): IterableIterator<T>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- as all methods are injected with a mixin
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
  return isCollection(value) && !isAssociative(value)
    ? (value as SetCollectionImpl<T>)
    : SetSeq(value);
}

/**
 * Set Collections only represent values. They have no associated keys or
 * indices. Duplicate values are possible in the lazy `Seq.Set`s, however
 * the concrete `Set` Collection does not allow duplicate values.
 *
 * Collection methods on Collection.Set such as `map` and `forEach` will provide
 * the value as both the first and second arguments to the provided function.
 *
 * ```js
 * import { Collection } from 'immutable'
 * const seq = Collection.Set([ 'A', 'B', 'C' ])
 * // Seq { "A", "B", "C" }
 * seq.forEach((v, k) =>
 *  assert.equal(v, k)
 * )
 * ```
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface SetCollectionImpl<T> {
  // Conversion to JavaScript types

  /**
   * Deeply converts this Set collection to equivalent native JavaScript Array.
   */
  toJS(): Array<any>;

  /**
   * Shallowly converts this Set collection to equivalent native JavaScript Array.
   */
  toJSON(): Array<T>;

  /**
   * Shallowly converts this collection to an Array.
   */
  toArray(): Array<T>;

  // Conversion to Seq

  /**
   * Returns Seq.Set.
   * @override
   */
  toSeq(): any;

  // Sequence algorithms
  concat<U>(...collections: Array<Iterable<U>>): SetCollectionImpl<T | U>;
  map<M>(
    mapper: (value: T, key: T, iter: this) => M,
    context?: unknown
  ): SetCollectionImpl<M>;
  flatMap<M>(
    mapper: (value: T, key: T, iter: this) => Iterable<M>,
    context?: unknown
  ): SetCollectionImpl<M>;
  filter<F extends T>(
    predicate: (value: T, key: T, iter: this) => value is F,
    context?: unknown
  ): SetCollectionImpl<F>;
  filter(
    predicate: (value: T, key: T, iter: this) => unknown,
    context?: unknown
  ): this;
  partition<F extends T, C>(
    predicate: (this: C, value: T, key: T, iter: this) => value is F,
    context?: C
  ): [SetCollectionImpl<T>, SetCollectionImpl<F>];
  partition<C>(
    predicate: (this: C, value: T, key: T, iter: this) => unknown,
    context?: C
  ): [this, this];

  [Symbol.iterator](): IterableIterator<T>;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- as all methods are injected with a mixin
export class SetCollectionImpl<T> extends CollectionImpl<T, T> {}

Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;
