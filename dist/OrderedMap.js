var ImmutableMap = require('./Map');


for(var ImmutableMap____Key in ImmutableMap){if(ImmutableMap.hasOwnProperty(ImmutableMap____Key)){OrderedMap[ImmutableMap____Key]=ImmutableMap[ImmutableMap____Key];}}var ____SuperProtoOfImmutableMap=ImmutableMap===null?null:ImmutableMap.prototype;OrderedMap.prototype=Object.create(____SuperProtoOfImmutableMap);OrderedMap.prototype.constructor=OrderedMap;OrderedMap.__superConstructor__=ImmutableMap;

  // @pragma Construction

  function OrderedMap(object) {"use strict";
    if (!object) {
      return OrderedMap.empty();
    }
    return OrderedMap.fromObject(object);
  }

  OrderedMap.empty=function() {"use strict";
    return __EMPTY_ORDERED_MAP || (__EMPTY_ORDERED_MAP = OrderedMap.$OrderedMap_make());
  };

  OrderedMap.fromObject=function(object) {"use strict";
    var omap = OrderedMap.empty().asMutable();
    for (var k in object) if (object.hasOwnProperty(k)) {
      omap = omap.set(k, object[k]);
    }
    return omap.asImmutable();
  };

  OrderedMap.prototype.toString=function() {"use strict";
    return this.__toString('OrderedMap {', '}');
  };

  // @pragma Access

  OrderedMap.prototype.has=function(k) {"use strict";
    return this.get(k, __SENTINEL) !== __SENTINEL;
  };

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
    if (this.$OrderedMap_ownerID) {
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
      newVector = require('./Vector').empty();
      newMap = ImmutableMap.empty();
      if (this.isMutable()) {
        newVector = newVector.asMutable();
        newMap = newMap.asMutable();
      }
      newVector = newVector.set(0, [k, v]);
      newMap = newMap.set(k, 0);
    }
    if (this.$OrderedMap_ownerID) {
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
    if (this.$OrderedMap_ownerID) {
      this.length = newMap.length;
      this.$OrderedMap_map = newMap;
      this.$OrderedMap_vector = newVector;
      return this;
    }
    return newMap === this.$OrderedMap_map ? this : OrderedMap.$OrderedMap_make(newMap, newVector);
  };

  // @pragma Mutability

  OrderedMap.prototype.asImmutable=function() {"use strict";
    this.$OrderedMap_ownerID = undefined;
    this.$OrderedMap_map = this.$OrderedMap_map.asImmutable();
    this.$OrderedMap_vector = this.$OrderedMap_vector.asImmutable();
    return this;
  };

  OrderedMap.prototype.asMutable=function() {"use strict";
    return this.$OrderedMap_ownerID ? this : OrderedMap.$OrderedMap_make(this.$OrderedMap_map && this.$OrderedMap_map.asMutable(), this.$OrderedMap_vector && this.$OrderedMap_vector.asMutable(), new OwnerID());
  };

  OrderedMap.prototype.clone=function() {"use strict";
    return this.isMutable() ? this.$OrderedMap_clone() : this;
  };

  OrderedMap.prototype.$OrderedMap_clone=function() {"use strict";
    return OrderedMap.$OrderedMap_make(this.$OrderedMap_map && this.$OrderedMap_map.clone(), this.$OrderedMap_vector && this.$OrderedMap_vector.clone(), this.$OrderedMap_ownerID && new OwnerID());
  };

  // @pragma Iteration

  OrderedMap.prototype.__deepEqual=function(other) {"use strict";
    if (other.length === 0 && this.length === 0) {
      return true;
    }
    var is = require('./Immutable').is;
    var iterator = this.$OrderedMap_vector.__iterator__();
    return other.every(function(v, k)  {
      var entry = iterator.next();
      entry && (entry = entry[1]);
      return entry && is(k, entry[0]) && is(v, entry[1]);
    });
  };

  OrderedMap.prototype.__iterate=function(fn, reverse) {"use strict";
    // TODO: anyway to use fromEntries() ?
    return this.$OrderedMap_vector ? this.$OrderedMap_vector.__iterate(function(entry)  {return fn(entry[1], entry[0]);}, reverse) : 0;
  };

  // @pragma Private

  OrderedMap.$OrderedMap_make=function(map, vector, ownerID) {"use strict";
    var omap = Object.create(OrderedMap.prototype);
    omap.length = map ? map.length : 0;
    omap.$OrderedMap_map = map;
    omap.$OrderedMap_vector = vector;
    omap.$OrderedMap_ownerID = ownerID;
    return omap;
  };




  function OwnerID() {"use strict";}



var __SENTINEL = {};
var __EMPTY_ORDERED_MAP;

module.exports = OrderedMap;
