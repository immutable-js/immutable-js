/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Sequence"
import "Vector"
import "invariant"
import "Iterator"
/* global LazyIndexedSequence, wholeSlice, resolveBegin, resolveEnd,
          VectorPrototype, wrapIndex, invariant,
          Iterator, iteratorValue, iteratorDone */
/* exported Range, RangePrototype */


/**
 * Returns a lazy seq of nums from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When start is equal to end, returns empty list.
 */
class Range extends LazyIndexedSequence {

  constructor(start, end, step) {
    if (!(this instanceof Range)) {
      return new Range(start, end, step);
    }
    invariant(step !== 0, 'Cannot step a Range by 0');
    start = start || 0;
    if (end == null) {
      end = Infinity;
    }
    if (start === end && __EMPTY_RANGE) {
      return __EMPTY_RANGE;
    }
    step = step == null ? 1 : Math.abs(step);
    if (end < start) {
      step = -step;
    }
    this._start = start;
    this._end = end;
    this._step = step;
    this.size = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
  }

  toString() {
    if (this.size === 0) {
      return 'Range []';
    }
    return 'Range [ ' +
      this._start + '...' + this._end +
      (this._step > 1 ? ' by ' + this._step : '') +
    ' ]';
  }

  get(index, notSetValue) {
    return this.has(index) ?
      this._start + wrapIndex(this, index) * this._step :
      notSetValue;
  }

  contains(searchValue) {
    var possibleIndex = (searchValue - this._start) / this._step;
    return possibleIndex >= 0 &&
      possibleIndex < this.size &&
      possibleIndex === Math.floor(possibleIndex);
  }

  slice(begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    begin = resolveBegin(begin, this.size);
    end = resolveEnd(end, this.size);
    if (end <= begin) {
      return __EMPTY_RANGE;
    }
    return new Range(this.get(begin, this._end), this.get(end, this._end), this._step);
  }

  indexOf(searchValue) {
    var offsetValue = searchValue - this._start;
    if (offsetValue % this._step === 0) {
      var index = offsetValue / this._step;
      if (index >= 0 && index < this.size) {
        return index
      }
    }
    return -1;
  }

  lastIndexOf(searchValue) {
    return this.indexOf(searchValue);
  }

  take(amount) {
    return this.slice(0, Math.max(0, amount));
  }

  skip(amount) {
    return this.slice(Math.max(0, amount));
  }

  __iterate(fn, reverse) {
    var maxIndex = this.size - 1;
    var step = this._step;
    var value = reverse ? this._start + maxIndex * step : this._start;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(value, ii, this) === false) {
        return ii + 1;
      }
      value += reverse ? -step : step;
    }
    return ii;
  }

  __iterator(type, reverse) {
    var maxIndex = this.size - 1;
    var step = this._step;
    var value = reverse ? this._start + maxIndex * step : this._start;
    var ii = 0;
    return new Iterator(() => {
      var v = value;
      value += reverse ? -step : step;
      return ii > maxIndex ? iteratorDone() : iteratorValue(type, ii++, v);
    });
  }

  __deepEquals(other) {
    return other instanceof Range ?
      this._start === other._start &&
      this._end === other._end &&
      this._step === other._step :
      super.__deepEquals(other);
  }
}

var RangePrototype = Range.prototype;

RangePrototype.__toJS = RangePrototype.toArray;
RangePrototype.first = VectorPrototype.first;
RangePrototype.last = VectorPrototype.last;

var __EMPTY_RANGE = Range(0, 0);
