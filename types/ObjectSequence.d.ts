import Sequence = require('./Sequence');

interface ObjectSequence<T> extends Sequence<string, T, ObjectSequence<T>> {

  /**
   *
   */
  new(object: {[key: string]: T;}): ObjectSequence<T>;
}

export = ObjectSequence;
