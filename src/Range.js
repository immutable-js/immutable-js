var IndexedSequence = require('./Sequence').IndexedSequence;
var Vector = require('./Vector');


/**
 * Returns a lazy seq of nums from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When start is equal to end, returns empty list.
 */
class Range extends IndexedSequence {

  constructor(start, end, step) {
    if (!(this instanceof Range)) {
      return new Range(start, end, step);
    }
    invariant(step !== 0, 'Cannot step a Range by 0');
    start = start || 0;
    if (end == null) {
      end = Infinity;
    }
    step = step == null ? 1 : Math.abs(step);
    if (end < start) {
      step = -step;
    }
    this._start = start;
    this._end = end;
    this._step = step;
    this.length = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
  }

  toString() {
    if (this.length === 0) {
      return 'Range []';
    }
    return 'Range [ ' +
      this._start + '...' + this._end +
      (this._step > 1 ? ' by ' + this._step : '') +
    ' ]';
  }

  has(index) {
    invariant(index >= 0, 'Index out of bounds');
    return index < this.length;
  }

  get(index, undefinedValue) {
    invariant(index >= 0, 'Index out of bounds');
    return this.length === Infinity || index < this.length ?
      this._start + index * this._step : undefinedValue;
  }

  contains(searchValue) {
    var possibleIndex = (searchValue - this._start) / this._step;
    return possibleIndex >= 0 &&
      possibleIndex < this.length &&
      possibleIndex === Math.floor(possibleIndex);
  }

  slice(begin, end, maintainIndices) {
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

  indexOf(searchValue) {
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

  __iterate(fn, reverse, flipIndices) {
    var reversedIndices = reverse ^ flipIndices;
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


module.exports = Range;
