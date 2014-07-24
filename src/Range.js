var IndexedSequence = require('./Sequence').IndexedSequence;
var Vector = require('./Vector');


/**
 * Returns a lazy seq of nums from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When step is equal to 0, returns an infinite sequence of
 * start. When start is equal to end, returns empty list.
 */
class Range extends IndexedSequence {

  constructor(start, end, step) {
    if (!(this instanceof Range)) {
      return new Range(start, end, step);
    }
    this._start = start || 0;
    this._end = end == null ? Infinity : end;
    step = step == null ? 1 : Math.abs(step);
    this._step = this._end < this._start ? -step : step;
    this.length = this._step === 0 ? Infinity : Math.max(0, Math.ceil((this._end - this._start) / this._step - 1) + 1);
  }

  toString() {
    if (this.length === 0) {
      return 'Range []';
    }
    return 'Range [ ' +
      this._start +
      (this._step === 0 ? ' repeated' :
        '...' + this._end +
        (this._step > 1 ? ' by ' + this._step : '')) +
    ' ]';
  }

  has(index) {
    invariant(index >= 0, 'Index out of bounds');
    return index < this.length;
  }

  get(index, undefinedValue) {
    invariant(index >= 0, 'Index out of bounds');
    return this.length === Infinity || index < this.length ?
      this._step === 0 ? this._start : this._start + index * this._step :
      undefinedValue;
  }

  contains(searchValue) {
    if (this._step === 0) {
      return searchValue === this._start;
    }
    var possibleIndex = (searchValue - this._start) / this._step;
    return possibleIndex >= 0 &&
      possibleIndex < this.length &&
      possibleIndex === Math.floor(possibleIndex);
  }

  slice(begin, end, maintainIndices) { // TODO maintainIndices
    if (maintainIndices) {
      return super.slice(begin, end, maintainIndices);
    }
    begin = begin < 0 ? Math.max(0, this.length + begin) : Math.min(this.length, begin);
    end = end == null ? this.length : end > 0 ? Math.min(this.length, end) : Math.max(0, this.length + end);
    return new Range(this.get(begin), end === this.length ? this._end : this.get(end), this._step);
  }

  __deepEquals(other) {
    return this._start === other._start && this._end === other._end && this._step === other._step;
  }

  toArray() {
    assertNotInfinite(this.length);
    return super.toArray();
  }

  toObject() {
    assertNotInfinite(this.length);
    return super.toObject();
  }

  toVector() {
    assertNotInfinite(this.length);
    return super.toVector();
  }

  toMap() {
    assertNotInfinite(this.length);
    return super.toMap();
  }

  toOrderedMap() {
    assertNotInfinite(this.length);
    return super.toOrderedMap();
  }

  toSet() {
    assertNotInfinite(this.length);
    return super.toSet();
  }

  indexOf(searchValue) {
    if (this._step === 0) {
      return searchValue === this._start ? 0 : -1;
    }
    var offsetValue = searchValue - this._start;
    if (offsetValue % this._step === 0) {
      var index = offsetValue / this._step;
      if (index >= 0 && index < this.length) {
        return index
      }
    }
    return -1;
  }

  lastIndexOf(searchValue) {
    return this.indexOf(searchValue);
  }

  take(amount) {
    return this.slice(0, amount);
  }

  skip(amount, maintainIndices) {
    return maintainIndices ? super.skip(amount) : this.slice(amount);
  }

  cacheResult() {
    return this;
  }

  __iterate(fn, reverse, flipIndices) {
    var reversedIndices = reverse ^ flipIndices;
    reversedIndices && assertNotInfinite(this.length);
    var maxIndex = this.length - 1;
    var step = this._step;
    var value = reverse ? this._start + maxIndex * step : this._start;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(value, reversedIndices ? maxIndex - ii : ii, this) === false) {
        break;
      }
      value += reverse ? -step : step;
    }
    return reversedIndices ? this.length : ii;
  }
}

Range.prototype.__toJS = Range.prototype.toArray;
Range.prototype.first = Vector.prototype.first;
Range.prototype.last = Vector.prototype.last;


function invariant(condition, error) {
  if (!condition) throw new Error(error);
}

function assertNotInfinite(length) {
  invariant(length < Infinity, 'Cannot access end of infinite range.');
}


module.exports = Range;
