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
    return OrderedMap.empty().withMutations(omap => {
      for (var k in object) if (object.hasOwnProperty(k)) {
        omap.set(k, object[k]);
      }
    });
  }

  toString() {
    return this.__toString('OrderedMap {', '}');
  }

  // @pragma Access

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
      newVector = require('./Vector').empty().__ensureOwner(this._ownerID).set(0, [k, v]);
      newMap = ImmutableMap.empty().__ensureOwner(this._ownerID).set(k, 0);
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

  withMutations(fn) {
    // Note: same impl as Map
    var mutable = this.__ensureOwner(this._ownerID || new OwnerID());
    fn(mutable);
    return mutable.__ensureOwner(this._ownerID);
  }

  __ensureOwner(ownerID) {
    if (ownerID === this._ownerID) {
      return this;
    }
    var newMap = this._map && this._map.__ensureOwner(ownerID);
    var newVector = this._vector && this._vector.__ensureOwner(ownerID);
    if (!ownerID) {
      this._ownerID = ownerID;
      this._map = newMap;
      this._vector = newVector;
      return this;
    }
    return OrderedMap._make(newMap, newVector, ownerID);
  }


  // @pragma Iteration

  toOrderedMap() {
    // Note: identical impl to Map.toMap
    return this;
  }

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


var __EMPTY_ORDERED_MAP;

module.exports = OrderedMap;
