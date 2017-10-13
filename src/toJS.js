/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { Collection } from './Collection';
import { isImmutable } from './Predicates';

export function toJS(value) {
  return isImmutable(value)
    ? Collection(value)
        .map(toJS)
        .toJSON()
    : value;
}
