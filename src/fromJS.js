/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
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
  return value && (value.constructor === Object || value.constructor === undefined);
}
