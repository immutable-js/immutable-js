import LazyIndexedSequence = require('./LazyIndexedSequence');

interface LazyArraySequence<T> extends LazyIndexedSequence<T, LazyArraySequence<T>> {
  new(array: T[]): LazyArraySequence<T>;
  length: number;
}

export = LazyArraySequence;
