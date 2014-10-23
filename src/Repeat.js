/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Sequence"
import "Range"
import "is"
import "Iterator"
/* global LazyIndexedSequence, RangePrototype, is,
          Iterator, iteratorValue, iteratorDone */
/* exported Repeat */


/**
 * Returns a lazy seq of `value` repeated `times` times. When `times` is
 * undefined, returns an infinite sequence of `value`.
 */
class Repeat extends LazyIndexedSequence {

  constructor(value, times) {
    if (times === 0 && EMPTY_REPEAT) {
      return EMPTY_REPEAT;
    }
    if (!(this instanceof Repeat)) {
      return new Repeat(value, times);
    }
    this._value = value;
    this.size = times == null ? Infinity : Math.max(0, times);
  }

  toString() {
    if (this.size === 0) {
      return 'Repeat []';
    }
    return 'Repeat [ ' + this._value + ' ' + this.size + ' times ]';
  }

  get(index, notSetValue) {
    return this.has(index) ? this._value : notSetValue;
  }

  contains(searchValue) {
    return is(this._value, searchValue);
  }

  slice(begin, end) {
    var size = this.size;
    begin = begin < 0 ? Math.max(0, size + begin) : Math.min(size, begin);
    end = end == null ? size : end > 0 ? Math.min(size, end) : Math.max(0, size + end);
    return end > begin ? new Repeat(this._value, end - begin) : EMPTY_REPEAT;
  }

  reverse() {
    return this;
  }

  indexOf(searchValue) {
    if (is(this._value, searchValue)) {
      return 0;
    }
    return -1;
  }

  lastIndexOf(searchValue) {
    if (is(this._value, searchValue)) {
      return this.size;
    }
    return -1;
  }

  __iterate(fn, reverse) {
    for (var ii = 0; ii < this.size; ii++) {
      if (fn(this._value, ii, this) === false) {
        return ii + 1;
      }
    }
    return ii;
  }

  __iterator(type, reverse) {
    var ii = 0;
    return new Iterator(() =>
      ii < this.size ? iteratorValue(type, ii++, this._value) : iteratorDone()
    );
  }

  __deepEquals(other) {
    return other instanceof Repeat ?
      is(this._value, other._value) :
      super.__deepEquals(other);
  }
}

var RepeatPrototype = Repeat.prototype;
RepeatPrototype.last = RepeatPrototype.first;
RepeatPrototype.has = RangePrototype.has;
RepeatPrototype.take = RangePrototype.take;
RepeatPrototype.skip = RangePrototype.skip;
RepeatPrototype.__toJS = RangePrototype.__toJS;


var EMPTY_REPEAT = new Repeat(undefined, 0);
