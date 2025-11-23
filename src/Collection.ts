import { ITERATE_ENTRIES, ITERATE_KEYS, ITERATE_VALUES, Iterator as IteratorClass, type IteratorType } from './Iterator';
import { ArraySeq, IndexedSeq, KeyedSeq, Seq, SetSeq } from './Seq';
import type ValueObject from './ValueObject';
import { isAssociative } from './predicates/isAssociative';
import { isCollection, IS_COLLECTION_SYMBOL } from './predicates/isCollection';
import { isIndexed, IS_INDEXED_SYMBOL } from './predicates/isIndexed';
import { isKeyed, IS_KEYED_SYMBOL } from './predicates/isKeyed';
import { IS_ORDERED_SYMBOL } from './predicates/isOrdered';
import assertNotInfinite from './utils/assertNotInfinite';
import deepEqual from './utils/deepEqual';
import { hashCollection } from './utils/hashCollection';
import {
  defaultNegComparator,
  entryMapper,
  keyMapper,
  neg,
  not,
  reduce as reduceHelper,
} from './CollectionHelperMethods';
import type { List } from './List';
import type { Map } from './Map';
// Operations are imported lazily to avoid circular dependencies
import type {
  FromEntriesSequence as FromEntriesSequenceType,
  ToIndexedSequence as ToIndexedSequenceType,
  ToKeyedSequence as ToKeyedSequenceType,
  ToSetSequence as ToSetSequenceType,
} from './Operations';
import type { OrderedMap } from './OrderedMap';
import type { OrderedSet } from './OrderedSet';
import type { Range as RangeType } from './Range';
import { ensureSize, NOT_SET, resolveBegin, returnTrue, wrapIndex } from './TrieUtils';
import { is } from './is';
import { getIn } from './methods/getIn';
import { hasIn } from './methods/hasIn';
import { toObject } from './methods/toObject';
import { toJS as toJSHelper } from './toJS';
import quoteString from './utils/quoteString';
import type { Set } from './Set';
import type { Stack } from './Stack';

// Lazy loading helper for Operations to avoid circular dependencies
let _Operations: any = null;
function getOperations() {
  if (!_Operations) {
    _Operations = require('./Operations');
  }
  return _Operations;
}

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
  _cache?: Array<[K, V]>;

  size: number = 0;

  equals(other: unknown): boolean {
    return deepEqual(this, other);
  }

  hashCode() {
    return this.__hash || (this.__hash = hashCollection(this));
  }

  every(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
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
    return this.__iterator(ITERATE_ENTRIES) as any;
  }

  // ### Conversion to other types

  toArray(): Array<V> | Array<[K, V]> {
    assertNotInfinite(this.size);
    const array = new Array(this.size || 0);
    const useTuples = isKeyed(this);
    let i = 0;
    this.__iterate((v: V, k: K) => {
      // Keyed collections produce an array of tuples.
      array[i++] = useTuples ? [k, v] : v;
    });
    return array;
  }

  toIndexedSeq(): any {
    const { ToIndexedSequence } = getOperations();
    return new ToIndexedSequence(this);
  }

  toJS(): Array<unknown> | { [key in PropertyKey]: unknown } {
    return toJSHelper(this);
  }

  toKeyedSeq(): any {
    const { ToKeyedSequence } = getOperations();
    return new ToKeyedSequence(this, true);
  }

  toMap(): any {
    // Use Late Binding here to solve the circular dependency.
    const { Map: MapConstructor } = require('./Map');
    return MapConstructor(this.toKeyedSeq());
  }

  toObject(): { [key: string]: V } {
    return toObject.call(this);
  }

  toOrderedMap(): any {
    // Use Late Binding here to solve the circular dependency.
    const { OrderedMap: OrderedMapConstructor } = require('./OrderedMap');
    return OrderedMapConstructor(this.toKeyedSeq());
  }

  toOrderedSet(): any {
    // Use Late Binding here to solve the circular dependency.
    const { OrderedSet: OrderedSetConstructor } = require('./OrderedSet');
    return OrderedSetConstructor(isKeyed(this) ? this.valueSeq() : this);
  }

  toSet(): any {
    // Use Late Binding here to solve the circular dependency.
    const { Set: SetConstructor } = require('./Set');
    return SetConstructor(isKeyed(this) ? this.valueSeq() : this);
  }

  toSetSeq(): any {
    const { ToSetSequence } = getOperations();
    return new ToSetSequence(this);
  }

  toSeq(): any {
    return isIndexed(this)
      ? this.toIndexedSeq()
      : isKeyed(this)
        ? this.toKeyedSeq()
        : this.toSetSeq();
  }

  toStack(): any {
    // Use Late Binding here to solve the circular dependency.
    const { Stack: StackConstructor } = require('./Stack');
    return StackConstructor(isKeyed(this) ? this.valueSeq() : this);
  }

  toList(): any {
    // Use Late Binding here to solve the circular dependency.
    const { List: ListConstructor } = require('./List');
    return ListConstructor(isKeyed(this) ? this.valueSeq() : this);
  }

  // ### Common JavaScript methods and properties

  toString(): string {
    return '[Collection]';
  }

  __toString(head: string, tail: string): string {
    if (this.size === 0) {
      return head + tail;
    }
    return (
      head +
      ' ' +
      this.toSeq().map(this.__toStringMapper).join(', ') +
      ' ' +
      tail
    );
  }

  __toStringMapper(v: unknown, k?: unknown): string {
    return quoteString(v);
  }

  // ### ES6 Collection methods (ES6 Array and Map)

  concat<C>(
    ...valuesOrCollections: Array<Iterable<C> | C>
  ): CollectionImpl<unknown, unknown> {
    const { reify, concatFactory } = getOperations();
    return reify(this, concatFactory(this, valuesOrCollections));
  }

  includes(searchValue: V): boolean {
    return this.some((value) => is(value, searchValue));
  }

  contains(value: V): boolean {
    return this.includes(value);
  }

  filter(
    predicate: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): this {
    const { reify, filterFactory } = getOperations();
    return reify(this, filterFactory(this, predicate, context, true));
  }

  partition<C>(
    predicate: (this: C, value: V, key: K, iter: this) => unknown,
    context?: C
  ): [this, this] {
    const { partitionFactory } = getOperations();
    return partitionFactory(this, predicate, context) as [this, this];
  }

  find(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): V | undefined {
    const entry = this.findEntry(predicate, context);
    return entry ? entry[1] : notSetValue;
  }

  forEach(
    sideEffect: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): number {
    assertNotInfinite(this.size);
    return this.__iterate(context ? sideEffect.bind(context) : sideEffect) as number;
  }

  join(separator?: string): string {
    assertNotInfinite(this.size);
    separator = separator !== undefined ? '' + separator : ',';
    let joined = '';
    let isFirst = true;
    this.__iterate((v: V) => {
      // eslint-disable-next-line @typescript-eslint/no-unused-expressions -- TODO enable eslint here
      isFirst ? (isFirst = false) : (joined += separator);
      joined += v !== null && v !== undefined ? v.toString() : '';
    });
    return joined;
  }

  keys(): IterableIterator<K> {
    return this.__iterator(ITERATE_KEYS) as any;
  }

  map<M>(
    mapper: (value: V, key: K, iter: this) => M,
    context?: unknown
  ): CollectionImpl<K, M> {
    const { reify, mapFactory } = getOperations();
    return reify(this, mapFactory(this, mapper, context));
  }

  reduce<R>(
    reducer: (reduction: R, value: V, key: K, iter: this) => R,
    initialReduction: R,
    context?: unknown
  ): R;
  reduce<R>(
    reducer: (reduction: V | R, value: V, key: K, iter: this) => R
  ): R;
  reduce<R>(
    reducer: (reduction: R | V, value: V, key: K, iter: this) => R,
    initialReduction?: R,
    context?: unknown
  ): R {
    return reduceHelper(
      this,
      reducer as any,
      initialReduction,
      context,
      arguments.length < 2,
      false
    ) as R;
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
    reducer: (reduction: R | V, value: V, key: K, iter: this) => R,
    initialReduction?: R,
    context?: unknown
  ): R {
    return reduceHelper(
      this,
      reducer as any,
      initialReduction,
      context,
      arguments.length < 2,
      true
    ) as R;
  }

  reverse(): this {
    const { reify, reverseFactory } = getOperations();
    return reify(this, reverseFactory(this, true));
  }

  slice(begin?: number, end?: number): this {
    const { reify, sliceFactory } = getOperations();
    return reify(this, sliceFactory(this, begin, end, true));
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

  sort(comparator?: (valueA: V, valueB: V) => number): this {
    const { reify, sortFactory } = getOperations();
    return reify(this, sortFactory(this, comparator));
  }

  values(): IterableIterator<V> {
    return this.__iterator(ITERATE_VALUES) as any;
  }

  // ### More sequential methods

  butLast(): this {
    return this.slice(0, -1);
  }

  isEmpty(): boolean {
    return this.size !== undefined ? this.size === 0 : !this.some(() => true);
  }

  count(): number;
  count(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): number;
  count(
    predicate?: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): number {
    return ensureSize(
      predicate ? this.toSeq().filter(predicate, context) : this
    );
  }

  countBy<G>(
    grouper: (value: V, key: K, iter: this) => G,
    context?: unknown
  ): Map<G, number> {
    const { countByFactory } = getOperations();
    return countByFactory(this, grouper, context);
  }

  entrySeq(): any {
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const collection = this;
    if (collection._cache) {
      // We cache as an entries array, so we can just return the cache!
      return new ArraySeq(collection._cache);
    }
    const entriesSequence = collection.toSeq().map(entryMapper).toIndexedSeq();
    (entriesSequence as any).fromEntrySeq = () => collection.toSeq();
    return entriesSequence;
  }

  filterNot(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this {
    return this.filter(not(predicate) as any, context);
  }

  findEntry(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): [K, V] | undefined {
    let found: [K, V] | undefined = notSetValue as any;
    this.__iterate((v, k, c) => {
      if (predicate.call(context, v, k, c)) {
        found = [k, v];
        return false;
      }
    });
    return found;
  }

  findKey(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): K | undefined {
    const entry = this.findEntry(predicate, context);
    return entry && entry[0];
  }

  findLast(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): V | undefined {
    return this.toKeyedSeq().reverse().find(predicate, context, notSetValue);
  }

  findLastEntry(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): [K, V] | undefined {
    return this.toKeyedSeq()
      .reverse()
      .findEntry(predicate, context, notSetValue);
  }

  findLastKey(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): K | undefined {
    return this.toKeyedSeq().reverse().findKey(predicate, context);
  }

  first(): V | undefined;
  first<NSV>(notSetValue: NSV): V | NSV;
  first<NSV>(notSetValue?: NSV): V | NSV | undefined {
    return this.find(returnTrue, null, notSetValue);
  }

  flatMap<M>(
    mapper: (value: V, key: K, iter: this) => Iterable<M>,
    context?: unknown
  ): CollectionImpl<K, M> {
    const { reify, flatMapFactory } = getOperations();
    return reify(this, flatMapFactory(this, mapper, context));
  }

  flatten(depth?: number | boolean): CollectionImpl<unknown, unknown> {
    const { reify, flattenFactory } = getOperations();
    return reify(this, flattenFactory(this, depth as any, true));
  }

  fromEntrySeq(): any {
    const { FromEntriesSequence } = getOperations();
    return new FromEntriesSequence(this);
  }

  get<NSV>(searchKey: K, notSetValue: NSV): V | NSV;
  get(searchKey: K): V | undefined;
  get<NSV>(searchKey: K, notSetValue?: NSV): V | NSV | undefined {
    return this.find((_, key) => is(key, searchKey), undefined, notSetValue);
  }

  getIn(searchKeyPath: Iterable<unknown>, notSetValue?: unknown): unknown {
    return getIn.call(this, searchKeyPath, notSetValue);
  }

  groupBy<G>(
    grouper: (value: V, key: K, iter: this) => G,
    context?: unknown
  ): any {
    const { groupByFactory } = getOperations();
    return groupByFactory(this, grouper, context);
  }

  has(searchKey: K): boolean {
    return this.get(searchKey, NOT_SET) !== NOT_SET;
  }

  hasIn(searchKeyPath: Iterable<unknown>): boolean {
    return hasIn.call(this, searchKeyPath);
  }

  isSubset(iter: Iterable<V>): boolean {
    iter = typeof (iter as any).includes === 'function' ? iter : Collection(iter);
    return this.every((value) => (iter as any).includes(value));
  }

  isSuperset(iter: Iterable<V>): boolean {
    iter = typeof (iter as any).isSubset === 'function' ? iter : Collection(iter);
    return (iter as any).isSubset(this);
  }

  keyOf(searchValue: V): K | undefined {
    return this.findKey((value) => is(value, searchValue));
  }

  keySeq(): any {
    return this.toSeq().map(keyMapper).toIndexedSeq();
  }

  last(): V | undefined;
  last<NSV>(notSetValue: NSV): V | NSV;
  last<NSV>(notSetValue?: NSV): V | NSV | undefined {
    return this.toSeq().reverse().first(notSetValue);
  }

  lastKeyOf(searchValue: V): K | undefined {
    return this.toKeyedSeq().reverse().keyOf(searchValue);
  }

  max(comparator?: (valueA: V, valueB: V) => number): V | undefined {
    const { maxFactory } = getOperations();
    return maxFactory(this, comparator as any);
  }

  maxBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: (valueA: C, valueB: C) => number
  ): V | undefined {
    const { maxFactory } = getOperations();
    return maxFactory(this, comparator as any, comparatorValueMapper);
  }

  min(comparator?: (valueA: V, valueB: V) => number): V | undefined {
    const { maxFactory } = getOperations();
    return maxFactory(
      this,
      (comparator ? neg(comparator) : defaultNegComparator) as any
    );
  }

  minBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: (valueA: C, valueB: C) => number
  ): V | undefined {
    const { maxFactory } = getOperations();
    return maxFactory(
      this,
      (comparator ? neg(comparator) : defaultNegComparator) as any,
      comparatorValueMapper
    );
  }

  rest(): this {
    return this.slice(1);
  }

  skip(amount: number): this {
    return amount === 0 ? this : this.slice(Math.max(0, amount));
  }

  skipLast(amount: number): this {
    return amount === 0 ? this : this.slice(0, -Math.max(0, amount));
  }

  skipWhile(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this {
    const { reify, skipWhileFactory } = getOperations();
    return reify(this, skipWhileFactory(this, predicate, context, true));
  }

  skipUntil(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this {
    return this.skipWhile(not(predicate) as any, context);
  }

  sortBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: (valueA: C, valueB: C) => number
  ): this {
    const { reify, sortFactory } = getOperations();
    return reify(this, sortFactory(this, comparator, comparatorValueMapper));
  }

  take(amount: number): this {
    return this.slice(0, Math.max(0, amount));
  }

  takeLast(amount: number): this {
    return this.slice(-Math.max(0, amount));
  }

  takeWhile(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this {
    const { reify, takeWhileFactory } = getOperations();
    return reify(this, takeWhileFactory(this, predicate, context));
  }

  takeUntil(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this {
    return this.takeWhile(not(predicate) as any, context);
  }

  update<R>(updater: (value: this) => R): R {
    return updater(this);
  }

  valueSeq(): any {
    return this.toIndexedSeq();
  }

  // ### Hashable Object

  // hashCode() {
  //   return this.__hash || (this.__hash = hashCollection(this));
  // }

  // ### Internal

  // abstract __iterate(fn, reverse)

  // abstract __iterator(type, reverse)

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

export class KeyedCollectionImpl<K, V> extends CollectionImpl<K, V> {
  // ### More sequential methods

  flip(): any {
    const { reify, flipFactory } = getOperations();
    return reify(this, flipFactory(this));
  }

  mapEntries<KM, VM>(
    mapper: (entry: [K, V], index: number, iter: this) => [KM, VM] | undefined,
    context?: unknown
  ): any {
    let iterations = 0;
    const { reify } = getOperations();
    return reify(
      this,
      this.toSeq()
        .map((v: V, k: K) => mapper.call(context, [k, v], iterations++, this))
        .fromEntrySeq()
    );
  }

  mapKeys<M>(
    mapper: (key: K, value: V, iter: this) => M,
    context?: unknown
  ): any {
    const { reify } = getOperations();
    return reify(
      this,
      this.toSeq()
        .flip()
        .map((k: K, v: V) => mapper.call(context, k, v, this))
        .flip()
    );
  }
}

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

  // ### Conversion to other types

  override toKeyedSeq(): any {
    const { ToKeyedSequence } = getOperations();
    return new ToKeyedSequence(this, false);
  }

  // ### ES6 Collection methods (ES6 Array and Map)

  override filter(
    predicate: (value: T, index: number, iter: this) => unknown,
    context?: unknown
  ): this {
    const { reify, filterFactory } = getOperations();
    return reify(this, filterFactory(this, predicate, context, false));
  }

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

  lastIndexOf(searchValue: T): number {
    const key = this.lastKeyOf(searchValue);
    return key === undefined ? -1 : key;
  }

  override reverse(): this {
    const { reify, reverseFactory } = getOperations();
    return reify(this, reverseFactory(this, false));
  }

  override slice(begin?: number, end?: number): this {
    const { reify, sliceFactory } = getOperations();
    return reify(this, sliceFactory(this, begin, end, false));
  }

  splice(index: number, removeNum: number, ...values: Array<T>): this {
    const numArgs = arguments.length;
    removeNum = Math.max(removeNum || 0, 0);
    if (numArgs === 0 || (numArgs === 2 && !removeNum)) {
      return this;
    }
    // If index is negative, it should resolve relative to the size of the
    // collection. However size may be expensive to compute if not cached, so
    // only call count() if the number is in fact negative.
    index = resolveBegin(index, index < 0 ? this.count() : this.size);
    const spliced = this.slice(0, index);
    const { reify } = getOperations();
    return reify(
      this,
      numArgs === 1
        ? spliced
        : (spliced.concat(values as any, this.slice(index + removeNum)) as any)
    );
  }

  // ### More collection methods

  findLastIndex(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): number {
    const entry = this.findLastEntry(predicate, context);
    return entry ? entry[0] : -1;
  }

  override first(): T | undefined;
  override first<NSV>(notSetValue: NSV): T | NSV;
  override first<NSV>(notSetValue?: NSV): T | NSV | undefined {
    return this.get(0, notSetValue);
  }

  override flatten(depth?: number | boolean): this {
    const { reify, flattenFactory } = getOperations();
    return reify(this, flattenFactory(this, depth as any, false));
  }

  override get(index: number): T | undefined;
  override get<NSV>(index: number, notSetValue: NSV): T | NSV;
  override get<NSV>(index: number, notSetValue?: NSV): T | NSV | undefined {
    index = wrapIndex(this, index);
    return index < 0 ||
      this.size === Infinity ||
      (this.size !== undefined && index > this.size)
      ? notSetValue
      : this.find((_, key) => key === index, undefined, notSetValue as any);
  }

  override has(index: number): boolean {
    index = wrapIndex(this, index);
    return (
      index >= 0 &&
      (this.size !== undefined
        ? this.size === Infinity || index < this.size
        : this.indexOf(index as any) !== -1)
    );
  }

  interpose(separator: T): this {
    const { reify, interposeFactory } = getOperations();
    return reify(this, interposeFactory(this, separator));
  }

  interleave(...collections: Array<any>): this {
    const thisAndCollections = [this].concat(collections);
    const { zipWithFactory } = getOperations(); const zipped = zipWithFactory(
      this.toSeq(),
      IndexedSeq.of,
      thisAndCollections
    );
    const interleaved = zipped.flatten(true);
    if (zipped.size) {
      (interleaved as any).size = zipped.size * thisAndCollections.length;
    }
    const { reify } = getOperations();
    return reify(this, interleaved);
  }

  override keySeq(): any {
    const { Range } = require('./Range');
    return Range(0, this.size);
  }

  override last(): T | undefined;
  override last<NSV>(notSetValue: NSV): T | NSV;
  override last<NSV>(notSetValue?: NSV): T | NSV | undefined {
    return this.get(-1, notSetValue);
  }

  override skipWhile(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): this {
    const { reify, skipWhileFactory } = getOperations();
    return reify(this, skipWhileFactory(this, predicate, context, false));
  }

  zip<U>(...collections: Array<any>): any {
    const thisAndCollections = [this].concat(collections);
    const { reify, zipWithFactory } = getOperations();
    return reify(this, zipWithFactory(this, defaultZipper, thisAndCollections));
  }

  zipAll<U>(...collections: Array<any>): any {
    const thisAndCollections = [this].concat(collections);
    const { reify, zipWithFactory } = getOperations();
    return reify(
      this,
      zipWithFactory(this, defaultZipper, thisAndCollections, true)
    );
  }

  zipWith<U, Z>(
    zipper: (...values: Array<any>) => Z,
    ...collections: Array<any>
  ): any {
    const thisAndCollections = [this].concat(collections);
    const { reify, zipWithFactory } = getOperations();
    return reify(this, zipWithFactory(this, zipper, thisAndCollections));
  }
}

export function SetCollection<T>(
  value: Iterable<T> | ArrayLike<T>
): SetCollectionImpl<T> {
  return isCollection(value) && !isAssociative(value) ? value : SetSeq(value);
}

export class SetCollectionImpl<T> extends CollectionImpl<T, T> {
  // ### ES6 Collection methods (ES6 Array and Map)

  override get(value: T): T | undefined;
  override get<NSV>(value: T, notSetValue: NSV): T | NSV;
  override get<NSV>(value: T, notSetValue?: NSV): T | NSV | undefined {
    return this.has(value) ? value : notSetValue;
  }

  override includes(value: T): boolean {
    return this.has(value);
  }

  // ### More sequential methods

  override keySeq(): any {
    return this.valueSeq();
  }
}

// #pragma Helper functions

function defaultZipper<T>(...values: Array<T>): Array<T> {
  return values;
}

Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;
Collection.Iterator = IteratorClass;

// Setup prototypes
export const CollectionPrototype = CollectionImpl.prototype as any;
(CollectionPrototype as any)[IS_COLLECTION_SYMBOL] = true;
(CollectionPrototype as any)[Symbol.iterator] = CollectionPrototype.values;
(CollectionPrototype as any).toJSON = CollectionPrototype.toArray;
(CollectionPrototype as any).inspect = (CollectionPrototype as any).toSource = function () {
  return this.toString();
};
(CollectionPrototype as any).chain = CollectionPrototype.flatMap;

export const KeyedCollectionPrototype = KeyedCollectionImpl.prototype as any;
(KeyedCollectionPrototype as any)[IS_KEYED_SYMBOL] = true;
(KeyedCollectionPrototype as any)[Symbol.iterator] = CollectionPrototype.entries;
(KeyedCollectionPrototype as any).toJSON = toObject;
(KeyedCollectionPrototype as any).__toStringMapper = (v: unknown, k: unknown) =>
  quoteString(k) + ': ' + quoteString(v);

export const IndexedCollectionPrototype = IndexedCollectionImpl.prototype as any;
(IndexedCollectionPrototype as any)[IS_INDEXED_SYMBOL] = true;
(IndexedCollectionPrototype as any)[IS_ORDERED_SYMBOL] = true;

export const SetCollectionPrototype = SetCollectionImpl.prototype as any;
(SetCollectionPrototype as any).has = CollectionPrototype.includes;
(SetCollectionPrototype as any).contains = (SetCollectionPrototype as any).includes;
(SetCollectionPrototype as any).keys = SetCollectionPrototype.values;
