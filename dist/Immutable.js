var Sequence = require('./Sequence').Sequence;
var ImmutableMap = require('./Map');
var OrderedMap = require('./OrderedMap');
var ImmutableSet = require('./Set');
var Vector = require('./Vector');
var Range = require('./Range');
var Repeat = require('./Repeat');
var Record = require('./Record');


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
    return first.equals(second);
  }
  return false;
}

function fromJSON(json) {
  if (Array.isArray(json)) {
    return Sequence(json).map(fromJSON).toVector();
  }
  if (typeof json === 'object') {
    return Sequence(json).map(fromJSON).toMap();
  }
  return json;
}


exports.is = is;
exports.fromJSON = fromJSON;
exports.Sequence = Sequence;
exports.Range = Range;
exports.Repeat = Repeat;
exports.Vector = Vector;
exports.Map = ImmutableMap;
exports.OrderedMap = OrderedMap;
exports.Set = ImmutableSet;
exports.Record = Record;
