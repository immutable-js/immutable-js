/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import isPlainObj from './isPlainObj';

export default function isPlainUpdatable(collection) {
  return collection && (Array.isArray(collection) || isPlainObj(collection));
}
