/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

export default function isPlainObj(value) {
  return (
    value &&
    ((value.constructor && (value.constructor.name === 'Object' ||
        typeof value.constructor != 'function')) ||
      value.constructor === undefined)
  );
}
