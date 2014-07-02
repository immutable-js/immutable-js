import LazyIndexedSequence = require('./LazyIndexedSequence');

declare class LazyArraySequence<T> extends LazyIndexedSequence<T, LazyArraySequence<T>> {
  constructor(_array: T[]);
}

export = LazyArraySequence;
