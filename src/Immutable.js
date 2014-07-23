var Sequence = require('./Sequence').Sequence;
var ImmutableMap = require('./Map');
var OrderedMap = require('./OrderedMap');
var ImmutableSet = require('./Set');
var Vector = require('./Vector');
var Range = require('./Range');
var Repeat = require('./Repeat');


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
  if (!(value instanceof Sequence)) {
    return value;
  }
  return value.map(toJS).toJS();
}

module.exports = {
  is: is,
  fromJS: fromJS,
  toJS: toJS,
  Sequence: Sequence,
  Range: Range,
  Repeat: Repeat,
  Vector: Vector,
  Map: ImmutableMap,
  OrderedMap: OrderedMap,
  Set: ImmutableSet,
};
