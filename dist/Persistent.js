var Sequence = require('./Sequence').Sequence;
var IndexedSequence = require('./Sequence').IndexedSequence;
var Range = require('./Range');
var Vector = require('./Vector');
var PersistentMap = require('./Map');
var PersistentSet = require('./Set');


/**
 * The same semantics as Object.is(), but treats immutable sequences as
 * data, equal when the structure contains equivalent data.
 */
function is(first, second) {
  if (first === second) {
    return first !== 0 || second !== 0 || 1 / first === 1 / second;
  }
  if (first !== first) {
    return second !== second;
  }
  if (first instanceof Sequence) {
    return first.equals(second) === true;
  }
  return false;
}

function fromJS(json) {
  if (Array.isArray(json)) {
    return Sequence(json).map(fromJS).toVector();
  }
  if (typeof json === 'object') {
    return Sequence(json).map(fromJS).toMap();
  }
  return json;
}

function toJS(value) {
  if (value instanceof IndexedSequence || value instanceof PersistentSet) {
    return value.map(toJS).toArray();
  }
  if (value instanceof Sequence) {
    return value.map(toJS).toObject();
  }
  return value;
}

module.exports = {
  is: is,
  fromJS: fromJS,
  toJS: toJS,
  Sequence: Sequence,
  Range: Range,
  Vector: Vector,
  Map: PersistentMap,
  Set: PersistentSet,
};
