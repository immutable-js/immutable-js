import IndexedSequence = require('./IndexedSequence');

interface ArraySequence<T> extends IndexedSequence<T, ArraySequence<T>> {
  new(array: T[]): ArraySequence<T>;
  length: number;
}

export = ArraySequence;
