import LazySequence = require('./LazySequence');

interface LazyObjectSequence<T> extends LazySequence<string, T, LazyObjectSequence<T>> {

  /**
   *
   */
  new(object: {[key: string]: T;}): LazyObjectSequence<T>;
}

export = LazyObjectSequence;
