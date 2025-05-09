const IS_COLLECTION_SYMBOL = '@@__IMMUTABLE_ITERABLE__@@';
const IS_ORDERED_SYMBOL = '@@__IMMUTABLE_ORDERED__@@';
const IS_INDEXED_SYMBOL = '@@__IMMUTABLE_INDEXED__@@';
const IS_RECORD_SYMBOL = '@@__IMMUTABLE_RECORD__@@';
const IS_STACK_SYMBOL = '@@__IMMUTABLE_STACK__@@';
const IS_KEYED_SYMBOL = '@@__IMMUTABLE_KEYED__@@';
const IS_LIST_SYMBOL = '@@__IMMUTABLE_LIST__@@';
const IS_SEQ_SYMBOL = '@@__IMMUTABLE_SEQ__@@';
const IS_SET_SYMBOL = '@@__IMMUTABLE_SET__@@';
const IS_MAP_SYMBOL = '@@__IMMUTABLE_MAP__@@';

const ITERATOR_SYMBOL_REAL = typeof Symbol === 'function' && Symbol.iterator;
const ITERATOR_SYMBOL_FAUX = '@@iterator';
const ITERATOR_SYMBOL = ITERATOR_SYMBOL_REAL || ITERATOR_SYMBOL_FAUX;

// Used for setting reserved keyword `delete` as named-property.
const DELETE = 'delete';

// A consistent shared value representing "not set" which equals nothing other
// than itself, and nothing that could be provided externally.
const NOT_SET = {};
const DONE = {};

// TODO consider removing these
const SHAPE_MAP = 'map';
const SHAPE_MAPORDERED = 'mapordered';
const SHAPE_RANGE = 'range';
const SHAPE_LIST = 'list';
const SHAPE_SET = 'set';
const SHAPE_SETORDERED = 'setordered';
const SHAPE_STACK = 'stack';
const SHAPE_NODELIST = 'nodeList';
const SHAPE_NODEVALUE = 'nodeValue';
const SHAPE_NODEARRAYMAP = 'nodeArrayMap';
const SHAPE_NODEHASHARRAYMAP = 'nodeHashArrayMap';
const SHAPE_NODEHASHCOLLISION = 'nodeHashCollision';
const SHAPE_NODEBITMAPINDEXED = 'nodeBitmapIndexed';

const ITERATE_TYPE_KEYS = 0;
const ITERATE_TYPE_VALUES = 1;
const ITERATE_TYPE_ENTRIES = 2;

export {
  ITERATE_TYPE_KEYS,
  ITERATE_TYPE_KEYS as ITERATE_KEYS,
  ITERATE_TYPE_VALUES,
  ITERATE_TYPE_VALUES as ITERATE_VALUES,
  ITERATE_TYPE_ENTRIES,
  ITERATE_TYPE_ENTRIES as ITERATE_ENTRIES,
  IS_COLLECTION_SYMBOL,
  IS_ORDERED_SYMBOL,
  IS_SET_SYMBOL,
  IS_LIST_SYMBOL,
  IS_INDEXED_SYMBOL,
  IS_RECORD_SYMBOL,
  IS_STACK_SYMBOL,
  IS_KEYED_SYMBOL,
  IS_MAP_SYMBOL,
  IS_SEQ_SYMBOL,
  ITERATOR_SYMBOL_REAL,
  ITERATOR_SYMBOL_FAUX,
  ITERATOR_SYMBOL,
  DELETE,
  NOT_SET,
  DONE,
  SHAPE_MAP,
  SHAPE_MAPORDERED,
  SHAPE_SET,
  SHAPE_SETORDERED,
  SHAPE_RANGE,
  SHAPE_LIST,
  SHAPE_STACK,
  SHAPE_NODELIST,
  SHAPE_NODEVALUE,
  SHAPE_NODEARRAYMAP,
  SHAPE_NODEHASHARRAYMAP,
  SHAPE_NODEHASHCOLLISION,
  SHAPE_NODEBITMAPINDEXED,
};
