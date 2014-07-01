import OrderedLazyIterable = require('./OrderedLazyIterable');

class ArrayIterator<T> extends OrderedLazyIterable<T, ArrayIterator<T>> {
  constructor(public _array: Array<T>) {
    super();
  }

  iterate(
    fn: (value?: T, key?: number, collection?: ArrayIterator<T>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    var iterator = this._array;
    return this._array.every((value, index) => fn.call(thisArg, value, index, iterator) !== false);
  }

  reverseIterate(
    fn: (value?: T, key?: number, collection?: ArrayIterator<T>) => any, // false or undefined
    thisArg?: any
  ): boolean {
    for (var ii = this._array.length - 1; ii >= 0; ii--) {
      if (this._array.hasOwnProperty(<any>ii) &&
          fn.call(thisArg, this._array[ii], ii, this._array) === false) {
        return false;
      }
    }
    return true;
  }
}

export = ArrayIterator;
