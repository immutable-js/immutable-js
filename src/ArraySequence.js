var IndexedSequence = require('./IndexedSequence');

class ArraySequence extends IndexedSequence {
  constructor(array) {
    this.length = array.length;
    this._array = array;
  }

  __iterate(fn, reverseIndices) {
    var array = this._array;
    var maxIndex = array.length - 1;
    return this._array.every((value, index) =>
      fn(value, reverseIndices ? maxIndex - index : index, array) !== false
    );
  }

  __reverseIterate(fn, maintainIndices) {
    var array = this._array;
    var maxIndex = array.length - 1;
    for (var ii = maxIndex; ii >= 0; ii--) {
      if (array.hasOwnProperty(ii) &&
          fn(array[ii], maintainIndices ? ii : maxIndex - ii, array) === false) {
        return false;
      }
    }
    return true;
  }
}

module.exports = ArraySequence;
