import OrderedLazyIterable = require('./OrderedLazyIterable');

declare class ObjectIterator<T> extends OrderedLazyIterable<string, T, ObjectIterator<T>> {

  /**
   *
   */
  (object: {[key: string]: T;}): ObjectIterator<T>;
}

export = ObjectIterator;
