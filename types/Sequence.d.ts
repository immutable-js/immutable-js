import Vector = require('./Vector');
import Map = require('./Map');
import Set = require('./Set');

export declare function Sequence<V, C>(seq: IndexedSequence<V, C>): IndexedSequence<V, C>;
export declare function Sequence<K, V, C>(seq: Sequence<K, V, C>): Sequence<K, V, C>;
export declare function Sequence<T>(array: Array<T>): IndexedSequence<T, Array<T>>;
export declare function Sequence<T>(obj: {[key: string]: T}): Sequence<string, T, {[key: string]: T}>;

/**
 * TODO
 */
export interface Sequence<K, V, C> {

  toString(): string;

  toArray(): Array<V>;

  toObject(): Object;

  toVector(): Vector<V>;

  toMap(): Map<K, V>;

  toSet(): Set<V>;

  join(separator?: string): string;

  reverse(): Sequence<K, V, C>;

  keys(): IndexedSequence<K, C>;

  values(): IndexedSequence<V, C>;

  entries(): IndexedSequence</*(K, V)*/Array<any>, C>;

  forEach(
    sideEffect: (value?: V, key?: K, collection?: C) => any,
    context?: any
  ): void;

  first(
    predicate?: (value?: V, index?: number, collection?: C) => boolean,
    context?: any
  ): V;

  last(
    predicate?: (value?: V, index?: number, collection?: C) => boolean,
    context?: any
  ): V;

  reduce<R>(
    reducer: (reduction?: R, value?: V, key?: K, collection?: C) => R,
    initialReduction?: R,
    context?: any
  ): R;

  reduceRight<R>(
    reducer: (reduction?: R, value?: V, key?: K, collection?: C) => R,
    initialReduction: R,
    context?: any
  ): R;

  every(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): boolean;

  some(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): boolean;

  find(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): V;

  findKey(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): K;

  findLast(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): V;

  findLastKey(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): K;

  flip(): Sequence<V, K, C>;

  map<M>(
    mapper: (value?: V, key?: K, collection?: C) => M,
    context?: any
  ): Sequence<K, M, C>;

  filter(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): Sequence<K, V, C>;

  take(amount: number): Sequence<K, V, C>;

  takeWhile(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): Sequence<K, V, C>;

  takeUntil(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): Sequence<K, V, C>;

  skip(amount: number): Sequence<K, V, C>;

  skipWhile(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): Sequence<K, V, C>;

  skipUntil(
    predicate: (value?: V, key?: K, collection?: C) => boolean,
    context?: any
  ): Sequence<K, V, C>;
}


/**
 * TODO
 */
export interface IndexedSequence<V, C> extends Sequence<number, V, C> {

  /**
   * Some indexed sequences can describe their length lazily. When this is the
   * case, length will be non-null.
   *
   * For example, the new IndexedSequences returned from map() or reverse()
   * preserve the length of the original sequence.
   */
  length?: number;

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
    context?: any,
    maintainIndices?: boolean
  ): IndexedSequence<V, C>;

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
    context?: any
  ): number;

  /**
   * Returns the last index in the sequence where a value satisfies the
   * provided predicate function. Otherwise -1 is returned.
   */
  findLastIndex(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: any
  ): number;

  /**
   * Indexed sequences have a different `skip` behavior, where the first non-skipped
   * value will have an index of 0. If you want to preserve the original indicies,
   * set maintainIndices to true.
   * @override
   */
  skip(amount: number, maintainIndices?: boolean): IndexedSequence<V, C>;

  /**
   * Has the same altered behavior as `skip`.
   * @override
   */
  skipWhile(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: any,
    maintainIndices?: boolean
  ): IndexedSequence<V, C>;

  /**
   * Has the same altered behavior as `skip`.
   * @override
   */
  skipUntil(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: any,
    maintainIndices?: boolean
  ): IndexedSequence<V, C>;

  // All below methods have identical behavior as Sequence,
  // except they take a function with index: number instead of key: K
  // and return an IndexedSequence.

  map<M>(
    mapper: (value?: V, index?: number, collection?: C) => M,
    context?: any
  ): IndexedSequence<M, C>;

  take(amount: number): IndexedSequence<V, C>;

  takeWhile(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: any
  ): IndexedSequence<V, C>;

  takeUntil(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: any
  ): IndexedSequence<V, C>;
}
