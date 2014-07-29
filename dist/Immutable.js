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

function fromJSON(json, converter) {
  if (converter) {
    var parentJSON = {'': json};
    return fromJSONWith(converter, json, '', parentJSON);
  }
  return fromJSONDefault(json);
}

function fromJSONDefault(json) {
  if (json) {
    if (Array.isArray(json)) {
      return Sequence(json).map(fromJSONDefault).toVector();
    }
    if (json.constructor === Object) {
      return Sequence(json).map(fromJSONDefault).toMap();
    }
  }
  return json;
}

function fromJSONWith(converter, json, key, parentJSON) {
  if (json && (Array.isArray(json) || json.constructor === Object)) {
    return converter.call(parentJSON, key, Sequence(json).map(function(v, k)  {return fromJSONWith(converter, v, k, json);}));
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
