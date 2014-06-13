import OrderedIterable = require('./OrderedIterable');

interface IList<T> extends OrderedIterable<T, IList<T>> {

  // @pragma Access

  length: number;
  get(index: number): T;
  first(): T;
  last(): T;

}

export = IList;
