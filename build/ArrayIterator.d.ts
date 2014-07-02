import IndexedLazyIterable = require('./IndexedLazyIterable');

declare class ArrayIterator<T> extends IndexedLazyIterable<T, ArrayIterator<T>> {
  (_array: T[]): ArrayIterator<T>;
}

export = ArrayIterator;
