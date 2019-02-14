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
  constructor(func, condition, seed) {
    if (!(this instanceof IterateUntil)) {
      return new IterateUntil(func, condition, seed);
    }
    const source = [];
    seed = seed || 1;
    this._func = func;
    this._condition = condition;
    this._seed = seed;
    let result = func(seed);
    while (condition(result)) {
      source.push(result);
      result = func(result);
    }
    super(source);
    if (this.size === 0) {
      if (EMPTY_TIMES) {
        return EMPTY_TIMES;
      }
      EMPTY_TIMES = this;
    }
  }
  //i wrote tests but i still have to figure out the type definitions
  toString() {
    if (this.size === 0) {
      return 'IterateUntil []';
    }
    return this.toArray().toString();
  }
  equals(other) {
    return other instanceof IterateUntil
      ? this._func === other._func &&
          this._condition === other._condition &&
          this._seed === other._seed
      : deepEqual(this, other);
  }
}

let EMPTY_TIMES;
