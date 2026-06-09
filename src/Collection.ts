import type { DeepCopy, KeyPath } from '../type-definitions/immutable';
import {
  defaultNegComparator,
  keyMapper,
  neg,
  not,
  reduce,
} from './CollectionHelperMethods';
import {
  ITERATE_ENTRIES,
  ITERATE_KEYS,
  ITERATE_VALUES,
  type IteratorType,
} from './Iterator';
import { IndexedSeq, KeyedSeq, Seq, SetSeq } from './Seq';
import { ensureSize, NOT_SET, returnTrue, wrapIndex } from './TrieUtils';
import type ValueObject from './ValueObject';
import { getIn as functionalGetIn } from './functional/getIn';
import { hasIn as functionalHasIn } from './functional/hasIn';
import { is } from './is';
import {
  filterFactory,
  flatMapFactory,
  flattenFactory,
  flipFactory,
  interposeFactory,
  mapFactory,
  maxFactory,
  partitionFactory,
  reverseFactory,
  skipWhileFactory,
  sliceFactory,
  sortFactory,
  takeWhileFactory,
  zipWithFactory,
  type Comparator,
} from './operations/factories';
import { reify } from './operations/helpers';
import { isAssociative } from './predicates/isAssociative';
import { isCollection, IS_COLLECTION_SYMBOL } from './predicates/isCollection';
import { isIndexed, IS_INDEXED_SYMBOL } from './predicates/isIndexed';
import { isKeyed, IS_KEYED_SYMBOL } from './predicates/isKeyed';
import { IS_ORDERED_SYMBOL } from './predicates/isOrdered';
import { toJS } from './toJS';
import assertNotInfinite from './utils/assertNotInfinite';
import deepEqual from './utils/deepEqual';
import { hashCollection } from './utils/hashCollection';
import { isProtoKey } from './utils/protoInjection';

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

function hasIncludesMethod<V>(
  iter: Iterable<V>
): iter is Iterable<V> & { includes(value: V): boolean } {
  return (
    typeof iter === 'object' &&
    iter !== null &&
    'includes' in iter &&
    typeof iter.includes === 'function'
  );
}

export class CollectionImpl<K, V> implements ValueObject {
  private __hash: number | undefined;

  // Lazy `Seq`s may not know their size until materialized, so the base type is
  // `number | undefined`. Concrete collections (List, Map, Range, …) always know
  // their size and narrow this back to `number`.
  size: number | undefined = 0;

  // Brand tested by the `isCollection` predicate. Declared for the type here;
  // the value is set on the prototype just below the class. It cannot be a
  // class field: that would be an own enumerable instance property, missing on
  // the many instances built via `Object.create(prototype)` (e.g. mapped Seqs).
  declare [IS_COLLECTION_SYMBOL]: true;

  declare toIndexedSeq: () => IndexedCollectionImpl<V>;
  declare toKeyedSeq: () => KeyedCollectionImpl<K, V>;
  declare toSetSeq: () => SetCollectionImpl<V>;

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
   * Deeply converts this Collection to equivalent native JavaScript Array or Object.
   *
   * `Collection.Indexed`, and `Collection.Set` become `Array`, while
   * `Collection.Keyed` become `Object`, converting keys to Strings.
   */
  toJS(): Array<DeepCopy<V>> | { [key in PropertyKey]: DeepCopy<V> } {
    return toJS(this);
  }

  /**
   * Shallowly converts this Collection to an Object.
   */
  toObject(): { [key in PropertyKey]: V } {
    assertNotInfinite(this.size);
    const object: { [key in PropertyKey]: V } = {};

    this.__iterate((v, k) => {
      if (isProtoKey(k)) {
        return;
      }

      // k is converted as a PropertyKey when used as an index. See https://tc39.es/ecma262/#sec-topropertykey
      object[k as PropertyKey] = v;
    });

    return object;
  }

  /**
   * Returns the value found by following a path of keys or indices through
   * nested Collections.
   *
   * Plain JavaScript Object or Arrays may be nested within an Immutable.js
   * Collection, and getIn() can access those values as well:
   */
  getIn(searchKeyPath: KeyPath<unknown>, notSetValue?: unknown): unknown {
    return functionalGetIn(this, searchKeyPath, notSetValue);
  }

  /**
   * True if the result of following a path of keys or indices through nested
   * Collections results in a set value.
   */
  hasIn(searchKeyPath: KeyPath<unknown>): boolean {
    return functionalHasIn(this, searchKeyPath);
  }

  toString(): string {
    return '[Collection]';
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
    notSetValue?: [K, V]
  ): [K, V] | undefined {
    let found = notSetValue;

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
  find<NSV>(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: NSV
  ): V | NSV;
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
    return this.find(returnTrue, null, notSetValue);
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
    return this.find((_, key) => is(key, searchKey), undefined, notSetValue);
  }

  /**
   * True if a key exists within this `Collection`, using `Immutable.is`
   * to determine equality
   */
  has(searchKey: K): boolean {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
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
    const c = hasIncludesMethod(iter) ? iter : Collection(iter);

    return this.every((value) => c.includes(value));
  }

  /**
   * True if this Collection includes every value in `iter`.
   */
  isSuperset(iter: Iterable<V>): boolean {
    return Collection(iter).every((value) => this.includes(value));
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
  reduce(reducer: (reduction: V, value: V, key: K, iter: this) => V): V;
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
  ): V | R | undefined {
    return reduce(
      this,
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      false
    );
  }

  /**
   * Reduces the Collection in reverse (from the right side).
   *
   * Note: Similar to this.reverse().reduce(), and provided for parity
   * with `Array#reduceRight`.
   */
  reduceRight(reducer: (reduction: V, value: V, key: K, iter: this) => V): V;
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
  ): V | R | undefined {
    return reduce(
      this,
      reducer,
      initialReduction,
      context,
      arguments.length < 2,
      true
    );
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
  ): CollectionImpl<K, M> {
    return reify(this, mapFactory(this, mapper, context));
  }

  /**
   * Converts this Collection to a Seq of the same kind (indexed,
   * keyed, or set).
   */
  toSeq(): CollectionImpl<K, V> {
    // Indexed and set collections override `toSeq` with their concrete Seq
    // kind, where the key type is fixed by the class. A keyed collection (and
    // the abstract base) converts to a keyed Seq.
    return this.toKeyedSeq();
  }

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
  filter(
    predicate: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): unknown {
    return reify(this, filterFactory(this, predicate, context, true));
  }

  /**
   * Returns a new Collection of the same type with only the entries for which
   * the `predicate` function returns false.
   */
  filterNot(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this {
    return this.filter(not(predicate), context);
  }

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
  partition(
    predicate: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): unknown {
    return partitionFactory(this, predicate, context);
  }

  /**
   * Returns a new Collection of the same type in reverse order.
   */
  reverse(): this {
    return reify(this, reverseFactory(this, true));
  }

  /**
   * Returns a new Collection of the same type representing a portion of this
   * Collection from start up to but not including end.
   */
  slice(begin?: number, end?: number): this {
    return reify(this, sliceFactory(this, begin, end, true));
  }

  /**
   * Returns a new Collection of the same type which includes the same entries,
   * stably sorted by using a `comparator`.
   *
   * If a `comparator` is not provided, a default comparator uses `<` and `>`.
   *
   * When sorting collections which have no defined order, their ordered
   * equivalents will be returned. e.g. `map.sort()` returns OrderedMap.
   *
   * Note: This is always an eager operation.
   */
  sort(comparator?: Comparator<V>): this {
    return reify(this, sortFactory(this, comparator));
  }

  /**
   * Like `sort`, but also accepts a `comparatorValueMapper` which allows for
   * sorting by more sophisticated means.
   *
   * Note: This is always an eager operation.
   */
  sortBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: Comparator<C>
  ): this {
    return reify(this, sortFactory(this, comparator, comparatorValueMapper));
  }

  /**
   * Flat-maps the Collection, returning a Collection of the same type.
   *
   * Similar to `collection.map(...).flatten(true)`.
   */
  flatMap<M>(
    mapper: (value: V, key: K, iter: this) => Iterable<M>,
    context?: unknown
  ): CollectionImpl<K, M>;
  flatMap<KM, VM>(
    mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
    context?: unknown
  ): CollectionImpl<KM, VM>;
  flatMap(
    mapper: (value: V, key: K, iter: this) => Iterable<unknown>,
    context?: unknown
  ): unknown {
    return reify(this, flatMapFactory(this, mapper, context));
  }

  /**
   * Flattens nested Collections.
   *
   * Will deeply flatten the Collection by default, returning a Collection of
   * the same type, but a `depth` can be provided in the form of a number or
   * boolean (where true means to shallowly flatten one level). A depth of 0
   * (or shallow: false) will deeply flatten.
   */
  flatten(depth?: number): CollectionImpl<unknown, unknown>;
  flatten(shallow?: boolean): CollectionImpl<unknown, unknown>;
  flatten(depth?: number | boolean): CollectionImpl<unknown, unknown> {
    return reify(this, flattenFactory(this, depth, true));
  }

  /**
   * Returns the maximum value in this collection. If any values are
   * comparatively equivalent, the first one found will be returned.
   */
  max(comparator?: Comparator<V>): V | undefined {
    return maxFactory(this, comparator);
  }

  /**
   * Like `max`, but also accepts a `comparatorValueMapper` which allows for
   * comparing by more sophisticated means.
   */
  maxBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: Comparator<C>
  ): V | undefined {
    return maxFactory(this, comparator, comparatorValueMapper);
  }

  /**
   * Returns the minimum value in this collection. If any values are
   * comparatively equivalent, the first one found will be returned.
   */
  min(comparator?: Comparator<V>): V | undefined {
    const c = comparator ? neg(comparator) : defaultNegComparator;

    return maxFactory(this, c);
  }

  /**
   * Like `min`, but also accepts a `comparatorValueMapper` which allows for
   * comparing by more sophisticated means.
   */
  minBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: Comparator<C>
  ): V | undefined {
    const c = comparator ? neg(comparator) : defaultNegComparator;

    return maxFactory(this, c, comparatorValueMapper);
  }

  /**
   * Returns a new Collection of the same type which excludes the first `amount`
   * entries from this Collection.
   */
  skip(amount: number): this {
    return amount === 0 ? this : this.slice(Math.max(0, amount));
  }

  /**
   * Returns a new Collection of the same type which excludes the last `amount`
   * entries from this Collection.
   */
  skipLast(amount: number): this {
    return amount === 0 ? this : this.slice(0, -Math.max(0, amount));
  }

  /**
   * Returns a new Collection of the same type which includes entries starting
   * from when `predicate` first returns false.
   */
  skipWhile(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this {
    return reify(this, skipWhileFactory(this, predicate, context, true));
  }

  /**
   * Returns a new Collection of the same type which includes entries starting
   * from when `predicate` first returns true.
   */
  skipUntil(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this {
    return this.skipWhile(not(predicate), context);
  }

  /**
   * Returns a new Collection of the same type which includes the first `amount`
   * entries from this Collection.
   */
  take(amount: number): this {
    return this.slice(0, Math.max(0, amount));
  }

  /**
   * Returns a new Collection of the same type which includes the last `amount`
   * entries from this Collection.
   */
  takeLast(amount: number): this {
    return this.slice(-Math.max(0, amount));
  }

  /**
   * Returns a new Collection of the same type which includes entries from this
   * Collection as long as the `predicate` returns true.
   */
  takeWhile(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this {
    return reify(this, takeWhileFactory(this, predicate, context));
  }

  /**
   * Returns a new Collection of the same type which includes entries from this
   * Collection as long as the `predicate` returns false.
   */
  takeUntil(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this {
    return this.takeWhile(not(predicate), context);
  }

  /**
   * Returns a new Collection of the same type containing all entries except
   * the last.
   */
  butLast(): this {
    return this.slice(0, -1);
  }

  /**
   * Returns a new Collection of the same type containing all entries except
   * the first.
   */
  rest(): this {
    return this.slice(1);
  }

  /**
   * Returns the size of this Collection.
   *
   * If `predicate` is provided, then this returns the count of entries in the
   * Collection for which the `predicate` returns true.
   */
  count(): number;
  count(
    predicate: (value: V, key: K, iter: CollectionImpl<K, V>) => boolean,
    context?: unknown
  ): number;
  count(
    predicate?: (value: V, key: K, iter: CollectionImpl<K, V>) => boolean,
    context?: unknown
  ): number {
    return ensureSize(
      predicate ? this.toSeq().filter(predicate, context) : this
    );
  }

  /**
   * Returns the last value for which the `predicate` returns true.
   *
   * Note: `predicate` will be called for each entry in reverse.
   */
  findLast(
    predicate: (value: V, key: K, iter: CollectionImpl<K, V>) => boolean,
    context?: unknown,
    notSetValue?: V
  ): V | undefined {
    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
  }

  /**
   * Returns the last [key, value] entry for which the `predicate`
   * returns true.
   *
   * Note: `predicate` will be called for each entry in reverse.
   */
  findLastEntry(
    predicate: (value: V, key: K, iter: CollectionImpl<K, V>) => boolean,
    context?: unknown,
    notSetValue?: [K, V]
  ): [K, V] | undefined {
    return this.toKeyedSeq()
      .reverse()
      .findEntry(predicate, context, notSetValue);
  }

  /**
   * Returns the last key for which the `predicate` returns true.
   *
   * Note: `predicate` will be called for each entry in reverse.
   */
  findLastKey(
    predicate: (value: V, key: K, iter: CollectionImpl<K, V>) => boolean,
    context?: unknown
  ): K | undefined {
    return this.toKeyedSeq().reverse().findKey(predicate, context);
  }

  /**
   * Returns the last key associated with the search value, or undefined.
   */
  lastKeyOf(searchValue: V): K | undefined {
    return this.toKeyedSeq().reverse().keyOf(searchValue);
  }

  /**
   * Returns the last value in this Collection.
   */
  last<NSV>(notSetValue: NSV): V | NSV;
  last(): V | undefined;
  last(notSetValue?: unknown): unknown {
    return this.toSeq().reverse().first(notSetValue);
  }

  /**
   * Returns a new Seq.Indexed of the keys of this Collection,
   * discarding values.
   */
  keySeq(): IndexedCollectionImpl<K> {
    return this.toSeq().map(keyMapper).toIndexedSeq();
  }

  /**
   * Returns a Seq.Indexed of the values of this Collection, discarding keys.
   */
  valueSeq(): IndexedCollectionImpl<V> {
    return this.toIndexedSeq();
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
  // Public overload for a non-literal `IteratorType`: callers that pass a
  // runtime `type` (e.g. operation factories forwarding their own `type`) match
  // this instead of failing to resolve against the literal overloads above.
  __iterator(
    type: IteratorType,
    reverse?: boolean
  ): IterableIterator<K | V | [K, V]>;
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

CollectionImpl.prototype[IS_COLLECTION_SYMBOL] = true;

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

export class KeyedCollectionImpl<K, V> extends CollectionImpl<K, V> {
  // Brand tested by the `isKeyed` predicate. Declaring it also makes
  // `KeyedCollectionImpl` structurally distinct from the base `CollectionImpl`,
  // otherwise `isKeyed`'s negative narrowing collapses `this` to `never`.
  declare [IS_KEYED_SYMBOL]: true;

  /**
   * Returns a new Collection.Keyed of the same type where the keys and values
   * have been flipped.
   */
  flip(): KeyedCollectionImpl<V, K> {
    return reify(this, flipFactory(this));
  }
}

KeyedCollectionImpl.prototype[IS_KEYED_SYMBOL] = true;

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

  // Brands tested by the `isIndexed` / `isOrdered` predicates. Declared for the
  // type here; the values are set on the prototype just below the class.
  declare [IS_INDEXED_SYMBOL]: true;
  declare [IS_ORDERED_SYMBOL]: true;

  override toSeq(): IndexedCollectionImpl<T> {
    return this.toIndexedSeq();
  }

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
    return this.get(0, notSetValue);
  }

  /**
   * In case the `Collection` is not empty returns the last element of the
   * `Collection`.
   * In case the `Collection` is empty returns the optional default
   * value if provided, if no default value is provided returns undefined.
   */
  override last<NSV>(notSetValue: NSV): T | NSV;
  override last(): T | undefined;
  override last(notSetValue?: unknown): unknown {
    return this.get(-1, notSetValue);
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
      : this.find((_, key) => key === index, undefined, notSetValue);
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
        : this.find((_, key) => key === index, undefined, NOT_SET) !== NOT_SET)
    );
  }

  override filter<F extends T>(
    predicate: (value: T, index: number, iter: this) => value is F,
    context?: unknown
  ): IndexedCollectionImpl<F>;
  override filter(
    predicate: (value: T, index: number, iter: this) => unknown,
    context?: unknown
  ): this;
  override filter(
    predicate: (value: T, index: number, iter: this) => unknown,
    context?: unknown
  ): unknown {
    return reify(this, filterFactory(this, predicate, context, false));
  }

  override reverse(): this {
    return reify(this, reverseFactory(this, false));
  }

  override slice(begin?: number, end?: number): this {
    return reify(this, sliceFactory(this, begin, end, false));
  }

  override flatten(depth?: number): CollectionImpl<unknown, unknown>;
  override flatten(shallow?: boolean): CollectionImpl<unknown, unknown>;
  override flatten(depth?: number | boolean): CollectionImpl<unknown, unknown> {
    return reify(this, flattenFactory(this, depth, false));
  }

  override skipWhile(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): this {
    return reify(this, skipWhileFactory(this, predicate, context, false));
  }

  /**
   * Returns the last index at which a given value can be found in the
   * Collection, or -1 if it is not present.
   */
  lastIndexOf(searchValue: T): number {
    const key = this.lastKeyOf(searchValue);
    return key === undefined ? -1 : key;
  }

  /**
   * Returns the last index in the Collection where a value satisfies the
   * provided predicate function. Otherwise -1 is returned.
   */
  findLastIndex(
    predicate: (
      value: T,
      index: number,
      iter: CollectionImpl<number, T>
    ) => boolean,
    context?: unknown
  ): number {
    const entry = this.findLastEntry(predicate, context);
    return entry ? entry[0] : -1;
  }

  /**
   * Returns a Collection of the same type with `separator` between each item
   * in this Collection.
   */
  interpose(separator: T): this {
    return reify(this, interposeFactory(this, separator));
  }

  /**
   * Returns a Collection of the same type with the provided `collections`
   * interleaved into this collection.
   */
  interleave(...collections: Array<CollectionImpl<unknown, T>>): this;
  interleave(...collections: Array<CollectionImpl<unknown, T>>): unknown {
    const thisAndCollections = [this, ...collections];
    const zipped = zipWithFactory(
      this.toSeq(),
      IndexedSeq.of,
      thisAndCollections
    );
    const interleaved = zipped.flatten(true);
    if (zipped.size) {
      interleaved.size = zipped.size * thisAndCollections.length;
    }
    return reify(this, interleaved);
  }

  /**
   * Returns a Collection of the same type "zipped" with the provided
   * collections.
   *
   * Like `zipWith`, but using the default `zipper`: creating an `Array`.
   */
  zip<U>(other: CollectionImpl<unknown, U>): IndexedCollectionImpl<[T, U]>;
  zip<U, W>(
    other: CollectionImpl<unknown, U>,
    other2: CollectionImpl<unknown, W>
  ): IndexedCollectionImpl<[T, U, W]>;
  zip(
    ...collections: Array<CollectionImpl<unknown, unknown>>
  ): IndexedCollectionImpl<unknown>;
  zip(...collections: Array<unknown>): unknown {
    const thisAndCollections = [this, ...collections];
    return reify(this, zipWithFactory(this, defaultZipper, thisAndCollections));
  }

  /**
   * Returns a Collection "zipped" with the provided collections.
   *
   * Unlike `zip`, `zipAll` continues zipping until the longest collection is
   * exhausted. Missing values from shorter collections are filled with
   * `undefined`.
   */
  zipAll<U>(other: CollectionImpl<unknown, U>): IndexedCollectionImpl<[T, U]>;
  zipAll<U, W>(
    other: CollectionImpl<unknown, U>,
    other2: CollectionImpl<unknown, W>
  ): IndexedCollectionImpl<[T, U, W]>;
  zipAll(
    ...collections: Array<CollectionImpl<unknown, unknown>>
  ): IndexedCollectionImpl<unknown>;
  zipAll(...collections: Array<unknown>): unknown {
    const thisAndCollections = [this, ...collections];
    return reify(
      this,
      zipWithFactory(this, defaultZipper, thisAndCollections, true)
    );
  }

  /**
   * Returns a Collection of the same type "zipped" with the provided
   * collections by using a custom `zipper` function.
   */
  zipWith<U, Z>(
    zipper: (value: T, otherValue: U) => Z,
    otherCollection: CollectionImpl<unknown, U>
  ): IndexedCollectionImpl<Z>;
  zipWith<U, W, Z>(
    zipper: (value: T, otherValue: U, thirdValue: W) => Z,
    otherCollection: CollectionImpl<unknown, U>,
    thirdCollection: CollectionImpl<unknown, W>
  ): IndexedCollectionImpl<Z>;
  zipWith<Z>(
    zipper: (...values: Array<unknown>) => Z,
    ...collections: Array<CollectionImpl<unknown, unknown>>
  ): IndexedCollectionImpl<Z>;
  zipWith(zipper: unknown, ...collections: Array<unknown>): unknown {
    const thisAndCollections = [this, ...collections];
    return reify(this, zipWithFactory(this, zipper, thisAndCollections));
  }
}

IndexedCollectionImpl.prototype[IS_INDEXED_SYMBOL] = true;
IndexedCollectionImpl.prototype[IS_ORDERED_SYMBOL] = true;

export function SetCollection<T>(
  value: Iterable<T> | ArrayLike<T>
): SetCollectionImpl<T> {
  return isCollection<T, T>(value) && !isAssociative<T, T>(value)
    ? value
    : SetSeq(value);
}

export class SetCollectionImpl<T> extends CollectionImpl<T, T> {
  /**
   * Returns the value associated with the provided key, or notSetValue if
   * the Collection does not contain this key.
   *
   * Note: it is possible a key may be associated with an `undefined` value,
   * so if `notSetValue` is not provided and this method returns `undefined`,
   * that does not guarantee the key was not found.
   */
  override get<NSV>(value: T, notSetValue: NSV): T | NSV;
  override get(value: T): T | undefined;
  override get(value: T, notSetValue?: unknown): unknown {
    return this.has(value) ? value : notSetValue;
  }

  /**
   * True if a value exists within this `Collection`, using `Immutable.is`
   * to determine equality
   * @alias contains
   */
  override includes(value: T): boolean {
    return this.has(value);
  }

  /**
   * Returns a new Seq.Indexed of the keys of this Collection,
   * discarding values.
   */
  override keySeq(): IndexedCollectionImpl<T> {
    return this.valueSeq();
  }

  override toSeq(): SetCollectionImpl<T> {
    return this.toSetSeq();
  }
}

Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;

function defaultZipper(...values: Array<unknown>): Array<unknown> {
  return values;
}
