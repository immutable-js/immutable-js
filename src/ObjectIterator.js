var OrderedLazyIterable = require('./OrderedLazyIterable');

class ObjectIterator extends OrderedLazyIterable {
  constructor(object) {
    if (this instanceof ObjectIterator) {
      this._object = object;
    } else {
      return new ObjectIterator(this._object);
    }
  }

  // TODO: add efficient reverse iteration

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
