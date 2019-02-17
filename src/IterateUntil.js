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
 * Takes a function that's used as a result generator and a function used as
 * a condition to check the result and returns an array of each generated
 * result, seed is passed as the initial value to func and then the result is
 * passed to func until the condition returns false
 * func and condition are required and seed defaults to 1
 */
export class IterateUntil extends ArraySeq {
  constructor(callback, condition, seed) {
    if (!(this instanceof IterateUntil)) {
      return new IterateUntil(callback, condition, seed);
    }
    const source = [];
    seed = seed || 1;
    this._callback = callback;
    this._condition = condition;
    this._seed = seed;
    let result = callback(seed);
    while (condition(result)) {
      source.push(result);
      result = callback(result);
    }
    super(source);
    if (this.size === 0) {
      if (EMPTY_ITERATEUNTIL) {
        return EMPTY_ITERATEUNTIL;
      }
      EMPTY_ITERATEUNTIL = this;
    }
  }
  toString() {
    if (this.size === 0) {
      return 'IterateUntil []';
    }
    return this.toArray().toString();
  }
  equals(other) {
    return other instanceof IterateUntil
      ? this._callback === other._callback &&
          this._condition === other._condition &&
          this._seed === other._seed
      : deepEqual(this, other);
  }
}

let EMPTY_ITERATEUNTIL;
