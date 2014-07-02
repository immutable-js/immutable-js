import LazySequence = require('./LazySequence');

interface IList<T> extends LazySequence<T, IList<T>> {
  length: number;
  get(index: number): T;
  first(): T;
  last(): T;
}

export = IList;
