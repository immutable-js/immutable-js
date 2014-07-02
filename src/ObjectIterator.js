var LazyIterable = require('./LazyIterable');

class ObjectIterator extends LazyIterable {
  constructor(object) {
    this._object = object;
  }

  iterate(fn, thisArg) {
    for (var key in this._object) if (this._object.hasOwnProperty(key)) {
      if (fn.call(thisArg, this._object[key], key, this) === false) {
        return false;
      }
    }
    return true;
  }
}

module.exports = ObjectIterator;
