/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/* global Symbol */

export var ITERATE_KEYS = 0;
export var ITERATE_VALUES = 1;
export var ITERATE_ENTRIES = 2;

var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var FAUX_ITERATOR_SYMBOL = '@@iterator';

export var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;


export class Iterator {
  constructor(next) {
    this.next = next;
  }

  toString() {
    return '[Iterator]';
  }
}

Iterator.KEYS = ITERATE_KEYS;
Iterator.VALUES = ITERATE_VALUES;
Iterator.ENTRIES = ITERATE_ENTRIES;

Iterator.prototype.inspect =
Iterator.prototype.toSource = function () { return this.toString(); }
Iterator.prototype[ITERATOR_SYMBOL] = function () {
  return this;
};


export function iteratorValue(type, k, v, iteratorResult) {
  var value = type === 0 ? k : type === 1 ? v : [k, v];
  iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
    value: value, done: false
  });
  return iteratorResult;
}

export function iteratorDone() {
  return { value: undefined, done: true };
}

export function hasIterator(maybeIterable) {
  return !!getIteratorFn(maybeIterable);
}

export function isIterator(maybeIterator) {
  return maybeIterator && typeof maybeIterator.next === 'function';
}

export function getIterator(iterable) {
  var iteratorFn = getIteratorFn(iterable);
  return iteratorFn && iteratorFn.call(iterable);
}

function getIteratorFn(iterable) {
  var iteratorFn = iterable && (
    (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
    iterable[FAUX_ITERATOR_SYMBOL]
  );
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}
