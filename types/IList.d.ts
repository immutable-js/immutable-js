import Sequence = require('./Sequence');

interface IList<T> extends Sequence<T, IList<T>> {
  length: number;
  get(index: number): T;
  first(): T;
  last(): T;
}

export = IList;
