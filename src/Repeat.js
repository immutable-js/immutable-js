import { Iterator, iteratorDone, iteratorValue } from './Iterator';
import { IndexedSeq } from './Seq';
import { resolveBegin, resolveEnd, wholeSlice } from './TrieUtils';
import { is } from './is';

import deepEqual from './utils/deepEqual';

/**
 * Returns a lazy Seq of `value` repeated `times` times. When `times` is
 * undefined, returns an infinite sequence of `value`.
 */
export class Repeat extends IndexedSeq {
  constructor(value, times) {
    if (!(this instanceof Repeat)) {
      // eslint-disable-next-line no-constructor-return
      return new Repeat(value, times);
    }
    this._value = value;
    this.size = times === undefined ? Infinity : Math.max(0, times);
    if (this.size === 0) {
      if (EMPTY_REPEAT) {
        // eslint-disable-next-line no-constructor-return
        return EMPTY_REPEAT;
      }
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      EMPTY_REPEAT = this;
    }
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

  includes(searchValue) {
    return is(this._value, searchValue);
  }

  slice(begin, end) {
    const size = this.size;
    return wholeSlice(begin, end, size)
      ? this
      : new Repeat(
          this._value,
          resolveEnd(end, size) - resolveBegin(begin, size)
        );
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
    const size = this.size;
    let i = 0;
    while (i !== size) {
      if (fn(this._value, reverse ? size - ++i : i++, this) === false) {
        break;
      }
    }
    return i;
  }

  __iterator(type, reverse) {
    const size = this.size;
    let i = 0;
    return new Iterator(() =>
      i === size
        ? iteratorDone()
        : iteratorValue(type, reverse ? size - ++i : i++, this._value)
    );
  }

  equals(other) {
    return other instanceof Repeat
      ? is(this._value, other._value)
      : deepEqual(this, other);
  }
}

let EMPTY_REPEAT;
