/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Immutable data encourages pure functions (data-in, data-out) and lends itself
 * to much simpler application development and enabling techniques from
 * functional programming such as lazy evaluation.
 *
 * While designed to bring these powerful functional concepts to JavaScript, it
 * presents an Object-Oriented API familiar to Javascript engineers and closely
 * mirroring that of Array, Map, and Set. It is easy and efficient to convert to
 * and from plain Javascript types.
 *
 * ## How to read these docs
 *
 * In order to better explain what kinds of values the Immutable.js API expects
 * and produces, this documentation is presented in a statically typed dialect of
 * JavaScript (like [Flow][] or [TypeScript][]). You *don't need* to use these
 * type checking tools in order to use Immutable.js, however becoming familiar
 * with their syntax will help you get a deeper understanding of this API.
 *
 * **A few examples and how to read them.**
 *
 * All methods describe the kinds of data they accept and the kinds of data
 * they return. For example a function which accepts two numbers and returns
 * a number would look like this:
 *
 * ```js
 * sum(first: number, second: number): number
 * ```
 *
 * Sometimes, methods can accept different kinds of data or return different
 * kinds of data, and this is described with a *type variable*, which are
 * typically in all-caps. For example, a function which always returns the same
 * kind of data it was provided would look like this:
 *
 * ```js
 * identity<T>(value: T): T
 * ```
 *
 * Type variables are defined with classes and referred to in methods. For
 * example, a class that holds onto a value for you might look like this:
 *
 * ```js
 * class Box<T> {
 *   constructor(value: T)
 *   getValue(): T
 * }
 * ```
 *
 * In order to manipulate Immutable data, methods that we're used to affecting
 * a Collection instead return a new Collection of the same type. The type
 * `this` refers to the same kind of class. For example, a List which returns
 * new Lists when you `push` a value onto it might look like:
 *
 * ```js
 * class List<T> {
 *   push(value: T): this
 * }
 * ```
 *
 * Many methods in Immutable.js accept values which implement the JavaScript
 * [Iterable][] protocol, and might appear like `Iterable<string>` for something
 * which represents sequence of strings. Typically in JavaScript we use plain
 * Arrays (`[]`) when an Iterable is expected, but also all of the Immutable.js
 * collections are iterable themselves!
 *
 * For example, to get a value deep within a structure of data, we might use
 * `getIn` which expects an `Iterable` path:
 *
 * ```
 * getIn(path: Iterable<string | number>): any
 * ```
 *
 * To use this method, we could pass an array: `data.getIn([ "key", 2 ])`.
 *
 *
 * Note: All examples are presented in the modern [ES2015][] version of
 * JavaScript. To run in older browsers, they need to be translated to ES3.
 *
 * For example:
 *
 * ```js
 * // ES2015
 * const mappedFoo = foo.map(x => x * x);
 * // ES3
 * var mappedFoo = foo.map(function (x) { return x * x; });
 * ```
 *
 * [ES2015]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/New_in_JavaScript/ECMAScript_6_support_in_Mozilla
 * [TypeScript]: http://www.typescriptlang.org/
 * [Flow]: https://flowtype.org/
 * [Iterable]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Iteration_protocols
 */

declare module Immutable {

  /**
   * Deeply converts plain JS objects and arrays to Immutable Maps and Lists.
   *
   * If a `reviver` is optionally provided, it will be called with every
   * collection as a Seq (beginning with the most nested collections
   * and proceeding to the top-level collection itself), along with the key
   * refering to each collection and the parent JS object provided as `this`.
   * For the top level, object, the key will be `""`. This `reviver` is expected
   * to return a new Immutable Collection, allowing for custom conversions from
   * deep JS objects. Finally, a `path` is provided which is the sequence of
   * keys to this value from the starting value.
   *
   * This example converts native JS data to List and OrderedMap:
   *
   * ```js
   * const { fromJS, isIndexed } = require('immutable')
   * fromJS({ a: {b: [10, 20, 30]}, c: 40}, function (key, value, path) {
   *   console.log(key, value, path)
   *   return isIndexed(value) ? value.toList() : value.toOrderedMap()
   * })
   *
   * > "b", [ 10, 20, 30 ], [ "a", "b" ]
   * > "a", { b: [10, 20, 30] }, c: 40 }, [ "a" ]
   * > "", {a: {b: [10, 20, 30]}, c: 40}, []
   * ```
   *
   * If `reviver` is not provided, the default behavior will convert Arrays into
   * Lists and Objects into Maps.
   *
   * `reviver` acts similarly to the [same parameter in `JSON.parse`][1].
   *
   * `fromJS` is conservative in its conversion. It will only convert
   * arrays which pass `Array.isArray` to Lists, and only raw objects (no custom
   * prototype) to Map.
   *
   * Keep in mind, when using JS objects to construct Immutable Maps, that
   * JavaScript Object properties are always strings, even if written in a
   * quote-less shorthand, while Immutable Maps accept keys of any type.
   *
   * ```js
   * let obj = { 1: "one" };
   * Object.keys(obj); // [ "1" ]
   * obj["1"]; // "one"
   * obj[1];   // "one"
   *
   * let map = Map(obj);
   * map.get("1"); // "one"
   * map.get(1);   // undefined
   * ```
   *
   * Property access for JavaScript Objects first converts the key to a string,
   * but since Immutable Map keys can be of any type the argument to `get()` is
   * not altered.
   *
   * [1]: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON/parse#Example.3A_Using_the_reviver_parameter
   *      "Using the reviver parameter"
   */
  export function fromJS(
    jsValue: any,
    reviver?: (
      key: string | number,
      sequence: Collection.Keyed<string, any> | Collection.Indexed<any>,
      path?: Array<string | number>
    ) => any
  ): any;


  /**
   * Value equality check with semantics similar to `Object.is`, but treats
   * Immutable `Collection`s as values, equal if the second `Collection` includes
   * equivalent values.
   *
   * It's used throughout Immutable when checking for equality, including `Map`
   * key equality and `Set` membership.
   *
   * ```js
   * import { Map, is } from 'immutable'
   * const map1 = Map({ a: 1, b: 1, c: 1 })
   * const map2 = Map({ a: 1, b: 1, c: 1 })
   * assert(map1 !== map2)
   * assert(Object.is(map1, map2) === false)
   * assert(is(map1, map2) === true)
   * ```
   *
   * `is()` compares primitive types like strings and numbers, Immutable.js
   * collections like `Map` and `List`, but also any custom object which
   * implements `ValueObject` by providing `equals()` and `hashCode()` methods.
   *
   * Note: Unlike `Object.is`, `Immutable.is` assumes `0` and `-0` are the same
   * value, matching the behavior of ES6 Map key equality.
   */
  export function is(first: any, second: any): boolean;


  /**
   * The `hash()` function is an important part of how Immutable determines if
   * two values are equivalent and is used to determine how to store those
   * values. Provided with any value, `hash()` will return a 31-bit integer.
   *
   * When designing Objects which may be equal, it's important than when a
   * `.equals()` method returns true, that both values `.hashCode()` method
   * return the same value. `hash()` may be used to produce those values.
   *
   * Note that `hash()` attempts to balance between speed and avoiding
   * collisions, however it makes no attempt to produce secure hashes.
   */
  export function hash(value: any): number;

  /**
   * True if `maybeImmutable` is an Immutable Collection or Record.
   *
   * ```js
   * const { isImmutable, Map, List, Stack } = require('immutable');
   * isImmutable([]); // false
   * isImmutable({}); // false
   * isImmutable(Map()); // true
   * isImmutable(List()); // true
   * isImmutable(Stack()); // true
   * isImmutable(Map().asMutable()); // false
   * ```
   */
  export function isImmutable(maybeImmutable: any): maybeImmutable is Collection<any, any>;

  /**
   * True if `maybeCollection` is an Collection, or any of its subclasses.
   *
   * ```js
   * const { isCollection, Map, List, Stack } = require('immutable');
   * isCollection([]); // false
   * isCollection({}); // false
   * isCollection(Map()); // true
   * isCollection(List()); // true
   * isCollection(Stack()); // true
   * ```
   */
  export function isCollection(maybeCollection: any): maybeCollection is Collection<any, any>;

  /**
   * True if `maybeKeyed` is an Collection.Keyed, or any of its subclasses.
   *
   * ```js
   * const { isKeyed, Map, List, Stack } = require('immutable');
   * isKeyed([]); // false
   * isKeyed({}); // false
   * isKeyed(Map()); // true
   * isKeyed(List()); // false
   * isKeyed(Stack()); // false
   * ```
   */
  export function isKeyed(maybeKeyed: any): maybeKeyed is Collection.Keyed<any, any>;

  /**
   * True if `maybeIndexed` is a Collection.Indexed, or any of its subclasses.
   *
   * ```js
   * const { isIndexed, Map, List, Stack, Set } = require('immutable');
   * isIndexed([]); // false
   * isIndexed({}); // false
   * isIndexed(Map()); // false
   * isIndexed(List()); // true
   * isIndexed(Stack()); // true
   * isIndexed(Set()); // false
   * ```
   */
  export function isIndexed(maybeIndexed: any): maybeIndexed is Collection.Indexed<any>;

  /**
   * True if `maybeAssociative` is either a Keyed or Indexed Collection.
   *
   * ```js
   * const { isAssociative, Map, List, Stack, Set } = require('immutable');
   * isAssociative([]); // false
   * isAssociative({}); // false
   * isAssociative(Map()); // true
   * isAssociative(List()); // true
   * isAssociative(Stack()); // true
   * isAssociative(Set()); // false
   * ```
   */
  export function isAssociative(maybeAssociative: any): maybeAssociative is Collection.Keyed<any, any> | Collection.Indexed<any>;

  /**
   * True if `maybeOrdered` is an Collection where iteration order is well
   * defined. True for Collection.Indexed as well as OrderedMap and OrderedSet.
   *
   * ```js
   * const { isOrdered, Map, OrderedMap, List, Set } = require('immutable');
   * isOrdered([]); // false
   * isOrdered({}); // false
   * isOrdered(Map()); // false
   * isOrdered(OrderedMap()); // true
   * isOrdered(List()); // true
   * isOrdered(Set()); // false
   */
  export function isOrdered(maybeOrdered: any): boolean;

  /**
   * True if `maybeValue` is a JavaScript Object which has *both* `equals()`
   * and `hashCode()` methods.
   *
   * Any two instances of *value objects* can be compared for value equality with
   * `Immutable.is()` and can be used as keys in a `Map` or members in a `Set`.
   */
  export function isValueObject(maybeValue: any): maybeValue is ValueObject;

  /**
   * The interface to fulfill to qualify as a Value Object.
   */
  export interface ValueObject {
    /**
     * True if this and the other Collection have value equality, as defined
     * by `Immutable.is()`.
     *
     * Note: This is equivalent to `Immutable.is(this, other)`, but provided to
     * allow for chained expressions.
     */
    equals(other: any): boolean;

    /**
     * Computes and returns the hashed identity for this Collection.
     *
     * The `hashCode` of an Collection is used to determine potential equality,
     * and is used when adding this to a `Set` or as a key in a `Map`, enabling
     * lookup via a different instance.
     *
     * ```js
     * const a = List([ 1, 2, 3 ]);
     * const b = List([ 1, 2, 3 ]);
     * assert(a !== b); // different instances
     * const set = Set([ a ]);
     * assert(set.has(b) === true);
     * ```
     *
     * If two values have the same `hashCode`, they are [not guaranteed
     * to be equal][Hash Collision]. If two values have different `hashCode`s,
     * they must not be equal.
     *
     * [Hash Collision]: http://en.wikipedia.org/wiki/Collision_(computer_science)
     */
    hashCode(): number;
  }

  /**
   * Lists are ordered indexed dense collections, much like a JavaScript
   * Array.
   *
   * Lists are immutable and fully persistent with O(log32 N) gets and sets,
   * and O(1) push and pop.
   *
   * Lists implement Deque, with efficient addition and removal from both the
   * end (`push`, `pop`) and beginning (`unshift`, `shift`).
   *
   * Unlike a JavaScript Array, there is no distinction between an
   * "unset" index and an index set to `undefined`. `List#forEach` visits all
   * indices from 0 to size, regardless of whether they were explicitly defined.
   */
  export module List {

    /**
     * True if the provided value is a List
     *
     * ```js
     * List.isList([]); // false
     * List.isList(List()); // true
     * ```
     */
    function isList(maybeList: any): maybeList is List<any>;

    /**
     * Creates a new List containing `values`.
     *
     * ```js
     * List.of(1, 2, 3, 4)
     * // List [ 1, 2, 3, 4 ]
     * ```
     *
     * Note: Values are not altered or converted in any way.
     *
     * ```js
     * List.of({x:1}, 2, [3], 4)
     * // List [ { x: 1 }, 2, [ 3 ], 4 ]
     * ```
     */
    function of<T>(...values: Array<T>): List<T>;
  }

  /**
   * Create a new immutable List containing the values of the provided
   * collection-like.
   *
   * ```js
   * const { List, Set } = require('immutable')
   *
   * const emptyList = List()
   * // List []
   *
   * const plainArray = [ 1, 2, 3, 4 ]
   * const listFromPlainArray = List(plainArray)
   * // List [ 1, 2, 3, 4 ]
   *
   * const plainSet = Set([ 1, 2, 3, 4 ])
   * const listFromPlainSet = List(plainSet)
   * // List [ 1, 2, 3, 4 ]
   *
   * const arrayIterator = plainArray[Symbol.iterator]()
   * const listFromCollectionArray = List(arrayIterator)
   * // List [ 1, 2, 3, 4 ]
   *
   * listFromPlainArray.equals(listFromCollectionSet) // true
   * listFromPlainSet.equals(listFromCollectionSet) // true
   * listFromPlainSet.equals(listFromPlainArray) // true
   * ```
   */
  export function List(): List<any>;
  export function List<T>(): List<T>;
  export function List<T>(collection: Iterable<T>): List<T>;

  export interface List<T> extends Collection.Indexed<T> {

    // Persistent changes

    /**
     * Returns a new List which includes `value` at `index`. If `index` already
     * exists in this List, it will be replaced.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * List. `v.set(-1, "value")` sets the last item in the List.
     *
     * If `index` larger than `size`, the returned List's `size` will be large
     * enough to include the `index`.
     *
     * ```js
     * const originalList = List([ 0 ]);
     * // List [ 0 ]
     * originalList.set(1, 1);
     * // List [ 0, 1 ]
     * originalList.set(0, 'overwritten');
     * // List [ "overwritten" ]
     * originalList.set(2, 2);
     * // List [ 0, undefined, 2 ]
     *
     * List().set(50000, 'value').size;
     * // 50001
     * ```
     *
     * Note: `set` can be used in `withMutations`.
     */
    set(index: number, value: T): List<T>;

    /**
     * Returns a new List which excludes this `index` and with a size 1 less
     * than this List. Values at indices above `index` are shifted down by 1 to
     * fill the position.
     *
     * This is synonymous with `list.splice(index, 1)`.
     *
     * `index` may be a negative number, which indexes back from the end of the
     * List. `v.delete(-1)` deletes the last item in the List.
     *
     * Note: `delete` cannot be safely used in IE8
     *
     * ```js
     * List([ 0, 1, 2, 3, 4 ]).delete(0);
     * // List [ 1, 2, 3, 4 ]
     * ```
     *
     * Note: `delete` *cannot* be used in `withMutations`.
     *
     * @alias remove
     */
    delete(index: number): List<T>;
    remove(index: number): List<T>;

    /**
     * Returns a new List with `value` at `index` with a size 1 more than this
     * List. Values at indices above `index` are shifted over by 1.
     *
     * This is synonymous with `list.splice(index, 0, value)`.
     *
     * ```js
     * List([ 0, 1, 2, 3, 4 ]).insert(6, 5)
     * // List [ 0, 1, 2, 3, 4, 5 ]
     * ```
     *
     * Note: `insert` *cannot* be used in `withMutations`.
     */
    insert(index: number, value: T): List<T>;

    /**
     * Returns a new List with 0 size and no values.
     *
     * ```js
     * List([ 1, 2, 3, 4 ]).clear()
     * // List []
     * ```
     *
     * Note: `clear` can be used in `withMutations`.
     */
    clear(): List<T>;

    /**
     * Returns a new List with the provided `values` appended, starting at this
     * List's `size`.
     *
     * ```js
     * List([ 1, 2, 3, 4 ]).push(5)
     * // List [ 1, 2, 3, 4, 5 ]
     * ```
     *
     * Note: `push` can be used in `withMutations`.
     */
    push(...values: Array<T>): List<T>;

    /**
     * Returns a new List with a size ones less than this List, excluding
     * the last index in this List.
     *
     * Note: this differs from `Array#pop` because it returns a new
     * List rather than the removed value. Use `last()` to get the last value
     * in this List.
     *
     * ```js
     * List([ 1, 2, 3, 4 ]).pop()
     * // List[ 1, 2, 3 ]
     * ```
     *
     * Note: `pop` can be used in `withMutations`.
     */
    pop(): List<T>;

    /**
     * Returns a new List with the provided `values` prepended, shifting other
     * values ahead to higher indices.
     *
     * ```js
     * List([ 2, 3, 4]).unshift(1);
     * // List [ 1, 2, 3, 4 ]
     * ```
     *
     * Note: `unshift` can be used in `withMutations`.
     */
    unshift(...values: Array<T>): List<T>;

    /**
     * Returns a new List with a size ones less than this List, excluding
     * the first index in this List, shifting all other values to a lower index.
     *
     * Note: this differs from `Array#shift` because it returns a new
     * List rather than the removed value. Use `first()` to get the first
     * value in this List.
     *
     * ```js
     * List([ 0, 1, 2, 3, 4 ]).shift();
     * // List [ 1, 2, 3, 4 ]
     * ```
     *
     * Note: `shift` can be used in `withMutations`.
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
     * ```js
     * const list = List([ 'a', 'b', 'c' ])
     * const result = list.update(2, val => val.toUpperCase())
     * // List [ "a", "b", "C" ]
     * ```
     *
     * This can be very useful as a way to "chain" a normal function into a
     * sequence of methods. RxJS calls this "let" and lodash calls it "thru".
     *
     * For example, to sum a List after mapping and filtering:
     *
     * ```js
     * function sum(collection) {
     *   return collection.reduce((sum, x) => sum + x, 0)
     * }
     *
     * List([ 1, 2, 3 ])
     *   .map(x => x + 1)
     *   .filter(x => x % 2 === 0)
     *   .update(sum)
     * // 6
     * ```
     *
     * Note: `update(index)` can be used in `withMutations`.
     *
     * @see `Map#update`
     */
    update(index: number, notSetValue: T, updater: (value: T) => T): this;
    update(index: number, updater: (value: T) => T): this;
    update<R>(updater: (value: this) => R): R;

    /**
     * Note: `merge` can be used in `withMutations`.
     *
     * @see `Map#merge`
     */
    merge(...collections: Array<Collection.Indexed<T> | Array<T>>): this;

    /**
     * Note: `mergeWith` can be used in `withMutations`.
     *
     * @see `Map#mergeWith`
     */
    mergeWith(
      merger: (oldVal: T, newVal: T, key: number) => T,
      ...collections: Array<Collection.Indexed<T> | Array<T>>
    ): this;

    /**
     * Note: `mergeDeep` can be used in `withMutations`.
     *
     * @see `Map#mergeDeep`
     */
    mergeDeep(...collections: Array<Collection.Indexed<T> | Array<T>>): this;

    /**
     * Note: `mergeDeepWith` can be used in `withMutations`.
     * @see `Map#mergeDeepWith`
     */
    mergeDeepWith(
      merger: (oldVal: T, newVal: T, key: number) => T,
      ...collections: Array<Collection.Indexed<T> | Array<T>>
    ): this;

    /**
     * Returns a new List with size `size`. If `size` is less than this
     * List's size, the new List will exclude values at the higher indices.
     * If `size` is greater than this List's size, the new List will have
     * undefined values for the newly available indices.
     *
     * When building a new List and the final size is known up front, `setSize`
     * used in conjunction with `withMutations` may result in the more
     * performant construction.
     */
    setSize(size: number): List<T>;


    // Deep persistent changes

    /**
     * Returns a new List having set `value` at this `keyPath`. If any keys in
     * `keyPath` do not exist, a new immutable Map will be created at that key.
     *
     * Index numbers are used as keys to determine the path to follow in
     * the List.
     *
     * ```js
     * const { List } = require('immutable');
     * const list = List([ 0, 1, 2, List([ 3, 4 ])])
     * list.setIn([3, 0], 999);
     * // List [ 0, 1, 2, List [ 999, 4 ] ]
     * ```
     *
     * Note: `setIn` can be used in `withMutations`.
     */
    setIn(keyPath: Iterable<any>, value: any): this;

    /**
     * Returns a new List having removed the value at this `keyPath`. If any
     * keys in `keyPath` do not exist, no change will occur.
     *
     * ```js
     * const { List } = require('immutable');
     * const list = List([ 0, 1, 2, List([ 3, 4 ])])
     * list.deleteIn([3, 0]);
     * // List [ 0, 1, 2, List [ 4 ] ]
     * ```
     *
     * Note: `deleteIn` *cannot* be safely used in `withMutations`.
     *
     * @alias removeIn
     */
    deleteIn(keyPath: Iterable<any>): this;
    removeIn(keyPath: Iterable<any>): this;

    /**
     * Note: `updateIn` can be used in `withMutations`.
     *
     * @see `Map#updateIn`
     */
    updateIn(keyPath: Iterable<any>, notSetValue: any, updater: (value: any) => any): this;
    updateIn(keyPath: Iterable<any>, updater: (value: any) => any): this;

    /**
     * Note: `mergeIn` can be used in `withMutations`.
     *
     * @see `Map#mergeIn`
     */
    mergeIn(keyPath: Iterable<any>, ...collections: Array<any>): this;

    /**
     * Note: `mergeDeepIn` can be used in `withMutations`.
     *
     * @see `Map#mergeDeepIn`
     */
    mergeDeepIn(keyPath: Iterable<any>, ...collections: Array<any>): this;

    // Transient changes

    /**
     * Note: Not all methods can be safely used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * allows being used in `withMutations`.
     *
     * @see `Map#withMutations`
     */
    withMutations(mutator: (mutable: this) => any): this;

    /**
     * An alternative API for withMutations()
     *
     * Note: Not all methods can be safely used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * allows being used in `withMutations`.
     *
     * @see `Map#asMutable`
     */
    asMutable(): this;

    /**
     * @see `Map#asImmutable`
     */
    asImmutable(): this;

    // Sequence algorithms

    /**
     * Returns a new List with other values or collections concatenated to this one.
     */
    concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): List<T | C>;

    /**
     * Returns a new List with values passed through a
     * `mapper` function.
     *
     * ```js
     * List([ 1, 2 ]).map(x => 10 * x)
     * // List [ 10, 20 ]
     * ```
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: T, key: number, iter: this) => M,
      context?: any
    ): List<M>;

    /**
     * Flat-maps the List, returning a new List.
     *
     * Similar to `list.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: T, key: number, iter: this) => Iterable<M>,
      context?: any
    ): List<M>;

    /**
     * Returns a new List with only the values for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends T>(
      predicate: (value: T, index: number, iter: this) => value is F,
      context?: any
    ): List<F>;
    filter(
      predicate: (value: T, index: number, iter: this) => any,
      context?: any
    ): this;
  }


  /**
   * Immutable Map is an unordered Collection.Keyed of (key, value) pairs with
   * `O(log32 N)` gets and `O(log32 N)` persistent sets.
   *
   * Iteration order of a Map is undefined, however is stable. Multiple
   * iterations of the same Map will iterate in the same order.
   *
   * Map's keys can be of any type, and use `Immutable.is` to determine key
   * equality. This allows the use of any value (including NaN) as a key.
   *
   * Because `Immutable.is` returns equality based on value semantics, and
   * Immutable collections are treated as values, any Immutable collection may
   * be used as a key.
   *
   * ```js
   * const { Map, List } = require('immutable');
   * Map().set(List([ 1 ]), 'listofone').get(List([ 1 ]));
   * // 'listofone'
   * ```
   *
   * Any JavaScript object may be used as a key, however strict identity is used
   * to evaluate key equality. Two similar looking objects will represent two
   * different keys.
   *
   * Implemented by a hash-array mapped trie.
   */
  export module Map {

    /**
     * True if the provided value is a Map
     *
     * ```js
     * const { Map } = require('immutable')
     * Map.isMap({}) // false
     * Map.isMap(Map()) // true
     * ```
     */
    function isMap(maybeMap: any): maybeMap is Map<any, any>;

    /**
     * Creates a new Map from alternating keys and values
     *
     * ```js
     * const { Map } = require('immutable')
     * Map.of(
     *   'key', 'value',
     *   'numerical value', 3,
     *    0, 'numerical key'
     * )
     * // Map { 0: "numerical key", "key": "value", "numerical value": 3 }
     * ```
     *
     * @deprecated Use Map([ [ 'k', 'v' ] ]) or Map({ k: 'v' })
     */
    function of(...keyValues: Array<any>): Map<any, any>;
  }

  /**
   * Creates a new Immutable Map.
   *
   * Created with the same key value pairs as the provided Collection.Keyed or
   * JavaScript Object or expects an Collection of [K, V] tuple entries.
   *
   * ```js
   * const { Map } = require('immutable')
   * Map({ key: "value" })
   * Map([ [ "key", "value" ] ])
   * ```
   *
   * Keep in mind, when using JS objects to construct Immutable Maps, that
   * JavaScript Object properties are always strings, even if written in a
   * quote-less shorthand, while Immutable Maps accept keys of any type.
   *
   * ```js
   * let obj = { 1: "one" }
   * Object.keys(obj) // [ "1" ]
   * obj["1"] // "one"
   * obj[1]   // "one"
   *
   * let map = Map(obj)
   * map.get("1") // "one"
   * map.get(1)   // undefined
   * ```
   *
   * Property access for JavaScript Objects first converts the key to a string,
   * but since Immutable Map keys can be of any type the argument to `get()` is
   * not altered.
   */
  export function Map<K, V>(collection: Iterable<[K, V]>): Map<K, V>;
  export function Map<T>(collection: Iterable<Iterable<T>>): Map<T, T>;
  export function Map<V>(obj: {[key: string]: V}): Map<string, V>;
  export function Map<K, V>(): Map<K, V>;
  export function Map(): Map<any, any>;

  export interface Map<K, V> extends Collection.Keyed<K, V> {

    // Persistent changes

    /**
     * Returns a new Map also containing the new key, value pair. If an equivalent
     * key already exists in this Map, it will be replaced.
     *
     * ```js
     * const { Map } = require('immutable')
     * const originalMap = Map()
     * const newerMap = originalMap.set('key', 'value')
     * const newestMap = newerMap.set('key', 'newer value')
     *
     * originalMap
     * // Map {}
     * newerMap
     * // Map { "key": "value" }
     * newestMap
     * // Map { "key": "newer value" }
     * ```
     *
     * Note: `set` can be used in `withMutations`.
     */
    set(key: K, value: V): this;

    /**
     * Returns a new Map which excludes this `key`.
     *
     * Note: `delete` cannot be safely used in IE8, but is provided to mirror
     * the ES6 collection API.
     *
     * ```js
     * const { Map } = require('immutable')
     * const originalMap = Map({
     *   key: 'value',
     *   otherKey: 'other value'
     * })
     * // Map { "key": "value", "otherKey": "other value" }
     * originalMap.delete('otherKey')
     * // Map { "key": "value" }
     * ```
     *
     * Note: `delete` can be used in `withMutations`.
     *
     * @alias remove
     */
    delete(key: K): this;
    remove(key: K): this;

    /**
     * Returns a new Map which excludes the provided `keys`.
     *
     * ```js
     * const { Map } = require('immutable')
     * const names = Map({ a: "Aaron", b: "Barry", c: "Connor" })
     * names.deleteAll([ 'a', 'c' ])
     * // Map { "b": "Barry" }
     * ```
     *
     * Note: `deleteAll` can be used in `withMutations`.
     *
     * @alias removeAll
     */
    deleteAll(keys: Iterable<K>): this;
    removeAll(keys: Iterable<K>): this;

    /**
     * Returns a new Map containing no keys or values.
     *
     * ```js
     * const { Map } = require('immutable')
     * Map({ key: 'value' }).clear()
     * // Map {}
     * ```
     *
     * Note: `clear` can be used in `withMutations`.
     */
    clear(): this;

    /**
     * Returns a new Map having updated the value at this `key` with the return
     * value of calling `updater` with the existing value.
     *
     * Similar to: `map.set(key, updater(map.get(key)))`.
     *
     * ```js
     * const { Map } = require('immutable')
     * const aMap = Map({ key: 'value' })
     * const newMap = aMap.update('key', value => value + value)
     * // Map { "key": "valuevalue" }
     * ```
     *
     * This is most commonly used to call methods on collections within a
     * structure of data. For example, in order to `.push()` onto a nested `List`,
     * `update` and `push` can be used together:
     *
     * ```js
     * const aMap = Map({ nestedList: List([ 1, 2, 3 ]) })
     * const newMap = aMap.update('nestedList', list => list.push(4))
     * // Map { "nestedList": List [ 1, 2, 3, 4 ] }
     * ```
     *
     * When a `notSetValue` is provided, it is provided to the `updater`
     * function when the value at the key does not exist in the Map.
     *
     * ```js
     * const aMap = Map({ key: 'value' })
     * const newMap = aMap.update('noKey', 'no value', value => value + value)
     * // Map { "key": "value", "noKey": "no valueno value" }
     * ```
     *
     * However, if the `updater` function returns the same value it was called
     * with, then no change will occur. This is still true if `notSetValue`
     * is provided.
     *
     * ```js
     * const aMap = Map({ apples: 10 })
     * const newMap = aMap.update('oranges', 0, val => val)
     * // Map { "apples": 10 }
     * assert(newMap === map);
     * ```
     *
     * For code using ES2015 or later, using `notSetValue` is discourged in
     * favor of function parameter default values. This helps to avoid any
     * potential confusion with identify functions as described above.
     *
     * The previous example behaves differently when written with default values:
     *
     * ```js
     * const aMap = Map({ apples: 10 })
     * const newMap = aMap.update('oranges', (val = 0) => val)
     * // Map { "apples": 10, "oranges": 0 }
     * ```
     *
     * If no key is provided, then the `updater` function return value is
     * returned as well.
     *
     * ```js
     * const aMap = Map({ key: 'value' })
     * const result = aMap.update(aMap => aMap.get('key'))
     * // "value"
     * ```
     *
     * This can be very useful as a way to "chain" a normal function into a
     * sequence of methods. RxJS calls this "let" and lodash calls it "thru".
     *
     * For example, to sum the values in a Map
     *
     * ```js
     * function sum(collection) {
     *   return collection.reduce((sum, x) => sum + x, 0)
     * }
     *
     * Map({ x: 1, y: 2, z: 3 })
     *   .map(x => x + 1)
     *   .filter(x => x % 2 === 0)
     *   .update(sum)
     * // 6
     * ```
     *
     * Note: `update(key)` can be used in `withMutations`.
     */
    update(key: K, notSetValue: V, updater: (value: V) => V): this;
    update(key: K, updater: (value: V) => V): this;
    update<R>(updater: (value: this) => R): R;

    /**
     * Returns a new Map resulting from merging the provided Collections
     * (or JS objects) into this Map. In other words, this takes each entry of
     * each collection and sets it on this Map.
     *
     * If any of the values provided to `merge` are not Collection (would return
     * false for `isCollection`) then they are deeply converted
     * via `fromJS` before being merged. However, if the value is an
     * Collection but includes non-collection JS objects or arrays, those nested
     * values will be preserved.
     *
     * ```js
     * const { Map } = require('immutable')
     * const one = Map({ a: 10, b: 20, c: 30 })
     * const two = Map({ b: 40, a: 50, d: 60 })
     * one.merge(two) // Map { "a": 50, "b": 40, "c": 30, "d": 60 }
     * two.merge(one) // Map { "b": 20, "a": 10, "d": 60, "c": 30 }
     * ```
     *
     * Note: `merge` can be used in `withMutations`.
     */
    merge(...collections: Array<Collection<K, V> | {[key: string]: V}>): this;

    /**
     * Like `merge()`, `mergeWith()` returns a new Map resulting from merging
     * the provided Collections (or JS objects) into this Map, but uses the
     * `merger` function for dealing with conflicts.
     *
     * ```js
     * const { Map } = require('immutable')
     * const one = Map({ a: 10, b: 20, c: 30 })
     * const two = Map({ b: 40, a: 50, d: 60 })
     * one.mergeWith((oldVal, newVal) => oldVal / newVal, two)
     * // { "a": 0.2, "b": 0.5, "c": 30, "d": 60 }
     * two.mergeWith((oldVal, newVal) => oldVal / newVal, one)
     * // { "b": 2, "a": 5, "d": 60, "c": 30 }
     * ```
     *
     * Note: `mergeWith` can be used in `withMutations`.
     */
    mergeWith(
      merger: (oldVal: V, newVal: V, key: K) => V,
      ...collections: Array<Collection<K, V> | {[key: string]: V}>
    ): this;

    /**
     * Like `merge()`, but when two Collections conflict, it merges them as well,
     * recursing deeply through the nested data.
     *
     * ```js
     * const { Map } = require('immutable')
     * const one = Map({ a: Map({ x: 10, y: 10 }), b: Map({ x: 20, y: 50 }) })
     * const two = Map({ a: Map({ x: 2 }), b: Map({ y: 5 }), c: Map({ z: 3 }) })
     * one.mergeDeep(two)
     * // Map {
     * //   "a": Map { "x": 2, "y": 10 },
     * //   "b": Map { "x": 20, "y": 5 },
     * //   "c": Map { "z": 3 }
     * // }
     * ```
     *
     * Note: `mergeDeep` can be used in `withMutations`.
     */
    mergeDeep(...collections: Array<Collection<K, V> | {[key: string]: V}>): this;

    /**
     * Like `mergeDeep()`, but when two non-Collections conflict, it uses the
     * `merger` function to determine the resulting value.
     *
     * ```js
     * const { Map } = require('immutable')
     * const one = Map({ a: Map({ x: 10, y: 10 }), b: Map({ x: 20, y: 50 }) })
     * const two = Map({ a: Map({ x: 2 }), b: Map({ y: 5 }), c: Map({ z: 3 }) })
     * one.mergeDeepWith((oldVal, newVal) => oldVal / newVal, two)
     * // Map {
     * //   "a": Map { "x": 5, "y": 10 },
     * //   "b": Map { "x": 20, "y": 10 },
     * //   "c": Map { "z": 3 }
     * // }
     * ```

     * Note: `mergeDeepWith` can be used in `withMutations`.
     */
    mergeDeepWith(
      merger: (oldVal: V, newVal: V, key: K) => V,
      ...collections: Array<Collection<K, V> | {[key: string]: V}>
    ): this;


    // Deep persistent changes

    /**
     * Returns a new Map having set `value` at this `keyPath`. If any keys in
     * `keyPath` do not exist, a new immutable Map will be created at that key.
     *
     * ```js
     * const { Map } = require('immutable')
     * const originalMap = Map({
     *   subObject: Map({
     *     subKey: 'subvalue',
     *     subSubObject: Map({
     *       subSubKey: 'subSubValue'
     *     })
     *   })
     * })
     *
     * const newMap = originalMap.setIn(['subObject', 'subKey'], 'ha ha!')
     * // Map {
     * //   "subObject": Map {
     * //     "subKey": "ha ha!",
     * //     "subSubObject": Map { "subSubKey": "subSubValue" }
     * //   }
     * // }
     *
     * const newerMap = originalMap.setIn(
     *   ['subObject', 'subSubObject', 'subSubKey'],
     *   'ha ha ha!'
     * )
     * // Map {
     * //   "subObject": Map {
     * //     "subKey": "ha ha!",
     * //     "subSubObject": Map { "subSubKey": "ha ha ha!" }
     * //   }
     * // }
     * ```
     *
     * If any key in the path exists but does not have a `.set()` method
     * (such as Map and List), an error will be throw.
     *
     * Note: `setIn` can be used in `withMutations`.
     */
    setIn(keyPath: Iterable<any>, value: any): this;

    /**
     * Returns a new Map having removed the value at this `keyPath`. If any keys
     * in `keyPath` do not exist, no change will occur.
     *
     * Note: `deleteIn` can be used in `withMutations`.
     *
     * @alias removeIn
     */
    deleteIn(keyPath: Iterable<any>): this;
    removeIn(keyPath: Iterable<any>): this;

    /**
     * Returns a new Map having applied the `updater` to the entry found at the
     * keyPath.
     *
     * This is most commonly used to call methods on collections nested within a
     * structure of data. For example, in order to `.push()` onto a nested `List`,
     * `updateIn` and `push` can be used together:
     *
     * ```js
     * const { Map, List } = require('immutable')
     * const map = Map({ inMap: Map({ inList: List([ 1, 2, 3 ]) }) })
     * const newMap = map.updateIn(['inMap', 'inList'], list => list.push(4))
     * // Map { "inMap": Map { "inList": List [ 1, 2, 3, 4 ] } }
     * ```
     *
     * If any keys in `keyPath` do not exist, new Immutable `Map`s will
     * be created at those keys. If the `keyPath` does not already contain a
     * value, the `updater` function will be called with `notSetValue`, if
     * provided, otherwise `undefined`.
     *
     * ```js
     * const map = Map({ a: Map({ b: Map({ c: 10 }) }) })
     * const newMap = map.updateIn(['a', 'b', 'c'], val => val * 2)
     * // Map { "a": Map { "b": Map { "c": 20 } } }
     * ```
     *
     * If the `updater` function returns the same value it was called with, then
     * no change will occur. This is still true if `notSetValue` is provided.
     *
     * ```js
     * const map = Map({ a: Map({ b: Map({ c: 10 }) }) })
     * const newMap = map.updateIn(['a', 'b', 'x'], 100, val => val)
     * // Map { "a": Map { "b": Map { "c": 10 } } }
     * assert(newMap === map)
     * ```
     *
     * For code using ES2015 or later, using `notSetValue` is discourged in
     * favor of function parameter default values. This helps to avoid any
     * potential confusion with identify functions as described above.
     *
     * The previous example behaves differently when written with default values:
     *
     * ```js
     * const map = Map({ a: Map({ b: Map({ c: 10 }) }) })
     * const newMap = map.updateIn(['a', 'b', 'x'], (val = 100) => val)
     * // Map { "a": Map { "b": Map { "c": 10, "x": 100 } } }
     * ```
     *
     * If any key in the path exists but does not have a .set() method (such as
     * Map and List), an error will be thrown.
     */
    updateIn(keyPath: Iterable<any>, notSetValue: any, updater: (value: any) => any): this;
    updateIn(keyPath: Iterable<any>, updater: (value: any) => any): this;

    /**
     * A combination of `updateIn` and `merge`, returning a new Map, but
     * performing the merge at a point arrived at by following the keyPath.
     * In other words, these two lines are equivalent:
     *
     * ```js
     * map.updateIn(['a', 'b', 'c'], abc => abc.merge(y))
     * map.mergeIn(['a', 'b', 'c'], y)
     * ```
     *
     * Note: `mergeIn` can be used in `withMutations`.
     */
    mergeIn(keyPath: Iterable<any>, ...collections: Array<any>): this;

    /**
     * A combination of `updateIn` and `mergeDeep`, returning a new Map, but
     * performing the deep merge at a point arrived at by following the keyPath.
     * In other words, these two lines are equivalent:
     *
     * ```js
     * map.updateIn(['a', 'b', 'c'], abc => abc.mergeDeep(y))
     * map.mergeDeepIn(['a', 'b', 'c'], y)
     * ```
     *
     * Note: `mergeDeepIn` can be used in `withMutations`.
     */
    mergeDeepIn(keyPath: Iterable<any>, ...collections: Array<any>): this;

    // Transient changes

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
     * ```js
     * const { Map } = require('immutable')
     * const map1 = Map()
     * const map2 = map1.withMutations(map => {
     *   map.set('a', 1).set('b', 2).set('c', 3)
     * })
     * assert(map1.size === 0)
     * assert(map2.size === 3)
     * ```
     *
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Read the documentation for each method to see if it
     * is safe to use in `withMutations`.
     */
    withMutations(mutator: (mutable: this) => any): this;

    /**
     * Another way to avoid creation of intermediate Immutable maps is to create
     * a mutable copy of this collection. Mutable copies *always* return `this`,
     * and thus shouldn't be used for equality. Your function should never return
     * a mutable copy of a collection, only use it internally to create a new
     * collection. If possible, use `withMutations` as it provides an easier to
     * use API.
     *
     * Note: if the collection is already mutable, `asMutable` returns itself.
     *
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Read the documentation for each method to see if it
     * is safe to use in `withMutations`.
     */
    asMutable(): this;

    /**
     * The yin to `asMutable`'s yang. Because it applies to mutable collections,
     * this operation is *mutable* and returns itself. Once performed, the mutable
     * copy has become immutable and can be safely returned from a function.
     */
    asImmutable(): this;

    // Sequence algorithms

    /**
     * Returns a new Map with other collections concatenated to this one.
     */
    concat<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): Map<K | KC, V | VC>;
    concat<C>(...collections: Array<{[key: string]: C}>): Map<K | string, V | C>;

    /**
     * Returns a new Map with values passed through a
     * `mapper` function.
     *
     *     Map({ a: 1, b: 2 }).map(x => 10 * x)
     *     // Map { a: 10, b: 20 }
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: V, key: K, iter: this) => M,
      context?: any
    ): Map<K, M>;

    /**
     * @see Collection.Keyed.mapKeys
     */
    mapKeys<M>(
      mapper: (key: K, value: V, iter: this) => M,
      context?: any
    ): Map<M, V>;

    /**
     * @see Collection.Keyed.mapEntries
     */
    mapEntries<KM, VM>(
      mapper: (entry: [K, V], index: number, iter: this) => [KM, VM],
      context?: any
    ): Map<KM, VM>;

    /**
     * Flat-maps the Map, returning a new Map.
     *
     * Similar to `data.map(...).flatten(true)`.
     */
    flatMap<KM, VM>(
      mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
      context?: any
    ): Map<KM, VM>;

    /**
     * Returns a new Map with only the entries for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends V>(
      predicate: (value: V, key: K, iter: this) => value is F,
      context?: any
    ): Map<K, F>;
    filter(
      predicate: (value: V, key: K, iter: this) => any,
      context?: any
    ): this;
  }


  /**
   * A type of Map that has the additional guarantee that the iteration order of
   * entries will be the order in which they were set().
   *
   * The iteration behavior of OrderedMap is the same as native ES6 Map and
   * JavaScript Object.
   *
   * Note that `OrderedMap` are more expensive than non-ordered `Map` and may
   * consume more memory. `OrderedMap#set` is amortized O(log32 N), but not
   * stable.
   */

  export module OrderedMap {

    /**
     * True if the provided value is an OrderedMap.
     */
    function isOrderedMap(maybeOrderedMap: any): maybeOrderedMap is OrderedMap<any, any>;
  }

  /**
   * Creates a new Immutable OrderedMap.
   *
   * Created with the same key value pairs as the provided Collection.Keyed or
   * JavaScript Object or expects an Collection of [K, V] tuple entries.
   *
   * The iteration order of key-value pairs provided to this constructor will
   * be preserved in the OrderedMap.
   *
   *     let newOrderedMap = OrderedMap({key: "value"})
   *     let newOrderedMap = OrderedMap([["key", "value"]])
   *
   */
  export function OrderedMap<K, V>(collection: Iterable<[K, V]>): OrderedMap<K, V>;
  export function OrderedMap<T>(collection: Iterable<Iterable<T>>): OrderedMap<T, T>;
  export function OrderedMap<V>(obj: {[key: string]: V}): OrderedMap<string, V>;
  export function OrderedMap<K, V>(): OrderedMap<K, V>;
  export function OrderedMap(): OrderedMap<any, any>;

  export interface OrderedMap<K, V> extends Map<K, V> {

    // Sequence algorithms

    /**
     * Returns a new OrderedMap with other collections concatenated to this one.
     */
    concat<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): OrderedMap<K | KC, V | VC>;
    concat<C>(...collections: Array<{[key: string]: C}>): OrderedMap<K | string, V | C>;

    /**
     * Returns a new OrderedMap with values passed through a
     * `mapper` function.
     *
     *     OrderedMap({ a: 1, b: 2 }).map(x => 10 * x)
     *     // OrderedMap { "a": 10, "b": 20 }
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: V, key: K, iter: this) => M,
      context?: any
    ): OrderedMap<K, M>;

    /**
     * @see Collection.Keyed.mapKeys
     */
    mapKeys<M>(
      mapper: (key: K, value: V, iter: this) => M,
      context?: any
    ): OrderedMap<M, V>;

    /**
     * @see Collection.Keyed.mapEntries
     */
    mapEntries<KM, VM>(
      mapper: (entry: [K, V], index: number, iter: this) => [KM, VM],
      context?: any
    ): OrderedMap<KM, VM>;

    /**
     * Flat-maps the OrderedMap, returning a new OrderedMap.
     *
     * Similar to `data.map(...).flatten(true)`.
     */
    flatMap<KM, VM>(
      mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
      context?: any
    ): OrderedMap<KM, VM>;

    /**
     * Returns a new OrderedMap with only the entries for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends V>(
      predicate: (value: V, key: K, iter: this) => value is F,
      context?: any
    ): OrderedMap<K, F>;
    filter(
      predicate: (value: V, key: K, iter: this) => any,
      context?: any
    ): this;
  }


  /**
   * A Collection of unique values with `O(log32 N)` adds and has.
   *
   * When iterating a Set, the entries will be (value, value) pairs. Iteration
   * order of a Set is undefined, however is stable. Multiple iterations of the
   * same Set will iterate in the same order.
   *
   * Set values, like Map keys, may be of any type. Equality is determined using
   * `Immutable.is`, enabling Sets to uniquely include other Immutable
   * collections, custom value types, and NaN.
   */
  export module Set {

    /**
     * True if the provided value is a Set
     */
    function isSet(maybeSet: any): maybeSet is Set<any>;

    /**
     * Creates a new Set containing `values`.
     */
    function of<T>(...values: Array<T>): Set<T>;

    /**
     * `Set.fromKeys()` creates a new immutable Set containing the keys from
     * this Collection or JavaScript Object.
     */
    function fromKeys<T>(iter: Collection<T, any>): Set<T>;
    function fromKeys(obj: {[key: string]: any}): Set<string>;

    /**
     * `Set.intersect()` creates a new immutable Set that is the intersection of
     * a collection of other sets.
     *
     * ```js
     * const { Set } = require('immutable')
     * const intersected = Set.intersect([
     *   Set([ 'a', 'b', 'c' ])
     *   Set([ 'c', 'a', 't' ])
     * ])
     * // Set [ "a", "c"" ]
     * ```
     */
    function intersect<T>(sets: Iterable<Iterable<T>>): Set<T>;

    /**
     * `Set.union()` creates a new immutable Set that is the union of a
     * collection of other sets.
     *
     * ```js
     * * const { Set } = require('immutable')
     * const unioned = Set.union([
     *   Set([ 'a', 'b', 'c' ])
     *   Set([ 'c', 'a', 't' ])
     * ])
     * // Set [ "a", "b", "c", "t"" ]
     * ```
     */
    function union<T>(sets: Iterable<Iterable<T>>): Set<T>;
  }

  /**
   * Create a new immutable Set containing the values of the provided
   * collection-like.
   */
  export function Set(): Set<any>;
  export function Set<T>(): Set<T>;
  export function Set<T>(collection: Iterable<T>): Set<T>;

  export interface Set<T> extends Collection.Set<T> {

    // Persistent changes

    /**
     * Returns a new Set which also includes this value.
     *
     * Note: `add` can be used in `withMutations`.
     */
    add(value: T): this;

    /**
     * Returns a new Set which excludes this value.
     *
     * Note: `delete` can be used in `withMutations`.
     *
     * Note: `delete` **cannot** be safely used in IE8, use `remove` if
     * supporting old browsers.
     *
     * @alias remove
     */
    delete(value: T): this;
    remove(value: T): this;

    /**
     * Returns a new Set containing no values.
     *
     * Note: `clear` can be used in `withMutations`.
     */
    clear(): this;

    /**
     * Returns a Set including any value from `collections` that does not already
     * exist in this Set.
     *
     * Note: `union` can be used in `withMutations`.
     * @alias merge
     */
    union(...collections: Array<Collection<any, T> | Array<T>>): this;
    merge(...collections: Array<Collection<any, T> | Array<T>>): this;

    /**
     * Returns a Set which has removed any values not also contained
     * within `collections`.
     *
     * Note: `intersect` can be used in `withMutations`.
     */
    intersect(...collections: Array<Collection<any, T> | Array<T>>): this;

    /**
     * Returns a Set excluding any values contained within `collections`.
     *
     * Note: `subtract` can be used in `withMutations`.
     */
    subtract(...collections: Array<Collection<any, T> | Array<T>>): this;


    // Transient changes

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * mentions being safe to use in `withMutations`.
     *
     * @see `Map#withMutations`
     */
    withMutations(mutator: (mutable: this) => any): this;

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * mentions being safe to use in `withMutations`.
     *
     * @see `Map#asMutable`
     */
    asMutable(): this;

    /**
     * @see `Map#asImmutable`
     */
    asImmutable(): this;

    // Sequence algorithms

    /**
     * Returns a new Set with other collections concatenated to this one.
     */
    concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): Set<T | C>;

    /**
     * Returns a new Set with values passed through a
     * `mapper` function.
     *
     *     Set([1,2]).map(x => 10 * x)
     *     // Set [10,20]
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: T, key: T, iter: this) => M,
      context?: any
    ): Set<M>;

    /**
     * Flat-maps the Set, returning a new Set.
     *
     * Similar to `set.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: T, key: T, iter: this) => Iterable<M>,
      context?: any
    ): Set<M>;

    /**
     * Returns a new Set with only the values for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends T>(
      predicate: (value: T, key: T, iter: this) => value is F,
      context?: any
    ): Set<F>;
    filter(
      predicate: (value: T, key: T, iter: this) => any,
      context?: any
    ): this;
  }


  /**
   * A type of Set that has the additional guarantee that the iteration order of
   * values will be the order in which they were `add`ed.
   *
   * The iteration behavior of OrderedSet is the same as native ES6 Set.
   *
   * Note that `OrderedSet` are more expensive than non-ordered `Set` and may
   * consume more memory. `OrderedSet#add` is amortized O(log32 N), but not
   * stable.
   */
  export module OrderedSet {

    /**
     * True if the provided value is an OrderedSet.
     */
    function isOrderedSet(maybeOrderedSet: any): boolean;

    /**
     * Creates a new OrderedSet containing `values`.
     */
    function of<T>(...values: Array<T>): OrderedSet<T>;

    /**
     * `OrderedSet.fromKeys()` creates a new immutable OrderedSet containing
     * the keys from this Collection or JavaScript Object.
     */
    function fromKeys<T>(iter: Collection<T, any>): OrderedSet<T>;
    function fromKeys(obj: {[key: string]: any}): OrderedSet<string>;
  }

  /**
   * Create a new immutable OrderedSet containing the values of the provided
   * collection-like.
   */
  export function OrderedSet(): OrderedSet<any>;
  export function OrderedSet<T>(): OrderedSet<T>;
  export function OrderedSet<T>(collection: Iterable<T>): OrderedSet<T>;

  export interface OrderedSet<T> extends Set<T> {

    // Sequence algorithms

    /**
     * Returns a new OrderedSet with other collections concatenated to this one.
     */
    concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): OrderedSet<T | C>;

    /**
     * Returns a new Set with values passed through a
     * `mapper` function.
     *
     *     OrderedSet([ 1, 2 ]).map(x => 10 * x)
     *     // OrderedSet [10, 20]
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: T, key: T, iter: this) => M,
      context?: any
    ): OrderedSet<M>;

    /**
     * Flat-maps the OrderedSet, returning a new OrderedSet.
     *
     * Similar to `set.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: T, key: T, iter: this) => Iterable<M>,
      context?: any
    ): OrderedSet<M>;

    /**
     * Returns a new OrderedSet with only the values for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends T>(
      predicate: (value: T, key: T, iter: this) => value is F,
      context?: any
    ): OrderedSet<F>;
    filter(
      predicate: (value: T, key: T, iter: this) => any,
      context?: any
    ): this;

    /**
     * Returns an OrderedSet of the same type "zipped" with the provided
     * collections.
     *
     * @see IndexedIterator.zip
     *
     * Like `zipWith`, but using the default `zipper`: creating an `Array`.
     *
     * ```js
     * const a = OrderedSet([ 1, 2, 3 ])
     * const b = OrderedSet([ 4, 5, 6 ])
     * const c = a.zip(b)
     * // OrderedSet [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]
     * ```
     */
    zip(...collections: Array<Collection<any, any>>): OrderedSet<any>;

    /**
     * Returns an OrderedSet of the same type "zipped" with the provided
     * collections by using a custom `zipper` function.
     *
     * @see IndexedIterator.zipWith
     */
    zipWith<U, Z>(
      zipper: (value: T, otherValue: U) => Z,
      otherCollection: Collection<any, U>
    ): OrderedSet<Z>;
    zipWith<U, V, Z>(
      zipper: (value: T, otherValue: U, thirdValue: V) => Z,
      otherCollection: Collection<any, U>,
      thirdCollection: Collection<any, V>
    ): OrderedSet<Z>;
    zipWith<Z>(
      zipper: (...any: Array<any>) => Z,
      ...collections: Array<Collection<any, any>>
    ): OrderedSet<Z>;

  }


  /**
   * Stacks are indexed collections which support very efficient O(1) addition
   * and removal from the front using `unshift(v)` and `shift()`.
   *
   * For familiarity, Stack also provides `push(v)`, `pop()`, and `peek()`, but
   * be aware that they also operate on the front of the list, unlike List or
   * a JavaScript Array.
   *
   * Note: `reverse()` or any inherent reverse traversal (`reduceRight`,
   * `lastIndexOf`, etc.) is not efficient with a Stack.
   *
   * Stack is implemented with a Single-Linked List.
   */
  export module Stack {

    /**
     * True if the provided value is a Stack
     */
    function isStack(maybeStack: any): maybeStack is Stack<any>;

    /**
     * Creates a new Stack containing `values`.
     */
    function of<T>(...values: Array<T>): Stack<T>;
  }

  /**
   * Create a new immutable Stack containing the values of the provided
   * collection-like.
   *
   * The iteration order of the provided collection is preserved in the
   * resulting `Stack`.
   */
  export function Stack(): Stack<any>;
  export function Stack<T>(): Stack<T>;
  export function Stack<T>(collection: Iterable<T>): Stack<T>;

  export interface Stack<T> extends Collection.Indexed<T> {

    // Reading values

    /**
     * Alias for `Stack.first()`.
     */
    peek(): T | undefined;


    // Persistent changes

    /**
     * Returns a new Stack with 0 size and no values.
     *
     * Note: `clear` can be used in `withMutations`.
     */
    clear(): Stack<T>;

    /**
     * Returns a new Stack with the provided `values` prepended, shifting other
     * values ahead to higher indices.
     *
     * This is very efficient for Stack.
     *
     * Note: `unshift` can be used in `withMutations`.
     */
    unshift(...values: Array<T>): Stack<T>;

    /**
     * Like `Stack#unshift`, but accepts a collection rather than varargs.
     *
     * Note: `unshiftAll` can be used in `withMutations`.
     */
    unshiftAll(iter: Iterable<T>): Stack<T>;

    /**
     * Returns a new Stack with a size ones less than this Stack, excluding
     * the first item in this Stack, shifting all other values to a lower index.
     *
     * Note: this differs from `Array#shift` because it returns a new
     * Stack rather than the removed value. Use `first()` or `peek()` to get the
     * first value in this Stack.
     *
     * Note: `shift` can be used in `withMutations`.
     */
    shift(): Stack<T>;

    /**
     * Alias for `Stack#unshift` and is not equivalent to `List#push`.
     */
    push(...values: Array<T>): Stack<T>;

    /**
     * Alias for `Stack#unshiftAll`.
     */
    pushAll(iter: Iterable<T>): Stack<T>;

    /**
     * Alias for `Stack#shift` and is not equivalent to `List#pop`.
     */
    pop(): Stack<T>;


    // Transient changes

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * mentions being safe to use in `withMutations`.
     *
     * @see `Map#withMutations`
     */
    withMutations(mutator: (mutable: this) => any): this;

    /**
     * Note: Not all methods can be used on a mutable collection or within
     * `withMutations`! Check the documentation for each method to see if it
     * mentions being safe to use in `withMutations`.
     *
     * @see `Map#asMutable`
     */
    asMutable(): this;

    /**
     * @see `Map#asImmutable`
     */
    asImmutable(): this;

    // Sequence algorithms

    /**
     * Returns a new Stack with other collections concatenated to this one.
     */
    concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): Stack<T | C>;

    /**
     * Returns a new Stack with values passed through a
     * `mapper` function.
     *
     *     Stack([ 1, 2 ]).map(x => 10 * x)
     *     // Stack [ 10, 20 ]
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: T, key: number, iter: this) => M,
      context?: any
    ): Stack<M>;

    /**
     * Flat-maps the Stack, returning a new Stack.
     *
     * Similar to `stack.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: T, key: number, iter: this) => M,
      context?: any
    ): Stack<M>;

    /**
     * Returns a new Set with only the values for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends T>(
      predicate: (value: T, index: number, iter: this) => value is F,
      context?: any
    ): Set<F>;
    filter(
      predicate: (value: T, index: number, iter: this) => any,
      context?: any
    ): this;
  }


  /**
   * Returns a Seq.Indexed of numbers from `start` (inclusive) to `end`
   * (exclusive), by `step`, where `start` defaults to 0, `step` to 1, and `end` to
   * infinity. When `start` is equal to `end`, returns empty range.
   *
   * ```js
   * const { Range } = require('immutable')
   * Range() // [ 0, 1, 2, 3, ... ]
   * Range(10) // [ 10, 11, 12, 13, ... ]
   * Range(10, 15) // [ 10, 11, 12, 13, 14 ]
   * Range(10, 30, 5) // [ 10, 15, 20, 25 ]
   * Range(30, 10, 5) // [ 30, 25, 20, 15 ]
   * Range(30, 30, 5) // []
   * ```
   */
  export function Range(start?: number, end?: number, step?: number): Seq.Indexed<number>;


  /**
   * Returns a Seq.Indexed of `value` repeated `times` times. When `times` is
   * not defined, returns an infinite `Seq` of `value`.
   *
   * ```js
   * const { Repeat } = require('immutable')
   * Repeat('foo') // [ 'foo', 'foo', 'foo', ... ]
   * Repeat('bar', 4) // [ 'bar', 'bar', 'bar', 'bar' ]
   * ```
   */
  export function Repeat<T>(value: T, times?: number): Seq.Indexed<T>;


  /**
   * Creates a new Class which produces Record instances. A record is similar to
   * a JS object, but enforce a specific set of allowed string keys, and have
   * default values.
   *
   * ```js
   * const { Record } = require('immutable')
   * const ABRecord = Record({ a: 1, b: 2 })
   * const myRecord = new ABRecord({ b: 3 })
   * ```
   *
   * Records always have a value for the keys they define. `remove`ing a key
   * from a record simply resets it to the default value for that key.
   *
   * ```js
   * myRecord.size // 2
   * myRecord.get('a') // 1
   * myRecord.get('b') // 3
   * const myRecordWithoutB = myRecord.remove('b')
   * myRecordWithoutB.get('b') // 2
   * myRecordWithoutB.size // 2
   * ```
   *
   * Values provided to the constructor not found in the Record type will
   * be ignored. For example, in this case, ABRecord is provided a key "x" even
   * though only "a" and "b" have been defined. The value for "x" will be
   * ignored for this record.
   *
   * ```js
   * const myRecord = new ABRecord({ b: 3, x: 10 })
   * myRecord.get('x') // undefined
   * ```
   *
   * Because Records have a known set of string keys, property get access works
   * as expected, however property sets will throw an Error.
   *
   * Note: IE8 does not support property access. Only use `get()` when
   * supporting IE8.
   *
   * ```js
   * myRecord.b // 3
   * myRecord.b = 5 // throws Error
   * ```
   *
   * Record Classes can be extended as well, allowing for custom methods on your
   * Record. This is not a common pattern in functional environments, but is in
   * many JS programs.
   *
   * ```
   * class ABRecord extends Record({ a: 1, b: 2 }) {
   *   getAB() {
   *     return this.a + this.b;
   *   }
   * }
   *
   * var myRecord = new ABRecord({b: 3})
   * myRecord.getAB() // 4
   * ```
   */
  export module Record {

    /**
     * True if `maybeRecord` is an instance of a Record.
     */
    export function isRecord(maybeRecord: any): maybeRecord is Record.Instance<any>;

    /**
     * Records allow passing a second parameter to supply a descriptive name
     * that appears when converting a Record to a string or in any error
     * messages. A descriptive name for any record can be accessed by using this
     * method. If one was not provided, the string "Record" is returned.
     *
     * ```js
     * const { Record } = require('immutable')
     * const Person = Record({
     *   name: null
     * }, 'Person')
     *
     * var me = Person({ name: 'My Name' })
     * me.toString() // "Person { "name": "My Name" }"
     * Record.getDescriptiveName(me) // "Person"
     * ```
     */
    export function getDescriptiveName(record: Instance<any>): string;

    export interface Class<T extends Object> {
      (values?: Partial<T> | Iterable<[string, any]>): Instance<T> & Readonly<T>;
      new (values?: Partial<T> | Iterable<[string, any]>): Instance<T> & Readonly<T>;
    }

    export interface Instance<T extends Object> {
      readonly size: number;

      // Reading values

      has(key: string): boolean;
      get<K extends keyof T>(key: K): T[K];

      // Reading deep values

      hasIn(keyPath: Iterable<any>): boolean;
      getIn(keyPath: Iterable<any>): any;

      // Value equality

      equals(other: any): boolean;
      hashCode(): number;

      // Persistent changes

      set<K extends keyof T>(key: K, value: T[K]): this;
      update<K extends keyof T>(key: K, updater: (value: T[K]) => T[K]): this;
      merge(...collections: Array<Partial<T> | Iterable<[string, any]>>): this;
      mergeDeep(...collections: Array<Partial<T> | Iterable<[string, any]>>): this;

      mergeWith(
        merger: (oldVal: any, newVal: any, key: keyof T) => any,
        ...collections: Array<Partial<T> | Iterable<[string, any]>>
      ): this;
      mergeDeepWith(
        merger: (oldVal: any, newVal: any, key: any) => any,
        ...collections: Array<Partial<T> | Iterable<[string, any]>>
      ): this;

      /**
       * Returns a new instance of this Record type with the value for the
       * specific key set to its default value.
       *
       * @alias remove
       */
      delete<K extends keyof T>(key: K): this;
      remove<K extends keyof T>(key: K): this;

      /**
       * Returns a new instance of this Record type with all values set
       * to their default values.
       */
      clear(): this;

      // Deep persistent changes

      setIn(keyPath: Iterable<any>, value: any): this;
      updateIn(keyPath: Iterable<any>, updater: (value: any) => any): this;
      mergeIn(keyPath: Iterable<any>, ...collections: Array<any>): this;
      mergeDeepIn(keyPath: Iterable<any>, ...collections: Array<any>): this;

      /**
       * @alias removeIn
       */
      deleteIn(keyPath: Iterable<any>): this;
      removeIn(keyPath: Iterable<any>): this;

      // Conversion to JavaScript types

      /**
       * Deeply converts this Record to equivalent native JavaScript Object.
       */
      toJS(): { [K in keyof T]: any };

      /**
       * Shallowly converts this Record to equivalent native JavaScript Object.
       */
      toJSON(): T;

      /**
       * Shallowly converts this Record to equivalent JavaScript Object.
       */
      toObject(): T;

      // Transient changes

      /**
       * Note: Not all methods can be used on a mutable collection or within
       * `withMutations`! Only `set` may be used mutatively.
       *
       * @see `Map#withMutations`
       */
      withMutations(mutator: (mutable: this) => any): this;

      /**
       * @see `Map#asMutable`
       */
      asMutable(): this;

      /**
       * @see `Map#asImmutable`
       */
      asImmutable(): this;

      // Sequence algorithms

      toSeq(): Seq.Keyed<keyof T, T[keyof T]>;

      [Symbol.iterator](): IterableIterator<[keyof T, T[keyof T]]>;
    }
  }

  export function Record<T>(defaultValues: T, name?: string): Record.Class<T>;


  /**
   * Represents a sequence of values, but may not be backed by a concrete data
   * structure.
   *
   * **Seq is immutable** — Once a Seq is created, it cannot be
   * changed, appended to, rearranged or otherwise modified. Instead, any
   * mutative method called on a `Seq` will return a new `Seq`.
   *
   * **Seq is lazy** — Seq does as little work as necessary to respond to any
   * method call. Values are often created during iteration, including implicit
   * iteration when reducing or converting to a concrete data structure such as
   * a `List` or JavaScript `Array`.
   *
   * For example, the following performs no work, because the resulting
   * Seq's values are never iterated:
   *
   * ```js
   * const { Seq } = require('immutable')
   * const oddSquares = Seq([ 1, 2, 3, 4, 5, 6, 7, 8 ])
   *   .filter(x => x % 2 !== 0)
   *   .map(x => x * x)
   * ```
   *
   * Once the Seq is used, it performs only the work necessary. In this
   * example, no intermediate data structures are ever created, filter is only
   * called three times, and map is only called once:
   *
   * ```
   * oddSquares.get(1)); // 9
   * ```
   *
   * Seq allows for the efficient chaining of operations,
   * allowing for the expression of logic that can otherwise be very tedious:
   *
   * ```
   * Seq({ a: 1, b: 1, c: 1})
   *   .flip()
   *   .map(key => key.toUpperCase())
   *   .flip()
   * // Seq { A: 1, B: 1, C: 1 }
   * ```
   *
   * As well as expressing logic that would otherwise be memory or time limited:
   *
   * ```js
   * const { Range } = require('immutable')
   * Range(1, Infinity)
   *   .skip(1000)
   *   .map(n => -n)
   *   .filter(n => n % 2 === 0)
   *   .take(2)
   *   .reduce((r, n) => r * n, 1)
   * // 1006008
   * ```
   *
   * Seq is often used to provide a rich collection API to JavaScript Object.
   *
   * ```js
   * Seq({ x: 0, y: 1, z: 2 }).map(v => v * 2).toObject();
   * // { x: 0, y: 2, z: 4 }
   * ```
   */

  export module Seq {
    /**
     * True if `maybeSeq` is a Seq, it is not backed by a concrete
     * structure such as Map, List, or Set.
     */
    function isSeq(maybeSeq: any): maybeSeq is Seq.Indexed<any> | Seq.Keyed<any, any>;

    /**
     * Returns a Seq of the values provided. Alias for `Seq.Indexed.of()`.
     */
    function of<T>(...values: Array<T>): Seq.Indexed<T>;


    /**
     * `Seq` which represents key-value pairs.
     */
    export module Keyed {}

    /**
     * Always returns a Seq.Keyed, if input is not keyed, expects an
     * collection of [K, V] tuples.
     */
    export function Keyed<K, V>(collection: Iterable<[K, V]>): Seq.Keyed<K, V>;
    export function Keyed<V>(obj: {[key: string]: V}): Seq.Keyed<string, V>;
    export function Keyed<K, V>(): Seq.Keyed<K, V>;
    export function Keyed(): Seq.Keyed<any, any>;

    export interface Keyed<K, V> extends Seq<K, V>, Collection.Keyed<K, V> {
      /**
       * Deeply converts this Keyed Seq to equivalent native JavaScript Object.
       *
       * Converts keys to Strings.
       */
      toJS(): Object;

      /**
       * Shallowly converts this Keyed Seq to equivalent native JavaScript Object.
       *
       * Converts keys to Strings.
       */
      toJSON(): { [key: string]: V };

      /**
       * Returns itself
       */
      toSeq(): this;

      /**
       * Returns a new Seq with other collections concatenated to this one.
       *
       * All entries will be present in the resulting Seq, even if they
       * have the same key.
       */
      concat<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): Seq.Keyed<K | KC, V | VC>;
      concat<C>(...collections: Array<{[key: string]: C}>): Seq.Keyed<K | string, V | C>;

      /**
       * Returns a new Seq.Keyed with values passed through a
       * `mapper` function.
       *
       * ```js
       * const { Seq } = require('immutable')
       * Seq.Keyed({ a: 1, b: 2 }).map(x => 10 * x)
       * // Seq { "a": 10, "b": 20 }
       * ```
       *
       * Note: `map()` always returns a new instance, even if it produced the
       * same value at every step.
       */
      map<M>(
        mapper: (value: V, key: K, iter: this) => M,
        context?: any
      ): Seq.Keyed<K, M>;

      /**
       * @see Collection.Keyed.mapKeys
       */
      mapKeys<M>(
        mapper: (key: K, value: V, iter: this) => M,
        context?: any
      ): Seq.Keyed<M, V>;

      /**
       * @see Collection.Keyed.mapEntries
       */
      mapEntries<KM, VM>(
        mapper: (entry: [K, V], index: number, iter: this) => [KM, VM],
        context?: any
      ): Seq.Keyed<KM, VM>;

      /**
       * Flat-maps the Seq, returning a Seq of the same type.
       *
       * Similar to `seq.map(...).flatten(true)`.
       */
      flatMap<KM, VM>(
        mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
        context?: any
      ): Seq.Keyed<KM, VM>;

      /**
       * Returns a new Seq with only the entries for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends V>(
        predicate: (value: V, key: K, iter: this) => value is F,
        context?: any
      ): Seq.Keyed<K, F>;
      filter(
        predicate: (value: V, key: K, iter: this) => any,
        context?: any
      ): this;
    }


    /**
     * `Seq` which represents an ordered indexed list of values.
     */
    module Indexed {

      /**
       * Provides an Seq.Indexed of the values provided.
       */
      function of<T>(...values: Array<T>): Seq.Indexed<T>;
    }

    /**
     * Always returns Seq.Indexed, discarding associated keys and
     * supplying incrementing indices.
     */
    export function Indexed(): Seq.Indexed<any>;
    export function Indexed<T>(): Seq.Indexed<T>;
    export function Indexed<T>(collection: Iterable<T>): Seq.Indexed<T>;

    export interface Indexed<T> extends Seq<number, T>, Collection.Indexed<T> {
      /**
       * Deeply converts this Indexed Seq to equivalent native JavaScript Array.
       */
      toJS(): Array<any>;

      /**
       * Shallowly converts this Indexed Seq to equivalent native JavaScript Array.
       */
      toJSON(): Array<T>;

      /**
       * Returns itself
       */
      toSeq(): this

      /**
       * Returns a new Seq with other collections concatenated to this one.
       */
      concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): Seq.Indexed<T | C>;

      /**
       * Returns a new Seq.Indexed with values passed through a
       * `mapper` function.
       *
       * ```js
       * const { Seq } = require('immutable')
       * Seq.Indexed([ 1, 2 ]).map(x => 10 * x)
       * // Seq [ 10, 20 ]
       * ```
       *
       * Note: `map()` always returns a new instance, even if it produced the
       * same value at every step.
       */
      map<M>(
        mapper: (value: T, key: number, iter: this) => M,
        context?: any
      ): Seq.Indexed<M>;

      /**
       * Flat-maps the Seq, returning a a Seq of the same type.
       *
       * Similar to `seq.map(...).flatten(true)`.
       */
      flatMap<M>(
        mapper: (value: T, key: number, iter: this) => Iterable<M>,
        context?: any
      ): Seq.Indexed<M>;

      /**
       * Returns a new Seq with only the values for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends T>(
        predicate: (value: T, index: number, iter: this) => value is F,
        context?: any
      ): Seq.Indexed<F>;
      filter(
        predicate: (value: T, index: number, iter: this) => any,
        context?: any
      ): this;
    }


    /**
     * `Seq` which represents a set of values.
     *
     * Because `Seq` are often lazy, `Seq.Set` does not provide the same guarantee
     * of value uniqueness as the concrete `Set`.
     */
    export module Set {

      /**
       * Returns a Seq.Set of the provided values
       */
      function of<T>(...values: Array<T>): Seq.Set<T>;
    }

    /**
     * Always returns a Seq.Set, discarding associated indices or keys.
     */
    export function Set(): Seq.Set<any>;
    export function Set<T>(): Seq.Set<T>;
    export function Set<T>(collection: Iterable<T>): Seq.Set<T>;

    export interface Set<T> extends Seq<T, T>, Collection.Set<T> {
      /**
       * Deeply converts this Set Seq to equivalent native JavaScript Array.
       */
      toJS(): Array<any>;

      /**
       * Shallowly converts this Set Seq to equivalent native JavaScript Array.
       */
      toJSON(): Array<T>;

      /**
       * Returns itself
       */
      toSeq(): this

      /**
       * Returns a new Seq with other collections concatenated to this one.
       *
       * All entries will be present in the resulting Seq, even if they
       * are duplicates.
       */
      concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): Seq.Set<T | C>;

      /**
       * Returns a new Seq.Set with values passed through a
       * `mapper` function.
       *
       * ```js
       * Seq.Set([ 1, 2 ]).map(x => 10 * x)
       * // Seq { 10, 20 }
       * ```
       *
       * Note: `map()` always returns a new instance, even if it produced the
       * same value at every step.
       */
      map<M>(
        mapper: (value: T, key: T, iter: this) => M,
        context?: any
      ): Seq.Set<M>;

      /**
       * Flat-maps the Seq, returning a Seq of the same type.
       *
       * Similar to `seq.map(...).flatten(true)`.
       */
      flatMap<M>(
        mapper: (value: T, key: T, iter: this) => Iterable<M>,
        context?: any
      ): Seq.Set<M>;

      /**
       * Returns a new Seq with only the values for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends T>(
        predicate: (value: T, key: T, iter: this) => value is F,
        context?: any
      ): Seq.Set<F>;
      filter(
        predicate: (value: T, key: T, iter: this) => any,
        context?: any
      ): this;
    }

  }

  /**
   * Creates a Seq.
   *
   * Returns a particular kind of `Seq` based on the input.
   *
   *   * If a `Seq`, that same `Seq`.
   *   * If an `Collection`, a `Seq` of the same kind (Keyed, Indexed, or Set).
   *   * If an Array-like, an `Seq.Indexed`.
   *   * If an Object with an Iterator, an `Seq.Indexed`.
   *   * If an Iterator, an `Seq.Indexed`.
   *   * If an Object, a `Seq.Keyed`.
   *
   */
  export function Seq<S extends Seq<any, any>>(seq: S): S;
  export function Seq<K, V>(collection: Collection.Keyed<K, V>): Seq.Keyed<K, V>;
  export function Seq<T>(collection: Collection.Indexed<T>): Seq.Indexed<T>;
  export function Seq<T>(collection: Collection.Set<T>): Seq.Set<T>;
  export function Seq<T>(collection: Iterable<T>): Seq.Indexed<T>;
  export function Seq<V>(obj: {[key: string]: V}): Seq.Keyed<string, V>;
  export function Seq(): Seq<any, any>;

  export interface Seq<K, V> extends Collection<K, V> {

    /**
     * Some Seqs can describe their size lazily. When this is the case,
     * size will be an integer. Otherwise it will be undefined.
     *
     * For example, Seqs returned from `map()` or `reverse()`
     * preserve the size of the original `Seq` while `filter()` does not.
     *
     * Note: `Range`, `Repeat` and `Seq`s made from `Array`s and `Object`s will
     * always have a size.
     */
    readonly size: number | undefined;


    // Force evaluation

    /**
     * Because Sequences are lazy and designed to be chained together, they do
     * not cache their results. For example, this map function is called a total
     * of 6 times, as each `join` iterates the Seq of three values.
     *
     *     var squares = Seq([ 1, 2, 3 ]).map(x => x * x)
     *     squares.join() + squares.join()
     *
     * If you know a `Seq` will be used multiple times, it may be more
     * efficient to first cache it in memory. Here, the map function is called
     * only 3 times.
     *
     *     var squares = Seq([ 1, 2, 3 ]).map(x => x * x).cacheResult()
     *     squares.join() + squares.join()
     *
     * Use this method judiciously, as it must fully evaluate a Seq which can be
     * a burden on memory and possibly performance.
     *
     * Note: after calling `cacheResult`, a Seq will always have a `size`.
     */
    cacheResult(): this;

    // Sequence algorithms

    /**
     * Returns a new Seq with values passed through a
     * `mapper` function.
     *
     * ```js
     * const { Seq } = require('immutable')
     * Seq([ 1, 2 ]).map(x => 10 * x)
     * // Seq [ 10, 20 ]
     * ```
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: V, key: K, iter: this) => M,
      context?: any
    ): Seq<K, M>;

    /**
     * Flat-maps the Seq, returning a Seq of the same type.
     *
     * Similar to `seq.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: V, key: K, iter: this) => Iterable<M>,
      context?: any
    ): Seq<K, M>;

    /**
     * Returns a new Seq with only the values for which the `predicate`
     * function returns true.
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends V>(
      predicate: (value: V, key: K, iter: this) => value is F,
      context?: any
    ): Seq<K, F>;
    filter(
      predicate: (value: V, key: K, iter: this) => any,
      context?: any
    ): this;
  }

  /**
   * The `Collection` is a set of (key, value) entries which can be iterated, and
   * is the base class for all collections in `immutable`, allowing them to
   * make use of all the Collection methods (such as `map` and `filter`).
   *
   * Note: An collection is always iterated in the same order, however that order
   * may not always be well defined, as is the case for the `Map` and `Set`.
   *
   * Collection is the abstract base class for concrete data structures. It
   * cannot be constructed directly.
   *
   * Implementations should extend one of the subclasses, `Collection.Keyed`,
   * `Collection.Indexed`, or `Collection.Set`.
   */
  export module Collection {

    /**
     * @deprecated use `const { isKeyed } = require('immutable')`
     */
    function isKeyed(maybeKeyed: any): maybeKeyed is Collection.Keyed<any, any>;

    /**
     * @deprecated use `const { isIndexed } = require('immutable')`
     */
    function isIndexed(maybeIndexed: any): maybeIndexed is Collection.Indexed<any>;

    /**
     * @deprecated use `const { isAssociative } = require('immutable')`
     */
    function isAssociative(maybeAssociative: any): maybeAssociative is Collection.Keyed<any, any> | Collection.Indexed<any>;

    /**
     * @deprecated use `const { isOrdered } = require('immutable')`
     */
    function isOrdered(maybeOrdered: any): boolean;


    /**
     * Keyed Collections have discrete keys tied to each value.
     *
     * When iterating `Collection.Keyed`, each iteration will yield a `[K, V]`
     * tuple, in other words, `Collection#entries` is the default iterator for
     * Keyed Collections.
     */
    export module Keyed {}

    /**
     * Creates an Collection.Keyed
     *
     * Similar to `Collection()`, however it expects collection-likes of [K, V]
     * tuples if not constructed from a Collection.Keyed or JS Object.
     */
    export function Keyed<K, V>(collection: Iterable<[K, V]>): Collection.Keyed<K, V>;
    export function Keyed<V>(obj: {[key: string]: V}): Collection.Keyed<string, V>;

    export interface Keyed<K, V> extends Collection<K, V> {
      /**
       * Deeply converts this Keyed collection to equivalent native JavaScript Object.
       *
       * Converts keys to Strings.
       */
      toJS(): Object;

      /**
       * Shallowly converts this Keyed collection to equivalent native JavaScript Object.
       *
       * Converts keys to Strings.
       */
      toJSON(): { [key: string]: V };

      /**
       * Returns Seq.Keyed.
       * @override
       */
      toSeq(): Seq.Keyed<K, V>;


      // Sequence functions

      /**
       * Returns a new Collection.Keyed of the same type where the keys and values
       * have been flipped.
       *
       * ```js
       * const { Map } = require('immutable')
       * Map({ a: 'z', b: 'y' }).flip()
       * // Map { "z": "a", "y": "b" }
       * ```
       */
      flip(): this;

      /**
       * Returns a new Collection with other collections concatenated to this one.
       */
      concat<KC, VC>(...collections: Array<Iterable<[KC, VC]>>): Collection.Keyed<K | KC, V | VC>;
      concat<C>(...collections: Array<{[key: string]: C}>): Collection.Keyed<K | string, V | C>;

      /**
       * Returns a new Collection.Keyed with values passed through a
       * `mapper` function.
       *
       * ```js
       * const { Collection } = require('immutable')
       * Collection.Keyed({ a: 1, b: 2 }).map(x => 10 * x)
       * // Seq { "a": 10, "b": 20 }
       * ```
       *
       * Note: `map()` always returns a new instance, even if it produced the
       * same value at every step.
       */
      map<M>(
        mapper: (value: V, key: K, iter: this) => M,
        context?: any
      ): Collection.Keyed<K, M>;

      /**
       * Returns a new Collection.Keyed of the same type with keys passed through
       * a `mapper` function.
       *
       * ```js
       * const { Map } = require('immutable')
       * Map({ a: 1, b: 2 }).mapKeys(x => x.toUpperCase())
       * // Map { "A": 1, "B": 2 }
       * ```
       *
       * Note: `mapKeys()` always returns a new instance, even if it produced
       * the same key at every step.
       */
      mapKeys<M>(
        mapper: (key: K, value: V, iter: this) => M,
        context?: any
      ): Collection.Keyed<M, V>;

      /**
       * Returns a new Collection.Keyed of the same type with entries
       * ([key, value] tuples) passed through a `mapper` function.
       *
       * ```js
       * const { Map } = require('immutable')
       * Map({ a: 1, b: 2 })
       *   .mapEntries(([ k, v ]) => [ k.toUpperCase(), v * 2 ])
       * // Map { "A": 2, "B": 4 }
       * ```
       *
       * Note: `mapEntries()` always returns a new instance, even if it produced
       * the same entry at every step.
       */
      mapEntries<KM, VM>(
        mapper: (entry: [K, V], index: number, iter: this) => [KM, VM],
        context?: any
      ): Collection.Keyed<KM, VM>;

      /**
       * Flat-maps the Collection, returning an Collection of the same type.
       *
       * Similar to `collection.map(...).flatten(true)`.
       */
      flatMap<KM, VM>(
        mapper: (value: V, key: K, iter: this) => Iterable<[KM, VM]>,
        context?: any
      ): Collection.Keyed<KM, VM>;

      /**
       * Returns a new Collection with only the values for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends V>(
        predicate: (value: V, key: K, iter: this) => value is F,
        context?: any
      ): Collection.Keyed<K, F>;
      filter(
        predicate: (value: V, key: K, iter: this) => any,
        context?: any
      ): this;

      [Symbol.iterator](): IterableIterator<[K, V]>;
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
    export module Indexed {}

    /**
     * Creates a new Collection.Indexed.
     */
    export function Indexed<T>(collection: Iterable<T>): Collection.Indexed<T>;

    export interface Indexed<T> extends Collection<number, T> {
      /**
       * Deeply converts this Indexed collection to equivalent native JavaScript Array.
       */
      toJS(): Array<any>;

      /**
       * Shallowly converts this Indexed collection to equivalent native JavaScript Array.
       */
      toJSON(): Array<T>;

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
      toSeq(): Seq.Indexed<T>;

      /**
       * If this is an collection of [key, value] entry tuples, it will return a
       * Seq.Keyed of those entries.
       */
      fromEntrySeq(): Seq.Keyed<any, any>;


      // Combination

      /**
       * Returns an Collection of the same type with `separator` between each item
       * in this Collection.
       */
      interpose(separator: T): this;

      /**
       * Returns an Collection of the same type with the provided `collections`
       * interleaved into this collection.
       *
       * The resulting Collection includes the first item from each, then the
       * second from each, etc.
       *
       * ```js
       * const { List } = require('immutable')
       * List([ 1, 2, 3 ]).interleave(List([ 'A', 'B', 'C' ]))
       * // List [ 1, "A", 2, "B", 3, "C"" ]
       * ```
       *
       * The shortest Collection stops interleave.
       *
       * ```js
       * List([ 1, 2, 3 ]).interleave(
       *   List([ 'A', 'B' ]),
       *   List([ 'X', 'Y', 'Z' ])
       * )
       * // List [ 1, "A", "X", 2, "B", "Y"" ]
       * ```
       */
      interleave(...collections: Array<Collection<any, T>>): this;

      /**
       * Splice returns a new indexed Collection by replacing a region of this
       * Collection with new values. If values are not provided, it only skips the
       * region to be removed.
       *
       * `index` may be a negative number, which indexes back from the end of the
       * Collection. `s.splice(-2)` splices after the second to last item.
       *
       * ```js
       * const { List } = require('immutable')
       * List([ 'a', 'b', 'c', 'd' ]).splice(1, 2, 'q', 'r', 's')
       * // List [ "a", "q", "r", "s", "d" ]
       * ```
       */
      splice(
        index: number,
        removeNum: number,
        ...values: Array<T>
      ): this;

      /**
       * Returns an Collection of the same type "zipped" with the provided
       * collections.
       *
       * Like `zipWith`, but using the default `zipper`: creating an `Array`.
       *
       * ```js
       * const a = List([ 1, 2, 3 ]);
       * const b = List([ 4, 5, 6 ]);
       * const c = a.zip(b); // List [ [ 1, 4 ], [ 2, 5 ], [ 3, 6 ] ]
       * ```
       */
      zip(...collections: Array<Collection<any, any>>): Collection.Indexed<any>;

      /**
       * Returns an Collection of the same type "zipped" with the provided
       * collections by using a custom `zipper` function.
       *
       * ```js
       * const a = List([ 1, 2, 3 ]);
       * const b = List([ 4, 5, 6 ]);
       * const c = a.zipWith((a, b) => a + b, b);
       * // List [ 5, 7, 9 ]
       * ```
       */
      zipWith<U, Z>(
        zipper: (value: T, otherValue: U) => Z,
        otherCollection: Collection<any, U>
      ): Collection.Indexed<Z>;
      zipWith<U, V, Z>(
        zipper: (value: T, otherValue: U, thirdValue: V) => Z,
        otherCollection: Collection<any, U>,
        thirdCollection: Collection<any, V>
      ): Collection.Indexed<Z>;
      zipWith<Z>(
        zipper: (...any: Array<any>) => Z,
        ...collections: Array<Collection<any, any>>
      ): Collection.Indexed<Z>;


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
        context?: any
      ): number;

      /**
       * Returns the last index in the Collection where a value satisfies the
       * provided predicate function. Otherwise -1 is returned.
       */
      findLastIndex(
        predicate: (value: T, index: number, iter: this) => boolean,
        context?: any
      ): number;

      // Sequence algorithms

      /**
       * Returns a new Collection with other collections concatenated to this one.
       */
      concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): Collection.Indexed<T | C>;

      /**
       * Returns a new Collection.Indexed with values passed through a
       * `mapper` function.
       *
       * ```js
       * const { Collection } = require('immutable')
       * Collection.Indexed([1,2]).map(x => 10 * x)
       * // Seq [ 1, 2 ]
       * ```
       *
       * Note: `map()` always returns a new instance, even if it produced the
       * same value at every step.
       */
      map<M>(
        mapper: (value: T, key: number, iter: this) => M,
        context?: any
      ): Collection.Indexed<M>;

      /**
       * Flat-maps the Collection, returning an Collection of the same type.
       *
       * Similar to `collection.map(...).flatten(true)`.
       */
      flatMap<M>(
        mapper: (value: T, key: number, iter: this) => Iterable<M>,
        context?: any
      ): Collection.Indexed<M>;

      /**
       * Returns a new Collection with only the values for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends T>(
        predicate: (value: T, index: number, iter: this) => value is F,
        context?: any
      ): Collection.Indexed<F>;
      filter(
        predicate: (value: T, index: number, iter: this) => any,
        context?: any
      ): this;

      [Symbol.iterator](): IterableIterator<T>;
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
     * const { Collection } = require('immutable')
     * const seq = Collection.Set([ 'A', 'B', 'C' ])
     * // Seq { "A", "B", "C" }
     * seq.forEach((v, k) =>
     *  assert.equal(v, k)
     * )
     * ```
     */
    export module Set {}

    /**
     * Similar to `Collection()`, but always returns a Collection.Set.
     */
    export function Set<T>(collection: Iterable<T>): Collection.Set<T>;

    export interface Set<T> extends Collection<T, T> {
      /**
       * Deeply converts this Set collection to equivalent native JavaScript Array.
       */
      toJS(): Array<any>;

      /**
       * Shallowly converts this Set collection to equivalent native JavaScript Array.
       */
      toJSON(): Array<T>;

      /**
       * Returns Seq.Set.
       * @override
       */
      toSeq(): Seq.Set<T>;

      // Sequence algorithms

      /**
       * Returns a new Collection with other collections concatenated to this one.
       */
      concat<C>(...valuesOrCollections: Array<Iterable<C> | C>): Collection.Set<T | C>;

      /**
       * Returns a new Collection.Set with values passed through a
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
        context?: any
      ): Collection.Set<M>;

      /**
       * Flat-maps the Collection, returning an Collection of the same type.
       *
       * Similar to `collection.map(...).flatten(true)`.
       */
      flatMap<M>(
        mapper: (value: T, key: T, iter: this) => Iterable<M>,
        context?: any
      ): Collection.Set<M>;

      /**
       * Returns a new Collection with only the values for which the `predicate`
       * function returns true.
       *
       * Note: `filter()` always returns a new instance, even if it results in
       * not filtering out any values.
       */
      filter<F extends T>(
        predicate: (value: T, key: T, iter: this) => value is F,
        context?: any
      ): Collection.Set<F>;
      filter(
        predicate: (value: T, key: T, iter: this) => any,
        context?: any
      ): this;

      [Symbol.iterator](): IterableIterator<T>;
    }

  }

  /**
   * Creates an Collection.
   *
   * The type of Collection created is based on the input.
   *
   *   * If an `Collection`, that same `Collection`.
   *   * If an Array-like, an `Collection.Indexed`.
   *   * If an Object with an Iterator, an `Collection.Indexed`.
   *   * If an Iterator, an `Collection.Indexed`.
   *   * If an Object, an `Collection.Keyed`.
   *
   * This methods forces the conversion of Objects and Strings to Collections.
   * If you want to ensure that a Collection of one item is returned, use
   * `Seq.of`.
   */
  export function Collection<I extends Collection<any, any>>(collection: I): I;
  export function Collection<T>(collection: Iterable<T>): Collection.Indexed<T>;
  export function Collection<V>(obj: {[key: string]: V}): Collection.Keyed<string, V>;

  export interface Collection<K, V> extends ValueObject {

    // Value equality

    /**
     * True if this and the other Collection have value equality, as defined
     * by `Immutable.is()`.
     *
     * Note: This is equivalent to `Immutable.is(this, other)`, but provided to
     * allow for chained expressions.
     */
    equals(other: any): boolean;

    /**
     * Computes and returns the hashed identity for this Collection.
     *
     * The `hashCode` of an Collection is used to determine potential equality,
     * and is used when adding this to a `Set` or as a key in a `Map`, enabling
     * lookup via a different instance.
     *
     * ```js
     * const a = List([ 1, 2, 3 ]);
     * const b = List([ 1, 2, 3 ]);
     * assert(a !== b); // different instances
     * const set = Set([ a ]);
     * assert(set.has(b) === true);
     * ```
     *
     * If two values have the same `hashCode`, they are [not guaranteed
     * to be equal][Hash Collision]. If two values have different `hashCode`s,
     * they must not be equal.
     *
     * [Hash Collision]: http://en.wikipedia.org/wiki/Collision_(computer_science)
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
     * The first value in the Collection.
     */
    first(): V | undefined;

    /**
     * The last value in the Collection.
     */
    last(): V | undefined;


    // Reading deep values

    /**
     * Returns the value found by following a path of keys or indices through
     * nested Collections.
     */
    getIn(searchKeyPath: Iterable<any>, notSetValue?: any): any;

    /**
     * True if the result of following a path of keys or indices through nested
     * Collections results in a set value.
     */
    hasIn(searchKeyPath: Iterable<any>): boolean;

    // Persistent changes

    /**
     * This can be very useful as a way to "chain" a normal function into a
     * sequence of methods. RxJS calls this "let" and lodash calls it "thru".
     *
     * For example, to sum a Seq after mapping and filtering:
     *
     * ```js
     * const { Seq } = require('immutable')
     *
     * function sum(collection) {
     *   return collection.reduce((sum, x) => sum + x, 0)
     * }
     *
     * Seq([ 1, 2, 3 ])
     *   .map(x => x + 1)
     *   .filter(x => x % 2 === 0)
     *   .update(sum)
     * // 6
     * ```
     */
    update<R>(updater: (value: this) => R): R;


    // Conversion to JavaScript types

    /**
     * Deeply converts this Collection to equivalent native JavaScript Array or Object.
     *
     * `Collection.Indexed`, and `Collection.Set` become `Array`, while
     * `Collection.Keyed` become `Object`, converting keys to Strings.
     */
    toJS(): Array<any> | { [key: string]: any };

    /**
     * Shallowly converts this Collection to equivalent native JavaScript Array or Object.
     *
     * `Collection.Indexed`, and `Collection.Set` become `Array`, while
     * `Collection.Keyed` become `Object`, converting keys to Strings.
     */
    toJSON(): Array<V> | { [key: string]: V };

    /**
     * Shallowly converts this collection to an Array, discarding keys.
     */
    toArray(): Array<V>;

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
    toOrderedMap(): OrderedMap<K, V>;

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
    toOrderedSet(): OrderedSet<V>;

    /**
     * Converts this Collection to a List, discarding keys.
     *
     * This is similar to `List(collection)`, but provided to allow for chained
     * expressions. However, when called on `Map` or other keyed collections,
     * `collection.toList()` discards the keys and creates a list of only the
     * values, whereas `List(collection)` creates a list of entry tuples.
     *
     * ```js
     * const { Map, List } = require('immutable')
     * var myMap = Map({ a: 'Apple', b: 'Banana' })
     * List(myMap) // List [ [ "a", "Apple" ], [ "b", "Banana" ] ]
     * myMap.toList() // List [ "Apple", "Banana" ]
     * ```
     */
    toList(): List<V>;

    /**
     * Converts this Collection to a Stack, discarding keys. Throws if values
     * are not hashable.
     *
     * Note: This is equivalent to `Stack(this)`, but provided to allow for
     * chained expressions.
     */
    toStack(): Stack<V>;


    // Conversion to Seq

    /**
     * Converts this Collection to a Seq of the same kind (indexed,
     * keyed, or set).
     */
    toSeq(): Seq<K, V>;

    /**
     * Returns a Seq.Keyed from this Collection where indices are treated as keys.
     *
     * This is useful if you want to operate on an
     * Collection.Indexed and preserve the [index, value] pairs.
     *
     * The returned Seq will have identical iteration order as
     * this Collection.
     *
     * ```js
     * const { Seq } = require('immutable')
     * const indexedSeq = Seq([ 'A', 'B', 'C' ])
     * // Seq [ "A", "B", "C" ]
     * indexedSeq.filter(v => v === 'B')
     * // Seq [ "B" ]
     * const keyedSeq = indexedSeq.toKeyedSeq()
     * // Seq { 0: "A", 1: "B", 2: "C" }
     * keyedSeq.filter(v => v === 'B')
     * // Seq { 1: "B" }
     */
    toKeyedSeq(): Seq.Keyed<K, V>;

    /**
     * Returns an Seq.Indexed of the values of this Collection, discarding keys.
     */
    toIndexedSeq(): Seq.Indexed<V>;

    /**
     * Returns a Seq.Set of the values of this Collection, discarding keys.
     */
    toSetSeq(): Seq.Set<V>;


    // Iterators

    /**
     * An iterator of this `Collection`'s keys.
     *
     * Note: this will return an ES6 iterator which does not support
     * Immutable.js sequence algorithms. Use `keySeq` instead, if this is
     * what you want.
     */
    keys(): IterableIterator<K>;

    /**
     * An iterator of this `Collection`'s values.
     *
     * Note: this will return an ES6 iterator which does not support
     * Immutable.js sequence algorithms. Use `valueSeq` instead, if this is
     * what you want.
     */
    values(): IterableIterator<V>;

    /**
     * An iterator of this `Collection`'s entries as `[ key, value ]` tuples.
     *
     * Note: this will return an ES6 iterator which does not support
     * Immutable.js sequence algorithms. Use `entrySeq` instead, if this is
     * what you want.
     */
    entries(): IterableIterator<[K, V]>;


    // Collections (Seq)

    /**
     * Returns a new Seq.Indexed of the keys of this Collection,
     * discarding values.
     */
    keySeq(): Seq.Indexed<K>;

    /**
     * Returns an Seq.Indexed of the values of this Collection, discarding keys.
     */
    valueSeq(): Seq.Indexed<V>;

    /**
     * Returns a new Seq.Indexed of [key, value] tuples.
     */
    entrySeq(): Seq.Indexed<[K, V]>;


    // Sequence algorithms

    /**
     * Returns a new Collection of the same type with values passed through a
     * `mapper` function.
     *
     * ```js
     * const { Collection } = require('immutable')
     * Collection({ a: 1, b: 2 }).map(x => 10 * x)
     * // Seq { "a": 10, "b": 20 }
     * ```
     *
     * Note: `map()` always returns a new instance, even if it produced the same
     * value at every step.
     */
    map<M>(
      mapper: (value: V, key: K, iter: this) => M,
      context?: any
    ): Collection<K, M>;

    /**
     * Returns a new Collection of the same type with only the entries for which
     * the `predicate` function returns true.
     *
     * ```js
     * const { Map } = require('immutable')
     * Map({ a: 1, b: 2, c: 3, d: 4}).filter(x => x % 2 === 0)
     * // Map { "b": 2, "d": 4 }
     * ```
     *
     * Note: `filter()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filter<F extends V>(
      predicate: (value: V, key: K, iter: this) => value is F,
      context?: any
    ): Collection<K, F>;
    filter(
      predicate: (value: V, key: K, iter: this) => any,
      context?: any
    ): this;

    /**
     * Returns a new Collection of the same type with only the entries for which
     * the `predicate` function returns false.
     *
     * ```js
     * const { Map } = require('immutable')
     * Map({ a: 1, b: 2, c: 3, d: 4}).filterNot(x => x % 2 === 0)
     * // Map { "a": 1, "c": 3 }
     * ```
     *
     * Note: `filterNot()` always returns a new instance, even if it results in
     * not filtering out any values.
     */
    filterNot(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): this;

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
     *   * Is pure, i.e. it must always return the same value for the same pair
     *     of values.
     *
     * When sorting collections which have no defined order, their ordered
     * equivalents will be returned. e.g. `map.sort()` returns OrderedMap.
     *
     * ```js
     * const { Map } = require('immutable')
     * Map({ "c": 3, "a": 1, "b": 2 }).sort((a, b) => {
     *   if (a < b) { return -1; }
     *   if (a > b) { return 1; }
     *   if (a === b) { return 0; }
     * });
     * // OrderedMap { "a": 1, "b": 2, "c": 3 }
     * ```
     *
     * Note: `sort()` Always returns a new instance, even if the original was
     * already sorted.
     */
    sort(comparator?: (valueA: V, valueB: V) => number): this;

    /**
     * Like `sort`, but also accepts a `comparatorValueMapper` which allows for
     * sorting by more sophisticated means:
     *
     *     hitters.sortBy(hitter => hitter.avgHits)
     *
     * Note: `sortBy()` Always returns a new instance, even if the original was
     * already sorted.
     */
    sortBy<C>(
      comparatorValueMapper: (value: V, key: K, iter: this) => C,
      comparator?: (valueA: C, valueB: C) => number
    ): this;

    /**
     * Returns a `Collection.Keyed` of `Collection.Keyeds`, grouped by the return
     * value of the `grouper` function.
     *
     * Note: This is always an eager operation.
     *
     * ```js
     * const { List, Map } = require('immutable')
     * const listOfMaps = List([
     *   Map({ v: 0 }),
     *   Map({ v: 1 }),
     *   Map({ v: 1 }),
     *   Map({ v: 0 }),
     *   Map({ v: 2 })
     * ])
     * const groupsOfMaps = listOfMaps.groupBy(x => x.get('v'))
     * // Map {
     * //   0: List [ Map{ "v": 0 }, Map { "v": 0 } ],
     * //   1: List [ Map{ "v": 1 }, Map { "v": 1 } ],
     * //   2: List [ Map{ "v": 2 } ],
     * // }
     */
    groupBy<G>(
      grouper: (value: V, key: K, iter: this) => G,
      context?: any
    ): /*Map*/Seq.Keyed<G, /*this*/Collection<K, V>>;


    // Side effects

    /**
     * The `sideEffect` is executed for every entry in the Collection.
     *
     * Unlike `Array#forEach`, if any call of `sideEffect` returns
     * `false`, the iteration will stop. Returns the number of entries iterated
     * (including the last iteration which returned false).
     */
    forEach(
      sideEffect: (value: V, key: K, iter: this) => any,
      context?: any
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
     * `slice(0, -1)` returns an Collection of everything but the last entry. If
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
     *
     * ```js
     * const { List } = require('immutable')
     * List([ 'dog', 'frog', 'cat', 'hat', 'god' ])
     *   .skipWhile(x => x.match(/g/))
     * // List [ "cat", "hat", "god"" ]
     * ```
     */
    skipWhile(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): this;

    /**
     * Returns a new Collection of the same type which includes entries starting
     * from when `predicate` first returns true.
     *
     * ```js
     * const { List } = require('immutable')
     * List([ 'dog', 'frog', 'cat', 'hat', 'god' ])
     *   .skipUntil(x => x.match(/hat/))
     * // List [ "hat", "god"" ]
     * ```
     */
    skipUntil(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
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
     *
     * ```js
     * const { List } = require('immutable')
     * List([ 'dog', 'frog', 'cat', 'hat', 'god' ])
     *   .takeWhile(x => x.match(/o/))
     * // List [ "dog", "frog" ]
     * ```
     */
    takeWhile(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): this;

    /**
     * Returns a new Collection of the same type which includes entries from this
     * Collection as long as the `predicate` returns false.
     *
     * ```js
     * const { List } = require('immutable')
     * List([ 'dog', 'frog', 'cat', 'hat', 'god' ])
     *   .takeUntil(x => x.match(/at/))
     * // List [ "dog", "frog" ]
     * ```
     */
    takeUntil(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): this;


    // Combination

    /**
     * Returns a new Collection of the same type with other values and
     * collection-like concatenated to this one.
     *
     * For Seqs, all entries will be present in the resulting Seq, even if they
     * have the same key.
     */
    concat(...valuesOrCollections: Array<any>): Collection<any, any>;

    /**
     * Flattens nested Collections.
     *
     * Will deeply flatten the Collection by default, returning an Collection of the
     * same type, but a `depth` can be provided in the form of a number or
     * boolean (where true means to shallowly flatten one level). A depth of 0
     * (or shallow: false) will deeply flatten.
     *
     * Flattens only others Collection, not Arrays or Objects.
     *
     * Note: `flatten(true)` operates on Collection<any, Collection<K, V>> and
     * returns Collection<K, V>
     */
    flatten(depth?: number): Collection<any, any>;
    flatten(shallow?: boolean): Collection<any, any>;

    /**
     * Flat-maps the Collection, returning an Collection of the same type.
     *
     * Similar to `collection.map(...).flatten(true)`.
     */
    flatMap<M>(
      mapper: (value: V, key: K, iter: this) => Iterable<M>,
      context?: any
    ): Collection<K, M>;

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
      context?: any
    ): R;
    reduce<R>(
      reducer: (reduction: V | R, value: V, key: K, iter: this) => R
    ): R;

    /**
     * Reduces the Collection in reverse (from the right side).
     *
     * Note: Similar to this.reverse().reduce(), and provided for parity
     * with `Array#reduceRight`.
     */
    reduceRight<R>(
      reducer: (reduction: R, value: V, key: K, iter: this) => R,
      initialReduction: R,
      context?: any
    ): R;
    reduceRight<R>(
      reducer: (reduction: V | R, value: V, key: K, iter: this) => R
    ): R;

    /**
     * True if `predicate` returns true for all entries in the Collection.
     */
    every(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): boolean;

    /**
     * True if `predicate` returns true for any entry in the Collection.
     */
    some(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
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
      context?: any
    ): number;

    /**
     * Returns a `Seq.Keyed` of counts, grouped by the return value of
     * the `grouper` function.
     *
     * Note: This is not a lazy operation.
     */
    countBy<G>(
      grouper: (value: V, key: K, iter: this) => G,
      context?: any
    ): Map<G, number>;


    // Search for value

    /**
     * Returns the first value for which the `predicate` returns true.
     */
    find(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any,
      notSetValue?: V
    ): V | undefined;

    /**
     * Returns the last value for which the `predicate` returns true.
     *
     * Note: `predicate` will be called for each entry in reverse.
     */
    findLast(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any,
      notSetValue?: V
    ): V | undefined;

    /**
     * Returns the first [key, value] entry for which the `predicate` returns true.
     */
    findEntry(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any,
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
      context?: any,
      notSetValue?: V
    ): [K, V] | undefined;

    /**
     * Returns the key for which the `predicate` returns true.
     */
    findKey(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
    ): K | undefined;

    /**
     * Returns the last key for which the `predicate` returns true.
     *
     * Note: `predicate` will be called for each entry in reverse.
     */
    findLastKey(
      predicate: (value: V, key: K, iter: this) => boolean,
      context?: any
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
    max(comparator?: (valueA: V, valueB: V) => number): V | undefined;

    /**
     * Like `max`, but also accepts a `comparatorValueMapper` which allows for
     * comparing by more sophisticated means:
     *
     *     hitters.maxBy(hitter => hitter.avgHits);
     *
     */
    maxBy<C>(
      comparatorValueMapper: (value: V, key: K, iter: this) => C,
      comparator?: (valueA: C, valueB: C) => number
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
    min(comparator?: (valueA: V, valueB: V) => number): V | undefined;

    /**
     * Like `min`, but also accepts a `comparatorValueMapper` which allows for
     * comparing by more sophisticated means:
     *
     *     hitters.minBy(hitter => hitter.avgHits);
     *
     */
    minBy<C>(
      comparatorValueMapper: (value: V, key: K, iter: this) => C,
      comparator?: (valueA: C, valueB: C) => number
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


    /**
     * Note: this is here as a convenience to work around an issue with
     * TypeScript https://github.com/Microsoft/TypeScript/issues/285, but
     * Collection does not define `size`, instead `Seq` defines `size` as
     * nullable number, and `Collection` defines `size` as always a number.
     *
     * @ignore
     */
    readonly size: number;
  }
}

declare module "immutable" {
  export = Immutable
}
