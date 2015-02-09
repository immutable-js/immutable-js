/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */


// Used for setting prototype methods that IE8 chokes on.
export var DELETE = 'delete';

// Constants describing the size of trie nodes.
export var SHIFT = 5; // Resulted in best performance after ______?
export var SIZE = 1 << SHIFT;
export var MASK = SIZE - 1;

// A consistent shared value representing "not set" which equals nothing other
// than itself, and nothing that could be provided externally.
export var NOT_SET = {};

// Boolean references, Rough equivalent of `bool &`.
export var CHANGE_LENGTH = { value: false };
export var DID_ALTER = { value: false };

export function MakeRef(ref) {
  ref.value = false;
  return ref;
}

export function SetRef(ref) {
  ref && (ref.value = true);
}

// A function which returns a value representing an "owner" for transient writes
// to tries. The return value will only ever equal itself, and will not equal
// the return of any subsequent call of this function.
export function OwnerID() {}

// http://jsperf.com/copy-array-inline
export function arrCopy(arr, offset) {
  offset = offset || 0;
  var len = Math.max(0, arr.length - offset);
  var newArr = new Array(len);
  for (var ii = 0; ii < len; ii++) {
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
}

export function ensureSize(iter) {
  if (iter.size === undefined) {
    iter.size = iter.__iterate(returnTrue);
  }
  return iter.size;
}

export function wrapIndex(iter, index) {
  return index >= 0 ? (+index) : ensureSize(iter) + (+index);
}

export function returnTrue() {
  return true;
}

export function wholeSlice(begin, end, size) {
  return (begin === 0 || (size !== undefined && begin <= -size)) &&
    (end === undefined || (size !== undefined && end >= size));
}

export function resolveBegin(begin, size) {
  return resolveIndex(begin, size, 0);
}

export function resolveEnd(end, size) {
  return resolveIndex(end, size, size);
}

function resolveIndex(index, size, defaultIndex) {
  return index === undefined ?
    defaultIndex :
    index < 0 ?
      Math.max(0, size + index) :
      size === undefined ?
        index :
        Math.min(size, index);
}
