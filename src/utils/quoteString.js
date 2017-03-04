/**
 *  Copyright (c) 2014-2015, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

/**
 * Converts a value to a string, adding quotes if a string was provided.
 */
export default function quoteString(value) {
  return typeof value === 'string' ? JSON.stringify(value) : String(value);
}
