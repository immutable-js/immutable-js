import LazyIterable = require('./LazyIterable');

class ObjectIterator<T> extends LazyIterable<string, T, ObjectIterator<T>> {
  constructor(public _object: {[key: string]: T}) {
    super();
  }

  iterate(
    fn: (value?: T, key?: string, collection?: ObjectIterator<T>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    for (var key in this._object) {
      if (this._object.hasOwnProperty(key)) {
        if (fn.call(thisArg, this._object[key], key, this) === false) {
          return false;
        }
      }
    }
    return true;
  }
}

export = ObjectIterator;
