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
  Null: 12,
  Union: 13,
  Intersection: 14,
  Tuple: 15,
  Indexed: 16,
  Operator: 17,

  Unknown: 18,
};

module.exports = TypeKind;
