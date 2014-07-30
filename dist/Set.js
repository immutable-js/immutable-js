/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

var SequenceModule = require('./Sequence');
var ImmutableMap = require('./Map');
var Sequence = SequenceModule.Sequence;
var IndexedSequence = SequenceModule.IndexedSequence;


for(var Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){Set[Sequence____Key]=Sequence[Sequence____Key];}}var ____SuperProtoOfSequence=Sequence===null?null:Sequence.prototype;Set.prototype=Object.create(____SuperProtoOfSequence);Set.prototype.constructor=Set;Set.__superConstructor__=Sequence;

  // @pragma Construction

  function Set() {"use strict";var values=Array.prototype.slice.call(arguments,0);
    return Set.from(values);
  }

  Set.empty=function() {"use strict";
    return __EMPTY_SET || (__EMPTY_SET = Set.$Set_make());
  };

  Set.from=function(sequence) {"use strict";
    if (sequence && sequence.constructor === Set) {
      return sequence;
    }
    if (!sequence || sequence.length === 0) {
      return Set.empty();
    }
    return Set.empty().union(sequence);
  };

  Set.fromKeys=function(sequence) {"use strict";
    return Set.from(Sequence(sequence).flip());
  };

  Set.prototype.toString=function() {"use strict";
    return this.__toString('Set {', '}');
  };

  // @pragma Access

  Set.prototype.has=function(value) {"use strict";
    return this.$Set_map ? this.$Set_map.has(value) : false;
  };

  Set.prototype.get=function(value, notFoundValue) {"use strict";
    return this.has(value) ? value : notFoundValue;
  };

  // @pragma Modification

  Set.prototype.add=function(value) {"use strict";
    if (value == null) {
      return this;
    }
    var newMap = this.$Set_map;
    if (!newMap) {
      newMap = ImmutableMap.empty().__ensureOwner(this.__ownerID);
    }
    newMap = newMap.set(value, null);
    if (this.__ownerID) {
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
    if (this.__ownerID) {
      this.length = newMap.length;
      this.$Set_map = newMap;
      return this;
    }
    return newMap === this.$Set_map ? this : Set.$Set_make(newMap);
  };

  Set.prototype.clear=function() {"use strict";
    if (this.__ownerID) {
      this.length = 0;
      this.$Set_map = null;
      return this;
    }
    return Set.empty();
  };

  // @pragma Composition

  Set.prototype.union=function() {"use strict";
    var seqs = arguments;
    if (seqs.length === 0) {
      return this;
    }
    return this.withMutations(function(set)  {
      for (var ii = 0; ii < seqs.length; ii++) {
        var seq = seqs[ii];
        seq = seq.forEach ? seq : Sequence(seq);
        seq.forEach(function(value)  {return set.add(value);});
      }
    });
  };

  Set.prototype.intersect=function() {"use strict";var seqs=Array.prototype.slice.call(arguments,0);
    if (seqs.length === 0) {
      return this;
    }
    seqs = seqs.map(function(seq)  {return Sequence(seq);});
    var originalSet = this;
    return this.withMutations(function(set)  {
      originalSet.forEach(function(value)  {
        if (!seqs.every(function(seq)  {return seq.contains(value);})) {
          set.delete(value);
        }
      });
    });
  };

  Set.prototype.subtract=function() {"use strict";var seqs=Array.prototype.slice.call(arguments,0);
    if (seqs.length === 0) {
      return this;
    }
    seqs = seqs.map(function(seq)  {return Sequence(seq);});
    var originalSet = this;
    return this.withMutations(function(set)  {
      originalSet.forEach(function(value)  {
        if (seqs.some(function(seq)  {return seq.contains(value);})) {
          set.delete(value);
        }
      });
    });
  };

  Set.prototype.isSubset=function(seq) {"use strict";
    seq = Sequence(seq);
    return this.every(function(value)  {return seq.contains(value);});
  };

  Set.prototype.isSuperset=function(seq) {"use strict";
    var set = this;
    seq = Sequence(seq);
    return seq.every(function(value)  {return set.contains(value);});
  };

  // @pragma Mutability

  Set.prototype.__ensureOwner=function(ownerID) {"use strict";
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this.$Set_map && this.$Set_map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this.$Set_map = newMap;
      return this;
    }
    return Set.$Set_make(newMap, ownerID);
  };

  // @pragma Iteration

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
    set.__ownerID = ownerID;
    return set;
  };


Set.prototype.contains = Set.prototype.has;
Set.prototype.withMutations = ImmutableMap.prototype.withMutations;
Set.prototype.__toJS = IndexedSequence.prototype.__toJS;
Set.prototype.__toStringMapper = IndexedSequence.prototype.__toStringMapper;


var __EMPTY_SET;

module.exports = Set;
