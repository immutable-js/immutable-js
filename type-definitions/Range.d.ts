import SequenceModule = require('./Sequence');
import IndexedSequence = SequenceModule.IndexedSequence;

/**
 * Returns a lazy sequence of numbers from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When step is equal to 0, returns an infinite sequence of
 * start. When start is equal to end, returns empty range.
 */
declare function Range(start?: number, end?: number, step?: number): Range;

interface Range extends IndexedSequence<number, Range> {
  length: number;
  has(index: number): boolean;
  get(index: number): number;
  slice(begin: number, end?: number): Range;

  asImmutable(): Range;
}

export = Range;
