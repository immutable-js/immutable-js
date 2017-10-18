/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var TypeKind = {
  Any: 0,

  Boolean: 1,
  Number: 2,
  String: 3,
  Object: 4,
  Array: 5,
  Never: 6,
  Function: 7,

  Param: 8,
  Type: 9,

  This: 10,
  Undefined: 11,
  Union: 12,
  Intersection: 13,
  Tuple: 14,
  Indexed: 15,
  Operator: 16,
};

module.exports = TypeKind;
