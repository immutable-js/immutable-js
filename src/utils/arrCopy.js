/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

// http://jsperf.com/copy-array-inline
export default function arrCopy(arr, offset) {
  offset = offset || 0;
  const len = Math.max(0, arr.length - offset);
  const newArr = new Array(len);
  for (let ii = 0; ii < len; ii++) {
    newArr[ii] = arr[ii + offset];
  }
  return newArr;
}
