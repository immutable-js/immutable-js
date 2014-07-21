var Sequence = require('./Sequence').Sequence;
var IndexedSequence = require('./Sequence').IndexedSequence;


for(var Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){Set[Sequence____Key]=Sequence[Sequence____Key];}}var ____SuperProtoOfSequence=Sequence===null?null:Sequence.prototype;Set.prototype=Object.create(____SuperProtoOfSequence);Set.prototype.constructor=Set;Set.__superConstructor__=Sequence;

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
    return Set.empty().withMutations(function(set)  {
      for (var ii = 0; ii < values.length; ii++) {
        set.add(values[ii]);
      }
    });
  };

  Set.prototype.toString=function() {"use strict";
    return this.__toString('Set {', '}');
  };

  // @pragma Access

  Set.prototype.has=function(value) {"use strict";
    return this.$Set_map ? this.$Set_map.has(value) : false;
  };

  // @pragma Modification

  Set.prototype.clear=function() {"use strict";
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
      // Use Late Binding here to ensure no circular dependency.
      newMap = require('./Map').empty().__ensureOwner(this.$Set_ownerID);
    }
    newMap = newMap.set(value, null);
    if (this.$Set_ownerID) {
      this.length = newMap.length;
      this.$Set_map = newMap;
      return this;
    }
    return newMap === this.$Set_map ? this : Set.$Set_make(newMap);
  };

  Set.prototype.delete=function(value) {"use strict";
    if (value == null || this.$Set_map == null) {
      return this;
    }
    var newMap = this.$Set_map.delete(value);
    if (newMap.length === 0) {
      return this.clear();
    }
    if (this.$Set_ownerID) {
      this.length = newMap.length;
      this.$Set_map = newMap;
      return this;
    }
    return newMap === this.$Set_map ? this : Set.$Set_make(newMap);
  };

  // @pragma Composition

  Set.prototype.merge=function(seq) {"use strict";
    if (seq == null) {
      return this;
    }
    return this.withMutations(function(set)  {
      Sequence(seq).forEach(function(value)  {return set.add(value);})
    });
  };

  // @pragma Mutability

  Set.prototype.withMutations=function(fn) {"use strict";
    // Note: same impl as Map
    var mutable = this.__ensureOwner(this.$Set_ownerID || new OwnerID());
    fn(mutable);
    return mutable.__ensureOwner(this.$Set_ownerID);
  };

  Set.prototype.__ensureOwner=function(ownerID) {"use strict";
    if (ownerID === this.$Set_ownerID) {
      return this;
    }
    var newMap = this.$Set_map && this.$Set_map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.$Set_ownerID = ownerID;
      this.$Set_map = newMap;
      return this;
    }
    return Set.$Set_make(newMap, ownerID);
  };

  // @pragma Iteration

  Set.prototype.toSet=function() {"use strict";
    // Note: identical impl to Map.toMap
    return this;
  };

  Set.prototype.cacheResult=function() {"use strict";
    return this;
  };

  Set.prototype.__deepEquals=function(other) {"use strict";
    return !(this.$Set_map || other.$Set_map) || this.$Set_map.equals(other.$Set_map);
  };

  Set.prototype.__iterate=function(fn, reverse) {"use strict";
    var collection = this;
    return this.$Set_map ? this.$Set_map.__iterate(function(_, k)  {return fn(k, k, collection);}, reverse) : 0;
  };

  // @pragma Private

  Set.$Set_make=function(map, ownerID) {"use strict";
    var set = Object.create(Set.prototype);
    set.length = map ? map.length : 0;
    set.$Set_map = map;
    set.$Set_ownerID = ownerID;
    return set;
  };


Set.prototype.toJS = Sequence.prototype.toArray;

Set.prototype.__toStringMapper = IndexedSequence.prototype.__toStringMapper;



  function OwnerID() {"use strict";}


var __EMPTY_SET;

module.exports = Set;
