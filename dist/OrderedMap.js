var ImmutableMap = require('./Map');


for(var ImmutableMap____Key in ImmutableMap){if(ImmutableMap.hasOwnProperty(ImmutableMap____Key)){OrderedMap[ImmutableMap____Key]=ImmutableMap[ImmutableMap____Key];}}var ____SuperProtoOfImmutableMap=ImmutableMap===null?null:ImmutableMap.prototype;OrderedMap.prototype=Object.create(____SuperProtoOfImmutableMap);OrderedMap.prototype.constructor=OrderedMap;OrderedMap.__superConstructor__=ImmutableMap;

  // @pragma Construction

  function OrderedMap(sequence) {"use strict";
    if (sequence && sequence.constructor === OrderedMap) {
      return sequence;
    }
    if (!sequence || sequence.length === 0) {
      return OrderedMap.empty();
    }
    return OrderedMap.empty().merge(sequence);
  }

  OrderedMap.empty=function() {"use strict";
    return __EMPTY_ORDERED_MAP || (__EMPTY_ORDERED_MAP = OrderedMap.$OrderedMap_make());
  };

  OrderedMap.prototype.toString=function() {"use strict";
    return this.__toString('OrderedMap {', '}');
  };

  // @pragma Access

  OrderedMap.prototype.get=function(k, undefinedValue) {"use strict";
    if (k != null && this.$OrderedMap_map) {
      var index = this.$OrderedMap_map.get(k);
      if (index != null) {
        return this.$OrderedMap_vector.get(index)[1];
      }
    }
    return undefinedValue;
  };

  // @pragma Modification

  OrderedMap.prototype.clear=function() {"use strict";
    if (this.__ownerID) {
      this.length = 0;
      this.$OrderedMap_map = this.$OrderedMap_vector = null;
      return this;
    }
    return OrderedMap.empty();
  };

  OrderedMap.prototype.set=function(k, v) {"use strict";
    if (k == null) {
      return this;
    }
    var newMap = this.$OrderedMap_map;
    var newVector = this.$OrderedMap_vector;
    if (newMap) {
      var index = newMap.get(k);
      if (index == null) {
        newMap = newMap.set(k, newVector.length);
        newVector = newVector.push([k, v]);
      } else if (newVector.get(index)[1] !== v) {
        newVector = newVector.set(index, [k, v]);
      }
    } else {
      newVector = require('./Vector').empty().__ensureOwner(this.__ownerID).set(0, [k, v]);
      newMap = ImmutableMap.empty().__ensureOwner(this.__ownerID).set(k, 0);
    }
    if (this.__ownerID) {
      this.length = newMap.length;
      this.$OrderedMap_map = newMap;
      this.$OrderedMap_vector = newVector;
      return this;
    }
    return newVector === this.$OrderedMap_vector ? this : OrderedMap.$OrderedMap_make(newMap, newVector);
  };

  OrderedMap.prototype.delete=function(k) {"use strict";
    if (k == null || this.$OrderedMap_map == null) {
      return this;
    }
    var index = this.$OrderedMap_map.get(k);
    if (index == null) {
      return this;
    }
    var newMap = this.$OrderedMap_map.delete(k);
    var newVector = this.$OrderedMap_vector.delete(index);

    if (newMap.length === 0) {
      return this.clear();
    }
    if (this.__ownerID) {
      this.length = newMap.length;
      this.$OrderedMap_map = newMap;
      this.$OrderedMap_vector = newVector;
      return this;
    }
    return newMap === this.$OrderedMap_map ? this : OrderedMap.$OrderedMap_make(newMap, newVector);
  };

  // @pragma Mutability

  OrderedMap.prototype.__ensureOwner=function(ownerID) {"use strict";
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this.$OrderedMap_map && this.$OrderedMap_map.__ensureOwner(ownerID);
    var newVector = this.$OrderedMap_vector && this.$OrderedMap_vector.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this.$OrderedMap_map = newMap;
      this.$OrderedMap_vector = newVector;
      return this;
    }
    return OrderedMap.$OrderedMap_make(newMap, newVector, ownerID);
  };


  // @pragma Iteration

  OrderedMap.prototype.__deepEqual=function(other) {"use strict";
    var is = require('./Immutable').is;
    var iterator = this.$OrderedMap_vector.__iterator__();
    return other.every(function(v, k)  {
      var entry = iterator.next();
      entry && (entry = entry[1]);
      return entry && is(k, entry[0]) && is(v, entry[1]);
    });
  };

  OrderedMap.prototype.__iterate=function(fn, reverse) {"use strict";
    return this.$OrderedMap_vector ? this.$OrderedMap_vector.fromEntries().__iterate(fn, reverse) : 0;
  };

  // @pragma Private

  OrderedMap.$OrderedMap_make=function(map, vector, ownerID) {"use strict";
    var omap = Object.create(OrderedMap.prototype);
    omap.length = map ? map.length : 0;
    omap.$OrderedMap_map = map;
    omap.$OrderedMap_vector = vector;
    omap.__ownerID = ownerID;
    return omap;
  };


OrderedMap.from = OrderedMap;


var __EMPTY_ORDERED_MAP;

module.exports = OrderedMap;
