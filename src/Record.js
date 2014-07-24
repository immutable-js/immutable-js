var Sequence = require('./Sequence').Sequence;
var ImmutableMap = require('./Map');


class Record extends Sequence {

  constructor(defaultValues, name) {
    var RecordType = function(values) {
      this._map = ImmutableMap(values);
    };
    RecordType.prototype = Object.create(Record.prototype);
    RecordType.prototype.constructor = RecordType;
    RecordType.prototype._name = name;
    RecordType.prototype._defaultValues = defaultValues;

    var keys = Object.keys(defaultValues);
    RecordType.prototype.length = keys.length;
    keys.forEach(key => {
      Object.defineProperty(RecordType.prototype, key, {
        get: function() {
          return this.get(key);
        },
        set: function(value) {
          if (!this.__ownerID) {
            throw new Error('Cannot set on an immutable record.');
          }
          this.set(key, value);
        }
      });
    });

    return RecordType;
  }

  toString() {
    return this.__toString((this._name || 'Record') + ' {', '}');
  }

  // @pragma Access

  has(k) {
    return this._defaultValues.hasOwnProperty(k);
  }

  get(k, undefinedValue) {
    if (undefinedValue !== undefined && !this.has(k)) {
      return undefinedValue;
    }
    return this._map.get(k, this._defaultValues[k]);
  }

  // @pragma Modification

  clear() {
    if (this.__ownerID) {
      this._map.clear();
      return this;
    }
    return this._empty();
  }

  set(k, v) {
    if (k == null || !this.has(k)) {
      return this;
    }
    if (this.__ownerID) {
      this._map.set(k, v);
      return this;
    }
    var newMap = this._map.set(k, v);
    if (newMap === this._map) {
      return this;
    }
    return this._make(newMap);
  }

  delete(k) {
    return this.set(k, this._defaultValues[k]);
  }

  // @pragma Mutability

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
    return this._make(newMap, ownerID);
  }

  // @pragma Iteration

  __iterate(fn, reverse) {
    var record = this;
    return Sequence(this._defaultValues).map((_, k) => record.get(k)).__iterate(fn, reverse);
  }

  _empty() {
    var Record = Object.getPrototypeOf(this).constructor;
    return Record._empty || (Record._empty = this._make(ImmutableMap.empty()));
  }

  _make(map, ownerID) {
    var record = Object.create(Object.getPrototypeOf(this));
    record._map = map;
    record.__ownerID = ownerID;
    return record;
  }
}

Record.prototype.__deepEqual = ImmutableMap.prototype.__deepEqual;
Record.prototype.merge = ImmutableMap.prototype.merge;
Record.prototype.mergeWith = ImmutableMap.prototype.mergeWith;
Record.prototype.mergeDeep = ImmutableMap.prototype.mergeDeep;
Record.prototype.mergeDeepWith = ImmutableMap.prototype.mergeDeepWith;
Record.prototype.withMutations = ImmutableMap.prototype.withMutations;
Record.prototype.updateIn = ImmutableMap.prototype.updateIn;


module.exports = Record;
