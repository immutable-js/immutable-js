/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Seq } from './Seq';
import { isIndexed } from './Predicates';
import isDataStructure from './utils/isDataStructure';

export function toJS(value) {
  if (isDataStructure(value)) {
    value = Seq(value);
    const result = isIndexed(value) ? [] : {};
    value.forEach((v, k) => {
      result[k] = toJS(v);
    });
    return result;
  }
  return value;
}
