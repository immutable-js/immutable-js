/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

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

declare module 'immutable' {

  /**
   * `Immutable.is()` has the same semantics as Object.is(), but treats
   * Immutable collections and sequences as values, equal if the second
   * Immutable iterable contains equivalent values. It's used throughout when
   * checking for equality.
   *
   *     var map1 = Immutable.Map({a:1, b:1, c:1});
   *     var map2 = Immutable.Map({a:1, b:1, c:1});
   *     assert(map1 !== map2);
   *     assert(Object.is(map1, map2) === false);
   *     assert(Immutable.is(map1, map2) === true);
   *
   */
  export function is(first: any, second: any): boolean;

  /**
   * `Immutable.fromJS()` deeply converts plain JS objects and arrays to
   * Immutable Maps and Lists.
   *
   * If a `reviver` is optionally provided, it will be called with every
   * collection as a Seq (beginning with the most nested collections
   * and proceeding to the top-level collection itself), along with the key
   * refering to each collection and the parent JS object provided as `this`.
   * For the top level, object, the key will be "". This `reviver` is expected
   * to return a new Immutable Iterable, allowing for custom convertions from
   * deep JS objects.
   *
   * This example converts JSON to List and OrderedMap:
   *
   *     Immutable.fromJS({a: {b: [10, 20, 30]}, c: 40}, function (key, value) {
   *       var isIndexed = Immutable.Iterable.isIndexed(value);
   *       return isIndexed ? value.toList() : value.toOrderedMap();
   *     });
   *
   *     // true, "b", {b: [10, 20, 30]}
   *     // false, "a", {a: {b: [10, 20, 30]}, c: 40}
   *     // false, "", {"": {a: {b: [10, 20, 30]}, c: 40}}
   *
   * If `reviver` is not provided, the default behavior will convert Arrays into
   * Lists and Objects into Maps.
   *
   * `reviver` acts similarly to [`JSON.parse`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter).
   *
   * `Immutable.fromJS` is conservative in it's conversion. It will only convert
   * arrays which pass `Array.isArray` to Lists, and only raw objects (no custom
   * prototype) to Map.
   */
  export function fromJS(
    json: any,
    reviver?: (k: any, v: Iterable<any, any>) => any
  ): any;



  /**
   * Iterable
   * --------
   *
   * The `Iterable` is a set of (key, value) entries which can be iterated, and
   * is the base class for all collections in `immutable`, allowing them to
   * make use of all the Iterable methods (such as `map` and `filter`).
   *
   * Note: An iterable is always iterated in the same order, however that order
   * may not always be well defined, as is the case for the `Map` and `Set`.
   */
  export module Iterable {
    /**
     * True if `maybeIterable` is an Iterable, or any of its subclasses.
     */
    function isIterable(maybeIterable: any): boolean;

    /**
     * True if `maybeKeyed` is a KeyedIterable, or any of its subclasses.
     */
    function isKeyed(maybeKeyed: any): boolean;

    /**
     * True if `maybeIndexed` is a IndexedIterable, or any of its subclasses.
     */
    function isIndexed(maybeIndexed: any): boolean;

    /**
     * True if `maybeAssociative` is either a keyed or indexed Iterable.
     */
    function isAssociative(maybeAssociative: any): boolean;

    /**
     * True if `maybeOrdered` is an Iterable where iteration order is well
     * defined. True for IndexedIterable as well as OrderedMap and OrderedSet.
     */
    function isOrdered(maybeOrdered: any): boolean;
  }

  /**
   * `Immutable.Iterable()` returns a particular kind of Iterable based
   * on the input.
   *
   *   * If an `Iterable`, that same `Iterable`.
   *   * If an Array-like, an `IndexedIterable`.
   *   * If an Object with an Iterator, an `IndexedIterable`.
   *   * If an Iterator, an `IndexedIterable`.
   *   * If an Object, a `KeyedIterable`.
   *
   * This methods forces the conversion of Objects and Strings to Iterables.
   * If you want to ensure that a Iterable of one item is returned, use
   * `Seq.of`.
   */
  export function Iterable<K, V>(iterable: Iterable<K, V>): Iterable<K, V>;
  export function Iterable<T>(array: Array<T>): IndexedIterable<T>;
  export function Iterable<V>(obj: {[key: string]: V}): KeyedIterable<string, V>;
  export function Iterable<T>(iterator: Iterator<T>): IndexedIterable<T>;
  export function Iterable<T>(iterable: /*ES6Iterable<T>*/Object): IndexedIterable<T>;
  export function Iterable<V>(value: V): IndexedIterable<V>;


  export interface Iterable<K, V> {

    // ### Conversion to other types

    /**
     * Converts this iterable to an Array, discarding keys.
     */
    toArray(): Array<V>;

    /**
     * Returns a Seq of the values of this Iterable, discarding keys.
     */
    toIndexedSeq(): IndexedSeq<V>;

    /**
     * Deeply converts this Iterable to equivalent JS.
     *
     * IndexedIterables, and SetIterables become Arrays, while
     * KeyedIterables become Objects.
     */
    toJS(): any;

    /**
     * Converts this Iterable into an identical Seq where indices are
     * treated as keys. This is useful if you want to operate on an
     * IndexedIterable and preserve the [index, value] pairs.
     *
     * The returned Seq will have identical iteration order as
     * this Iterable.
     *
     * Example:
     *
     *     var indexedSeq = Immutable.Seq.of('A', 'B', 'C');
     *     indexedSeq.filter(v => v === 'B').toString() // Seq [ 'B' ]
     *     var keyedSeq = indexedSeq.toKeyedSeq();
     *     keyedSeq.filter(v => v === 'B').toString() // Seq { 1: 'B' }
     *
     */
    toKeyedSeq(): KeyedSeq<K, V>;

    /**
     * Converts this Iterable to a Map, Throws if keys are not hashable.
     *
     * Note: This is equivalent to `Map(this.toKeyedSeq())`, but provided
     * for convenience and to allow for chained expressions.
     */
    toMap(): Map<K, V>;

    /**
     * Converts this Iterable to an Object. Throws if keys are not strings.
     */
    toObject(): { [key: string]: V };

    /**
     * Converts this Iterable to a Map, maintaining the order of iteration.
     *
     * Note: This is equivalent to `OrderedMap(this.toKeyedSeq())`, but
     * provided for convenience and to allow for chained expressions.
     */
    toOrderedMap(): Map<K, V>;

    /**
     * Converts this Iterable to a Set, maintaining the order of iteration and
     * discarding keys.
     *
     * Note: This is equivalent to `OrderedSet(this.valueSeq())`, but provided
     * for convenience and to allow for chained expressions.
     */
    toOrderedSet(): Set<V>;

    /**
     * Converts this Iterable to a Set, discarding keys. Throws if values
     * are not hashable.
     *
     * Note: This is equivalent to `Set(this)`, but provided to allow for
     * chained expressions.
     */
    toSet(): Set<V>;

    /**
     * Converts this Iterable to a Seq of the values of this Iterable,
     * discarding keys, and behaving as a set.
     */
    toSetSeq(): SetSeq<V>;

    /**
     * Converts this Iterable to a Seq of the same kind (indexed,
     * keyed, or set).
     */
    toSeq(): Seq<K, V>;

    /**
     * Converts this Iterable to a Stack, discarding keys. Throws if values
     * are not hashable.
     *
     * Note: This is equivalent to `Stack(this)`, but provided to allow for
     * chained expressions.
     */
    toStack(): Stack<V>;

    /**
     * Converts this Iterable to a List, discarding keys.
     *
     * Note: This is equivalent to `List(this)`, but provided to allow
     * for chained expressions.
     */
    toList(): List<V>;


    // ### Common JavaScript methods and properties

    /**
     * Deeply converts this Iterable to a string.
     */
    toString(): string;


    // ### ES6 Collection methods (ES6 Array and Map)

    /**
     * Returns a new Iterable of the same type with other values and
     * iterable-like concatenated to this one.
     *
     * For Seqs, all entries will be present in
     * the resulting iterable, even if they have the same key.
     */
    concat(...valuesOrIterables: /*Array<Iterable<K, V>|V*/any[]): /*this*/Iterable<K, V>;

    /**
     * True if a value exists within this Iterable.
     */
    contains(value: V): boolean;

    /**
     * An iterator of this Map's entries as [key, value] tuples.
     */
    entries(): Iterator</*[K, V]*/Array<any>>;

    /**
     * True if `predicate` returns true for all entries in the Iterable.
     */
    every(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): boolean;

    /**
     * Returns a new Iterable of the same type with only the entries for which
     * the `predicate` function returns true.
     *
     *     Seq({a:1,b:2,c:3,d:4}).filter(x => x % 2 === 0)
     *     // Seq { b: 2, d: 4 }
     *
     */
    filter(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns the value for which the `predicate` returns true.
     */
    find(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any,
      notSetValue?: V
    ): V;

    /**
     * The `sideEffect` is executed for every entry in the Iterable.
     *
     * Unlike `Array.prototype.forEach`, if any call of `sideEffect` returns
     * `false`, the iteration will stop. Returns the number of entries iterated
     * (including the last iteration which returned false).
     */
    forEach(
      sideEffect: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => any,
      context?: any
    ): number;

    /**
     * Joins values together as a string, inserting a separator between each.
     * The default separator is ",".
     */
    join(separator?: string): string;

    /**
     * An iterator of this Iterable's keys.
     */
    keys(): Iterator<K>;

    /**
     * Returns a new Iterable of the same type with values passed through a
     * `mapper` function.
     *
     *     Seq({ a: 1, b: 2 }).map(x => 10 * x)
     *     // Seq { a: 10, b: 20 }
     *
     */
    map<M>(
      mapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => M,
      context?: any
    ): /*this*/Iterable<K, M>;

    /**
     * Reduces the Iterable to a value by calling the `reducer` for every entry
     * in the Iterable and passing along the reduced value.
     *
     * If `initialReduction` is not provided, or is null, the first item in the
     * Iterable will be used.
     *
     * @see `Array.prototype.reduce`.
     */
    reduce<R>(
      reducer: (reduction?: R, value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => R,
      initialReduction?: R,
      context?: any
    ): R;

    /**
     * Reduces the Iterable in reverse (from the right side).
     *
     * Note: Similar to this.reverse().reduce(), and provided for parity
     * with `Array#reduceRight`.
     */
    reduceRight<R>(
      reducer: (reduction?: R, value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => R,
      initialReduction?: R,
      context?: any
    ): R;

    /**
     * Returns a new Iterable of the same type in reverse order.
     */
    reverse(): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type representing a portion of this
     * Iterable from start up to but not including end.
     *
     * If begin is negative, it is offset from the end of the Iterable. e.g.
     * `slice(-2)` returns a Iterable of the last two entries. If it is not
     * provided the new Iterable will begin at the beginning of this Iterable.
     *
     * If end is negative, it is offset from the end of the Iterable. e.g.
     * `slice(0, -1)` returns an Iterable of everything but the last entry. If
     * it is not provided, the new Iterable will continue through the end of
     * this Iterable.
     *
     * If the requested slice is equivalent to the current Iterable, then it
     * will return itself.
     */
    slice(begin?: number, end?: number): /*this*/Iterable<K, V>;

    /**
     * True if `predicate` returns true for any entry in the Iterable.
     */
    some(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): boolean;

    /**
     * Returns a new Iterable of the same type which contains the same entries,
     * stably sorted by using a `comparator`.
     *
     * If a `comparator` is not provided, a default comparator uses `<` and `>`.
     *
     * `comparator(valueA, valueB)`:
     *
     *   * Returns `0` if the elements should not be swapped.
     *   * Returns `-1` (or any negative number) if `valueA` comes before `valueB`
     *   * Returns `1` (or any positive number) if `valueA` comes after `valueB`
     *   * Is pure, i.e. it must always return the same value for the same pair
     *     of values.
     *
     * When sorting collections which have no defined order, their ordered
     * equivalents will be returned. e.g. `map.sort()` returns OrderedMap.
     */
    sort(comparator?: (valueA: V, valueB: V) => number): /*this*/Iterable<K, V>;

    /**
     * An iterator of this Map's values.
     */
    values(): Iterator<V>;


    // ### More collection methods

    /**
     * Returns a new Iterable of the same type containing all entries except
     * the last.
     */
    butLast(): /*this*/Iterable<K, V>;

    /**
     * Regardless of if this Iterable can describe its size (some Seqs
     * cannot), this method will always return the correct size. E.g. it
     * evaluates a Seq if necessary.
     *
     * If `predicate` is provided, then this returns the count of entries in the
     * Iterable for which the `predicate` returns true.
     */
    count(): number;
    count(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): number;

    /**
     * Returns a `KeyedSeq` of counts, grouped by the return value of
     * the `grouper` function.
     *
     * Note: This is not a lazy operation.
     */
    countBy<G>(
      grouper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => G,
      context?: any
    ): Map<G, number>;

    /**
     * True if this and the other Iterable have value equality, as defined
     * by `Immutable.is()`.
     *
     * Note: This is equivalent to `Immutable.is(this, other)`, but provided to
     * allow for chained expressions.
     */
    equals(other: Iterable<K, V>): boolean;

    /**
     * Returns a new IndexedSeq of [key, value] tuples.
     */
    entrySeq(): IndexedSeq</*(K, V)*/Array<any>>;

    /**
     * Returns a new Iterable of the same type with only the entries for which
     * the `predicate` function returns false.
     *
     *     Seq({a:1,b:2,c:3,d:4}).filterNot(x => x % 2 === 0)
     *     // Seq { a: 1, c: 3 }
     *
     */
    filterNot(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns the last value for which the `predicate` returns true.
     *
     * Note: `predicate` will be called for each entry in reverse.
     */
    findLast(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any,
      notSetValue?: V
    ): V;

    /**
     * The first value in the Iterable.
     */
    first(): V;

    /**
     * Flat-maps the Iterable, returning an Iterable of the same type.
     */
    flatMap<MK, MV>(
      mapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => Iterable<MK, MV>,
      context?: any
    ): /*this*/Iterable<MK, MV>;
    flatMap<MK, MV>(
      mapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => /*iterable-like*/any,
      context?: any
    ): /*this*/Iterable<MK, MV>;

    /**
     * Flattens nested Iterables.
     *
     * Will deeply flatten the Iterable by default, returning an Iterable of the
     * same type, but a `depth` can be provided in the form of a number or
     * boolean (where true means to shallowly flatten one level). A depth of 0
     * (or shallow: false) will deeply flatten.
     *
     * Flattens only others Iterable, not Arrays or Objects.
     *
     * Note: `flatten(true)` operates on Iterable<any, Iterable<K, V>> and
     * returns Iterable<K, V>
     */
    flatten(depth?: number): /*this*/Iterable<any, any>;
    flatten(shallow?: boolean): /*this*/Iterable<any, any>;

    /**
     * Returns the value associated with the provided key, or notSetValue if
     * the Iterable does not contain this key.
     *
     * Note: it is possible a key may be associated with an `undefined` value, so
     * if `notSetValue` is not provided and this method returns `undefined`,
     * that does not guarantee the key was not found.
     */
    get(key: K, notSetValue?: V): V;

    /**
     * Returns the value found by following a key path through nested Iterables.
     */
    getIn(searchKeyPath: Array<any>, notSetValue?: any): any;
    getIn(searchKeyPath: Iterable<any, any>, notSetValue?: any): any;

    /**
     * Returns a `KeyedIterable` of `KeyedIterables`, grouped by the return
     * value of the `grouper` function.
     *
     * Note: This is not a lazy operation.
     */
    groupBy<G>(
      grouper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => G,
      context?: any
    ): /*Map*/KeyedSeq<G, /*this*/Iterable<K, V>>;

    /**
     * True if a key exists within this Iterable.
     */
    has(key: K): boolean;

    /**
     * True if `iter` contains every value in this Iterable.
     */
    isSubset(iter: Iterable<any, V>): boolean;
    isSubset(iter: Array<V>): boolean;

    /**
     * True if this Iterable contains every value in `iter`.
     */
    isSuperset(iter: Iterable<any, V>): boolean;
    isSuperset(iter: Array<V>): boolean;

    /**
     * Returns a new IndexedSeq of the keys of this Iterable,
     * discarding values.
     */
    keySeq(): IndexedSeq<K>;

    /**
     * The last value in the Iterable.
     */
    last(): V;

    /**
     * Returns the maximum value in this collection. If any values are
     * comparatively equivalent, the first one found will be returned.
     *
     * The `comparator` is used in the same way as `Iterable#sort`. If it is not
     * provided, the default comparator is `a > b`.
     */
    max(comparator?: (valueA: V, valueB: V) => number): V;

    /**
     * Like `max`, but also accepts a `comparatorValueMapper` which allows for
     * comparing by more sophisticated means:
     *
     *     hitters.maxBy(hitter => hitter.avgHits);
     *
     */
    maxBy<C>(
      comparatorValueMapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): V;

    /**
     * Returns the maximum value in this collection. If any values are
     * comparatively equivalent, the first one found will be returned.
     *
     * The `comparator` is used in the same way as `Iterable#sort`. If it is not
     * provided, the default comparator is `a > b`.
     */
    min(comparator?: (valueA: V, valueB: V) => number): V;

    /**
     * Like `min`, but also accepts a `comparatorValueMapper` which allows for
     * comparing by more sophisticated means:
     *
     *     hitters.minBy(hitter => hitter.avgHits);
     *
     */
    minBy<C>(
      comparatorValueMapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): V;

    /**
     * Returns a new Iterable of the same type containing all entries except
     * the first.
     */
    rest(): /*this*/Iterable<K, V>

    /**
     * Returns a new Iterable of the same type which excludes the first `amount`
     * entries from this Iterable.
     */
    skip(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which excludes the last `amount`
     * entries from this Iterable.
     */
    skipLast(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains entries starting
     * from when `predicate` first returns false.
     *
     *     Seq.of('dog','frog','cat','hat','god')
     *       .skipWhile(x => x.match(/g/))
     *     // Seq [ 'cat', 'hat', 'god' ]
     *
     */
    skipWhile(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains entries starting
     * from when `predicate` first returns true.
     *
     *     Seq.of('dog','frog','cat','hat','god')
     *       .skipUntil(x => x.match(/hat/))
     *     // Seq [ 'hat', 'god' ]
     *
     */
    skipUntil(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Like `sort`, but also accepts a `comparatorValueMapper` which allows for
     * sorting by more sophisticated means:
     *
     *     hitters.sortBy(hitter => hitter.avgHits);
     *
     */
    sortBy<C>(
      comparatorValueMapper: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains the first `amount`
     * entries from this Iterable.
     */
    take(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains the last `amount`
     * entries from this Iterable.
     */
    takeLast(amount: number): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains entries from this
     * Iterable as long as the `predicate` returns true.
     *
     *     Seq.of('dog','frog','cat','hat','god')
     *       .takeWhile(x => x.match(/o/))
     *     // Seq [ 'dog', 'frog' ]
     *
     */
    takeWhile(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new Iterable of the same type which contains entries from this
     * Iterable as long as the `predicate` returns false.
     *
     *     Seq.of('dog','frog','cat','hat','god').takeUntil(x => x.match(/at/))
     *     // ['dog', 'frog']
     *
     */
    takeUntil(
      predicate: (value?: V, key?: K, iter?: /*this*/Iterable<K, V>) => boolean,
      context?: any
    ): /*this*/Iterable<K, V>;

    /**
     * Returns a new IndexedSeq of the values of this Iterable,
     * discarding keys.
     */
    valueSeq(): IndexedSeq<V>;

    /**
     * Note: this is here as a convenience to work around an issue with
     * TypeScript https://github.com/Microsoft/TypeScript/issues/285, but
     * Iterable does not define `size`, instead `Seq` defines `size` as
     * nullable number, and `Collection` defines `size` as always a number.
     */
    size: number;
  }


  /**
   * Keyed Iterable
   * --------------
   *
   * Keyed Iterables have discrete keys tied to each value.
   *
   * When iterating `KeyedIterable`, each iteration will yield a `[K, V]` tuple,
   * in other words, `Iterable#entries` is the default iterator for Keyed
   * Iterables.
   */

  /**
   * Similar to `Iterable()`, however it expects iterable-likes of [K, V]
   * tuples if not constructed from a KeyedIterable or JS Object.
   */
  export function KeyedIterable<K, V>(iter: KeyedIterable<K, V>): KeyedIterable<K, V>;
  export function KeyedIterable<K, V>(iter: Iterable<any, /*[K,V]*/any>): KeyedIterable<K, V>;
  export function KeyedIterable<K, V>(array: Array</*[K,V]*/any>): KeyedIterable<K, V>;
  export function KeyedIterable<V>(obj: {[key: string]: V}): KeyedIterable<string, V>;
  export function KeyedIterable<K, V>(iterator: Iterator</*[K,V]*/any>): KeyedIterable<K, V>;
  export function KeyedIterable<K, V>(iterable: /*Iterable<[K,V]>*/Object): KeyedIterable<K, V>;


  export interface KeyedIterable<K, V> extends Iterable<K, V> {

    /**
     * Returns KeyedSeq.
     * @override
     */
    toSeq(): KeyedSeq<K, V>;


    /**
     * Returns a new KeyedIterable of the same type where the keys and values
     * have been flipped.
     *
     *     Seq({ a: 'z', b: 'y' }).flip() // { z: 'a', y: 'b' }
     *
     */
    flip(): /*this*/KeyedIterable<V, K>;

    /**
     * Returns the key for which the `predicate` returns true.
     */
    findKey(
      predicate: (value?: V, key?: K, iter?: /*this*/KeyedIterable<K, V>) => boolean,
      context?: any
    ): K;

    /**
     * Returns the last key for which the `predicate` returns true.
     *
     * Note: `predicate` will be called for each entry in reverse.
     */
    findLastKey(
      predicate: (value?: V, key?: K, iter?: /*this*/KeyedIterable<K, V>) => boolean,
      context?: any
    ): K;

    /**
     * Returns the key associated with the search value, or undefined.
     */
    keyOf(searchValue: V): K;

    /**
     * Returns the last key associated with the search value, or undefined.
     */
    lastKeyOf(searchValue: V): K;

    /**
     * Returns a new KeyedIterable of the same type with entries
     * ([key, value] tuples) passed through a `mapper` function.
     *
     *     Seq({ a: 1, b: 2 })
     *       .mapEntries(([k, v]) => [k.toUpperCase(), v * 2])
     *     // Seq { A: 2, B: 4 }
     *
     */
    mapEntries<KM, VM>(
      mapper: (entry?: /*(K, V)*/Array<any>, index?: number, iter?: /*this*/KeyedIterable<K, V>) => /*[KM, VM]*/Array<any>,
      context?: any
    ): /*this*/KeyedIterable<KM, VM>;

    /**
     * Returns a new KeyedIterable of the same type with keys passed through a
     * `mapper` function.
     *
     *     Seq({ a: 1, b: 2 })
     *       .mapKeys(x => x.toUpperCase())
     *     // Seq { A: 1, B: 2 }
     *
     */
    mapKeys<M>(
      mapper: (key?: K, value?: V, iter?: /*this*/KeyedIterable<K, V>) => M,
      context?: any
    ): /*this*/KeyedIterable<M, V>;
  }


  /**
   * Indexed Iterable
   * ----------------
   *
   * Indexed Iterables have incrementing numeric keys. They exhibit
   * slightly different behavior than `KeyedIterable` for some methods in order
   * to better mirror the behavior of JavaScript's `Array`, and add others which
   * do not make sense on non-indexed Iterables such as `indexOf`.
   *
   * Unlike JavaScript arrays, `IndexedIterable`s are always dense. "Unset"
   * indices and `undefined` indices are indistinguishable, and all indices from
   * 0 to `size` are visited when iterated.
   *
   * All IndexedIterable methods return re-indexed Iterables. In other words,
   * indices always start at 0 and increment until size. If you wish to
   * preserve indices, using them as keys, convert to a KeyedIterable by calling
   * `toKeyedSeq`.
   */

  /**
   * Similar to `Iterable()`, but always returns an IndexedIterable.
   */
  export function IndexedIterable<T>(iter: IndexedIterable<T>): IndexedIterable<T>;
  export function IndexedIterable<T>(iter: SetIterable<T>): IndexedIterable<T>;
  export function IndexedIterable<K, V>(iter: KeyedIterable<K, V>): IndexedIterable</*[K,V]*/any>;
  export function IndexedIterable<T>(array: Array<T>): IndexedIterable<T>;
  export function IndexedIterable<T>(iterator: Iterator<T>): IndexedIterable<T>;
  export function IndexedIterable<T>(iterable: /*Iterable<T>*/Object): IndexedIterable<T>;


  export interface IndexedIterable<T> extends Iterable<number, T> {

    /**
     * Returns IndexedSeq.
     * @override
     */
    toSeq(): IndexedSeq<T>;


    // ### ES6 Collection methods (ES6 Array and Map)

    /**
     * Returns the first index in the Iterable where a value satisfies the
     * provided predicate function. Otherwise -1 is returned.
     */
    findIndex(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): number;

    /**
     * Returns the first index at which a given value can be found in the
     * Iterable, or -1 if it is not present.
     */
    indexOf(searchValue: T): number;

    /**
     * Returns the last index at which a given value can be found in the
     * Iterable, or -1 if it is not present.
     */
    lastIndexOf(searchValue: T): number;

    /**
     * Splice returns a new indexed Iterable by replacing a region of this
     * Iterable with new values. If values are not provided, it only skips the
     * region to be removed.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * Iterable. `s.splice(-2)` splices after the second to last item.
     *
     *     Seq(['a','b','c','d']).splice(1, 2, 'q', 'r', 's')
     *     // Seq ['a', 'q', 'r', 's', 'd']
     *
     */
    splice(
      index: number,
      removeNum: number,
      ...values: /*Array<IndexedIterable<T> | T>*/any[]
    ): /*this*/IndexedIterable<T>;


    // ### More collection methods

    /**
     * Returns the last index in the Iterable where a value satisfies the
     * provided predicate function. Otherwise -1 is returned.
     */
    findLastIndex(
      predicate: (value?: T, index?: number, iter?: /*this*/IndexedIterable<T>) => boolean,
      context?: any
    ): number;

    /**
     * If this is an iterable of [key, value] entry tuples, it will return a
     * KeyedSeq of those entries.
     */
    fromEntrySeq(): KeyedSeq<any, any>;

    /**
     * Returns the value associated with the provided index, or notSetValue if
     * the index is beyond the bounds of the Iterable.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * Iterable. `s.get(-1)` gets the last item in the Iterable.
     */
    get(index: number, notSetValue?: T): T;

    /**
     * Returns an Iterable of the same type with `separator` between each item
     * in this Iterable.
     */
    interpose(separator: T): /*this*/IndexedIterable<T>;
  }


  /**
   * Set Iterable
   * ------------
   *
   * Set Iterables only represent values. They have no associated keys or
   * indices. Duplicate values are possible in SetSeqs, however the
   * concrete `Set` does not allow duplicate values.
   *
   * Iterable methods on SetIterable such as `map` and `forEach` will provide
   * the value as both the first and second arguments to the provided function.
   *
   *     var seq = SetSeq.of('A', 'B', 'C');
   *     assert.equal(seq.every((v, k) => v === k), true);
   *
   */

  /**
   * Similar to `Iterable()`, but always returns a SetIterable.
   */
  export function SetIterable<T>(iter: SetIterable<T>): SetIterable<T>;
  export function SetIterable<T>(iter: IndexedIterable<T>): SetIterable<T>;
  export function SetIterable<K, V>(iter: KeyedIterable<K, V>): SetIterable</*[K,V]*/any>;
  export function SetIterable<T>(array: Array<T>): SetIterable<T>;
  export function SetIterable<T>(iterator: Iterator<T>): SetIterable<T>;
  export function SetIterable<T>(iterable: /*Iterable<T>*/Object): SetIterable<T>;


  export interface SetIterable<T> extends Iterable<T, T> {

    /**
     * Returns SetSeq.
     * @override
     */
    toSeq(): SetSeq<T>;
  }


  /**
   * Seq
   * ---
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
   *     var oddSquares = Immutable.Seq.of(1,2,3,4,5,6,7,8)
   *       .filter(x => x % 2).map(x => x * x);
   *
   * Once the sequence is used, it performs only the work necessary. In this
   * example, no intermediate arrays are ever created, filter is only called
   * three times, and map is only called twice:
   *
   *     console.log(evenSquares.get(1)); // 9
   *
   * Lazy Sequences allow for the efficient chaining of sequence operations,
   * allowing for the expression of logic that can otherwise be very tedious:
   *
   *     Immutable.Seq({a:1, b:1, c:1})
   *       .flip().map(key => key.toUpperCase()).flip().toObject();
   *     // Map { A: 1, B: 1, C: 1 }
   *
   * As well as expressing logic that would otherwise seem memory-limited:
   *
   *     Immutable.Range(1, Infinity)
   *       .skip(1000)
   *       .map(n => -n)
   *       .filter(n => n % 2 === 0)
   *       .take(2)
   *       .reduce((r, n) => r * n, 1);
   *     // 1006008
   *
   */

  export module Seq {
    /**
     * True if `maybeSeq` is a Seq, it is not backed by a concrete
     * structure such as Map, List, or Set.
     */
    function isSeq(maybeSeq: any): boolean;

    /**
     * Returns a Seq of the values provided. Alias for `IndexedSeq.of()`.
     */
    function of<T>(...values: T[]): IndexedSeq<T>;
  }

  /**
   * `Immutable.Seq()` returns a particular kind of Sequence based
   * on the input.
   *
   *   * If a `Seq`, that same `Seq`.
   *   * If an `Iterable`, a `Seq` of the same kind (Keyed, Indexed, or Set).
   *   * If an Array-like, an `IndexedSeq`.
   *   * If an Object with an Iterator, an `IndexedSeq`.
   *   * If an Iterator, an `IndexedSeq`.
   *   * If an Object, a `KeyedSeq`.
   *
   */
  export function Seq<K, V>(): Seq<K, V>;
  export function Seq<K, V>(seq: Seq<K, V>): Seq<K, V>;
  export function Seq<K, V>(iterable: Iterable<K, V>): Seq<K, V>;
  export function Seq<T>(array: Array<T>): IndexedSeq<T>;
  export function Seq<V>(obj: {[key: string]: V}): KeyedSeq<string, V>;
  export function Seq<T>(iterator: Iterator<T>): IndexedSeq<T>;
  export function Seq<T>(iterable: /*ES6Iterable<T>*/Object): IndexedSeq<T>;

  export interface Seq<K, V> extends Iterable<K, V> {

    /**
     * Some Seqs can describe their size lazily. When this is the case,
     * size will be an integer. Otherwise it will be undefined.
     *
     * For example, Seqs returned from map() or reverse()
     * preserve the size of the original Seq while filter() does not.
     *
     * Note: Ranges, Repeats and Seqs made from Arrays and Objects will
     * always have a size.
     */
    size: number/*?*/;

    /**
     * Because Sequences are lazy and designed to be chained together, they do
     * not cache their results. For example, this map function is called 6 times:
     *
     *     var squares = Seq.of(1,2,3).map(x => x * x);
     *     squares.join() + squares.join();
     *
     * If you know a derived sequence will be used multiple times, it may be more
     * efficient to first cache it. Here, map is called 3 times:
     *
     *     var squares = Seq.of(1,2,3).map(x => x * x).cacheResult();
     *     squares.join() + squares.join();
     *
     * Use this method judiciously, as it must fully evaluate a Seq.
     *
     * Note: after calling `cacheResult()`, a Seq will always have a size.
     */
    cacheResult(): /*this*/Seq<K, V>;
  }


  /**
   * Always returns a KeyedSeq, if input is not keyed, expects an
   * iterable of [K, V] tuples.
   */
  export function KeyedSeq<K, V>(): KeyedSeq<K, V>;
  export function KeyedSeq<K, V>(seq: KeyedIterable<K, V>): KeyedSeq<K, V>;
  export function KeyedSeq<K, V>(seq: Iterable<any, /*[K,V]*/any>): KeyedSeq<K, V>;
  export function KeyedSeq<K, V>(array: Array</*[K,V]*/any>): KeyedSeq<K, V>;
  export function KeyedSeq<V>(obj: {[key: string]: V}): KeyedSeq<string, V>;
  export function KeyedSeq<K, V>(iterator: Iterator</*[K,V]*/any>): KeyedSeq<K, V>;
  export function KeyedSeq<K, V>(iterable: /*Iterable<[K,V]>*/Object): KeyedSeq<K, V>;

  export interface KeyedSeq<K, V> extends Seq<K, V>, KeyedIterable<K, V> {

    /**
     * Returns itself
     */
    toSeq(): /*this*/KeyedSeq<K, V>
  }


  export module IndexedSeq {

    /**
     * Provides an IndexedSeq of the values provided.
     */
    function of<T>(...values: T[]): IndexedSeq<T>;
  }

  /**
   * Always returns IndexedSeq, discarding associated keys and
   * supplying incrementing indices.
   */
  export function IndexedSeq<T>(): IndexedSeq<T>;
  export function IndexedSeq<T>(seq: IndexedIterable<T>): IndexedSeq<T>;
  export function IndexedSeq<T>(seq: SetIterable<T>): IndexedSeq<T>;
  export function IndexedSeq<K, V>(seq: KeyedIterable<K, V>): IndexedSeq</*[K,V]*/any>;
  export function IndexedSeq<T>(array: Array<T>): IndexedSeq<T>;
  export function IndexedSeq<T>(iterator: Iterator<T>): IndexedSeq<T>;
  export function IndexedSeq<T>(iterable: /*Iterable<T>*/Object): IndexedSeq<T>;

  export interface IndexedSeq<T> extends Seq<number, T>, IndexedIterable<T> {

    /**
     * Returns itself
     */
    toSeq(): /*this*/IndexedSeq<T>
  }

  export module SetSeq {

    /**
     * Returns a SetSeq of the provided values
     */
    function of<T>(...values: T[]): SetSeq<T>;
  }

  /**
   * Always returns a SetSeq, discarding associated indices or keys.
   */
  export function SetSeq<T>(): SetSeq<T>;
  export function SetSeq<T>(seq: SetIterable<T>): SetSeq<T>;
  export function SetSeq<T>(seq: IndexedIterable<T>): SetSeq<T>;
  export function SetSeq<K, V>(seq: KeyedIterable<K, V>): SetSeq</*[K,V]*/any>;
  export function SetSeq<T>(array: Array<T>): SetSeq<T>;
  export function SetSeq<T>(iterator: Iterator<T>): SetSeq<T>;
  export function SetSeq<T>(iterable: /*Iterable<T>*/Object): SetSeq<T>;

  export interface SetSeq<T> extends Seq<T, T>, SetIterable<T> {

    /**
     * Returns itself
     */
    toSeq(): /*this*/SetSeq<T>
  }


  /**
   * Range
   * -----
   *
   * Returns a IndexedSeq of numbers from `start` (inclusive) to `end`
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
  export function Range(start?: number, end?: number, step?: number): IndexedSeq<number>;


  /**
   * Repeat
   * ------
   *
   * Returns a IndexedSeq of `value` repeated `times` times. When `times` is
   * not defined, returns an infinite sequence of `value`.
   *
   *     Repeat('foo') // ['foo','foo','foo',...]
   *     Repeat('bar',4) // ['bar','bar','bar','bar']
   *
   */
  export function Repeat<T>(value: T, times?: number): IndexedSeq<T>;


  /**
   * Collections
   * -----------
   */
  export interface Collection<K, V> extends Iterable<K, V> {

    /**
     * All collections maintain their current `size` as an integer.
     */
    size: number;
  }

  export interface KeyedCollection<K, V> extends Collection<K, V>, KeyedIterable<K, V> {

    /**
     * Returns KeyedSeq.
     * @override
     */
    toSeq(): KeyedSeq<K, V>;
  }

  export interface IndexedCollection<T> extends Collection<number, T>, IndexedIterable<T> {

    /**
     * Returns IndexedSeq.
     * @override
     */
    toSeq(): IndexedSeq<T>;
  }

  export interface SetCollection<T> extends Collection<T, T>, SetIterable<T> {

    /**
     * Returns SetSeq.
     * @override
     */
    toSeq(): SetSeq<T>;
  }


  /**
   * Map
   * ---
   *
   * A Map is a Iterable of (key, value) pairs with `O(log32 N)` gets and sets
   * implemented by an unordered hash map using a hash-array mapped trie.
   *
   * Iteration order of a Map is undefined, however is stable. Multiple iterations
   * of the same Map will iterate in the same order.
   *
   * Map's keys can be of any type, and use `Immutable.is` to determine key
   * equality. This allows the use of NaN as a key.
   *
   * Because `Immutable.is` returns equality based on value semantics, and
   * Immutable collections are treated as values, any Immutable collection may
   * be used as a key.
   *
   *     Map().set(List.of(1), 'listofone').get(List.of(1));
   *     // 'listofone'
   *
   * Any JavaScript object may be used as a key, however strict identity is used
   * to evaluate key equality. Two similar looking objects will represent two
   * different keys.
   *
   */

  export module Map {

    /**
     * True if the provided value is a Map
     */
    function isMap(maybeMap: any): boolean;
  }

  /**
   * `Map()` creates a new immutable Map with the same key value pairs as
   * the provided KeyedIterable or JavaScript Object or expects an Iterable
   * of [K, V] tuple entries.
   *
   *     var newMap = Map({key: "value"});
   *     var newMap = Map([["key", "value"]]);
   *
   */
  export function Map<K, V>(): Map<K, V>;
  export function Map<K, V>(iter: KeyedIterable<K, V>): Map<K, V>;
  export function Map<K, V>(iter: Iterable<any, /*[K,V]*/Array<any>>): Map<K, V>;
  export function Map<K, V>(array: Array</*[K,V]*/Array<any>>): Map<K, V>;
  export function Map<V>(obj: {[key: string]: V}): Map<string, V>;
  export function Map<K, V>(iterator: Iterator</*[K,V]*/Array<any>>): Map<K, V>;
  export function Map<K, V>(iterable: /*Iterable<[K,V]>*/Object): Map<K, V>;


  export interface Map<K, V> extends KeyedCollection<K, V> {

    /**
     * Returns a new Map also containing the new key, value pair. If an equivalent
     * key already exists in this Map, it will be replaced.
     */
    set(key: K, value: V): Map<K, V>;

    /**
     * Returns a new Map having set `value` at this `keyPath`. If any keys in
     * `keyPath` do not exist, a new immutable Map will be created at that key.
     */
    setIn(keyPath: Array<any>, value: V): Map<K, V>;
    setIn(KeyPath: Iterable<any, any>, value: V): Map<K, V>;

    /**
     * Returns a new Map which excludes this `key`.
     *
     * Note: `delete` cannot be safely used in IE8
     * @alias delete
     */
    remove(key: K): Map<K, V>;
    delete(key: K): Map<K, V>;

    /**
     * Returns a new Map having removed the value at this `keyPath`. If any keys
     * in `keyPath` do not exist, a new immutable Map will be created at
     * that key.
     */
    removeIn(keyPath: Array<any>): Map<K, V>;
    removeIn(keyPath: Iterable<any, any>): Map<K, V>;

    /**
     * Returns a new Map containing no keys or values.
     */
    clear(): Map<K, V>;

    /**
     * Returns a new Map having updated the value at this `key` with the return
     * value of calling `updater` with the existing value, or `notSetValue` if
     * the key was not set. If called with only a single argument, `updater` is
     * called with the Map itself.
     *
     * Equivalent to: `map.set(key, updater(map.get(key, notSetValue)))`.
     */
    update(updater: (value: Map<K, V>) => Map<K, V>): Map<K, V>;
    update(key: K, updater: (value: V) => V): Map<K, V>;
    update(key: K, notSetValue: V, updater: (value: V) => V): Map<K, V>;

    /**
     * Returns a new Map having applied the `updater` to the entry found at the
     * keyPath. If any keys in `keyPath` do not exist, a new immutable Map will
     * be created at that key. If the `keyPath` was not previously set,
     * `updater` is called with `notSetValue` (if provided).
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
    updateIn(
      keyPath: Array<any>,
      notSetValue: any,
      updater: (value: any) => any
    ): Map<K, V>;
    updateIn(
      keyPath: Iterable<any, any>,
      updater: (value: any) => any
    ): Map<K, V>;
    updateIn(
      keyPath: Iterable<any, any>,
      notSetValue: any,
      updater: (value: any) => any
    ): Map<K, V>;

    /**
     * Returns a new Map resulting from merging the provided Iterables
     * (or JS objects) into this Map. In other words, this takes each entry of
     * each iterable and sets it on this Map.
     *
     * If any of the values provided to `merge` are not Iterable (would return
     * false for `Immutable.isIterable`) then they are deeply converted via
     * `Immutable.fromJS` before being merged. However, if the value is an
     * Iterable but contains non-iterable JS objects or arrays, those nested
     * values will be preserved.
     *
     *     var x = Immutable.Map({a: 10, b: 20, c: 30});
     *     var y = Immutable.Map({b: 40, a: 50, d: 60});
     *     x.merge(y) // { a: 50, b: 40, c: 30, d: 60 }
     *     y.merge(x) // { b: 20, a: 10, d: 60, c: 30 }
     *
     */
    merge(...iterables: Iterable<K, V>[]): Map<K, V>;
    merge(...iterables: {[key: string]: V}[]): Map<string, V>;

    /**
     * Like `merge()`, `mergeWith()` returns a new Map resulting from merging
     * the provided Iterables (or JS objects) into this Map, but uses the
     * `merger` function for dealing with conflicts.
     *
     *     var x = Immutable.Map({a: 10, b: 20, c: 30});
     *     var y = Immutable.Map({b: 40, a: 50, d: 60});
     *     x.mergeWith((prev, next) => prev / next, y) // { a: 0.2, b: 0.5, c: 30, d: 60 }
     *     y.mergeWith((prev, next) => prev / next, x) // { b: 2, a: 5, d: 60, c: 30 }
     *
     */
    mergeWith(
      merger: (previous?: V, next?: V) => V,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeWith(
      merger: (previous?: V, next?: V) => V,
      ...iterables: {[key: string]: V}[]
    ): Map<string, V>;

    /**
     * A combination of `updateIn` and `merge`, returning a new Map, but
     * performing the merge at a point arrived at by following the keyPath.
     * In other words, these two lines are equivalent:
     *
     *     x.updateIn(['a', 'b', 'c'], abc => abc.merge(y));
     *     x.mergeIn(['a', 'b', 'c'], y);
     *
     */
    mergeIn(
      keyPath: Iterable<any, any>,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeIn(
      keyPath: Array<any>,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeIn(
      keyPath: Array<any>,
      ...iterables: {[key: string]: V}[]
    ): Map<string, V>;

    /**
     * Like `merge()`, but when two Iterables conflict, it merges them as well,
     * recursing deeply through the nested data.
     *
     *     var x = Immutable.fromJS({a: { x: 10, y: 10 }, b: { x: 20, y: 50 } });
     *     var y = Immutable.fromJS({a: { x: 2 }, b: { y: 5 }, c: { z: 3 } });
     *     x.mergeDeep(y) // {a: { x: 2, y: 10 }, b: { x: 20, y: 5 }, c: { z: 3 } }
     *
     */
    mergeDeep(...iterables: Iterable<K, V>[]): Map<K, V>;
    mergeDeep(...iterables: {[key: string]: V}[]): Map<string, V>;

    /**
     * Like `mergeDeep()`, but when two non-Iterables conflict, it uses the
     * `merger` function to determine the resulting value.
     *
     *     var x = Immutable.fromJS({a: { x: 10, y: 10 }, b: { x: 20, y: 50 } });
     *     var y = Immutable.fromJS({a: { x: 2 }, b: { y: 5 }, c: { z: 3 } });
     *     x.mergeDeepWith((prev, next) => prev / next, y)
     *     // {a: { x: 5, y: 10 }, b: { x: 20, y: 10 }, c: { z: 3 } }
     *
     */
    mergeDeepWith(
      merger: (previous?: V, next?: V) => V,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeDeepWith(
      merger: (previous?: V, next?: V) => V,
      ...iterables: {[key: string]: V}[]
    ): Map<string, V>;

    /**
     * A combination of `updateIn` and `mergeDeep`, returning a new Map, but
     * performing the deep merge at a point arrived at by following the keyPath.
     * In other words, these two lines are equivalent:
     *
     *     x.updateIn(['a', 'b', 'c'], abc => abc.mergeDeep(y));
     *     x.mergeDeepIn(['a', 'b', 'c'], y);
     *
     */
    mergeDeepIn(
      keyPath: Iterable<any, any>,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeDeepIn(
      keyPath: Array<any>,
      ...iterables: Iterable<K, V>[]
    ): Map<K, V>;
    mergeDeepIn(
      keyPath: Array<any>,
      ...iterables: {[key: string]: V}[]
    ): Map<string, V>;

    /**
     * Every time you call one of the above functions, a new immutable Map is
     * created. If a pure function calls a number of these to produce a final
     * return value, then a penalty on performance and memory has been paid by
     * creating all of the intermediate immutable Maps.
     *
     * If you need to apply a series of mutations to produce a new immutable
     * Map, `withMutations()` creates a temporary mutable copy of the Map which
     * can apply mutations in a highly performant manner. In fact, this is
     * exactly how complex mutations like `merge` are done.
     *
     * As an example, this results in the creation of 2, not 4, new Maps:
     *
     *     var map1 = Immutable.Map();
     *     var map2 = map1.withMutations(map => {
     *       map.set('a', 1).set('b', 2).set('c', 3);
     *     });
     *     assert(map1.size === 0);
     *     assert(map2.size === 3);
     *
     */
    withMutations(mutator: (mutable: Map<K, V>) => any): Map<K, V>;

    /**
     * Another way to avoid creation of intermediate Immutable maps is to create
     * a mutable copy of this collection. Mutable copies *always* return `this`,
     * and thus shouldn't be used for equality. Your function should never return
     * a mutable copy of a collection, only use it internally to create a new
     * collection. If possible, use `withMutations` as it provides an easier to
     * use API.
     *
     * Note: if the collection is already mutable, `asMutable` returns itself.
     */
    asMutable(): Map<K, V>;

    /**
     * The yin to `asMutable`'s yang. Because it applies to mutable collections,
     * this operation is *mutable* and returns itself. Once performed, the mutable
     * copy has become immutable and can be safely returned from a function.
     */
    asImmutable(): Map<K, V>;
  }


  /**
   * Ordered Map
   * -----------
   *
   * OrderedMap constructors return a Map which has the additional guarantee of
   * the iteration order of entries to match the order in which they were set().
   * This makes OrderedMap behave similarly to native JS objects.
   */

  export module OrderedMap {

    /**
     * True if the provided value is an OrderedMap.
     */
    function isOrderedMap(maybeOrderedMap: any): boolean;
  }

  /**
   * `OrderedMap()` creates a new immutable ordered Map with the same key
   * value pairs as the provided KeyedIterable or JavaScript Object or expects
   * an Iterable of [K, V] tuple entries.
   *
   *     var newOrderedMap = OrderedMap({key: "value"});
   *     var newOrderedMap = OrderedMap([["key", "value"]]);
   *
   */
  export function OrderedMap<K, V>(): Map<K, V>;
  export function OrderedMap<K, V>(iter: KeyedIterable<K, V>): Map<K, V>;
  export function OrderedMap<K, V>(iter: Iterable<any, /*[K,V]*/Array<any>>): Map<K, V>;
  export function OrderedMap<K, V>(array: Array</*[K,V]*/Array<any>>): Map<K, V>;
  export function OrderedMap<V>(obj: {[key: string]: V}): Map<string, V>;
  export function OrderedMap<K, V>(iterator: Iterator</*[K,V]*/Array<any>>): Map<K, V>;
  export function OrderedMap<K, V>(iterable: /*Iterable<[K,V]>*/Object): Map<K, V>;


  /**
   * Record
   * ------
   *
   * Creates a new Class which produces Record instances. A record is similar to
   * a JS object, but enforce a specific set of allowed string keys, and have
   * default values.
   *
   *     var ABRecord = Record({a:1, b:2})
   *     var myRecord = new ABRecord({b:3})
   *
   * Records always have a value for the keys they define. `remove`ing a key
   * from a record simply resets it to the default value for that key.
   *
   *     myRecord.size // 2
   *     myRecord.get('a') // 1
   *     myRecord.get('b') // 3
   *     myRecordWithoutB = myRecord.remove('b')
   *     myRecordWithoutB.get('b') // 2
   *     myRecordWithoutB.size // 2
   *
   * Values provided to the constructor not found in the Record type will
   * be ignored:
   *
   *     var myRecord = new ABRecord({b:3, x:10})
   *     myRecord.get('x') // undefined
   *
   * Because Records have a known set of string keys, property get access works
   * as expected, however property sets will throw an Error.
   *
   * Note: IE8 does not support property access.
   *
   *     myRecord.b // 3
   *     myRecord.b = 5 // throws Error
   *
   * Record Classes can be extended as well, allowing for custom methods on your
   * Record. This is not a common pattern in functional environments, but is in
   * many JS programs.
   *
   * Note: TypeScript does not support this type of subclassing.
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
  export function Record(
    defaultValues: {[key: string]: any}, name?: string
  ): RecordType;

  export interface RecordType {
    new (): Map<string, any>;
    new (values: {[key: string]: any}): Map<string, any>;
    new (values: Iterable<string, any>): Map<string, any>; // deprecated
  }


  /**
   * Set
   * ---
   *
   * A Set is a Iterable of unique values with `O(log32 N)` gets and sets.
   *
   * Sets, like Maps, require that their values are hashable, either a primitive
   * (string or number) or an object with a `hashCode(): number` method.
   *
   * When iterating a Set, the entries will be (value, value) pairs. Iteration
   * order of a Set is undefined, however is stable. Multiple iterations of the
   * same Set will iterate in the same order.
   */

  export module Set {

    /**
     * True if the provided value is a Set
     */
    function isSet(maybeSet: any): boolean;

    /**
     * Creates a new Set containing `values`.
     */
    function of<T>(...values: T[]): Set<T>;

    /**
     * `Set.fromKeys()` creates a new immutable Set containing the keys from
     * this Iterable or JavaScript Object.
     */
    function fromKeys<T>(iter: Iterable<T, any>): Set<T>;
    function fromKeys(obj: {[key: string]: any}): Set<string>;
  }

  /**
   * Create a new immutable Set containing the values of the provided
   * iterable-like.
   */
  export function Set<T>(): Set<T>;
  export function Set<T>(iter: SetIterable<T>): Set<T>;
  export function Set<T>(iter: IndexedIterable<T>): Set<T>;
  export function Set<K, V>(iter: KeyedIterable<K, V>): Set</*[K,V]*/any>;
  export function Set<T>(array: Array<T>): Set<T>;
  export function Set<T>(iterator: Iterator<T>): Set<T>;
  export function Set<T>(iterable: /*Iterable<T>*/Object): Set<T>;


  export interface Set<T> extends SetCollection<T> {

    /**
     * Returns a new Set which also includes this value.
     */
    add(value: T): Set<T>;

    /**
     * Returns a new Set which excludes this value.
     *
     * Note: `delete` cannot be safely used in IE8
     * @alias delete
     */
    remove(value: T): Set<T>;
    delete(value: T): Set<T>;

    /**
     * Returns a new Set containing no values.
     */
    clear(): Set<T>;

    /**
     * Alias for `union`.
     * @see `Map.prototype.merge`
     */
    merge(...iterables: Iterable<any, T>[]): Set<T>;
    merge(...iterables: Array<T>[]): Set<T>;

    /**
     * Returns a Set including any value from `iterables` that does not already
     * exist in this Set.
     */
    union(...iterables: Iterable<any, T>[]): Set<T>;
    union(...iterables: Array<T>[]): Set<T>;

    /**
     * Returns a Set which has removed any values not also contained
     * within `iterables`.
     */
    intersect(...iterables: Iterable<any, T>[]): Set<T>;
    intersect(...iterables: Array<T>[]): Set<T>;

    /**
     * Returns a Set excluding any values contained within `iterables`.
     */
    subtract(...iterables: Iterable<any, T>[]): Set<T>;
    subtract(...iterables: Array<T>[]): Set<T>;

    /**
     * @see `Map.prototype.withMutations`
     */
    withMutations(mutator: (mutable: Set<T>) => any): Set<T>;

    /**
     * @see `Map.prototype.asMutable`
     */
    asMutable(): Set<T>;

    /**
     * @see `Map.prototype.asImmutable`
     */
    asImmutable(): Set<T>;
  }


  /**
   * Ordered Set
   * -----------
   *
   * OrderedSet constructors return a Set which has the additional guarantee of
   * the iteration order of entries to match the order in which they were added.
   * This makes OrderedSet behave similarly to native JS objects or arrays.
   */

  export module OrderedSet {

    /**
     * True if the provided value is an OrderedSet.
     */
    function isOrderedSet(maybeOrderedSet: any): boolean;

    /**
     * Creates a new ordered Set containing `values`.
     */
    function of<T>(...values: T[]): Set<T>;

    /**
     * `OrderedSet.fromKeys()` creates a new immutable ordered Set containing
     * the keys from this Iterable or JavaScript Object.
     */
    function fromKeys<T>(iter: Iterable<T, any>): Set<T>;
    function fromKeys(obj: {[key: string]: any}): Set<string>;
  }

  /**
   * Create a new immutable ordered Set containing the values of the provided
   * iterable-like.
   */
  export function OrderedSet<T>(): Set<T>;
  export function OrderedSet<T>(iter: SetIterable<T>): Set<T>;
  export function OrderedSet<T>(iter: IndexedIterable<T>): Set<T>;
  export function OrderedSet<K, V>(iter: KeyedIterable<K, V>): Set</*[K,V]*/any>;
  export function OrderedSet<T>(array: Array<T>): Set<T>;
  export function OrderedSet<T>(iterator: Iterator<T>): Set<T>;
  export function OrderedSet<T>(iterable: /*Iterable<T>*/Object): Set<T>;


  /**
   * List
   * ------
   *
   * Lists are ordered indexed dense collections, much like a JavaScript
   * Array. Unlike a JavaScript Array, there is no distinction between an
   * "unset" index and an index set to `undefined`. `List#forEach` visits all
   * indices from 0 to size, regardless of if they are defined.
   */

  export module List {

    /**
     * True if the provided value is a List
     */
    function isList(maybeList: any): boolean;

    /**
     * Creates a new List containing `values`.
     */
    function of<T>(...values: T[]): List<T>;
  }

  /**
   * Create a new immutable List containing the values of the provided
   * iterable-like.
   */
  export function List<T>(): List<T>;
  export function List<T>(iter: IndexedIterable<T>): List<T>;
  export function List<T>(iter: SetIterable<T>): List<T>;
  export function List<K, V>(iter: KeyedIterable<K, V>): List</*[K,V]*/any>;
  export function List<T>(array: Array<T>): List<T>;
  export function List<T>(iterator: Iterator<T>): List<T>;
  export function List<T>(iterable: /*Iterable<T>*/Object): List<T>;


  export interface List<T> extends IndexedCollection<T> {

    /**
     * Returns a new List which includes `value` at `index`. If `index` already
     * exists in this List, it will be replaced.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * List. `v.set(-1, "value")` sets the last item in the List.
     */
    set(index: number, value: T): List<T>;

    /**
     * Returns a new List having set `value` at this `keyPath`. If any keys in
     * `keyPath` do not exist, a new immutable Map will be created at that key.
     */
    setIn(keyPath: Array<any>, value: T): List<T>;
    setIn(keyPath: Iterable<any, any>, value: T): List<T>;

    /**
     * Returns a new List which excludes this `index` and with a size 1 less
     * than this List. Values at indicies above `index` are shifted down by 1 to
     * fill the position.
     *
     * This is synonymous with `list.splice(index, 1)`.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * List. `v.delete(-1)` deletes the last item in the List.
     *
     * Note: `delete` cannot be safely used in IE8
     * @alias delete
     */
    remove(index: number): List<T>;
    delete(index: number): List<T>;

    /**
     * Returns a new List having removed the value at this `keyPath`. If any
     * keys in `keyPath` do not exist, a new immutable Map will be created at
     * that key.
     */
    removeIn(keyPath: Array<any>): List<T>;
    removeIn(keyPath: Iterable<any, any>): List<T>;

    /**
     * Returns a new List with 0 size and no values.
     */
    clear(): List<T>;

    /**
     * Returns a new List with the provided `values` appended, starting at this
     * List's `size`.
     */
    push(...values: T[]): List<T>;

    /**
     * Returns a new List with a size ones less than this List, excluding
     * the last index in this List.
     *
     * Note: this differs from `Array.prototype.pop` because it returns a new
     * List rather than the removed value. Use `last()` to get the last value
     * in this List.
     */
    pop(): List<T>;

    /**
     * Returns a new List with the provided `values` prepended, shifting other
     * values ahead to higher indices.
     */
    unshift(...values: T[]): List<T>;

    /**
     * Returns a new List with a size ones less than this List, excluding
     * the first index in this List, shifting all other values to a lower index.
     *
     * Note: this differs from `Array.prototype.shift` because it returns a new
     * List rather than the removed value. Use `first()` to get the first
     * value in this List.
     */
    shift(): List<T>;

    /**
     * Returns a new List with an updated value at `index` with the return
     * value of calling `updater` with the existing value, or `notSetValue` if
     * `index` was not set. If called with a single argument, `updater` is
     * called with the List itself.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * List. `v.update(-1)` updates the last item in the List.
     *
     * @see Map.update
     */
    update(updater: (value: List<T>) => List<T>): List<T>;
    update(index: number, updater: (value: T) => T): List<T>;
    update(index: number, notSetValue: T, updater: (value: T) => T): List<T>;

    /**
     * @see `Map.prototype.updateIn`
     */
    updateIn(
      keyPath: Array<any>,
      updater: (value: any) => any
    ): List<T>;
    updateIn(
      keyPath: Array<any>,
      notSetValue: any,
      updater: (value: any) => any
    ): List<T>;
    updateIn(
      keyPath: Iterable<any, any>,
      updater: (value: any) => any
    ): List<T>;
    updateIn(
      keyPath: Iterable<any, any>,
      notSetValue: any,
      updater: (value: any) => any
    ): List<T>;

    /**
     * @see `Map.prototype.merge`
     */
    merge(...iterables: IndexedIterable<T>[]): List<T>;
    merge(...iterables: Array<T>[]): List<T>;

    /**
     * @see `Map.prototype.mergeWith`
     */
    mergeWith(
      merger: (previous?: T, next?: T) => T,
      ...iterables: IndexedIterable<T>[]
    ): List<T>;
    mergeWith(
      merger: (previous?: T, next?: T) => T,
      ...iterables: Array<T>[]
    ): List<T>;

    /**
     * @see `Map.prototype.mergeIn`
     */
    mergeIn(
      keyPath: Iterable<any, any>,
      ...iterables: IndexedIterable<T>[]
    ): List<T>;
    mergeIn(
      keyPath: Array<any>,
      ...iterables: IndexedIterable<T>[]
    ): List<T>;
    mergeIn(
      keyPath: Array<any>,
      ...iterables: Array<T>[]
    ): List<T>;

    /**
     * @see `Map.prototype.mergeDeep`
     */
    mergeDeep(...iterables: IndexedIterable<T>[]): List<T>;
    mergeDeep(...iterables: Array<T>[]): List<T>;

    /**
     * @see `Map.prototype.mergeDeepWith`
     */
    mergeDeepWith(
      merger: (previous?: T, next?: T) => T,
      ...iterables: IndexedIterable<T>[]
    ): List<T>;
    mergeDeepWith(
      merger: (previous?: T, next?: T) => T,
      ...iterables: Array<T>[]
    ): List<T>;

    /**
     * @see `Map.prototype.mergeDeepIn`
     */
    mergeDeepIn(
      keyPath: Iterable<any, any>,
      ...iterables: IndexedIterable<T>[]
    ): List<T>;
    mergeDeepIn(
      keyPath: Array<any>,
      ...iterables: IndexedIterable<T>[]
    ): List<T>;
    mergeDeepIn(
      keyPath: Array<any>,
      ...iterables: Array<T>[]
    ): List<T>;

    /**
     * Returns a new List with size `size`. If `size` is less than this
     * List's size, the new List will exclude values at the higher indices.
     * If `size` is greater than this List's size, the new List will have
     * undefined values for the newly available indices.
     */
    setSize(size: number): List<T>;

    /**
     * @see `Map.prototype.withMutations`
     */
    withMutations(mutator: (mutable: List<T>) => any): List<T>;

    /**
     * @see `Map.prototype.asMutable`
     */
    asMutable(): List<T>;

    /**
     * @see `Map.prototype.asImmutable`
     */
    asImmutable(): List<T>;
  }


  /**
   * Stack
   * -----
   *
   * Stacks are indexed collections which support very efficient addition and
   * removal from the front using `unshift(v)` and `shift()`.
   *
   * For familiarity, Stack also provides `push(v)`, `pop()`, and `peek()`, but
   * be aware that they also operate on the front of the list, unlike List or
   * a JavaScript Array.
   */

  export module Stack {

    /**
     * True if the provided value is a Stack
     */
    function isStack(maybeStack: any): boolean;

    /**
     * Creates a new Stack containing `values`.
     */
    function of<T>(...values: T[]): Stack<T>;
  }

  /**
   * Create a new immutable Stack containing the values of the provided
   * iterable.
   */
  export function Stack<T>(): Stack<T>;
  export function Stack<T>(iter: IndexedIterable<T>): Stack<T>;
  export function Stack<T>(iter: SetIterable<T>): Stack<T>;
  export function Stack<K, V>(iter: KeyedIterable<K, V>): Stack</*[K,V]*/any>;
  export function Stack<T>(array: Array<T>): Stack<T>;
  export function Stack<T>(iterator: Iterator<T>): Stack<T>;
  export function Stack<T>(iterable: /*Iterable<T>*/Object): Stack<T>;


  export interface Stack<T> extends IndexedCollection<T> {

    /**
     * Returns a new Stack with 0 size and no values.
     */
    clear(): Stack<T>;

    /**
     * Returns a new Stack with the provided `values` prepended, shifting other
     * values ahead to higher indices.
     *
     * This is very efficient for Stack.
     */
    unshift(...values: T[]): Stack<T>;

    /**
     * Like `Stack#unshift`, but accepts a iterable rather than varargs.
     */
    unshiftAll(iter: Iterable<any, T>): Stack<T>;
    unshiftAll(iter: Array<T>): Stack<T>;

    /**
     * Returns a new Stack with a size ones less than this Stack, excluding
     * the first item in this Stack, shifting all other values to a lower index.
     *
     * Note: this differs from `Array.prototype.shift` because it returns a new
     * Stack rather than the removed value. Use `first()` or `peek()` to get the
     * first value in this Stack.
     */
    shift(): Stack<T>;

    /**
     * Alias for `Stack#unshift` and is not equivalent to `List#push`.
     */
    push(...values: T[]): Stack<T>;

    /**
     * Alias for `Stack#unshiftAll`.
     */
    pushAll(iter: Iterable<any, T>): Stack<T>;
    pushAll(iter: Array<T>): Stack<T>;

    /**
     * Alias for `Stack#shift` and is not equivalent to `List#pop`.
     */
    pop(): Stack<T>;

    /**
     * Alias for `Stack.first()`.
     */
    peek(): T;

    /**
     * @see `Map.prototype.withMutations`
     */
    withMutations(mutator: (mutable: List<T>) => any): List<T>;

    /**
     * @see `Map.prototype.asMutable`
     */
    asMutable(): List<T>;

    /**
     * @see `Map.prototype.asImmutable`
     */
    asImmutable(): List<T>;
  }


  // ES6 Iterator
  export interface Iterator<T> {
    next(): { value: T; done: boolean; }
  }

}
