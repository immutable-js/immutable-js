var LazySequence = require('./LazySequence');
var LazyArraySequence = require('./LazyArraySequence');
var LazyObjectSequence = require('./LazyObjectSequence');
var Map = require('./Map');
var Vector = require('./Vector');
var Set = require('./Set');

/**
 * The same semantics as Object.is(), but treats persistent data structures as
 * data, equal when the structure contains equivalent data.
 */
function is(first, second) {
  if (first === second) {
    return first !== 0 || second !== 0 || 1 / first === 1 / second;
  }
  if (first !== first) {
    return second !== second;
  }
  if (isPersistent(first)) {
    return first.equals(second);
  }
  return false;
}

function isPersistent(value) {
  return value instanceof Map || value instanceof Vector || value instanceof Set;
}

function isLazy(value) {
  return value instanceof LazySequence;
}

function lazy(value) {
  if (isLazy(value)) {
    return value;
  }
  if (Array.isArray(value)) {
    return new LazyArraySequence(value);
  }
  if (typeof value === 'object') {
    return new LazyObjectSequence(value);
  }
  return null;
}

function fromJS(json) {
  if (Array.isArray(json)) {
    var vect = Vector.empty();
    json.forEach(function(v, k)  {
      vect.set(k, fromJS(v));
    });
    return vect;
  }
  if (typeof json === 'object') {
    var map = Map.empty();
    for (var k in json) {
      if (json.hasOwnProperty(k)) {
        map.set(k, fromJS(json[k]));
      }
    }
    return map;
  }
  return json;
}

function toJS(value) {
  if (value instanceof Vector) {
    var array = value.map(toJS).toArray();
    array.length = value.length;
    return array;
  }
  if (value instanceof Map) {
    return value.map(toJS).toObject();
  }
  if (value instanceof Set) {
    return value.map(toJS).toArray();
  }
  return value;
}

module.exports = {
  is: is,
  isPersistent: isPersistent,
  isLazy: isLazy,
  lazy: lazy,
  fromJS: fromJS,
  toJS: toJS,
  LazySequence: LazySequence,
  LazyArraySequence: LazyArraySequence,
  LazyObjectSequence: LazyObjectSequence,
  Map: Map,
  Vector: Vector,
  Set: Set,
};
