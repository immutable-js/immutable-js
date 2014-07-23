var IndexedSequence = require('./Sequence').IndexedSequence;
var Range = require('./Range');


/**
 * Returns a lazy seq of `value` repeated `times` times. When `times` is
 * undefined, returns an infinite sequence of `value`.
 */
class Repeat extends IndexedSequence {

  constructor(value, times) {
    if (times === 0 && __EMPTY_REPEAT) {
      return __EMPTY_REPEAT;
    }
    if (!(this instanceof Repeat)) {
      return new Repeat(value, times);
    }
    this._value = value;
    this.length = times == null ? Infinity : Math.max(0, times);
  }

  toString() {
    if (this.length === 0) {
      return 'Repeat []';
    }
    return 'Repeat [ ' + this._value + ' ' + this.length + ' times ]';
  }

  get(index, undefinedValue) {
    invariant(index >= 0, 'Index out of bounds');
    return this.length === Infinity || index < this.length ?
      this._value :
      undefinedValue;
  }

  contains(searchValue) {
    var is = require('./Immutable').is;
    return is(this._value, searchValue);
  }

  __deepEquals(other) {
    var is = require('./Immutable').is;
    return is(this._value, other._value);
  }

  first(predicate, thisArg) {
    return predicate ? super.first(predicate, thisArg) : this._value;
  }

  slice(begin, end, maintainIndices) {
    if (maintainIndices) {
      return super.slice(begin, end, maintainIndices);
    }
    var length = this.length;
    begin = begin < 0 ? Math.max(0, length + begin) : Math.min(length, begin);
    end = end == null ? length : end > 0 ? Math.min(length, end) : Math.max(0, length + end);
    return end > begin ? new Repeat(this._value, end - begin) : __EMPTY_REPEAT;
  }

  reverse(maintainIndices) {
    return maintainIndices ? super.reverse(maintainIndices) : this;
  }

  indexOf(searchValue) {
    var is = require('./Immutable').is;
    if (is(this._value, searchValue)) {
      return 0;
    }
    return -1;
  }

  lastIndexOf(searchValue) {
    var is = require('./Immutable').is;
    if (is(this._value, searchValue)) {
      return this.length;
    }
    return -1;
  }

  cacheResult() {
    return this;
  }

  __iterate(fn, reverse, flipIndices) {
    var reversedIndices = reverse ^ flipIndices;
    invariant(!reversedIndices || this.length < Infinity, 'Cannot access end of infinite range.');
    var maxIndex = this.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(this._value, reversedIndices ? maxIndex - ii : ii, this) === false) {
        break;
      }
    }
    return reversedIndices ? this.length : ii;
  }
}

Repeat.prototype.has = Range.prototype.has;
Repeat.prototype.toArray = Range.prototype.toArray;
Repeat.prototype.toObject = Range.prototype.toObject;
Repeat.prototype.toVector = Range.prototype.toVector;
Repeat.prototype.toMap = Range.prototype.toMap;
Repeat.prototype.toOrderedMap = Range.prototype.toOrderedMap;
Repeat.prototype.toSet = Range.prototype.toSet;
Repeat.prototype.take = Range.prototype.take;
Repeat.prototype.skip = Range.prototype.skip;
Repeat.prototype.toJS = Range.prototype.toJS;
Repeat.prototype.last = Repeat.prototype.first;


function invariant(condition, error) {
  if (!condition) throw new Error(error);
}


var __EMPTY_REPEAT = new Repeat(undefined, 0);

module.exports = Repeat;
