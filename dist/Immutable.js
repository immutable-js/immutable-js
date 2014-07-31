/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

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

function fromJS(json, converter) {
  if (converter) {
    return fromJSWith(converter, json, '', {'': json});
  }
  return fromJSDefault(json);
}

function fromJSDefault(json) {
  if (json) {
    if (Array.isArray(json)) {
      return Sequence(json).map(fromJSDefault).toVector();
    }
    if (json.constructor === Object) {
      return Sequence(json).map(fromJSDefault).toMap();
    }
  }
  return json;
}

function fromJSWith(converter, json, key, parentJSON) {
  if (json && (Array.isArray(json) || json.constructor === Object)) {
    return converter.call(parentJSON, key, Sequence(json).map(function(v, k)  {return fromJSWith(converter, v, k, json);}));
  }
  return json;
}

exports.is = is;
exports.fromJS = fromJS;
exports.Sequence = Sequence;
exports.Range = Range;
exports.Repeat = Repeat;
exports.Vector = Vector;
exports.Map = ImmutableMap;
exports.OrderedMap = OrderedMap;
exports.Set = ImmutableSet;
exports.Record = Record;
