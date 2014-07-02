var OrderedLazyIterable = require('./OrderedLazyIterable');

class ArrayIterator extends OrderedLazyIterable {
  constructor(array) {
    this._array = array;
  }

  iterate(fn, thisArg, reverseIndices) {
    var array = this._array;
    return this._array.every((value, index) =>
      fn.call(thisArg, value, reverseIndices ? array.length - 1 - index : index, array) !== false
    );
  }

  reverseIterate(fn, thisArg, maintainIndices) {
    var array = this._array;
    for (var ii = array.length - 1; ii >= 0; ii--) {
      if (array.hasOwnProperty(ii) &&
          fn.call(thisArg, array[ii], maintainIndices ? ii : array.length - 1 - ii, array) === false) {
        return false;
      }
    }
    return true;
  }
}

module.exports = ArrayIterator;
