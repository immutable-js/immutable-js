/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

//import { wrapIndex, wholeSlice, resolveBegin, resolveEnd } from './TrieUtils';
import { ArraySeq } from './Seq';
//import { Iterator, iteratorValue, iteratorDone } from './Iterator';

import deepEqual from './utils/deepEqual';

/**
 * Calls func with seed as the argument and passes the result to func and
 * repeats it times number of times and returns a Seq.Indexed of each result 
 * times and func are required and seed defaults to 1
 */
export class Times extends ArraySeq {
  constructor(times, func, seed) {
    if (!(this instanceof Times)) {
      return new Times(times, func, seed);
    }
    const source = [];
    seed = seed || 1;
    times = Math.max(0, times);
    this._times = times;
    this._seed = seed;
    this._func = func;
    while (times > 0) {
      seed = func(seed);
      source.push(seed);
      times--;
    }
    super(source);
    if (this.size === 0) {
      if (EMPTY_TIMES) {
        return EMPTY_TIMES;
      }
      EMPTY_TIMES = this;
    }
  }
  toString() {
    if (this.size === 0) {
      return 'Times []';
    }
    return this.toArray().toString();
  }
  equals(other) {
    return other instanceof Times
      ? this._times === other._times &&
          this._seed === other._seed &&
          this._func === other._func
      : deepEqual(this, other);
  }
}

let EMPTY_TIMES;
