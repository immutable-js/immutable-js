var LazyIterable = require('./LazyIterable');

class ObjectIterator extends LazyIterable {
  constructor(object) {
    if (this instanceof ObjectIterator) {
      this._object = object;
    } else {
      return new ObjectIterator(this._object);
    }
  }

  iterate(fn) {
    for (var key in this._object) if (this._object.hasOwnProperty(key)) {
      if (fn(this._object[key], key, this) === false) {
        return false;
      }
    }
    return true;
  }
}

module.exports = ObjectIterator;
