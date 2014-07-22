/**
* The same semantics as Object.is(), but treats immutable data structures as
* data, equal when the structure contains equivalent data.
*/
export declare function is(first: any, second: any): boolean;

/**
 * Convert to and from plain JS objects and arrays.
 */
export declare function fromJS(json: any): any;
export declare function toJS(value: any): any;



/**
 * Sequences
 */
export declare function Sequence<T>(seq: IndexedSequence<T>): IndexedSequence<T>;
export declare function Sequence<K, V>(seq: Sequence<K, V>): Sequence<K, V>;
export declare function Sequence<T>(array: Array<T>): IndexedSequence<T>;
export declare function Sequence<T>(obj: {[key: string]: T}): Sequence<string, T>;
export declare function Sequence<T>(...values: T[]): IndexedSequence<T>;
export declare function Sequence(): Sequence<any, any>;

export interface Sequence<K, V> {

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

  /**
   * Converts this to a JavaScript native equivalent. IndexedSequence and Set
   * returns an Array while other Sequences return an Object.
   */
  toJS(): any;

  toArray(): Array<V>;

  toObject(): Object;

  toVector(): Vector<V>;

  toMap(): Map<K, V>;

  toOrderedMap(): Map<K, V>;

  toSet(): Set<V>;

  equals(other: Sequence<K, V>): boolean;

  join(separator?: string): string;

  concat(...valuesOrSequences: any[]): Sequence<any, any>;

  reverse(): Sequence<K, V>;

  keys(): IndexedSequence<K>;

  values(): IndexedSequence<V>;

  entries(): IndexedSequence</*(K, V)*/Array<any>>;

  /**
   * This behavior differs from Array.prototype.forEach
   * sideEffect is run for every entry in the sequence. If any sideEffect
   * returns false, the iteration will stop. Returns the length of the sequence
   * which was iterated.
   */
  forEach(
    sideEffect: (value?: V, key?: K, seq?: Sequence<K, V>) => any,
    thisArg?: Object
  ): number;

  first(
    predicate?: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object
  ): V;

  last(
    predicate?: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object
  ): V;

  reduce<R>(
    reducer: (reduction?: R, value?: V, key?: K, seq?: Sequence<K, V>) => R,
    initialReduction?: R,
    thisArg?: Object
  ): R;

  reduceRight<R>(
    reducer: (reduction?: R, value?: V, key?: K, seq?: Sequence<K, V>) => R,
    initialReduction: R,
    thisArg?: Object
  ): R;

  every(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object
  ): boolean;

  some(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object
  ): boolean;

  /**
   * True if a key exists within this Sequence.
   */
  has(key: K): boolean;

  /**
   * Returns the value associated with the provided key, or notFoundValue if
   * the Sequence does not contain this key.
   *
   * Note: it is possible a key may be associated with an `undefined` value, so
   * if `notFoundValue` is not provided and this method returns `undefined`,
   * that does not guarantee the key was not found.
   */
  get(key: K, notFoundValue?: V): V;

  /**
   * True if a value exists within this Sequence.
   */
  contains(value: V): boolean;

  find(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object,
    notFoundValue?: V
  ): V;

  findKey(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object
  ): K;

  findLast(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object,
    notFoundValue?: V
  ): V;

  findLastKey(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object
  ): K;

  flip(): Sequence<V, K>;

  map<M>(
    mapper: (value?: V, key?: K, seq?: Sequence<K, V>) => M,
    thisArg?: Object
  ): Sequence<K, M>;

  filter(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object
  ): Sequence<K, V>;

  slice(start: number, end?: number): Sequence<K, V>;

  splice(index: number, removeNum: number, ...values: any[]): Sequence<K, V>;

  take(amount: number): Sequence<K, V>;

  takeLast(amount: number): Sequence<K, V>;

  takeWhile(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object
  ): Sequence<K, V>;

  takeUntil(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object
  ): Sequence<K, V>;

  skip(amount: number): Sequence<K, V>;

  skipLast(amount: number): Sequence<K, V>;

  skipWhile(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object
  ): Sequence<K, V>;

  skipUntil(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: Object
  ): Sequence<K, V>;

  groupBy<G>(
    grouper: (value?: V, key?: K, seq?: Sequence<K, V>) => G,
    thisArg?: Object
  ): Map<G, Sequence<K, V>>;

  cacheResult(): Sequence<K, V>;
}



/**
 * Indexed Sequences are Sequences with numeric keys which are expected to
 * iterate in the order of their indices. They exhibit slightly different
 * behavior for some methods, and add others which do not make sense on
 * non-indexed sequences such as `indexOf`.
 */
export interface IndexedSequence<T> extends Sequence<number, T> {

  /**
   * If this is a sequence of entries (key-value tuples), it will return a
   * sequence of those entries.
   */
  fromEntries(): Sequence<any, any>;

  /**
   * Returns the first index at which a given value can be found in the
   * sequence, or -1 if it is not present.
   */
  indexOf(searchValue: T): number;

  /**
   * Returns the last index at which a given value can be found in the
   * sequence, or -1 if it is not present.
   */
  lastIndexOf(searchValue: T): number;

  /**
   * Returns the first index in the sequence where a value satisfies the
   * provided predicate function. Otherwise -1 is returned.
   */
  findIndex(
    predicate: (value?: T, index?: number, seq?: IndexedSequence<T>) => boolean,
    thisArg?: Object
  ): number;

  /**
   * Returns the last index in the sequence where a value satisfies the
   * provided predicate function. Otherwise -1 is returned.
   */
  findLastIndex(
    predicate: (value?: T, index?: number, seq?: IndexedSequence<T>) => boolean,
    thisArg?: Object
  ): number;

  /**
   * When IndexedSequence is converted to an array, the index keys are
   * maintained. This differs from the behavior of Sequence which
   * simply makes a dense array of all values.
   * @override
   */
  toArray(): Array<T>;

  /**
   * This has the same altered behavior as `toArray`.
   * @override
   */
  toVector(): Vector<T>;

  /**
   * This new behavior will iterate through the values and sequences with
   * increasing indices.
   * @override
   */
  concat(...valuesOrSequences: any[]): IndexedSequence<any>;

  /**
   * This new behavior will not only iterate through the sequence in reverse,
   * but it will also reverse the indices so the last value will report being
   * at index 0. If you wish to preserve the original indices, set
   * maintainIndices to true.
   * @override
   */
  reverse(maintainIndices?: boolean): IndexedSequence<T>;

  /**
   * Indexed sequences have a different `filter` behavior, where the filtered
   * values have new indicies incrementing from 0. If you want to preserve the
   * original indicies, set maintainIndices to true.
   * @override
   */
  filter(
    predicate: (value?: T, index?: number, seq?: IndexedSequence<T>) => boolean,
    thisArg?: Object,
    maintainIndices?: boolean
  ): IndexedSequence<T>;

  /**
   * Adds the ability to maintain original indices.
   * @override
   */
  slice(start: number, end?: number, maintainIndices?: boolean): IndexedSequence<T>;

  /**
   * Has the same altered behavior as `takeWhile`.
   * @override
   */
  take(amount: number, maintainIndices?: boolean): IndexedSequence<T>;

  /**
   * Has the same altered behavior as `takeWhile`.
   * @override
   */
  takeLast(amount: number, maintainIndices?: boolean): IndexedSequence<T>;

  /**
   * Indexed sequences have a different `takeWhile` behavior. The first
   * value will have an index of 0 and the length of the sequence could be
   * truncated. If you want to preserve the original indicies, set
   * maintainIndices to true.
   * @override
   */
  takeWhile(
    predicate: (value?: T, index?: number, seq?: IndexedSequence<T>) => boolean,
    thisArg?: Object,
    maintainIndices?: boolean
  ): IndexedSequence<T>;

  /**
   * Has the same altered behavior as `takeWhile`.
   * @override
   */
  takeUntil(
    predicate: (value?: T, index?: number, seq?: IndexedSequence<T>) => boolean,
    thisArg?: Object,
    maintainIndices?: boolean
  ): IndexedSequence<T>;

  /**
   * Has the same altered behavior as `skipWhile`.
   * @override
   */
  skip(amount: number, maintainIndices?: boolean): IndexedSequence<T>;

  /**
   * Has the same altered behavior as `skipWhile`.
   * @override
   */
  skipLast(amount: number, maintainIndices?: boolean): IndexedSequence<T>;

  /**
   * Indexed sequences have a different `skipWhile` behavior. The first
   * non-skipped value will have an index of 0. If you want to preserve the
   * original indicies, set maintainIndices to true.
   * @override
   */
  skipWhile(
    predicate: (value?: T, index?: number, seq?: IndexedSequence<T>) => boolean,
    thisArg?: Object,
    maintainIndices?: boolean
  ): IndexedSequence<T>;

  /**
   * Has the same altered behavior as `skipWhile`.
   * @override
   */
  skipUntil(
    predicate: (value?: T, index?: number, seq?: IndexedSequence<T>) => boolean,
    thisArg?: Object,
    maintainIndices?: boolean
  ): IndexedSequence<T>;

  groupBy<G>(
    grouper: (value?: T, index?: number, seq?: IndexedSequence<T>) => G,
    thisArg?: Object,
    maintainIndices?: boolean
  ): Map<G, any/*IndexedSequence<T>*/>; // Bug: exposing this causes the type checker to implode.

  // All below methods have identical behavior as Sequence,
  // except they take a function with index: number instead of key: K
  // and return an IndexedSequence.

  /**
   * @override
   */
  splice(index: number, removeNum: number, ...values: T[]): IndexedSequence<T>;

  /**
   * @override
   */
  map<M>(
    mapper: (value?: T, index?: number, seq?: IndexedSequence<T>) => M,
    thisArg?: Object
  ): IndexedSequence<M>;

  /**
   * @override
   */
  cacheResult(): IndexedSequence<T>;
}



/**
 * Returns a lazy sequence of numbers from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When step is equal to 0, returns an infinite sequence of
 * start. When start is equal to end, returns empty range.
 */
export declare function Range(start?: number, end?: number, step?: number): Range;

export interface Range extends IndexedSequence<number> {
  length: number;
  slice(begin: number, end?: number): Range;
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
  function fromObject<V>(object: {[key: string]: V}): Map<string, V>;
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
export declare function Map<V>(object: {[key: string]: V}): Map<string, V>;

/**
 * An immutable Map with lazy iteration.
 */
export interface Map<K, V> extends Sequence<K, V> {

  /**
   * The number of key-value pairs contained by this Map.
   */
  length: number;

  getIn(keyPath: Array<any>, pathOffset?: number): any;
  clear(): Map<K, V>;
  set(k: K, v: V): Map<K, V>;
  setIn(keyPath: Array<any>, v: any, pathOffset?: number): Map<K, V>;
  delete(k: K): Map<K, V>;
  deleteIn(keyPath: Array<any>, pathOffset?: number): Map<K, V>;

  merge(seq: Sequence<K, V>): Map<K, V>;
  merge(seq: {[key: string]: V}): Map<string, V>;

  mergeWith(
    merger: (previous?: V, next?: V) => V,
    seq: Sequence<K, V>
  ): Map<K, V>;
  mergeWith(
    merger: (previous?: V, next?: V) => V,
    seq: {[key: string]: V}
  ): Map<string, V>;

  deepMerge(seq: Sequence<K, V>): Map<K, V>;
  deepMerge(seq: {[key: string]: V}): Map<string, V>;

  deepMergeWith(
    merger: (previous?: V, next?: V) => V,
    seq: Sequence<K, V>
  ): Map<K, V>;
  deepMergeWith(
    merger: (previous?: V, next?: V) => V,
    seq: {[key: string]: V}
  ): Map<string, V>;

  withMutations(mutator: (mutable: Map<K, V>) => any): Map<K, V>;
}


export declare function Set<T>(): Set<T>;
export declare function Set<T>(...values: T[]): Set<T>;

export declare module Set {
  function empty(): Set<any>;
  function fromArray<T>(values: Array<T>): Set<T>;
}

export interface Set<T> extends Sequence<T, T> {
  length: number;
  clear(): Set<T>;
  add(value: T): Set<T>;
  delete(value: T): Set<T>;

  union(...seqs: Sequence<any, T>[]): Set<T>;
  union(...seqs: Array<T>[]): Set<T>;
  union(...seqs: {[key: string]: T}[]): Set<T>;

  intersect(...seqs: Sequence<any, T>[]): Set<T>;
  intersect(...seqs: Array<T>[]): Set<T>;
  intersect(...seqs: {[key: string]: T}[]): Set<T>;

  difference(...seqs: Sequence<any, T>[]): Set<T>;
  difference(...seqs: Array<T>[]): Set<T>;
  difference(...seqs: {[key: string]: T}[]): Set<T>;

  isSubset(seq: Sequence<any, T>): boolean;
  isSubset(seq: Array<T>): boolean;
  isSubset(seq: {[key: string]: T}): boolean;

  isSuperset(seq: Sequence<any, T>): boolean;
  isSuperset(seq: Array<T>): boolean;
  isSuperset(seq: {[key: string]: T}): boolean;

  withMutations(mutator: (mutable: Set<T>) => any): Set<T>;
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
   *   var newMap = OrderedMap.fromObject({key: "value"});
   *
   */
  function fromObject<V>(object: {[key: string]: V}): Map<string, V>;
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
export declare function OrderedMap<V>(object: {[key: string]: V}): Map<string, V>;



export declare function Vector<T>(): Vector<T>;
export declare function Vector<T>(...values: T[]): Vector<T>;

export declare module Vector {
  function empty(): Vector<any>;
  function fromArray<T>(values: Array<T>): Vector<T>;
}

/**
 * Vectors are like a Map with numeric keys which always iterate in the order
 * of their keys. They may be sparse: if an index has not been set, it will not
 * be iterated over. Also, via `setBounds` (or `fromArray` with a sparse array),
 * a Vector may have a length higher than the highest index.
 * See: [MDN: Array relationship between length and numeric properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Relationship_between_length_and_numerical_properties_2).
 */
export interface Vector<T> extends IndexedSequence<T> {
  length: number;
  getIn(indexPath: Array<any>, pathOffset?: number): any;

  clear(): Vector<T>;
  set(index: number, value: T): Vector<T>;
  delete(index: number): Vector<T>;

  setIn(keyPath: Array<any>, v: any, pathOffset?: number): Vector<T>;
  deleteIn(keyPath: Array<any>, pathOffset?: number): Vector<T>;

  push(...values: T[]): Vector<T>;
  pop(): Vector<T>;
  unshift(...values: T[]): Vector<T>;
  shift(): Vector<T>;

  merge(seq: IndexedSequence<T>): Vector<T>;
  merge(seq: Array<T>): Vector<T>;

  mergeWith(
    merger: (previous?: T, next?: T) => T,
    seq: IndexedSequence<T>
  ): Vector<T>;
  mergeWith(
    merger: (previous?: T, next?: T) => T,
    seq: Array<T>
  ): Vector<T>;

  deepMerge(seq: IndexedSequence<T>): Vector<T>;
  deepMerge(seq: Array<T>): Vector<T>;

  deepMergeWith(
    merger: (previous?: T, next?: T) => T,
    seq: IndexedSequence<T>
  ): Vector<T>;
  deepMergeWith(
    merger: (previous?: T, next?: T) => T,
    seq: Array<T>
  ): Vector<T>;

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

  withMutations(mutator: (mutable: Vector<T>) => any): Vector<T>;

  __iterator__(): {next(): /*(number, T)*/Array<any>}
}
