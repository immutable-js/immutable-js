/**
 *  Copyright (c) 2017-present, Applitopia, Inc.
 *
 *  Modified source code is licensed under the MIT-style license found in the
 *  LICENSE file in the root directory of this source tree.
 */

/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export const IS_SORTED_SYMBOL = '@@__IMMUTABLE_SORTED__@@';

export function isSorted(maybeSorted) {
  return Boolean(maybeSorted && maybeSorted[IS_SORTED_SYMBOL]);
}
