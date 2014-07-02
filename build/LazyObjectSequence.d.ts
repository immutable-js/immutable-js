import LazySequence = require('./LazySequence');

declare class LazyObjectSequence<T> extends LazySequence<string, T, LazyObjectSequence<T>> {

  /**
   *
   */
  constructor(object: {[key: string]: T;});
}

export = LazyObjectSequence;
