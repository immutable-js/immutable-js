/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import { KeyedSeq, IndexedSeq } from './Seq'

export function fromJS(json, converter) {
  return converter ?
    fromJSWith(converter, json, '', {'': json}) :
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

function isPlainObj(value) {
  return value && value.constructor === Object;
}
