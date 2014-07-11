var ImmutableMap = require('./Map');


class OrderedMap extends ImmutableMap {

  // @pragma Construction

  constructor(object) {
    if (!object) {
      return OrderedMap.empty();
    }
    return OrderedMap.fromObject(object);
  }

  static empty() {
    return __EMPTY_ORDERED_MAP || (__EMPTY_ORDERED_MAP = OrderedMap._make());
  }

  static fromObject(object) {
    var omap = OrderedMap.empty().asMutable();
    for (var k in object) if (object.hasOwnProperty(k)) {
      omap = omap.set(k, object[k]);
    }
    return omap.asImmutable();
  }

  toString() {
    return this.__toString('OrderedMap {', '}');
  }

  // @pragma Access

  has(k) {
    return this.get(k, __SENTINEL) !== __SENTINEL;
  }

  get(k, undefinedValue) {
    if (k != null && this._map) {
      var index = this._map.get(k);
      if (index != null) {
        return this._vector.get(index)[1];
      }
    }
    return undefinedValue;
  }

  // @pragma Modification

  clear() {
    if (this._ownerID) {
      this.length = 0;
      this._map = this._vector = null;
      return this;
    }
    return OrderedMap.empty();
  }

  set(k, v) {
    if (k == null) {
      return this;
    }
    var newMap = this._map;
    var newVector = this._vector;
    if (newMap) {
      var index = newMap.get(k);
      if (index == null) {
        newMap = newMap.set(k, newVector.length);
        newVector = newVector.push([k, v]);
      } else if (newVector.get(index)[1] !== v) {
        newVector = newVector.set(index, [k, v]);
      }
    } else {
      newVector = require('./Vector').empty();
      newMap = ImmutableMap.empty();
      if (this.isMutable()) {
        newVector = newVector.asMutable();
        newMap = newMap.asMutable();
      }
      newVector = newVector.set(0, [k, v]);
      newMap = newMap.set(k, 0);
    }
    if (this._ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return newVector === this._vector ? this : OrderedMap._make(newMap, newVector);
  }

  delete(k) {
    if (k == null || this._map == null) {
      return this;
    }
    var index = this._map.get(k);
    if (index == null) {
      return this;
    }
    var newMap = this._map.delete(k);
    var newVector = this._vector.delete(index);

    if (newMap.length === 0) {
      return this.clear();
    }
    if (this._ownerID) {
      this.length = newMap.length;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return newMap === this._map ? this : OrderedMap._make(newMap, newVector);
  }

  // @pragma Mutability

  asImmutable() {
    this._ownerID = undefined;
    this._map = this._map.asImmutable();
    this._vector = this._vector.asImmutable();
    return this;
  }

  asMutable() {
    return this._ownerID ? this : OrderedMap._make(this._map && this._map.asMutable(), this._vector && this._vector.asMutable(), new OwnerID());
  }

  clone() {
    return this.isMutable() ? this._clone() : this;
  }

  _clone() {
    return OrderedMap._make(this._map && this._map.clone(), this._vector && this._vector.clone(), this._ownerID && new OwnerID());
  }

  // @pragma Iteration

  __deepEqual(other) {
    if (other.length === 0 && this.length === 0) {
      return true;
    }
    var is = require('./Immutable').is;
    var iterator = this._vector.__iterator__();
    return other.every((v, k) => {
      var entry = iterator.next();
      entry && (entry = entry[1]);
      return entry && is(k, entry[0]) && is(v, entry[1]);
    });
  }

  __iterate(fn, reverse) {
    // TODO: anyway to use fromEntries() ?
    return this._vector ? this._vector.__iterate(entry => fn(entry[1], entry[0]), reverse) : 0;
  }

  // @pragma Private

  static _make(map, vector, ownerID) {
    var omap = Object.create(OrderedMap.prototype);
    omap.length = map ? map.length : 0;
    omap._map = map;
    omap._vector = vector;
    omap._ownerID = ownerID;
    return omap;
  }
}


class OwnerID {
  constructor() {}
}


var __SENTINEL = {};
var __EMPTY_ORDERED_MAP;

module.exports = OrderedMap;
