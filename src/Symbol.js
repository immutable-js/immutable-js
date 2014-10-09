/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/* global Symbol */
/* exported DELETE, ITERATOR, isIterable, isIterator, getIterator */

var DELETE = 'delete';
var FAUX_ITERATOR =  '@@iterator';
var ITERATOR = typeof Symbol !== 'undefined' ? Symbol.iterator : FAUX_ITERATOR;

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
  return iterable && (iterable[ITERATOR] || iterable[FAUX_ITERATOR]);
}
