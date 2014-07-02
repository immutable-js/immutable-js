var LazySequence = require('./LazySequence');

class LazyObjectSequence extends LazySequence {
  constructor(object) {
    this._object = object;
  }

  __iterate(fn) {
    for (var key in this._object) if (this._object.hasOwnProperty(key)) {
      if (fn(this._object[key], key, this) === false) {
        return false;
      }
    }
    return true;
  }

  __reverseIterate(fn) {
    var keys = Object.keys(this._object);
    for (var ii = keys.length - 1; ii >= 0; ii--) {
      if (fn(this._object[keys[ii]], keys[ii], this) === false) {
        return false;
      }
    }
    return true;
  }
}

module.exports = LazyObjectSequence;
