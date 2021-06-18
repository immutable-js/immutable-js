/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { wholeSlice, resolveBegin, resolveEnd } from './TrieUtils';
import { IndexedSeq } from './Seq';
import invariant from './utils/invariant';
import deepEqual from './utils/deepEqual';
import { Iterator, iteratorValue, iteratorDone } from './Iterator';

/**
 * Returns a lazy seq of base - ends, base, base + front,
 * if front is not provided it returns base + ends,
 * `base` and `ends` both default to 1
 */
export class Stretch {
  constructor(base, ends, front) {
    if (!(this instanceof Stretch)) {
      return new Stretch(base, ends, front);
    }
    invariant(
      base !== Infinity || ends !== Infinity || front !== Infinity,
      `Must be a finite number`
    );
    invariant(base !== undefined, `Base is required`);
    ends = ends === undefined ? 1 : ends;
    front = front === undefined ? ends : front;
    this._base = base;
    this._start = base - ends;
    this._end = base + front;
    this.size = 3;
    /*when i tried extending IndexedSeq or ArraySeq and calling super
    the tests __tests__/Stretch.ts returned [5, 8, undefined] instead of 2, 5, 8]
    and [5, 9, undefined] instead of [2, 5, 9]*/
    return new IndexedSeq([this._start, this._base, this._end]);
  }
  toString() {
    return `[${this._start}, ${this._base}, ${this._end}]`;
  }

  get(index, notSetValue) {
    return index === 0
      ? this._start
      : index === 1
        ? this._base
        : index === 2
          ? this._end
          : notSetValue;
  }

  includes(searchValue) {
    return (
      searchValue === this._start ||
      searchValue === this._base ||
      searchValue === this._end
    );
  }

  slice(begin, end) {
    if (wholeSlice(begin, end, this.size)) {
      return this;
    }
    begin = resolveBegin(begin, this.size);
    end = resolveEnd(end, this.size);
    return end <= begin
      ? new IndexedSeq([])
      : end - begin === 1
        ? new IndexedSeq([this.get(begin)])
        : new IndexedSeq([this.get(begin), this.get(begin + 1)]);
  }

  indexOf(searchValue) {
    return searchValue === this._start
      ? 0
      : searchValue === this._base
        ? 1
        : searchValue === this._end
          ? 2
          : -1;
  }
  /*we can't return indexOf for lastIndexOf because ends and front can
be be different values*/
  lastIndexOf(searchValue) {
    return searchValue === this._end
      ? 2
      : searchValue === this._base
        ? 1
        : searchValue === this._start
          ? 0
          : -1;
  }

  __iterate(fn, reverse) {
    const size = 3;
    let value = reverse ? this._end : this._start;
    let i = 0;
    value += reverse ? -(this._end - this._base) : this._base - this._start;
    if (fn(value, reverse ? size - ++i : i++, this) === false) {
      return i;
    }
    value += reverse ? -(this._base - this._start) : this._end - this._base;
    if (fn(value, reverse ? size - ++i : i++, this) === false) {
      return i;
    }
    return i;
  }

  __iterator(type, reverse) {
    const array = [this._start, this._base, this._end];
    const size = 3;
    let i = 0;
    return new Iterator(() => {
      if (i === size) {
        return iteratorDone();
      }
      const ii = reverse ? size - ++i : i++;
      return iteratorValue(type, ii, array[ii]);
    });
  }

  reverse() {
    return new Stretch(this._base, -this._ends, -this._front);
  }

  interpose(separator) {
    return new IndexedSeq([
      this._start,
      separator,
      this._base,
      separator,
      this._end,
    ]);
  }

  rest() {
    return new IndexedSeq([this._base, this._end]);
  }

  butLast() {
    return new IndexedSeq([this._start, this._base]);
  }

  equals(other) {
    return other instanceof Stretch
      ? this._start === other._start &&
          this._end === other._end &&
          this._base === other._base
      : deepEqual(this, other);
  }
}
