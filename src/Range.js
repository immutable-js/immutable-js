var IndexedSequence = require('./Sequence').IndexedSequence;
var Vector = require('./Vector');


function invariant(condition, error) {
  if (!condition) throw new Error(error);
}

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
    this.start = start || 0;
    this.end = end == null ? Infinity : end;
    step = step == null ? 1 : Math.abs(step);
    this.step = this.end < this.start ? -step : step;
    this.length = this.step === 0 ? Infinity : Math.max(0, Math.ceil((this.end - this.start) / this.step - 1) + 1);
  }

  toString() {
    if (this.length === 0) {
      return 'Range []';
    }
    return 'Range [ ' +
      this.start +
      (this.step === 0 ? ' repeated' :
        '...' + this.end +
        (this.step > 1 ? ' by ' + this.step : '')) +
    ' ]';
  }

  has(index) {
    invariant(index >= 0, 'Index out of bounds');
    return index < this.length;
  }

  get(index) {
    invariant(index >= 0, 'Index out of bounds');
    if (this.length === Infinity || index < this.length) {
      return this.step === 0 ? this.start : this.start + index * this.step;
    }
  }

  slice(begin, end) {
    begin = begin < 0 ? Math.max(0, this.length + begin) : Math.min(this.length, begin);
    end = end == null ? this.length : end > 0 ? Math.min(this.length, end) : Math.max(0, this.length + end);
    return new Range(this.get(begin), end === this.length ? this.end : this.get(end), this.step);
  }

  __deepEquals(other) {
    return this.start === other.start && this.end === other.end && this.step === other.step;
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

  indexOf(searchValue) {
    if (this.step === 0) {
      return searchValue === this.start ? 0 : -1;
    }
    var offsetValue = searchValue - this.start;
    if (offsetValue % this.step === 0) {
      var index = offsetValue / this.step;
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
    (reverse || flipIndices) && assertNotInfinite(this.length);
    var value, ii;
    if (reverse) {
      var maxIndex = this.length - 1;
      value = this.start + maxIndex * this.step;
      for (ii = maxIndex; ii >= 0; ii--) {
        if (fn(value, flipIndices ? ii : maxIndex - ii, this) === false) {
          break;
        }
        value -= this.step;
      }
      return maxIndex - ii;
    } else {
      value = this.start;
      for (ii = 0; ii < this.length; ii++) {
        if (fn(value, flipIndices ? this.length - 1 - ii : ii, this) === false) {
          break;
        }
        value += this.step;
      }
      return ii;
    }
  }
}

Range.prototype.toJS = Range.prototype.toArray;
Range.prototype.first = Vector.prototype.first;
Range.prototype.last = Vector.prototype.last;


function assertNotInfinite(length) {
  invariant(length < Infinity, 'Cannot access end of infinite range.');
}

module.exports = Range;
