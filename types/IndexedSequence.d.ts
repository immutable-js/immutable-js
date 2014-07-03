import Sequence = require('./Sequence');
import Vector = require('./Vector');

interface IndexedSequence<V, C> extends Sequence<number, V, C> {

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
  // except they return an IndexedSequence.

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

export = IndexedSequence;
