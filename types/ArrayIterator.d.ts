import OrderedLazyIterable = require('./OrderedLazyIterable');

declare class ArrayIterator<T> extends OrderedLazyIterable<T, ArrayIterator<T>> {
  (_array: T[]): ArrayIterator<T>;
}

export = ArrayIterator;
