/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import {
  KeyedSeq,
  IndexedSeq
} from './Seq'

export function fromJS(json, converter) {
  return converter ?
    fromJSWith(converter, json, '', {
      '': json
    }) :
    fromJSDefault(json);
}

function fromJSWith(converter, json, key, parentJSON) {
  if (Array.isArray(json)) {
    return converter.call(parentJSON, key, IndexedSeq(json).map((v, k) => fromJSWith(converter, v, k, json)));
  }
  if (isPlainObj(json)) {
    return converter.call(parentJSON, key, KeyedSeq(json).map((v, k) => fromJSWith(converter, v, k, json)));
  }
  return json;
}

function fromJSDefault(json) {
  if (Array.isArray(json)) {
    return IndexedSeq(json).map(fromJSDefault).toList();
  }
  if (isPlainObj(json)) {
    return KeyedSeq(json).map(fromJSDefault).toMap();
  }
  return json;
}

function typeOf(obj) {
  var objType = Object.prototype.toString.call(obj)
  if (objType === "[object Object]") {
    if (obj.constructor && obj.constructor.name) {
      objType = obj.constructor.name
    }
  }
  return objType
}

function isPlainObj(value) {
  // console.log("FFFF", value.constructor === undefined, typeOf(value))
  return value && (value.constructor === undefined || typeOf(value) === "Object");
}

// function isPlainObj(value) {
//   return value && (Object.prototype.toString.call(value) === "[object Object]" || value.constructor === undefined);
// }