/**
 * Immutable Data
 * ==============
 *
 * Immutable data encourages pure functions (data-in, data-out) and lends itself
 * to much simpler application development and enabling techniques from
 * functional programming such as lazy evaluation.
 *
 * While designed to bring these powerful functional concepts to JavaScript, it
 * presents an Object-Oriented API familiar to Javascript engineers and closely
 * mirroring that of Array, Map, and Set. It is easy and efficient to convert to
 * and from plain Javascript types.
 */

/**
 * `Immutable.is()` has the same semantics as Object.is(), but treats immutable
 * sequences as data, equal if the second immutable sequences contains
 * equivalent data. It's used throughout when checking for equality.
 *
 *     var map1 = Immutable.Map({a:1, b:1, c:1});
 *     var map2 = Immutable.Map({a:1, b:1, c:1});
 *     assert(map1 !== map2);
 *     assert(Object.is(map1, map2) === false);
 *     assert(Immutable.is(map1, map2) === true);
 *
 */
export declare function is(first: any, second: any): boolean;

/**
 * `Immutable.fromJSON()` deeply converts plain JS objects and arrays to
 * Immutable sequences.
 */
export declare function fromJSON(json: any): any;



/**
 * Sequences
 * ---------
 *
 * A sequence is a set of (key, value) entries which can be iterated.
 * All immutable collections extend from Sequence, and can make use of all
 * the Sequence methods.
 *
 * **Sequences are immutable** — Once a sequence is created, it cannot be
 * changed, appended to, rearranged or otherwise modified. Instead, any mutative
 * method called on a sequence will return a new immutable sequence.
 *
 * **Sequences are lazy** — Sequences do as little work as necessary to respond
 * to any method call.
 *
 * For example, the following does no work, because the resulting sequence is
 * never used:
 *
 *     var oddSquares = Immutable.Sequence(1,2,3,4,5,6,7,8)
 *       .filter(x => x % 2).map(x => x * x);
 *
 * Once the sequence is used, it performs only the work necessary. In this
 * example, no intermediate arrays are ever created, filter is only called
 * twice, and map is only called once:
 *
 *     console.log(evenSquares.last()); // 49
 *
 * Note: A sequence is always iterated in the same order, however that order may
 * not always be well defined.
 */

/**
 * `Immutable.Sequence()` returns a sequence of its parameters.
 *
 *   * If provided a single argument:
 *     * If a Sequence, that same Sequence is returned.
 *     * If an Array, an `IndexedSequence` is returned.
 *     * If a plain Object, a `Sequence` is returned, iterated in the same order
 *       as the for-in would iterate through the Object itself.
 *   * An `IndexedSequence` of all arguments is returned.
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
   * length will be an integer. Otherwise it will be undefined.
   *
   * For example, the new Sequences returned from map() or reverse()
   * preserve the length of the original sequence while filter() does not.
   *
   * Note: All original collections will have a length, including Maps, Vectors,
   * Sets, Ranges, Repeats and Sequences made from Arrays and Objects.
   */
  length: number;

  /**
   * Deeply converts this sequence to a string.
   */
  toString(): string;

  /**
   * Deeply converts this sequence to equivalent JSON.
   *
   * IndexedSequences, Vectors, Ranges, Repeats and Sets become Arrays, while
   * other Sequences become Objects.
   */
  toJSON(): any;

  /**
   * Converts this sequence to an Array, discarding keys.
   */
  toArray(): Array<V>;

  /**
   * Converts this sequence to an Object. Throws if keys are not strings.
   */
  toObject(): Object;

  /**
   * Converts this sequence to a Vector, discarding keys.
   */
  toVector(): Vector<V>;

  /**
   * Converts this sequence to a Map, Throws if keys are not hashable.
   */
  toMap(): Map<K, V>;

  /**
   * Converts this sequence to a Map, maintaining the order of iteration.
   */
  toOrderedMap(): Map<K, V>;

  /**
   * Converts this sequence to a Set, discarding keys. Throws if values
   * are not hashable.
   */
  toSet(): Set<V>;

  /**
   * True if this and the other sequence have value equality, as defined
   * by `Immutable.is()`
   */
  equals(other: Sequence<K, V>): boolean;

  /**
   * Joins values together as a string, inserting a separator between each.
   * The default separator is ",".
   */
  join(separator?: string): string;

  /**
   * Returns a new sequence with other values and sequences concatenated to
   * this one. All entries will be present in the resulting sequence, even if
   * they have the same key.
   */
  concat(...valuesOrSequences: any[]): Sequence<any, any>;

  /**
   * Returns a new sequence which iterates in reverse order of this sequence.
   */
  reverse(): Sequence<K, V>;

  /**
   * Returns a new indexed sequence of the keys of this sequence,
   * discarding values.
   */
  keys(): IndexedSequence<K>;

  /**
   * Returns a new indexed sequence of the keys of this sequence,
   * discarding keys.
   */
  values(): IndexedSequence<V>;

  /**
   * Returns a new indexed sequence of [key, value] tuples.
   */
  entries(): IndexedSequence</*(K, V)*/Array<any>>;

  /**
   * SideEffect is executed for every entry in the sequence.
   *
   * Unlike `Array.prototype.forEach`, if any sideEffect returns `false`, the
   * iteration will stop. Returns the length of the sequence which was iterated.
   */
  forEach(
    sideEffect: (value?: V, key?: K, seq?: Sequence<K, V>) => any,
    thisArg?: any
  ): number;

  /**
   * Reduces the sequence to a value by calling the `reducer` for every entry
   * in the sequence and passing along the reduced value.
   */
  reduce<R>(
    reducer: (reduction?: R, value?: V, key?: K, seq?: Sequence<K, V>) => R,
    initialReduction?: R,
    thisArg?: any
  ): R;

  /**
   * Reduces the sequence in reverse
   */
  reduceRight<R>(
    reducer: (reduction?: R, value?: V, key?: K, seq?: Sequence<K, V>) => R,
    initialReduction: R,
    thisArg?: any
  ): R;

  /**
   * True if `predicate` returns true for all entries in the sequence.
   */
  every(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): boolean;

  /**
   * True if `predicate` returns true for any entry in the sequence.
   */
  some(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): boolean;

  /**
   * The first value in the sequence.
   */
  first(
    predicate?: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): V;

  /**
   * The last value in the sequence.
   */
  last(
    predicate?: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): V;

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
   * Returns the value found by following a key path through nested sequences.
   */
  getIn(searchKeyPath: Array<K>, notFoundValue?: V): V;

  /**
   * True if a value exists within this Sequence.
   */
  contains(value: V): boolean;

  /**
   * Returns the value for which the `predicate` returns true.
   */
  find(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any,
    notFoundValue?: V
  ): V;

  /**
   * Returns the key for which the `predicate` returns true.
   */
  findKey(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): K;

  /**
   * Returns the last value for which the `predicate` returns true.
   *
   * Note: `predicate` will be called for each entry in reverse.
   */
  findLast(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any,
    notFoundValue?: V
  ): V;

  /**
   * Returns the last key for which the `predicate` returns true.
   *
   * Note: `predicate` will be called for each entry in reverse.
   */
  findLastKey(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): K;

  /**
   * Returns a new sequence with this sequences's keys as it's values, and this
   * sequences's values as it's keys.
   *
   *     Sequence({a:'z',b:'y'}).flip() // { z: 'a', y: 'b' }
   *
   */
  flip(): Sequence<V, K>;

  /**
   * Returns a new sequence with values passed through a `mapper` function.
   *
   *     Sequence({a:1,b:2}).map(x => 10 * x) // { a: 10, b: 20 }
   *
   * Note: if you want to map keys instead of values, consider flipping the
   * Sequence before mapping:
   *
   *     Sequence({a:1,b:2}).flip().map(x => x.toUpperCase()).flip() // { A: 1, B: 2 }
   *
   */
  map<M>(
    mapper: (value?: V, key?: K, seq?: Sequence<K, V>) => M,
    thisArg?: any
  ): Sequence<K, M>;

  /**
   * Returns a new sequence with only the entries for which the `predicate`
   * function returns true.
   *
   *     Sequence({a:1,b:2,c:3,d:4}).map(x => x % 2 === 0) // { b: 2, d: 4 }
   *
   */
  filter(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): Sequence<K, V>;

  /**
   * Returns a new sequence representing a portion of this sequence from start
   * up to but not including end.
   *
   * If begin is negative, it is offset from the end of the sequence. e.g.
   * `slice(-2)` returns a sequence of the last two entries. If it is not
   * provided the new sequence will begin at the beginning of this sequence.
   *
   * If end is negative, it is offset from the end of the sequence. e.g.
   * `slice(0, -1)` returns a sequence of everything but the last entry. If it
   * is not provided, the new sequence will continue through the end of
   * this sequence.
   *
   * If the requested slice is equivalent to the current Sequence, then it will
   * return itself.
   *
   * Note: unlike `Array.prototype.slice`, this function is O(1) and copies
   * no data. The resulting sequence is also lazy, and a copy is only made when
   * it is converted such as via `toArray()` or `toVector()`.
   */
  slice(begin?: number, end?: number): Sequence<K, V>;

  splice(index: number, removeNum: number, ...values: any[]): Sequence<K, V>;

  take(amount: number): Sequence<K, V>;

  takeLast(amount: number): Sequence<K, V>;

  takeWhile(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): Sequence<K, V>;

  takeUntil(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): Sequence<K, V>;

  skip(amount: number): Sequence<K, V>;

  skipLast(amount: number): Sequence<K, V>;

  skipWhile(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): Sequence<K, V>;

  skipUntil(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): Sequence<K, V>;

  groupBy<G>(
    grouper: (value?: V, key?: K, seq?: Sequence<K, V>) => G,
    thisArg?: any
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
    thisArg?: any
  ): number;

  /**
   * Returns the last index in the sequence where a value satisfies the
   * provided predicate function. Otherwise -1 is returned.
   */
  findLastIndex(
    predicate: (value?: T, index?: number, seq?: IndexedSequence<T>) => boolean,
    thisArg?: any
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
    thisArg?: any,
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
    thisArg?: any,
    maintainIndices?: boolean
  ): IndexedSequence<T>;

  /**
   * Has the same altered behavior as `takeWhile`.
   * @override
   */
  takeUntil(
    predicate: (value?: T, index?: number, seq?: IndexedSequence<T>) => boolean,
    thisArg?: any,
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
    thisArg?: any,
    maintainIndices?: boolean
  ): IndexedSequence<T>;

  /**
   * Has the same altered behavior as `skipWhile`.
   * @override
   */
  skipUntil(
    predicate: (value?: T, index?: number, seq?: IndexedSequence<T>) => boolean,
    thisArg?: any,
    maintainIndices?: boolean
  ): IndexedSequence<T>;

  /**
   * Indexed sequences have a different `groupBy` behavior. Each group will be
   * a new indexed sequence starting with an index of 0. If you want to preserve
   * the original indicies, set maintainIndices to true.
   * @override
   */
  groupBy<G>(
    grouper: (value?: T, index?: number, seq?: IndexedSequence<T>) => G,
    thisArg?: any,
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
    thisArg?: any
  ): IndexedSequence<M>;

  /**
   * @override
   */
  cacheResult(): IndexedSequence<T>;
}


/**
 * Returns a lazy sequence of numbers from `start` (inclusive) to `end`
 * (exclusive), by `step`, where `start` defaults to 0, `step` to 1, and `end` to
 * infinity. When `step` is equal to 0, returns an infinite sequence of
 * `start`. When `start` is equal to `end`, returns empty range.
 */
export declare function Range(start?: number, end?: number, step?: number): IndexedSequence<number>;


/**
 * Returns a lazy sequence of `value` repeated `times` times. When `times` is
 * not defined, returns an infinite sequence of `value`.
 */
export declare function Repeat<T>(value: T, times?: number): IndexedSequence<T>;


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

  clear(): Map<K, V>;
  set(k: K, v: V): Map<K, V>;
  delete(k: K): Map<K, V>;

  updateIn(
    keyPath: Array<any>,
    updater: (value: any) => any
  ): Map<K, V>;

  merge(...seqs: Sequence<K, V>[]): Map<K, V>;
  merge(...seqs: {[key: string]: V}[]): Map<string, V>;

  mergeWith(
    merger: (previous?: V, next?: V) => V,
    ...seqs: Sequence<K, V>[]
  ): Map<K, V>;
  mergeWith(
    merger: (previous?: V, next?: V) => V,
    ...seq: {[key: string]: V}[]
  ): Map<string, V>;

  deepMerge(...seq: Sequence<K, V>[]): Map<K, V>;
  deepMerge(...seq: {[key: string]: V}[]): Map<string, V>;

  deepMergeWith(
    merger: (previous?: V, next?: V) => V,
    ...seq: Sequence<K, V>[]
  ): Map<K, V>;
  deepMergeWith(
    merger: (previous?: V, next?: V) => V,
    ...seq: {[key: string]: V}[]
  ): Map<string, V>;

  withMutations(mutator: (mutable: Map<K, V>) => any): Map<K, V>;
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


/**
 * Creates a constructor function which produces maps with a specific set of
 * allowed keys.
 *
 *   var ABRecord = Record({a:1, b:2});
 *   var myRecord = new ABRecord({b:3});
 *
 */
export declare function Record(defaultValues: Object): {
  new (values?: Object): Map<string, any>;
}


export declare function Set<T>(): Set<T>;
export declare function Set<T>(...values: T[]): Set<T>;

export declare module Set {
  function empty(): Set<any>;
  function fromArray<T>(values: Array<T>): Set<T>;
}

export interface Set<T> extends Sequence<T, T> {
  length: number;

  /**
   * Returns an empty set.
   */
  clear(): Set<T>;

  /**
   * Returns a set which also includes this value.
   */
  add(value: T): Set<T>;

  /**
   * Returns a set which excludes this value.
   */
  delete(value: T): Set<T>;

  /**
   * Returns a set which has added any entry from `seqs` that does not already
   * exist in the set.
   */
  union(...seqs: Sequence<any, T>[]): Set<T>;
  union(...seqs: Array<T>[]): Set<T>;
  union(...seqs: {[key: string]: T}[]): Set<T>;

  /**
   * Returns a set which has removed any entries not also contained
   * within `seqs`.
   */
  intersect(...seqs: Sequence<any, T>[]): Set<T>;
  intersect(...seqs: Array<T>[]): Set<T>;
  intersect(...seqs: {[key: string]: T}[]): Set<T>;

  /**
   * Returns a set which has removed any entries contained within `seqs`.
   */
  subtract(...seqs: Sequence<any, T>[]): Set<T>;
  subtract(...seqs: Array<T>[]): Set<T>;
  subtract(...seqs: {[key: string]: T}[]): Set<T>;

  /**
   * True if seq contains every value in this set.
   */
  isSubset(seq: Sequence<any, T>): boolean;
  isSubset(seq: Array<T>): boolean;
  isSubset(seq: {[key: string]: T}): boolean;

  /**
   * True if seq this set contains every value in seq.
   */
  isSuperset(seq: Sequence<any, T>): boolean;
  isSuperset(seq: Array<T>): boolean;
  isSuperset(seq: {[key: string]: T}): boolean;

  withMutations(mutator: (mutable: Set<T>) => any): Set<T>;
}


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

  clear(): Vector<T>;
  set(index: number, value: T): Vector<T>;
  delete(index: number): Vector<T>;

  push(...values: T[]): Vector<T>;
  pop(): Vector<T>;
  unshift(...values: T[]): Vector<T>;
  shift(): Vector<T>;

  updateIn(
    keyPath: Array<any>,
    updater: (value: any) => any
  ): Vector<T>;

  merge(...seq: IndexedSequence<T>[]): Vector<T>;
  merge(...seq: Array<T>[]): Vector<T>;

  mergeWith(
    merger: (previous?: T, next?: T) => T,
    ...seq: IndexedSequence<T>[]
  ): Vector<T>;
  mergeWith(
    merger: (previous?: T, next?: T) => T,
    ...seq: Array<T>[]
  ): Vector<T>;

  deepMerge(seq: IndexedSequence<T>): Vector<T>;
  deepMerge(seq: Array<T>): Vector<T>;

  deepMergeWith(
    merger: (previous?: T, next?: T) => T,
    ...seq: IndexedSequence<T>[]
  ): Vector<T>;
  deepMergeWith(
    merger: (previous?: T, next?: T) => T,
    ...seq: Array<T>[]
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
