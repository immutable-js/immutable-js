/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/* global Symbol */
/* exported Iterator, iteratorValue, iteratorDone, iteratorMapper,
            isIterable, isIterator, getIterator,
            ITERATOR_SYMBOL, ITERATE_KEYS, ITERATE_VALUES, ITERATE_ENTRIES */

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


var iteratorResult = { value: undefined, done: false };

function iteratorValue(type, key, value) {
  iteratorResult.value = type === 0 ? key : type === 1 ? value : [key, value];
  iteratorResult.done = false;
  return iteratorResult;
}

function iteratorDone() {
  iteratorResult.value = undefined;
  iteratorResult.done = true;
  return iteratorResult;
}

function iteratorMapper(iter, fn) {
  var newIter = new Iterator();
  newIter.next = () => {
    var step = iter.next();
    if (step.done) return step;
    step.value = fn(step.value);
    return step;
  };
  return newIter;
}

function isIterable(maybeIterable) {
  return !!_iteratorFn(maybeIterable);
}

function isIterator(maybeIterator) {
  return maybeIterator && typeof maybeIterator.next === 'function';
}

function getIterator(iterable) {
  var iteratorFn = _iteratorFn(iterable);
  if (typeof iteratorFn === 'function') {
    return iteratorFn.call(iterable);
  }
}

function _iteratorFn(iterable) {
  return iterable && (iterable[ITERATOR_SYMBOL] || iterable[FAUX_ITERATOR_SYMBOL]);
}


var FAUX_ITERATOR_SYMBOL =  '@@iterator';
var ITERATOR_SYMBOL = typeof Symbol !== 'undefined' ?
  Symbol.iterator :
  FAUX_ITERATOR_SYMBOL;
var ITERATE_KEYS = 0;
var ITERATE_VALUES = 1;
var ITERATE_ENTRIES = 2;
