/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/* global Symbol */
/* exported ITERATE_KEYS, ITERATE_VALUES, ITERATE_ENTRIES, ITERATOR_SYMBOL,
            Iterator, iteratorValue, iteratorDone,
            hasIterator, isIterator, getIterator */

var ITERATE_KEYS = 0;
var ITERATE_VALUES = 1;
var ITERATE_ENTRIES = 2;

var FAUX_ITERATOR_SYMBOL = '@@iterator';
var REAL_ITERATOR_SYMBOL = typeof Symbol === 'function' && Symbol.iterator;
var ITERATOR_SYMBOL = REAL_ITERATOR_SYMBOL || FAUX_ITERATOR_SYMBOL;


class Iterator {
  constructor(next) {
    this.next = next;
  }

  toString() {
    return '[Iterator]';
  }
}

var IteratorPrototype = Iterator.prototype;
IteratorPrototype.inspect =
IteratorPrototype.toSource = function () { return this.toString(); }
IteratorPrototype[ITERATOR_SYMBOL] = function () {
  return this;
};


function iteratorValue(type, k, v, iteratorResult) {
  var value = type === 0 ? k : type === 1 ? v : [k, v];
  iteratorResult ? (iteratorResult.value = value) : (iteratorResult = {
    value: value, done: false
  });
  return iteratorResult;
}

function iteratorDone() {
  return { value: undefined, done: true };
}

function hasIterator(maybeIterable) {
  return !!_iteratorFn(maybeIterable);
}

function isIterator(maybeIterator) {
  return maybeIterator && typeof maybeIterator.next === 'function';
}

function getIterator(iterable) {
  var iteratorFn = _iteratorFn(iterable);
  return iteratorFn && iteratorFn.call(iterable);
}

function _iteratorFn(iterable) {
  var iteratorFn = iterable && (
    (REAL_ITERATOR_SYMBOL && iterable[REAL_ITERATOR_SYMBOL]) ||
    iterable[FAUX_ITERATOR_SYMBOL]
  );
  if (typeof iteratorFn === 'function') {
    return iteratorFn;
  }
}
