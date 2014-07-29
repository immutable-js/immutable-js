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
 *
 * If a `converter` is optionally provided, it will be called with every
 * sequence (beginning with the most nested sequences and proceeding to the
 * original sequence itself), along with the key refering to this Sequence
 * and the parent JSON object provided as `this`. For the top level, object,
 * the key will be "". This `converter` is expected to return a new Sequence,
 * allowing for custom convertions from JSON.
 *
 * This example converts JSON to Vector and OrderedMap:
 *
 *     Immutable.fromJSON({a: {b: [10, 20, 30]}, c: 40}, function (value, key) {
 *       var isIndexed = value instanceof IndexedSequence;
 *       console.log(isIndexed, key, this);
 *       return isIndexed ? value.toVector() : value.toOrderedMap();
 *     });
 *
 *     // true, "b", {b: [10, 20, 30]}
 *     // false, "a", {a: {b: [10, 20, 30]}, c: 40}
 *     // false, "", {"": {a: {b: [10, 20, 30]}, c: 40}}
 *
 * If `converter` is not provided, the default behavior will convert Arrays into
 * Vectors and Objects into Maps.
 *
 * Note: `converter` acts similarly to [`reviver`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter)
 * in `JSON.parse`.
 */
export declare function fromJSON(
  json: any,
  converter?: (k: any, v: Sequence<any, any>) => any
): any;



/**
 * Sequence
 * --------
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
 *
 * Note: if a Sequence is created from a JavaScript Array or Object, then it can
 * still possibly mutated if the underlying Array or Object is ever mutated.
 */
export declare function Sequence<T>(seq: IndexedSequence<T>): IndexedSequence<T>;
export declare function Sequence<T>(array: Array<T>): IndexedSequence<T>;
export declare function Sequence<K, V>(seq: Sequence<K, V>): Sequence<K, V>;
export declare function Sequence<V>(obj: {[key: string]: V}): Sequence<string, V>;
export declare function Sequence<T>(...values: T[]): IndexedSequence<T>;
export declare function Sequence(): Sequence<any, any>;

/**
 * Like `Immutable.Sequence()`, `Immutable.Sequence.from()` returns a sequence,
 * but always expects a single argument.
 */
export declare module Sequence {
  function from<T>(seq: IndexedSequence<T>): IndexedSequence<T>;
  function from<T>(array: Array<T>): IndexedSequence<T>;
  function from<K, V>(seq: Sequence<K, V>): Sequence<K, V>;
  function from<V>(obj: {[key: string]: V}): Sequence<string, V>;
}


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

  /**
   * Returns a new sequence which contains the first `amount` entries from
   * this sequence.
   */
  take(amount: number): Sequence<K, V>;

  /**
   * Returns a new sequence which contains the last `amount` entries from
   * this sequence.
   */
  takeLast(amount: number): Sequence<K, V>;

  /**
   * Returns a new sequence which contains entries from this sequence as long
   * as the `predicate` returns true.
   *
   *     Sequence('dog','frog','cat','hat','god').takeWhile(x => x.match(/o/))
   *     // ['dog', 'frog']
   *
   */
  takeWhile(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): Sequence<K, V>;

  /**
   * Returns a new sequence which contains entries from this sequence as long
   * as the `predicate` returns false.
   *
   *     Sequence('dog','frog','cat','hat','god').takeUntil(x => x.match(/at/))
   *     // ['dog', 'frog']
   *
   */
  takeUntil(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): Sequence<K, V>;

  /**
   * Returns a new sequence which excludes the first `amount` entries from
   * this sequence.
   */
  skip(amount: number): Sequence<K, V>;

  /**
   * Returns a new sequence which excludes the last `amount` entries from
   * this sequence.
   */
  skipLast(amount: number): Sequence<K, V>;

  /**
   * Returns a new sequence which contains entries starting from when
   * `predicate` first returns false.
   *
   *     Sequence('dog','frog','cat','hat','god').skipWhile(x => x.match(/g/))
   *     // ['cat', 'hat', 'god']
   *
   */
  skipWhile(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): Sequence<K, V>;

  /**
   * Returns a new sequence which contains entries starting from when
   * `predicate` first returns true.
   *
   *     Sequence('dog','frog','cat','hat','god').skipUntil(x => x.match(/hat/))
   *     // ['hat', 'god']
   *
   */
  skipUntil(
    predicate: (value?: V, key?: K, seq?: Sequence<K, V>) => boolean,
    thisArg?: any
  ): Sequence<K, V>;

  /**
   * Returns a `Map` of sequences, grouped by the return value of the
   * `grouper` function.
   *
   * Note: Because this returns a Map, this method is not lazy.
   */
  groupBy<G>(
    grouper: (value?: V, key?: K, seq?: Sequence<K, V>) => G,
    thisArg?: any
  ): Map<G, Sequence<K, V>>;

  /**
   * Because Sequences are lazy and designed to be chained together, they do
   * not cache their results. For example, this map function is called 6 times:
   *
   *     var squares = Sequence(1,2,3).map(x => x * x);
   *     squares.join() + squares.join();
   *
   * If you know a derived sequence will be used multiple times, it may be more
   * efficient to first cache it. Here, map is called 3 times:
   *
   *     var squares = Sequence(1,2,3).map(x => x * x).cacheResult();
   *     squares.join() + squares.join();
   *
   * Use this method judiciously, as it must fully evaluate a lazy Sequence.
   *
   * Note: after calling `cacheResult()`, a Sequence will always have a length.
   */
  cacheResult(): Sequence<K, V>;
}


/**
 * Indexed Sequence
 * ----------------
 *
 * Indexed Sequences have incrementing numeric keys. They exhibit
 * slightly different behavior than `Sequence` for some methods in order to
 * better mirror the behavior of JavaScript's `Array`, and add others which do
 * not make sense on non-indexed sequences such as `indexOf`.
 *
 * Like JavaScript arrays, `IndexedSequence`s may be sparse, skipping over some
 * indices and may have a length larger than the highest index.
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
   * Splice returns a new indexed sequence by replacing a region of this sequence
   * with new values. If values are not provided, it only skips the region to
   * be removed.
   *
   *     Sequence(['a','b','c','d']).splice(1, 2, 'q', 'r', 's')
   *     // ['a', 'q', 'r', 's', 'd']
   *
   */
  splice(index: number, removeNum: number, ...values: any[]): IndexedSequence<T>;

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

  /**
   * Returns an IndexedSequence
   * @override
   */
  map<M>(
    mapper: (value?: T, index?: number, seq?: IndexedSequence<T>) => M,
    thisArg?: any
  ): IndexedSequence<M>;

  /**
   * Returns an IndexedSequence
   * @override
   */
  cacheResult(): IndexedSequence<T>;
}


/**
 * Range
 * -----
 *
 * Returns a lazy indexed sequence of numbers from `start` (inclusive) to `end`
 * (exclusive), by `step`, where `start` defaults to 0, `step` to 1, and `end` to
 * infinity. When `start` is equal to `end`, returns empty range.
 *
 *     Range() // [0,1,2,3,...]
 *     Range(10) // [10,11,12,13,...]
 *     Range(10,15) // [10,11,12,13,14]
 *     Range(10,30,5) // [10,15,20,25]
 *     Range(30,10,5) // [30,25,20,15]
 *     Range(30,30,5) // []
 *
 */
export declare function Range(start?: number, end?: number, step?: number): IndexedSequence<number>;


/**
 * Repeat
 * ------
 *
 * Returns a lazy sequence of `value` repeated `times` times. When `times` is
 * not defined, returns an infinite sequence of `value`.
 *
 *     Repeat('foo') // ['foo','foo','foo',...]
 *     Repeat('bar',4) // ['bar','bar','bar','bar']
 *
 */
export declare function Repeat<T>(value: T, times?: number): IndexedSequence<T>;


/**
 * Map
 * ---
 *
 * A Map is a Sequence of (key, value) pairs with `O(log32 N)` gets and sets.
 *
 * Map is a hash map and requires keys that are hashable, either a primitive
 * (string or number) or an object with a `hashCode(): number` method.
 *
 * Iteration order of a Map is undefined, however is stable. Multiple iterations
 * of the same Map will iterate in the same order.
 */

export declare module Map {

  /**
   * `Map.empty()` creates a new immutable map of length 0.
   */
  function empty<K, V>(): Map<K, V>;

  /**
   * `Map.from()` creates a new immutable Map with the same key value pairs as
   * the provided Sequence or JavaScript Object or Array.
   *
   *     var newMap = Map.from({key: "value"});
   *
   */
  function from<K, V>(sequence: Sequence<K, V>): Map<K, V>;
  function from<V>(object: {[key: string]: V}): Map<string, V>;
  function from<V>(array: Array<V>): Map<number, V>;
}

/**
 * Alias for `Map.empty()`.
 */
export declare function Map<K, V>(): Map<K, V>;

/**
 * Alias for `Map.from()`.
 */
export declare function Map<K, V>(sequence: Sequence<K, V>): Map<K, V>;
export declare function Map<V>(object: {[key: string]: V}): Map<string, V>;
export declare function Map<V>(array: Array<V>): Map<number, V>;


export interface Map<K, V> extends Sequence<K, V> {

  /**
   * Returns a new Map also containing the new key, value pair. If an equivalent
   * key already exists in this Map, it will be replaced.
   */
  set(key: K, value: V): Map<K, V>;

  /**
   * Returns a new Map which excludes this `key`.
   */
  delete(key: K): Map<K, V>;

  /**
   * Returns a new Map containing no keys or values.
   */
  clear(): Map<K, V>;

  /**
   * Returns a new Map having applied the `updater` to the entry found at the
   * keyPath. If the keyPath does not result in a value, it returns itself.
   *
   *     var data = Immutable.fromJS({ a: { b: { c: 10 } } });
   *     data.updateIn(['a', 'b'], map => map.set('d', 20));
   *     // { a: { b: { c: 10, d: 20 } } }
   *
   */
  updateIn(
    keyPath: Array<any>,
    updater: (value: any) => any
  ): Map<K, V>;

  /**
   * Returns a new Map resulting from merging the provided Sequences
   * (or JS objects) into this Map. In other words, this takes each entry of
   * each sequence and sets it on this Map.
   *
   *     var x = Immutable.Map({a: 10, b: 20, c: 30});
   *     var y = Immutable.Map({b: 40, a: 50, d: 60});
   *     x.merge(y) // { a: 50, b: 40, c: 30, d: 60 }
   *     y.merge(x) // { b: 20, a: 10, d: 60, c: 30 }
   *
   */
  merge(...sequences: Sequence<K, V>[]): Map<K, V>;
  merge(...sequences: {[key: string]: V}[]): Map<string, V>;

  /**
   * Like `merge()`, `mergeWith()` returns a new Map resulting from merging the
   * provided Sequences (or JS objects) into this Map, but uses the `merger`
   * function for dealing with conflicts.
   *
   *     var x = Immutable.Map({a: 10, b: 20, c: 30});
   *     var y = Immutable.Map({b: 40, a: 50, d: 60});
   *     x.mergeWith((prev, next) => prev / next, y) // { a: 0.2, b: 0.5, c: 30, d: 60 }
   *     y.mergeWith((prev, next) => prev / next, x) // { b: 2, a: 5, d: 60, c: 30 }
   *
   */
  mergeWith(
    merger: (previous?: V, next?: V) => V,
    ...sequences: Sequence<K, V>[]
  ): Map<K, V>;
  mergeWith(
    merger: (previous?: V, next?: V) => V,
    ...sequences: {[key: string]: V}[]
  ): Map<string, V>;

  /**
   * Like `merge()`, but when two Sequences conflict, it merges them as well,
   * recursing deeply through the nested data.
   *
   *     var x = Immutable.fromJS({a: { x: 10, y: 10 }, b: { x: 20, y: 50 } });
   *     var y = Immutable.fromJS({a: { x: 2 }, b: { y: 5 }, c: { z: 3 } });
   *     x.deepMerge(y) // {a: { x: 2, y: 10 }, b: { x: 20, y: 5 }, c: { z: 3 } }
   *
   */
  deepMerge(...sequences: Sequence<K, V>[]): Map<K, V>;
  deepMerge(...sequences: {[key: string]: V}[]): Map<string, V>;

  /**
   * Like `deepMerge()`, but when two non-Sequences conflict, it uses the
   * `merger` function to determine the resulting value.
   *
   *     var x = Immutable.fromJS({a: { x: 10, y: 10 }, b: { x: 20, y: 50 } });
   *     var y = Immutable.fromJS({a: { x: 2 }, b: { y: 5 }, c: { z: 3 } });
   *     x.deepMergeWith((prev, next) => prev / next, y)
   *     // {a: { x: 5, y: 10 }, b: { x: 20, y: 10 }, c: { z: 3 } }
   *
   */
  deepMergeWith(
    merger: (previous?: V, next?: V) => V,
    ...sequences: Sequence<K, V>[]
  ): Map<K, V>;
  deepMergeWith(
    merger: (previous?: V, next?: V) => V,
    ...sequences: {[key: string]: V}[]
  ): Map<string, V>;

  /**
   * Every time you call one of the above functions, a new immutable Map is
   * created. If a pure function calls a number of these to produce a final
   * return value, then a penalty on performance and memory has been paid by
   * creating all of the intermediate immutable Maps.
   *
   * If you need to apply a series of mutations to produce a new immutable
   * Map, `withMutations()` create a temporary mutable copy of the Map which
   * can applying mutations in a highly performant manner. In fact, this is
   * exactly how complex mutations like `merge` are done.
   *
   * As an example, this results in the creation of 1, not 3, new Maps:
   *
   *     var map1 = Immutable.Map();
   *     var map2 = map1.withMutations(map => {
   *       map.set('a', 1).set('b', 2).set('c', 3);
   *     });
   *     assert(map1.length === 0);
   *     assert(map2.length === 3);
   *
   */
  withMutations(mutator: (mutable: Map<K, V>) => any): Map<K, V>;
}


/**
 * Ordered Map
 * -----------
 *
 * OrderedMap constructors return a Map which has the additional guarantee of
 * the iteration order of entries to match the order in which they were set().
 * This makes OrderedMap behave similarly to native JS objects.
 */

export declare module OrderedMap {

  /**
   * `OrderedMap.empty()` creates a new immutable ordered Map of length 0.
   */
  function empty<K, V>(): Map<K, V>;

  /**
   * `OrderedMap.from()` creates a new immutable ordered Map with the same key
   * value pairs as the provided Sequence or JavaScript Object or Array.
   *
   *   var newMap = OrderedMap.from({key: "value"});
   *
   */
  function from<K, V>(sequence: Sequence<K, V>): Map<K, V>;
  function from<V>(object: {[key: string]: V}): Map<string, V>;
  function from<V>(array: Array<V>): Map<number, V>;
}

/**
 * Alias for `OrderedMap.empty()`.
 */
export declare function OrderedMap<K, V>(): Map<K, V>;

/**
 * Alias for `OrderedMap.from()`.
 */
export declare function OrderedMap<K, V>(sequence: Sequence<K, V>): Map<K, V>;
export declare function OrderedMap<V>(object: {[key: string]: V}): Map<string, V>;
export declare function OrderedMap<V>(array: Array<V>): Map<number, V>;


/**
 * Record
 * ------
 *
 * Creates a new Class which produces maps with a specific set of allowed string
 * keys and have default values.
 *
 *     var ABRecord = Record({a:1, b:2})
 *     var myRecord = new ABRecord({b:3})
 *
 * Records always have a value for the keys they define. `delete()`ing a key
 * from a record simply resets it to the default value for that key.
 *
 *     myRecord.length // 2
 *     myRecordWithoutB = myRecord.delete('b')
 *     myRecordWithoutB.get('b') // 2
 *     myRecordWithoutB.length // 2
 *
 * Because Records have a known set of string keys, property get access works as
 * expected, however property sets will throw an Error.
 *
 *     myRecord.b // 3
 *     myRecord.b = 5 // throws Error
 *
 * Record Classes can be extended as well, allowing for custom methods on your
 * Record. This isn't how things are done in functional environments, but is a
 * common pattern in many JS programs.
 *
 *     class ABRecord extends Record({a:1,b:2}) {
 *       getAB() {
 *         return this.a + this.b;
 *       }
 *     }
 *
 *     var myRecord = new ABRecord(b:3)
 *     myRecord.getAB() // 4
 *
 */
export declare function Record(defaultValues: Sequence<string, any>, name?: string): RecordClass;
export declare function Record(defaultValues: {[key: string]: any}, name?: string): RecordClass;

export interface RecordClass {
  new (): Map<string, any>;
  new (values: Sequence<string, any>): Map<string, any>;
  new (values: {[key: string]: any}): Map<string, any>;
}


/**
 * Set
 * ---
 *
 * A Set is a Sequence of unique values with `O(log32 N)` gets and sets.
 *
 * Sets, like Maps, require that their values are hashable, either a primitive
 * (string or number) or an object with a `hashCode(): number` method.
 *
 * When iterating a Set, the entries will be (value, value) pairs. Iteration
 * order of a Set is undefined, however is stable. Multiple iterations of the
 * same Set will iterate in the same order.
 */

export declare module Set {

  /**
   * `Set.empty()` creates a new immutable set of length 0.
   */
  function empty<T>(): Set<T>;

  /**
   * `Set.from()` creates a new immutable Set containing the values from this
   * Sequence or JavaScript Array.
   */
  function from<T>(sequence: Sequence<any, T>): Set<T>;
  function from<T>(array: Array<T>): Set<T>;

  /**
   * `Set.fromKeys()` creates a new immutable Set containing the keys from
   * this Sequence or JavaScript Object.
   */
  function fromKeys<T>(sequence: Sequence<T, any>): Set<T>;
  function fromKeys(object: {[key: string]: any}): Set<string>;
}

/**
 * Alias for `Set.empty()`
 */
export declare function Set<T>(): Set<T>;

/**
 * Like `Set.from()`, but accepts variable arguments instead of an Array.
 */
export declare function Set<T>(...values: T[]): Set<T>;


export interface Set<T> extends Sequence<T, T> {

  /**
   * Returns a new Set which also includes this value.
   */
  add(value: T): Set<T>;

  /**
   * Returns a new Set which excludes this value.
   */
  delete(value: T): Set<T>;

  /**
   * Returns a new Set containing no values.
   */
  clear(): Set<T>;

  /**
   * Returns a Set including any value from `sequences` that does not already
   * exist in this Set.
   */
  union(...sequences: Sequence<any, T>[]): Set<T>;
  union(...sequences: Array<T>[]): Set<T>;

  /**
   * Returns a Set which has removed any values not also contained
   * within `sequences`.
   */
  intersect(...sequences: Sequence<any, T>[]): Set<T>;
  intersect(...sequences: Array<T>[]): Set<T>;

  /**
   * Returns a Set excluding any values contained within `sequences`.
   */
  subtract(...sequences: Sequence<any, T>[]): Set<T>;
  subtract(...sequences: Array<T>[]): Set<T>;

  /**
   * True if `sequence` contains every value in this Set.
   */
  isSubset(sequence: Sequence<any, T>): boolean;
  isSubset(sequence: Array<T>): boolean;

  /**
   * True if this Set contains every value in `sequence`.
   */
  isSuperset(sequence: Sequence<any, T>): boolean;
  isSuperset(sequence: Array<T>): boolean;

  /**
   * @see `Map.prototype.withMutations`
   */
  withMutations(mutator: (mutable: Set<T>) => any): Set<T>;
}


/**
 * Vector
 * ------
 *
 * Vectors are like a Map with numeric keys which always iterate in the order
 * of their keys. They may be sparse: if an index has not been set, it will not
 * be iterated over. Also, via `setBounds` (or `fromArray` with a sparse array),
 * a Vector may have a length higher than the highest index.
 *
 * @see: [MDN: Array relationship between length and numeric properties](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array#Relationship_between_length_and_numerical_properties_2).
 */

export declare module Vector {

  /**
   * `Vector.empty()` returns a Vector of length 0.
   */
  function empty<T>(): Vector<T>;

  /**
   * `Vector.from()` returns a Vector of the same length of the provided
   * `values` JavaScript Array or Sequence, containing the values at the
   * same indices.
   *
   * If a non-indexed Sequence is provided, its keys will be discarded and
   * its values will be used to fill the returned Vector.
   */
  function from<T>(array: Array<T>): Vector<T>;
  function from<T>(sequence: Sequence<any, T>): Vector<T>;
}

/**
 * Alias for `Vector.empty()`
 */
export declare function Vector<T>(): Vector<T>;

/**
 * Like `Vector.from()`, but accepts variable arguments instead of an Array.
 */
export declare function Vector<T>(...values: T[]): Vector<T>;


export interface Vector<T> extends IndexedSequence<T> {

  /**
   * Returns a new Vector which includes `value` at `index`. If `index` already
   * exists in this Vector, it will be replaced.
   */
  set(index: number, value: T): Vector<T>;

  /**
   * Returns a new Map which excludes this `index`. It will not affect the
   * length of the Vector, instead leaving a sparse hole.
   */
  delete(index: number): Vector<T>;

  /**
   * Returns a new Vector with 0 length and no values.
   */
  clear(): Vector<T>;

  /**
   * Returns a new Vector with the provided `values` appended, starting at this
   * Vector's `length`.
   */
  push(...values: T[]): Vector<T>;

  /**
   * Returns a new Vector with a length ones less than this Vector, excluding
   * the last index in this Vector.
   *
   * Note: this differs from `Array.prototype.pop` because it returns a new
   * Vector rather than the removed value. Use `last()` to get the last value
   * in this Vector.
   */
  pop(): Vector<T>;

  /**
   * Returns a new Vector with the provided `values` prepended, pushing other
   * values ahead to higher indices.
   */
  unshift(...values: T[]): Vector<T>;

  /**
   * Returns a new Vector with a length ones less than this Vector, excluding
   * the first index in this Vector, shifting all other values to a lower index.
   *
   * Note: this differs from `Array.prototype.shift` because it returns a new
   * Vector rather than the removed value. Use `first()` to get the last value
   * in this Vector.
   */
  shift(): Vector<T>;

  /**
   * @see `Map.prototype.updateIn`
   */
  updateIn(
    keyPath: Array<any>,
    updater: (value: any) => any
  ): Vector<T>;

  /**
   * @see `Map.prototype.merge`
   */
  merge(...sequences: IndexedSequence<T>[]): Vector<T>;
  merge(...sequences: Array<T>[]): Vector<T>;

  /**
   * @see `Map.prototype.mergeWith`
   */
  mergeWith(
    merger: (previous?: T, next?: T) => T,
    ...sequences: IndexedSequence<T>[]
  ): Vector<T>;
  mergeWith(
    merger: (previous?: T, next?: T) => T,
    ...sequences: Array<T>[]
  ): Vector<T>;

  /**
   * @see `Map.prototype.deepMerge`
   */
  deepMerge(...sequences: IndexedSequence<T>[]): Vector<T>;
  deepMerge(...sequences: Array<T>[]): Vector<T>;

  /**
   * @see `Map.prototype.deepMergeWith`
   */
  deepMergeWith(
    merger: (previous?: T, next?: T) => T,
    ...sequences: IndexedSequence<T>[]
  ): Vector<T>;
  deepMergeWith(
    merger: (previous?: T, next?: T) => T,
    ...sequences: Array<T>[]
  ): Vector<T>;

  /**
   * Returns a new Vector with length `length`. If `length` is less than this
   * Vector's length, the new Vector will exclude values at the higher indices.
   * If `length` is greater than this Vector's length, the new Vector will have
   * unset sparse holes for the newly available indices.
   */
  setLength(length: number): Vector<T>;

  /**
   * @see `Map.prototype.withMutations`
   */
  withMutations(mutator: (mutable: Vector<T>) => any): Vector<T>;

  /**
   * Allows `Vector` to be used in ES7 for expressions, returns an `Iterator`
   * which has a `next()` method which returns the next (index, value) tuple.
   *
   * When no entries remain, throws StopIteration in ES7 otherwise returns null.
   */
  __iterator__(): {next(): /*(number, T)*/Array<any>}
}
