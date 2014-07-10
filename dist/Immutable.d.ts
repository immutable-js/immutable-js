/**
* The same semantics as Object.is(), but treats immutable data structures as
* data, equal when the structure contains equivalent data.
*/
export declare function is(first: any, second: any): boolean;

/**
 *
 */
export declare function fromJS(json: any): any;
export declare function toJS(value: any): any;



/**
 * TODO Describe Sequence creation functions.
 */
export declare function Sequence<V, C>(seq: IndexedSequence<V, C>): IndexedSequence<V, C>;
export declare function Sequence<K, V, C>(seq: Sequence<K, V, C>): Sequence<K, V, C>;
export declare function Sequence<T>(array: Array<T>): IndexedSequence<T, Array<T>>;
export declare function Sequence<T>(obj: {[key: string]: T}): Sequence<string, T, {[key: string]: T}>;
export declare function Sequence<T>(...values: Array<T>): IndexedSequence<T, Array<T>>;
export declare function Sequence(): Sequence<any, any, any>;

/**
 * TODO
 */
export interface Sequence<K, V, C> {

  /**
   * Some sequences can describe their length lazily. When this is the case,
   * length will be set to an integer. Otherwise it will be undefined.
   *
   * For example, the new Sequences returned from map() or reverse()
   * preserve the length of the original sequence while filter() does not.
   *
   * If you must know the length, use cacheResult().
   */
  length?: number;

  toString(): string;

  isMutable(): boolean;

  asImmutable(): Sequence<K, V, C>;

  /**
   * Converts this to a JavaScript native equivalent. IndexedSequence and Set
   * returns an Array while other Sequences return an Object.
   */
  toJS(): any;

  toArray(): Array<V>;

  toObject(): Object;

  toVector(): Vector<V>;

  toMap(): Map<K, V>;

  toSet(): Set<V>;

  equals(other: Sequence<K, V, C>): boolean;

  join(separator?: string): string;

  concat(...valuesOrSequences: Array<any>): Sequence<any, any, any>;

  reverse(): Sequence<K, V, C>;

  keys(): IndexedSequence<K, C>;

  values(): IndexedSequence<V, C>;

  entries(): IndexedSequence</*(K, V)*/Array<any>, C>;

  /**
   * This behavior differs from Array.prototype.forEach
   * sideEffect is run for every entry in the sequence. If any sideEffect
   * returns false, the iteration will stop. Returns the length of the sequence
   * which was iterated.
   */
  forEach(
    sideEffect: (value?: V, key?: K, collection?: C) => any,
    context?: Object
  ): number;

  first(
    predicate?: (value?: V, index?: number, collection?: C) => boolean,
    context?: Object
  ): V;

  last(
    predicate?: (value?: V, index?: number, collection?: C) => boolean,
    context?: Object
  ): V;

  reduce<R>(
    reducer: (reduction?: R, value?: V, key?: K, collection?: C) => R,
    initialReduction?: R,
    context?: Object
  ): R;

  reduceRight<R>(
    reducer: (reduction?: R, value?: V, key?: K, collection?: C) => R,
    initialReduction: R,
    context?: Object
  ): R;

  every(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: Object
  ): boolean;

  some(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: Object
  ): boolean;

  get(key: K, notFoundValue?: V): V;

  find(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: Object,
    notFoundValue?: V
  ): V;

  findKey(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: Object
  ): K;

  findLast(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: Object,
    notFoundValue?: V
  ): V;

  findLastKey(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: Object
  ): K;

  flip(): Sequence<V, K, C>;

  map<M>(
    mapper: (value?: V, key?: K, collection?: C) => M,
    context?: Object
  ): Sequence<K, M, C>;

  filter(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: Object
  ): Sequence<K, V, C>;

  slice(start: number, end?: number): Sequence<K, V, C>;

  splice(index: number, removeNum: number, ...values: Array<any>): Sequence<K, V, C>;

  take(amount: number): Sequence<K, V, C>;

  takeLast(amount: number): Sequence<K, V, C>;

  takeWhile(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: Object
  ): Sequence<K, V, C>;

  takeUntil(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: Object
  ): Sequence<K, V, C>;

  skip(amount: number): Sequence<K, V, C>;

  skipLast(amount: number): Sequence<K, V, C>;

  skipWhile(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: Object
  ): Sequence<K, V, C>;

  skipUntil(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: Object
  ): Sequence<K, V, C>;

  cacheResult(): Sequence<K, V, C>;
}



/**
 * TODO
 */
export interface IndexedSequence<V, C> extends Sequence<number, V, C> {

  /**
   * If this is a sequence of entries (key-value tuples), it will return a
   * sequence of those entries.
   */
  fromEntries(): Sequence<any, any, C>;

  /**
   * Returns the first index at which a given value can be found in the
   * sequence, or -1 if it is not present.
   */
  indexOf(searchValue: V): number;

  /**
   * Returns the last index at which a given value can be found in the
   * sequence, or -1 if it is not present.
   */
  lastIndexOf(searchValue: V): number;

  /**
   * Returns the first index in the sequence where a value satisfies the
   * provided predicate function. Otherwise -1 is returned.
   */
  findIndex(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: Object
  ): number;

  /**
   * Returns the last index in the sequence where a value satisfies the
   * provided predicate function. Otherwise -1 is returned.
   */
  findLastIndex(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: Object
  ): number;

  /**
   * When IndexedSequence is converted to an array, the index keys are
   * maintained. This differs from the behavior of Sequence which
   * simply makes a dense array of all values.
   * @override
   */
  toArray(): Array<V>;

  /**
   * This has the same altered behavior as `toArray`.
   * @override
   */
  toVector(): Vector<V>;

  /**
   * This new behavior will iterate through the values and sequences with
   * increasing indices.
   * @override
   */
  concat(...valuesOrSequences: Array<any>): IndexedSequence<any, any>;

  /**
   * This new behavior will not only iterate through the sequence in reverse,
   * but it will also reverse the indices so the last value will report being
   * at index 0. If you wish to preserve the original indices, set
   * maintainIndices to true.
   * @override
   */
  reverse(maintainIndices?: boolean): IndexedSequence<V, C>;

  /**
   * Indexed sequences have a different `filter` behavior, where the filtered
   * values have new indicies incrementing from 0. If you want to preserve the
   * original indicies, set maintainIndices to true.
   * @override
   */
  filter(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: Object,
    maintainIndices?: boolean
  ): IndexedSequence<V, C>;

  /**
   * Adds the ability to maintain original indices.
   * @override
   */
  slice(start: number, end?: number, maintainIndices?: boolean): IndexedSequence<V, C>;

  /**
   * Has the same altered behavior as `takeWhile`.
   * @override
   */
  take(amount: number, maintainIndices?: boolean): IndexedSequence<V, C>;

  /**
   * Has the same altered behavior as `takeWhile`.
   * @override
   */
  takeLast(amount: number, maintainIndices?: boolean): IndexedSequence<V, C>;

  /**
   * Indexed sequences have a different `takeWhile` behavior. The first
   * value will have an index of 0 and the length of the sequence could be
   * truncated. If you want to preserve the original indicies, set
   * maintainIndices to true.
   * @override
   */
  takeWhile(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: Object,
    maintainIndices?: boolean
  ): IndexedSequence<V, C>;

  /**
   * Has the same altered behavior as `takeWhile`.
   * @override
   */
  takeUntil(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: Object,
    maintainIndices?: boolean
  ): IndexedSequence<V, C>;

  /**
   * Has the same altered behavior as `skipWhile`.
   * @override
   */
  skip(amount: number, maintainIndices?: boolean): IndexedSequence<V, C>;

  /**
   * Has the same altered behavior as `skipWhile`.
   * @override
   */
  skipLast(amount: number, maintainIndices?: boolean): IndexedSequence<V, C>;

  /**
   * Indexed sequences have a different `skipWhile` behavior. The first
   * non-skipped value will have an index of 0. If you want to preserve the
   * original indicies, set maintainIndices to true.
   * @override
   */
  skipWhile(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: Object,
    maintainIndices?: boolean
  ): IndexedSequence<V, C>;

  /**
   * Has the same altered behavior as `skipWhile`.
   * @override
   */
  skipUntil(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: Object,
    maintainIndices?: boolean
  ): IndexedSequence<V, C>;

  // All below methods have identical behavior as Sequence,
  // except they take a function with index: number instead of key: K
  // and return an IndexedSequence.

  /**
   * @override
   */
  asImmutable(): IndexedSequence<V, C>;

  /**
   * @override
   */
  splice(index: number, removeNum: number, ...values: Array<V>): IndexedSequence<V, C>;

  /**
   * @override
   */
  map<M>(
    mapper: (value?: V, index?: number, collection?: C) => M,
    context?: Object
  ): IndexedSequence<M, C>;

  /**
   * @override
   */
  cacheResult(): IndexedSequence<V, C>;
}



/**
 * Returns a lazy sequence of numbers from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When step is equal to 0, returns an infinite sequence of
 * start. When start is equal to end, returns empty range.
 */
export declare function Range(start?: number, end?: number, step?: number): Range;

export interface Range extends IndexedSequence<number, Range> {
  length: number;
  has(index: number): boolean;
  get(index: number): number;
  slice(begin: number, end?: number): Range;

  /**
   * @override
   */
  asImmutable(): Range;
}



export declare module Map {

  /**
   * Map.empty() creates a new immutable map of length 0.
   */
  function empty(): Map<any, any>;

  /**
   * Creates a new immutable map with the same
   * key value pairs as the provided object.
   *
   *   var newMap = Map.fromObject({key: "value"});
   *
   */
  function fromObject<V>(object: {[key: string]: V;}): Map<string, V>;
}


/**
 * Creates a new empty map with specific key and value type.
 *
 *   var stringToNumberMap = Map<string, number>();
 *
 */
export declare function Map<K, V>(): Map<K, V>;


/**
 * Alias for Map.fromObject().
 */
export declare function Map<V>(object: {[key: string]: V;}): Map<string, V>;

/**
 * An immutable Map with lazy iteration.
 */
export interface Map<K, V> extends Sequence<K, V, Map<K, V>> {

  /**
   * The number of key-value pairs contained by this Map.
   */
  length: number;

  /**
   * True if a key exists within this Map.
   */
  has(k: K): boolean;

  /**
   * Returns the value associated with the provided key, or undefinedValue if
   * the Map does not have this key.
   *
   * Note: it is possible to store `undefined` as a value for a key, so if
   *`undefinedValue` is not provided and this method returns `undefined`, that
   * does not guarantee the key was not set.
   */
  get(k: K, undefinedValue?: V): V;
  getIn(keyPath: any[], pathOffset?: number): any;
  clear(): Map<K, V>;
  set(k: K, v: V): Map<K, V>;
  setIn(keyPath: any[], v: any, pathOffset?: number): Map<K, V>;
  delete(k: K): Map<K, V>;
  deleteIn(keyPath: any[], pathOffset?: number): Map<K, V>;

  merge(seq: Sequence<K, V, any>): Map<K, V>;
  merge(seq: {[key: string]: V;}): Map<string, V>;

  asMutable(): Map<K, V>;
  asImmutable(): Map<K, V>;
  clone(): Map<K, V>;
}


export declare function Set<T>(): Set<T>;
export declare function Set<T>(...values: T[]): Set<T>;

export declare module Set {
  function empty(): Set<any>;
  function fromArray<T>(values: T[]): Set<T>;
}

export interface Set<T> extends Sequence<T, T, Set<T>> {
  length: number;
  has(value: T): boolean;
  clear(): Set<T>;
  add(value: T): Set<T>;
  delete(value: T): Set<T>;
  merge(seq: Sequence<any, T, any>): Set<T>;
  merge(seq: Array<T>): Set<T>;

  asMutable(): Set<T>;
  asImmutable(): Set<T>;
  clone(): Set<T>;
}



/**
 * OrderedMap constructors return a Map which has the additional guarantee of
 * the iteration order of entries to match the order in which they were set().
 * This makes OrderedMap behave similarly to native JS objects.
 */
export declare module OrderedMap {

  /**
   * OrderedMap.empty() creates a new immutable ordered map of length 0.
   */
  function empty(): Map<any, any>;

  /**
   * Creates a new immutable ordered map with the same
   * key value pairs as the provided object.
   *
   *   var newMap = OrderedMapMap.fromObject({key: "value"});
   *
   */
  function fromObject<V>(object: {[key: string]: V;}): Map<string, V>;
}


/**
 * Creates a new empty map with specific key and value type.
 *
 *   var stringToNumberMap = OrderedMap<string, number>();
 *
 */
export declare function OrderedMap<K, V>(): Map<K, V>;


/**
 * Alias for OrderedMap.fromObject().
 */
export declare function OrderedMap<V>(object: {[key: string]: V;}): Map<string, V>;



export declare function Vector<T>(): Vector<T>;
export declare function Vector<T>(...values: T[]): Vector<T>;

export declare module Vector {
  function empty(): Vector<any>;
  function fromArray<T>(values: T[]): Vector<T>;
}

export interface Vector<T> extends IndexedSequence<T, Vector<T>> {
  length: number;
  has(index: number): boolean;
  get(index: number, undefinedValue?: T): T;
  getIn(indexPath: any[], pathOffset?: number): any;

  clear(): Vector<T>;
  set(index: number, value: T): Vector<T>;
  delete(index: number): Vector<T>;

  setIn(keyPath: any[], v: any, pathOffset?: number): Vector<T>;
  deleteIn(keyPath: any[], pathOffset?: number): Vector<T>;

  push(...values: T[]): Vector<T>;
  pop(): Vector<T>;
  unshift(...values: T[]): Vector<T>;
  shift(): Vector<T>;

  merge(seq: IndexedSequence<T, any>): Vector<T>;
  merge(seq: Array<T>): Vector<T>;

  /**
   * Similar to slice, but returns a new Vector (or mutates a mutable Vector).
   * Begin is a relative number from current origin. negative numbers add new
   * capacity on the left side of the vector, while positive numbers remove
   * values from the left side of the vector.
   * End is a relative number. If negative, it removes values from the right
   * side of the vector. If positive, sets the new length of the vector which
   * could remove values or add capacity depending on if it's longer than `length`.
   */
  setBounds(begin: number, end: number): Vector<T>;

  /**
   * Convienience for setBounds(0, length)
   */
  setLength(length: number): Vector<T>;

  asMutable(): Vector<T>;
  asImmutable(): Vector<T>;
  clone(): Vector<T>;
  __iterator__(): {next(): /*(number, T)*/Array<any>}
}
