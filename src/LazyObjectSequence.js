var LazySequence = require('./LazySequence');

class LazyObjectSequence extends LazySequence {
  constructor(object) {
    if (this instanceof LazyObjectSequence) {
      this._object = object;
    } else {
      return new LazyObjectSequence(this._object);
    }
  }

  // TODO: add efficient reverse iteration

  __iterate(fn) {
    for (var key in this._object) if (this._object.hasOwnProperty(key)) {
      if (fn(this._object[key], key, this) === false) {
        return false;
      }
    }
    return true;
  }
}

module.exports = LazyObjectSequence;
