/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// Note: value is unchanged to not break immutable-devtools.
export const IS_COLLECTION_SYMBOL = '@@__IMMUTABLE_ITERABLE__@@';

export function isCollection(maybeCollection) {
  return Boolean(maybeCollection && maybeCollection[IS_COLLECTION_SYMBOL]);
}
