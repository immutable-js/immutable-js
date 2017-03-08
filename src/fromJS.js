/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { KeyedSeq, IndexedSeq } from './Seq'
import { isKeyed } from './Iterable'

export function fromJS(json, converter) {
  var stack = [];
  return fromJSWith(stack, converter || defaultConverter, json, '', {'': json});
}

function fromJSWith(stack, converter, json, key, parentJSON) {
  if (Array.isArray(json)) {
    checkCircular(stack, json);
    const result = converter.call(parentJSON, key, IndexedSeq(json).map((v, k) => fromJSWith(stack, converter, v, k, json)));
    stack.pop();
    return result;
  }
  if (isPlainObj(json)) {
    checkCircular(stack, json);
    const result = converter.call(parentJSON, key, KeyedSeq(json).map((v, k) => fromJSWith(stack, converter, v, k, json)));
    stack.pop();
    return result;
  }
  return json;
}

function defaultConverter(k, v) {
  return isKeyed(v) ? v.toMap() : v.toList();
}

function checkCircular(stack, value) {
  if (~stack.indexOf(value)) {
    throw new TypeError('Cannot convert circular structure to Immutable');
  }
  stack.push(value);
}

function isPlainObj(value) {
  return value && (value.constructor === Object || value.constructor === undefined);
}
