import LazyIndexedSequence = require('./LazyIndexedSequence');

declare class LazyArraySequence<T> extends LazyIndexedSequence<T, LazyArraySequence<T>> {
  (_array: T[]): LazyArraySequence<T>;
}

export = LazyArraySequence;
