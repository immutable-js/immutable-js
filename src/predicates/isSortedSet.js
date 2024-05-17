/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { isSet } from './isSet';
import { isSorted } from './isSorted';

export function isSortedSet(maybeSortedSet) {
  return isSet(maybeSortedSet) && isSorted(maybeSortedSet);
}
