/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Seq } from './Seq';
import isDataStructure from './utils/isDataStructure';

export function toJS(value) {
  return isDataStructure(value)
    ? Seq(value)
        .map(toJS)
        .toJSON()
    : value;
}
