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

// Interface for methods added via mixin in CollectionImpl.ts
// Using declaration merging to add type information
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface CollectionImpl<K, V> {
  // _cache?: Array<[K, V]>;
  toArray(): Array<V> | Array<[K, V]>;
  toIndexedSeq(): any;
  toJS(): any;
  toKeyedSeq(): any;
  toMap(): any;
  toObject(): { [key: string]: V };
  toOrderedMap(): any;
  toOrderedSet(): any;
  toSet(): any;
  toSetSeq(): any;
  toSeq(): any;
  toStack(): any;
  toList(): any;
  toString(): string;
  __toString(head: string, tail: string): string;
  __toStringMapper(v: unknown, k?: unknown): string;
  concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): any;
  includes(searchValue: V): boolean;
  contains(searchValue: V): boolean;
  filter(
    predicate: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): this;
  partition<C>(
    predicate: (this: C, value: V, key: K, iter: this) => unknown,
    context?: C
  ): [this, this];
  find(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): V | undefined;
  forEach(
    sideEffect: (value: V, key: K, iter: this) => unknown,
    context?: unknown
  ): number;
  join(separator?: string): string;
  keys(): IterableIterator<K>;
  map<M>(mapper: (value: V, key: K, iter: this) => M, context?: unknown): any;
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
  reverse(): this;
  slice(begin?: number, end?: number): this;
  some(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): boolean;
  sort(comparator?: (valueA: V, valueB: V) => number): this;
  values(): IterableIterator<V>;
  butLast(): this;
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
  entrySeq(): any;
  filterNot(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): this;
  findEntry(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): [K, V] | undefined;
  findKey(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): K | undefined;
  findLast(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): V | undefined;
  findLastEntry(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown,
    notSetValue?: V
  ): [K, V] | undefined;
  findLastKey(
    predicate: (value: V, key: K, iter: this) => boolean,
    context?: unknown
  ): K | undefined;
  first(): V | undefined;
  first<NSV>(notSetValue: NSV): V | NSV;
  flatMap<M>(
    mapper: (value: V, key: K, iter: this) => Iterable<M>,
    context?: unknown
  ): any;
  flatten(depth?: number | boolean): any;
  fromEntrySeq(): any;
  get<NSV>(searchKey: K, notSetValue: NSV): V | NSV;
  get(searchKey: K): V | undefined;
  getIn(searchKeyPath: Iterable<unknown>, notSetValue?: unknown): unknown;
  groupBy<G>(
    grouper: (value: V, key: K, iter: this) => G,
    context?: unknown
  ): any;
  has(searchKey: K): boolean;
  hasIn(searchKeyPath: Iterable<unknown>): boolean;
  isSubset(iter: Iterable<V>): boolean;
  isSuperset(iter: Iterable<V>): boolean;
  keyOf(searchValue: V): K | undefined;
  keySeq(): any;
  last(): V | undefined;
  last<NSV>(notSetValue: NSV): V | NSV;
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
  rest(): this;
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
  sortBy<C>(
    comparatorValueMapper: (value: V, key: K, iter: this) => C,
    comparator?: (valueA: C, valueB: C) => number
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
  update<R>(updater: (value: this) => R): R;
  valueSeq(): any;
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

// Interface for KeyedCollectionImpl methods added via mixin
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface KeyedCollectionImpl<K, V> {
  flip(): any;
  mapEntries<KM, VM>(
    mapper: (entry: [K, V], index: number, iter: this) => [KM, VM] | undefined,
    context?: unknown
  ): any;
  mapKeys<M>(
    mapper: (key: K, value: V, iter: this) => M,
    context?: unknown
  ): any;
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

// Interface for IndexedCollectionImpl methods added via mixin
/* eslint-disable @typescript-eslint/no-explicit-any */
export interface IndexedCollectionImpl<T> {
  toKeyedSeq(): any;
  filter(
    predicate: (value: T, index: number, iter: this) => unknown,
    context?: unknown
  ): this;
  findIndex(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): number;
  indexOf(searchValue: T): number;
  lastIndexOf(searchValue: T): number;
  reverse(): this;
  slice(begin?: number, end?: number): this;
  splice(index: number, removeNum: number, ...values: Array<T>): this;
  findLastIndex(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): number;
  first(): T | undefined;
  first<NSV>(notSetValue: NSV): T | NSV;
  flatten(depth?: number | boolean): this;
  get(index: number): T | undefined;
  get<NSV>(index: number, notSetValue: NSV): T | NSV;
  has(index: number): boolean;
  interpose(separator: T): this;
  interleave(...collections: Array<any>): this;
  keySeq(): any;
  last(): T | undefined;
  last<NSV>(notSetValue: NSV): T | NSV;
  skipWhile(
    predicate: (value: T, index: number, iter: this) => boolean,
    context?: unknown
  ): this;
  zip<U>(...collections: Array<any>): any;
  zipAll<U>(...collections: Array<any>): any;
  zipWith<U, Z>(
    zipper: (...values: Array<any>) => Z,
    ...collections: Array<any>
  ): any;
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

// Interface for SetCollectionImpl methods added via mixin
export interface SetCollectionImpl<T> {
  get(value: T): T | undefined;
  get<NSV>(value: T, notSetValue: NSV): T | NSV;
  includes(value: T): boolean;
  keySeq(): any;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- as all methods are injected with a mixin
export class SetCollectionImpl<T> extends CollectionImpl<T, T> {}

Collection.Keyed = KeyedCollection;
Collection.Indexed = IndexedCollection;
Collection.Set = SetCollection;
