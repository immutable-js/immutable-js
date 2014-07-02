import OrderedLazyIterable = require('./OrderedLazyIterable');

class ArrayIterator<T> extends OrderedLazyIterable<T, ArrayIterator<T>> {
  constructor(public _array: Array<T>) {
    super();
  }

  iterate(
    fn: (value?: T, key?: number, collection?: ArrayIterator<T>) => any, // false or undefined
    thisArg?: any,
    reverseIndices?: boolean
  ): boolean {
    var array = this._array;
    return this._array.every((value, index) =>
      fn.call(thisArg, value, reverseIndices ? array.length - 1 - index : index, array) !== false
    );
  }

  reverseIterate(
    fn: (value?: T, key?: number, collection?: ArrayIterator<T>) => any, // false or undefined
    thisArg?: any,
    maintainIndices?: boolean
  ): boolean {
    var array = this._array;
    for (var ii = array.length - 1; ii >= 0; ii--) {
      if (array.hasOwnProperty(<any>ii) &&
          fn.call(thisArg, array[ii], maintainIndices ? ii : array.length - 1 - ii, array) === false) {
        return false;
      }
    }
    return true;
  }
}

export = ArrayIterator;
