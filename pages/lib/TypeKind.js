var TypeKind = {
  Any: 0,

  Boolean: 1,
  Number: 2,
  String: 3,
  Object: 4,
  Array: 5,
  Function: 6,

  Param: 7,
  Type: 8,

  This: 9,
  Undefined: 10,
  Union: 11,
  Tuple: 12,
  Indexed: 13,
  Operator: 14,
};

module.exports = TypeKind;
