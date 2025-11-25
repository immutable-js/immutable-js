import type { Comparator } from '../type-definitions/comparator';
import type { DeepCopy } from '../type-definitions/deepCopy';
import type {
  List as ListTypeToMigrate,
  OrderedMap as OrderedMapTypeToMigrate,
  OrderedSet as OrderedSetTypeToMigrate,
  Stack as StackTypeToMigrate,
  Seq as SeqTypeToMigrate,
} from '../type-definitions/immutable';
import {
  ITERATE_ENTRIES,
  ITERATE_KEYS,
  ITERATE_VALUES,
  type IteratorType,
} from './Iterator';
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
 * Creates a Collection.
 *
 * The type of Collection created is based on the input.
 *
 *   * If an `Collection`, that same `Collection`.
 *   * If an Array-like, an `Collection.Indexed`.
 *   * If an Object with an Iterator defined, an `Collection.Indexed`.
 *   * If an Object, an `Collection.Keyed`.
 *
 * This methods forces the conversion of Objects and Strings to Collections.
 * If you want to ensure that a Collection of one item is returned, use
 * `Seq.of`.
 *
 * Note: An Iterator itself will be treated as an object, becoming a `Seq.Keyed`,
 * which is usually not what you want. You should turn your Iterator Object into
 * an iterable object by defining a Symbol.iterator (or @@iterator) method which
 * returns `this`.
 *
 * Note: `Collection` is a conversion function and not a class, and does not
 * use the `new` keyword during construction.
 */
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CollectionImpl<K, V> extends ValueObject {
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
  toJS(): Array<DeepCopy<V>> | { [key in PropertyKey]: DeepCopy<V> };

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

  /**
   * Converts this Collection to a Map, Throws if keys are not hashable.
   *
   * Note: This is equivalent to `Map(this.toKeyedSeq())`, but provided
   * for convenience and to allow for chained expressions.
   */
  toMap(): Map<K, V>;

  /**
   * Converts this Collection to a Map, maintaining the order of iteration.
   *
   * Note: This is equivalent to `OrderedMap(this.toKeyedSeq())`, but
   * provided for convenience and to allow for chained expressions.
   */
  toOrderedMap(): OrderedMapTypeToMigrate<K, V>;

  /**
   * Converts this Collection to a Set, discarding keys. Throws if values
   * are not hashable.
   *
   * Note: This is equivalent to `Set(this)`, but provided to allow for
   * chained expressions.
   */
  toSet(): Set<V>;

  /**
   * Converts this Collection to a Set, maintaining the order of iteration and
   * discarding keys.
   *
   * Note: This is equivalent to `OrderedSet(this.valueSeq())`, but provided
   * for convenience and to allow for chained expressions.
   */
  toOrderedSet(): OrderedSetTypeToMigrate<V>;

  /**
   * Converts this Collection to a List, discarding keys.
   *
   * This is similar to `List(collection)`, but provided to allow for chained
   * expressions. However, when called on `Map` or other keyed collections,
   * `collection.toList()` discards the keys and creates a list of only the
   * values, whereas `List(collection)` creates a list of entry tuples.
   */
  toList(): ListTypeToMigrate<V>;

  /**
   * Converts this Collection to a Stack, discarding keys. Throws if values
   * are not hashable.
   *
   * Note: This is equivalent to `Stack(this)`, but provided to allow for
   * chained expressions.
   */
  toStack(): StackTypeToMigrate<V>;

  // Conversion to Seq

  /**
   * Converts this Collection to a Seq of the same kind (indexed,
   * keyed, or set).
   */
  toSeq(): SeqTypeToMigrate<K, V>;

  /**
   * Returns a Seq.Keyed from this Collection where indices are treated as keys.
   *
   * This is useful if you want to operate on an
   * Collection.Indexed and preserve the [index, value] pairs.
   *
   * The returned Seq will have identical iteration order as
   * this Collection.
   */
  toKeyedSeq(): SeqTypeToMigrate.Keyed<K, V>;

  /**
   * Returns an Seq.Indexed of the values of this Collection, discarding keys.
   */
  toIndexedSeq(): SeqTypeToMigrate.Indexed<V>;

  /**
   * Returns a Seq.Set of the values of this Collection, discarding keys.
   */
  toSetSeq(): SeqTypeToMigrate.Set<V>;

  // Iterators

  /**
   * An iterator of this `Collection`'s keys.
   *
   * Note: this will return an ES6 iterator which does not support
   * Immutable.js sequence algorithms. Use `keySeq` instead, if this is
   * what you want.
   */
  keys(): globalThis.Iterator<K>;

  /**
   * An iterator of this `Collection`'s values.
   *
   * Note: this will return an ES6 iterator which does not support
   * Immutable.js sequence algorithms. Use `valueSeq` instead, if this is
   * what you want.
   */
  values(): globalThis.Iterator<V>;

  /**
   * An iterator of this `Collection`'s entries as `[ key, value ]` tuples.
   *
   * Note: this will return an ES6 iterator which does not support
   * Immutable.js sequence algorithms. Use `entrySeq` instead, if this is
   * what you want.
   */
  entries(): globalThis.Iterator<[K, V]>;

  [Symbol.iterator](): IterableIterator<unknown>;

  // Collections (Seq)

  /**
   * Returns a new Seq.Indexed of the keys of this Collection,
   * discarding values.
   */
  keySeq(): SeqTypeToMigrate.Indexed<K>;

  /**
   * Returns an Seq.Indexed of the values of this Collection, discarding keys.
   */
  valueSeq(): SeqTypeToMigrate.Indexed<V>;

  /**
   * Returns a new Seq.Indexed of [key, value] tuples.
   */
  entrySeq(): SeqTypeToMigrate.Indexed<[K, V]>;

  // Sequence algorithms

  /**
   * Returns a new Collection of the same type with values passed through a
   * `mapper` function.
   *
   * Note: `map()` always returns a new instance, even if it produced the same
   * value at every step.
   */
  map<M>(
    mapper: (value: V, key: K, iter: this) => M,
    context?: unknown
  ): CollectionImpl<K, M>;

  /**
   * Note: used only for sets, which return Collection<M, M> but are otherwise
   * identical to normal `map()`.
   *
   * @ignore
   */
  map(...args: Array<never>): unknown;

  /**
   * Returns a new Collection of the same type with only the entries for which
   * the `predicate` function returns true.
   *
   * Note: `filter()` always returns a new instance, even if it results in
   * not filtering out any values.
   */
  filter<F extends V>(
    predicate: (value: V, key: K, iter: this) => value is F,
    context?: unknown
  ): CollectionImpl<K, F>;
  filter(
    predicate: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): this;

  /**
   * Returns a new Collection of the same type with only the entries for which
   * the `predicate` function returns false.
   *
   * Note: `filterNot()` always returns a new instance, even if it results in
   * not filtering out any values.
   */
  filterNot(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this;

  /**
   * Returns a new Collection with the values for which the `predicate`
   * function returns false and another for which is returns true.
   */
  partition<F extends V, C>(
    predicate: (this: C, value: V, key: K, iter: this) => value is F,
    context?: C
  ): [CollectionImpl<K, V>, CollectionImpl<K, F>];
  partition<C>(
    predicate: (this: C, value: V, key: K, iter: this) => unknown,
    context?: C
  ): [this, this];

  /**
   * Returns a new Collection of the same type in reverse order.
   */
  reverse(): this;

  /**
   * Returns a new Collection of the same type which includes the same entries,
   * stably sorted by using a `comparator`.
   *
   * If a `comparator` is not provided, a default comparator uses `<` and `>`.
   *
   * `comparator(valueA, valueB)`:
   *
   *   * Returns `0` if the elements should not be swapped.
   *   * Returns `-1` (or any negative number) if `valueA` comes before `valueB`
   *   * Returns `1` (or any positive number) if `valueA` comes after `valueB`
   *   * Alternatively, can return a value of the `PairSorting` enum type
   *   * Is pure, i.e. it must always return the same value for the same pair
   *     of values.
   *
   * When sorting collections which have no defined order, their ordered
   * equivalents will be returned. e.g. `map.sort()` returns OrderedMap.
   *
   * Note: `sort()` Always returns a new instance, even if the original was
   * already sorted.
   *
   * Note: This is always an eager operation.
   */
  sort(comparator?: Comparator<V>): this;

  /**
   * Like `sort`, but also accepts a `comparatorValueMapper` which allows for
   * sorting by more sophisticated means:
   *
   * Note: `sortBy()` Always returns a new instance, even if the original was
   * already sorted.
   *
   * Note: This is always an eager operation.
   */
  sortBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: Comparator<C>
  ): this;

  /**
   * Returns a `Map` of `Collection`, grouped by the return
   * value of the `grouper` function.
   *
   * Note: This is always an eager operation.
   */
  groupBy<G>(
    grouper: (value: V, key: K, iter: this) => G,
    context?: unknown
  ): Map<G, this>;

  // Side effects

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
  ): number;

  // Creating subsets

  /**
   * Returns a new Collection of the same type representing a portion of this
   * Collection from start up to but not including end.
   *
   * If begin is negative, it is offset from the end of the Collection. e.g.
   * `slice(-2)` returns a Collection of the last two entries. If it is not
   * provided the new Collection will begin at the beginning of this Collection.
   *
   * If end is negative, it is offset from the end of the Collection. e.g.
   * `slice(0, -1)` returns a Collection of everything but the last entry. If
   * it is not provided, the new Collection will continue through the end of
   * this Collection.
   *
   * If the requested slice is equivalent to the current Collection, then it
   * will return itself.
   */
  slice(begin?: number, end?: number): this;

  /**
   * Returns a new Collection of the same type containing all entries except
   * the first.
   */
  rest(): this;

  /**
   * Returns a new Collection of the same type containing all entries except
   * the last.
   */
  butLast(): this;

  /**
   * Returns a new Collection of the same type which excludes the first `amount`
   * entries from this Collection.
   */
  skip(amount: number): this;

  /**
   * Returns a new Collection of the same type which excludes the last `amount`
   * entries from this Collection.
   */
  skipLast(amount: number): this;

  /**
   * Returns a new Collection of the same type which includes entries starting
   * from when `predicate` first returns false.
   */
  skipWhile(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this;

  /**
   * Returns a new Collection of the same type which includes entries starting
   * from when `predicate` first returns true.
   */
  skipUntil(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this;

  /**
   * Returns a new Collection of the same type which includes the first `amount`
   * entries from this Collection.
   */
  take(amount: number): this;

  /**
   * Returns a new Collection of the same type which includes the last `amount`
   * entries from this Collection.
   */
  takeLast(amount: number): this;

  /**
   * Returns a new Collection of the same type which includes entries from this
   * Collection as long as the `predicate` returns true.
   */
  takeWhile(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this;

  /**
   * Returns a new Collection of the same type which includes entries from this
   * Collection as long as the `predicate` returns false.
   */
  takeUntil(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this;

  // Combination

  /**
   * Returns a new Collection of the same type with other values and
   * collection-like concatenated to this one.
   *
   * For Seqs, all entries will be present in the resulting Seq, even if they
   * have the same key.
   */
  concat(
    ...valuesOrCollections: Array<unknown>
  ): CollectionImpl<unknown, unknown>;

  /**
   * Flattens nested Collections.
   *
   * Will deeply flatten the Collection by default, returning a Collection of the
   * same type, but a `depth` can be provided in the form of a number or
   * boolean (where true means to shallowly flatten one level). A depth of 0
   * (or shallow: false) will deeply flatten.
   *
   * Flattens only others Collection, not Arrays or Objects.
   *
   * Note: `flatten(true)` operates on Collection<unknown, Collection<K, V>> and
   * returns Collection<K, V>
   */
  flatten(depth?: number): CollectionImpl<unknown, unknown>;
  flatten(shallow?: boolean): CollectionImpl<unknown, unknown>;

  /**
   * Flat-maps the Collection, returning a Collection of the same type.
   *
   * Similar to `collection.map(...).flatten(true)`.
   */
  flatMap<M>(
    mapper: (value: V, key: K, iter: this) => Iterable<M>,
    context?: unknown
  ): CollectionImpl<K, M>;

  /**
   * Flat-maps the Collection, returning a Collection of the same type.
   *
   * Similar to `collection.map(...).flatten(true)`.
   * Used for Dictionaries only.
   */
  flatMap<KM, VM>(
    mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
    context?: unknown
  ): CollectionImpl<KM, VM>;

  // Reducing a value

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

  /**
   * True if `predicate` returns true for all entries in the Collection.
   */
  every(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): boolean;

  /**
   * True if `predicate` returns true for any entry in the Collection.
   */
  some(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): boolean;

  /**
   * Joins values together as a string, inserting a separator between each.
   * The default separator is `","`.
   */
  join(separator?: string): string;

  /**
   * Returns true if this Collection includes no values.
   *
   * For some lazy `Seq`, `isEmpty` might need to iterate to determine
   * emptiness. At most one iteration will occur.
   */
  isEmpty(): boolean;

  /**
   * Returns the size of this Collection.
   *
   * Regardless of if this Collection can describe its size lazily (some Seqs
   * cannot), this method will always return the correct size. E.g. it
   * evaluates a lazy `Seq` if necessary.
   *
   * If `predicate` is provided, then this returns the count of entries in the
   * Collection for which the `predicate` returns true.
   */
  count(): number;
  count(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): number;

  /**
   * Returns a `Seq.Keyed` of counts, grouped by the return value of
   * the `grouper` function.
   *
   * Note: This is not a lazy operation.
   */
  countBy<G>(
    grouper: (value: V, key: K, iter: this) => G,
    context?: unknown
  ): Map<G, number>;

  // Search for value

  /**
   * Returns the first value for which the `predicate` returns true.
   */
  find(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): V | undefined;

  /**
   * Returns the last value for which the `predicate` returns true.
   *
   * Note: `predicate` will be called for each entry in reverse.
   */
  findLast(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): V | undefined;

  /**
   * Returns the first [key, value] entry for which the `predicate` returns true.
   */
  findEntry(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): [K, V] | undefined;

  /**
   * Returns the last [key, value] entry for which the `predicate`
   * returns true.
   *
   * Note: `predicate` will be called for each entry in reverse.
   */
  findLastEntry(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): [K, V] | undefined;

  /**
   * Returns the key for which the `predicate` returns true.
   */
  findKey(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): K | undefined;

  /**
   * Returns the last key for which the `predicate` returns true.
   *
   * Note: `predicate` will be called for each entry in reverse.
   */
  findLastKey(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): K | undefined;

  /**
   * Returns the key associated with the search value, or undefined.
   */
  keyOf(searchValue: V): K | undefined;

  /**
   * Returns the last key associated with the search value, or undefined.
   */
  lastKeyOf(searchValue: V): K | undefined;

  /**
   * Returns the maximum value in this collection. If any values are
   * comparatively equivalent, the first one found will be returned.
   *
   * The `comparator` is used in the same way as `Collection#sort`. If it is not
   * provided, the default comparator is `>`.
   *
   * When two values are considered equivalent, the first encountered will be
   * returned. Otherwise, `max` will operate independent of the order of input
   * as long as the comparator is commutative. The default comparator `>` is
   * commutative *only* when types do not differ.
   *
   * If `comparator` returns 0 and either value is NaN, undefined, or null,
   * that value will be returned.
   */
  max(comparator?: Comparator<V>): V | undefined;

  /**
   * Like `max`, but also accepts a `comparatorValueMapper` which allows for
   * comparing by more sophisticated means:
   */
  maxBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: Comparator<C>
  ): V | undefined;

  /**
   * Returns the minimum value in this collection. If any values are
   * comparatively equivalent, the first one found will be returned.
   *
   * The `comparator` is used in the same way as `Collection#sort`. If it is not
   * provided, the default comparator is `<`.
   *
   * When two values are considered equivalent, the first encountered will be
   * returned. Otherwise, `min` will operate independent of the order of input
   * as long as the comparator is commutative. The default comparator `<` is
   * commutative *only* when types do not differ.
   *
   * If `comparator` returns 0 and either value is NaN, undefined, or null,
   * that value will be returned.
   */
  min(comparator?: Comparator<V>): V | undefined;

  /**
   * Like `min`, but also accepts a `comparatorValueMapper` which allows for
   * comparing by more sophisticated means:
   */
  minBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: Comparator<C>
  ): V | undefined;

  // Comparison

  /**
   * True if `iter` includes every value in this Collection.
   */
  isSubset(iter: Iterable<V>): boolean;

  /**
   * True if this Collection includes every value in `iter`.
   */
  isSuperset(iter: Iterable<V>): boolean;
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- as all methods are injected with a mixin
export class CollectionImpl<K, V> implements CollectionImpl<K, V> {
  private __hash: number | undefined;

  size: number = 0;

  // __toStringMapper!: (value: V, key: K, iter: this) => string;

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
    type: typeof ITERATE_KEYS,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reverse?: boolean
  ): Iterator<K>;
  __iterator(
    type: typeof ITERATE_VALUES,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reverse?: boolean
  ): Iterator<V>;
  __iterator(
    type: typeof ITERATE_ENTRIES,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    reverse?: boolean
  ): Iterator<[K, V]>;
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
export interface KeyedCollectionImpl<K, V> extends CollectionImpl<K, V> {
  /**
   * Deeply converts this Keyed collection to equivalent native JavaScript Object.
   *
   * Converts keys to Strings.
   */
  toJS(): { [key in PropertyKey]: DeepCopy<V> };

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

  /**
   * Returns Seq.Keyed.
   * @override
   */
  toSeq(): SeqTypeToMigrate.Keyed<K, V>;

  // Sequence functions

  /**
   * Returns a new KeyedCollectionImpl of the same type where the keys and values
   * have been flipped.
   */
  flip(): KeyedCollectionImpl<V, K>;

  /**
   * Returns a new Collection with other collections concatenated to this one.
   */
  concat<KC, VC>(
    ...collections: Array<Iterable<[KC, VC]>>
  ): KeyedCollectionImpl<K | KC, V | VC>;
  concat<C>(
    ...collections: Array<{ [key: string]: C }>
  ): KeyedCollectionImpl<K | string, V | C>;

  /**
   * Returns a new KeyedCollectionImpl with values passed through a
   * `mapper` function.
   *
   * ```js
   * import { Collection } from 'immutable'
   * Collection.Keyed({ a: 1, b: 2 }).map(x => 10 * x)
   * // Seq { "a": 10, "b": 20 }
   * ```
   *
   * Note: `map()` always returns a new instance, even if it produced the
   * same value at every step.
   */
  map<M>(
    mapper: (value: V, key: K, iter: this) => M,
    context?: unknown
  ): KeyedCollectionImpl<K, M>;

  /**
   * Returns a new KeyedCollectionImpl of the same type with keys passed through
   * a `mapper` function.
   *
   * Note: `mapKeys()` always returns a new instance, even if it produced
   * the same key at every step.
   */
  mapKeys<M>(
    mapper: (key: K, value: V, iter: this) => M,
    context?: unknown
  ): KeyedCollectionImpl<M, V>;

  /**
   * Returns a new KeyedCollectionImpl of the same type with entries
   * ([key, value] tuples) passed through a `mapper` function.
   *
   * Note: `mapEntries()` always returns a new instance, even if it produced
   * the same entry at every step.
   *
   * If the mapper function returns `undefined`, then the entry will be filtered
   */
  mapEntries<KM, VM>(
    mapper: (entry: [K, V], index: number, iter: this) => [KM, VM] | undefined,
    context?: unknown
  ): KeyedCollectionImpl<KM, VM>;

  /**
   * Flat-maps the Collection, returning a Collection of the same type.
   *
   * Similar to `collection.map(...).flatten(true)`.
   */
  flatMap<KM, VM>(
    mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
    context?: unknown
  ): KeyedCollectionImpl<KM, VM>;

  /**
   * Returns a new Collection with only the values for which the `predicate`
   * function returns true.
   *
   * Note: `filter()` always returns a new instance, even if it results in
   * not filtering out any values.
   */
  filter<F extends V>(
    predicate: (value: V, key: K, iter: this) => value is F,
    context?: unknown
  ): KeyedCollectionImpl<K, F>;
  filter(
    predicate: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): this;

  /**
   * Returns a new keyed Collection with the values for which the
   * `predicate` function returns false and another for which is returns
   * true.
   */
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
export interface OrderedCollection<T> {
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
export interface IndexedCollectionImpl<T>
  extends CollectionImpl<number, T>,
    OrderedCollection<T> {
  /**
   * Deeply converts this Indexed collection to equivalent native JavaScript Array.
   */
  toJS(): Array<DeepCopy<T>>;

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
  toSeq(): SeqTypeToMigrate.Indexed<T>;

  /**
   * If this is a collection of [key, value] entry tuples, it will return a
   * Seq.Keyed of those entries.
   */
  fromEntrySeq(): SeqTypeToMigrate.Keyed<unknown, unknown>;

  // Combination

  /**
   * Returns a Collection of the same type with `separator` between each item
   * in this Collection.
   */
  interpose(separator: T): this;

  /**
   * Returns a Collection of the same type with the provided `collections`
   * interleaved into this collection.
   *
   * The resulting Collection includes the first item from each, then the
   * second from each, etc.
   *
   * The shortest Collection stops interleave.
   *
   * Since `interleave()` re-indexes values, it produces a complete copy,
   * which has `O(N)` complexity.
   *
   * Note: `interleave` *cannot* be used in `withMutations`.
   */
  interleave(...collections: Array<CollectionImpl<unknown, T>>): this;

  /**
   * Splice returns a new indexed Collection by replacing a region of this
   * Collection with new values. If values are not provided, it only skips the
   * region to be removed.
   *
   * `index` may be a negative number, which indexes back from the end of the
   * Collection. `s.splice(-2)` splices after the second to last item.
   *
   * Since `splice()` re-indexes values, it produces a complete copy, which
   * has `O(N)` complexity.
   *
   * Note: `splice` *cannot* be used in `withMutations`.
   */
  splice(index: number, removeNum: number, ...values: Array<T>): this;

  /**
   * Returns a Collection of the same type "zipped" with the provided
   * collections.
   *
   * Like `zipWith`, but using the default `zipper`: creating an `Array`.
   */
  zip<U>(other: CollectionImpl<unknown, U>): IndexedCollectionImpl<[T, U]>;
  zip<U, V>(
    other: CollectionImpl<unknown, U>,
    other2: CollectionImpl<unknown, V>
  ): IndexedCollectionImpl<[T, U, V]>;
  zip(
    ...collections: Array<CollectionImpl<unknown, unknown>>
  ): IndexedCollectionImpl<unknown>;

  /**
   * Returns a Collection "zipped" with the provided collections.
   *
   * Unlike `zip`, `zipAll` continues zipping until the longest collection is
   * exhausted. Missing values from shorter collections are filled with `undefined`.
   *
   * ```js
   * const a = List([ 1, 2 ]);
   * const b = List([ 3, 4, 5 ]);
   * const c = a.zipAll(b); // List [ [ 1, 3 ], [ 2, 4 ], [ undefined, 5 ] ]
   * ```
   */
  zipAll<U>(other: CollectionImpl<unknown, U>): IndexedCollectionImpl<[T, U]>;
  zipAll<U, V>(
    other: CollectionImpl<unknown, U>,
    other2: CollectionImpl<unknown, V>
  ): IndexedCollectionImpl<[T, U, V]>;
  zipAll(
    ...collections: Array<CollectionImpl<unknown, unknown>>
  ): IndexedCollectionImpl<unknown>;

  /**
   * Returns a Collection of the same type "zipped" with the provided
   * collections by using a custom `zipper` function.
   */
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

  /**
   * Returns the first index at which a given value can be found in the
   * Collection, or -1 if it is not present.
   */
  indexOf(searchValue: T): number;

  /**
   * Returns the last index at which a given value can be found in the
   * Collection, or -1 if it is not present.
   */
  lastIndexOf(searchValue: T): number;

  /**
   * Returns the first index in the Collection where a value satisfies the
   * provided predicate function. Otherwise -1 is returned.
   */
  findIndex(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): number;

  /**
   * Returns the last index in the Collection where a value satisfies the
   * provided predicate function. Otherwise -1 is returned.
   */
  findLastIndex(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): number;

  // Sequence algorithms

  /**
   * Returns a new Collection with other collections concatenated to this one.
   */
  concat<C>(
    ...valuesOrCollections: Array<Iterable<C> | C>
  ): IndexedCollectionImpl<T | C>;

  /**
   * Returns a new Collection.Indexed with values passed through a
   * `mapper` function.
   *
   * ```js
   * import { Collection } from 'immutable'
   * Collection.Indexed([1,2]).map(x => 10 * x)
   * // Seq [ 1, 2 ]
   * ```
   *
   * Note: `map()` always returns a new instance, even if it produced the
   * same value at every step.
   */
  map<M>(
    mapper: (value: T, key: number, iter: this) => M,
    context?: unknown
  ): IndexedCollectionImpl<M>;

  /**
   * Flat-maps the Collection, returning a Collection of the same type.
   *
   * Similar to `collection.map(...).flatten(true)`.
   */
  flatMap<M>(
    mapper: (value: T, key: number, iter: this) => Iterable<M>,
    context?: unknown
  ): IndexedCollectionImpl<M>;

  /**
   * Returns a new Collection with only the values for which the `predicate`
   * function returns true.
   *
   * Note: `filter()` always returns a new instance, even if it results in
   * not filtering out any values.
   */
  filter<F extends T>(
    predicate: (value: T, index: number, iter: this) => value is F,
    context?: unknown
  ): IndexedCollectionImpl<F>;
  filter(
    predicate: (value: T, index: number, iter: this) => unknown,
    context?: unknown
  ): this;

  /**
   * Returns a new indexed Collection with the values for which the
   * `predicate` function returns false and another for which is returns
   * true.
   */
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
  return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
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
export interface SetCollectionImpl<T> extends CollectionImpl<T, T> {
  /**
   * Deeply converts this Set collection to equivalent native JavaScript Array.
   */
  toJS(): Array<DeepCopy<T>>;

  /**
   * Shallowly converts this Set collection to equivalent native JavaScript Array.
   */
  toJSON(): Array<T>;

  /**
   * Shallowly converts this collection to an Array.
   */
  toArray(): Array<T>;

  /**
   * Returns Seq.Set.
   * @override
   */
  toSeq(): SeqTypeToMigrate.Set<T>;

  // Sequence algorithms

  /**
   * Returns a new Collection with other collections concatenated to this one.
   */
  concat<U>(...collections: Array<Iterable<U>>): SetCollectionImpl<T | U>;

  /**
   * Returns a new SetCollectionImpl with values passed through a
   * `mapper` function.
   *
   * ```
   * Collection.Set([ 1, 2 ]).map(x => 10 * x)
   * // Seq { 1, 2 }
   * ```
   *
   * Note: `map()` always returns a new instance, even if it produced the
   * same value at every step.
   */
  map<M>(
    mapper: (value: T, key: T, iter: this) => M,
    context?: unknown
  ): SetCollectionImpl<M>;

  /**
   * Flat-maps the Collection, returning a Collection of the same type.
   *
   * Similar to `collection.map(...).flatten(true)`.
   */
  flatMap<M>(
    mapper: (value: T, key: T, iter: this) => Iterable<M>,
    context?: unknown
  ): SetCollectionImpl<M>;

  /**
   * Returns a new Collection with only the values for which the `predicate`
   * function returns true.
   *
   * Note: `filter()` always returns a new instance, even if it results in
   * not filtering out any values.
   */
  filter<F extends T>(
    predicate: (value: T, key: T, iter: this) => value is F,
    context?: unknown
  ): SetCollectionImpl<F>;
  filter(
    predicate: (value: T, key: T, iter: this) => unknown,
    context?: unknown
  ): this;

  /**
   * Returns a new set Collection with the values for which the
   * `predicate` function returns false and another for which is returns
   * true.
   */
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

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- as all methods are injected with a mixin
export class SetCollectionImpl<T> extends CollectionImpl<T, T> {}

Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;
