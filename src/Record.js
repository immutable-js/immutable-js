/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

import "Sequence"
import "Map"
import "invariant"
/* global Sequence, Map, MapPrototype, invariant */
/* exported Record */


class Record extends Sequence {

  constructor(defaultValues, name) {
    var RecordType = function(values) {
      this._map = Map(values);
    };
    defaultValues = Sequence(defaultValues);
    var RecordTypePrototype = RecordType.prototype = Object.create(RecordPrototype);
    RecordTypePrototype.constructor = RecordType;
    RecordTypePrototype._name = name;
    RecordTypePrototype._defaultValues = defaultValues;

    var keys = Object.keys(defaultValues);
    RecordType.prototype.length = keys.length;
    if (Object.defineProperty) {
      defaultValues.forEach((_, key) => {
        Object.defineProperty(RecordType.prototype, key, {
          get: function() {
            return this.get(key);
          },
          set: function(value) {
            invariant(this.__ownerID, 'Cannot set on an immutable record.');
            this.set(key, value);
          }
        });
      });
    }

    return RecordType;
  }

  toString() {
    return this.__toString((this._name || 'Record') + ' {', '}');
  }

  // @pragma Access

  has(k) {
    return this._defaultValues.has(k);
  }

  get(k, undefinedValue) {
    if (undefinedValue !== undefined && !this.has(k)) {
      return undefinedValue;
    }
    return this._map.get(k, this._defaultValues.get(k));
  }

  // @pragma Modification

  clear() {
    if (this.__ownerID) {
      this._map.clear();
      return this;
    }
    var Record = Object.getPrototypeOf(this).constructor;
    return Record._empty || (Record._empty = makeRecord(this, Map.empty()));
  }

  set(k, v) {
    if (k == null || !this.has(k)) {
      return this;
    }
    var newMap = this._map.set(k, v);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return makeRecord(this, newMap);
  }

  delete(k) {
    if (k == null || !this.has(k)) {
      return this;
    }
    var newMap = this._map.delete(k);
    if (this.__ownerID || newMap === this._map) {
      return this;
    }
    return makeRecord(this, newMap);
  }

  __iterate(fn, reverse) {
    var record = this;
    return this._defaultValues.map((_, k) => record.get(k)).__iterate(fn, reverse);
  }

  __ensureOwner(ownerID) {
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this._map && this._map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this._map = newMap;
      return this;
    }
    return makeRecord(this, newMap, ownerID);
  }
}

var RecordPrototype = Record.prototype;
RecordPrototype.__deepEqual = MapPrototype.__deepEqual;
RecordPrototype.merge = MapPrototype.merge;
RecordPrototype.mergeWith = MapPrototype.mergeWith;
RecordPrototype.mergeDeep = MapPrototype.mergeDeep;
RecordPrototype.mergeDeepWith = MapPrototype.mergeDeepWith;
RecordPrototype.update = MapPrototype.update;
RecordPrototype.updateIn = MapPrototype.updateIn;
RecordPrototype.cursor = MapPrototype.cursor;
RecordPrototype.withMutations = MapPrototype.withMutations;
RecordPrototype.asMutable = MapPrototype.asMutable;
RecordPrototype.asImmutable = MapPrototype.asImmutable;


function makeRecord(likeRecord, map, ownerID) {
  var record = Object.create(Object.getPrototypeOf(likeRecord));
  record._map = map;
  record.__ownerID = ownerID;
  return record;
}
