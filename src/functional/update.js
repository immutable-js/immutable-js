/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { updateIn } from './updateIn';

export function update(collection, key, notSetValue, updater) {
  return updateIn(collection, [key], notSetValue, updater);
}
