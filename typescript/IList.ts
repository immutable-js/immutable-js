import OrderedLazyIterable = require('./OrderedLazyIterable');

interface IList<T> extends OrderedLazyIterable<T, IList<T>> {

  // @pragma Access

  length: number;
  get(index: number): T;
  first(): T;
  last(): T;

}

export = IList;
