import OrderedLazyIterable = require('./OrderedLazyIterable');
import Vector = require('./Vector');

declare class IndexedLazyIterable<V, C> extends OrderedLazyIterable<number, V, C> {

  /**
   * When IndexedLazyIterable is converted to an array, the index keys are
   * maintained. This differs from the behavior of OrderedLazyIterable which
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
  reverse(maintainIndices?: boolean): IndexedLazyIterable<V, C>;

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
  ): IndexedLazyIterable<V, C>;

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
  skip(amount: number, maintainIndices?: boolean): IndexedLazyIterable<V, C>;

  /**
   * Has the same altered behavior as `skip`.
   * @override
   */
  skipWhile(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: any,
    maintainIndices?: boolean
  ): IndexedLazyIterable<V, C>;

  /**
   * Has the same altered behavior as `skip`.
   * @override
   */
  skipUntil(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: any,
    maintainIndices?: boolean
  ): IndexedLazyIterable<V, C>;

  // All below methods have identical behavior as OrderedLazyIterable,
  // except they return an IndexedLazyIterable.

  map<M>(
    mapper: (value?: V, index?: number, collection?: C) => M,
    context?: any
  ): IndexedLazyIterable<M, C>;

  take(amount: number): IndexedLazyIterable<V, C>;

  takeWhile(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: any
  ): IndexedLazyIterable<V, C>;

  takeUntil(
    predicate: (value?: V, index?: number, collection?: C) => boolean,
    context?: any
  ): IndexedLazyIterable<V, C>;
}

export = IndexedLazyIterable;
