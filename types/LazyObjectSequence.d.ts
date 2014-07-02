import LazySequence = require('./LazySequence');

declare class LazyObjectSequence<T> extends LazySequence<string, T, LazyObjectSequence<T>> {

  /**
   *
   */
  (object: {[key: string]: T;}): LazyObjectSequence<T>;
}

export = LazyObjectSequence;
