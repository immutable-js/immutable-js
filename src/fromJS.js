/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Seq"
/* global KeyedSeq, IndexedSeq */
/* exported fromJS */

function fromJS(json, converter) {
  return converter ?
    _fromJSWith(converter, json, '', {'': json}) :
    _fromJSDefault(json);
}

function _fromJSWith(converter, json, key, parentJSON) {
  if (Array.isArray(json)) {
    return converter.call(parentJSON, key, IndexedSeq(json).map((v, k) => _fromJSWith(converter, v, k, json)));
  }
  if (isPlainObj(json)) {
    return converter.call(parentJSON, key, KeyedSeq(json).map((v, k) => _fromJSWith(converter, v, k, json)));
  }
  return json;
}

function _fromJSDefault(json) {
  if (Array.isArray(json)) {
    return IndexedSeq(json).map(_fromJSDefault).toList();
  }
  if (isPlainObj(json)) {
    return KeyedSeq(json).map(_fromJSDefault).toMap();
  }
  return json;
}

function isPlainObj(value) {
  return value && value.constructor === Object;
}
