import LazyIterable = require('./LazyIterable');

declare class ObjectIterator<T> extends LazyIterable<string, T, ObjectIterator<T>> {

  /**
   *
   */
  (object: {[key: string]: T;}): ObjectIterator<T>;
}

export = ObjectIterator;
