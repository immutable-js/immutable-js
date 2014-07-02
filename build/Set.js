var LazyIterable = require('./LazyIterable');
var Map = require('./Map');


for(var LazyIterable____Key in LazyIterable){if(LazyIterable.hasOwnProperty(LazyIterable____Key)){Set[LazyIterable____Key]=LazyIterable[LazyIterable____Key];}}var ____SuperProtoOfLazyIterable=LazyIterable===null?null:LazyIterable.prototype;Set.prototype=Object.create(____SuperProtoOfLazyIterable);Set.prototype.constructor=Set;Set.__superConstructor__=LazyIterable;

  // @pragma Construction

  function Set() {"use strict";
    return Set.fromArray(arguments);
  }

  Set.empty=function() {"use strict";
    return __EMPTY_SET || (__EMPTY_SET = Set.$Set_make());
  };

  Set.fromArray=function(values) {"use strict";
    if (values.length === 0) {
      return Set.empty();
    }
    var set = Set.empty().asTransient();
    for (var ii = 0; ii < values.length; ii++) {
      set.add(values[ii]);
    }
    return set.asPersistent();
  };

  // @pragma Access

  Set.prototype.has=function(value) {"use strict";
    return this.$Set_map ? this.$Set_map.has(value) : false;
  };

  // @pragma Modification

  // ES6 calls this "clear"
  Set.prototype.empty=function() {"use strict";
    if (this.$Set_ownerID) {
      this.length = 0;
      this.$Set_map = null;
      return this;
    }
    return Set.empty();
  };

  Set.prototype.add=function(value) {"use strict";
    if (value == null) {
      return this;
    }
    var newMap = this.$Set_map;
    if (!newMap) {
      newMap = Map.empty();
      if (this.isTransient()) {
        newMap = newMap.asTransient();
      }
    }
    newMap = newMap.set(value, null);
    if (newMap === this.$Set_map) {
      return this;
    }
    if (this.$Set_ownerID) {
      this.length = newMap.length;
      this.$Set_map = newMap;
      return this;
    }
    return Set.$Set_make(newMap);
  };

  Set.prototype.delete=function(value) {"use strict";
    if (value == null || this.$Set_map == null) {
      return this;
    }
    var newMap = this.$Set_map.delete(value);
    if (newMap === this.$Set_map) {
      return this;
    }
    if (this.$Set_ownerID) {
      this.length = newMap.length;
      this.$Set_map = newMap;
      return this;
    }
    return newMap.length ? Set.$Set_make(newMap) : Set.empty();
  };

  Set.prototype.equals=function(other) {"use strict";
    if (this === other) {
      return true;
    }
    if (other instanceof Set) {
      return this.$Set_map.equals(other.$Set_map);
    }
    return false;
  };

  // @pragma Composition

  Set.prototype.merge=function(seq) {"use strict";
    var newSet = this.asTransient();
    seq.iterate(function(value)  {return newSet.add(value);});
    return this.isTransient() ? newSet : newSet.asPersistent();
  };

  // @pragma Mutability

  Set.prototype.isTransient=function() {"use strict";
    return !!this.$Set_ownerID;
  };

  Set.prototype.asTransient=function() {"use strict";
    // TODO: ensure same owner.
    return this.$Set_ownerID ? this : Set.$Set_make(this.$Set_map && this.$Set_map.asTransient(), new OwnerID());
  };

  Set.prototype.asPersistent=function() {"use strict";
    this.$Set_ownerID = undefined;
    this.$Set_map = this.$Set_map.asPersistent();
    return this;
  };

  Set.prototype.clone=function() {"use strict";
    // TODO: this doesn't appropriately clone the _map and ensure same owner.
    return Set.$Set_make(this.$Set_map.clone(), this.$Set_ownerID && new OwnerID());
  };

  // @pragma Iteration

  Set.prototype.iterate=function(fn) {"use strict";
    if (!this.$Set_map) {
      return true;
    }
    var collection = this;
    return this.$Set_map.iterate(function ($Set_, key) {
      return fn(key, key, collection);
    });
  };

  // @pragma Private

  Set.$Set_make=function(map, ownerID) {"use strict";
    var set = Object.create(Set.prototype);
    set.length = map ? map.length : 0;
    set.$Set_map = map;
    set.$Set_ownerID = ownerID;
    return set;
  };



  function OwnerID() {"use strict";}


var __SENTINEL = {};
var __EMPTY_SET;

module.exports = Set;
