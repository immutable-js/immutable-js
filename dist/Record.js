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


for(var Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){Record[Sequence____Key]=Sequence[Sequence____Key];}}var ____SuperProtoOfSequence=Sequence===null?null:Sequence.prototype;Record.prototype=Object.create(____SuperProtoOfSequence);Record.prototype.constructor=Record;Record.__superConstructor__=Sequence;

  function Record(defaultValues, name) {"use strict";
    var RecordType = function(values) {
      this.$Record_map = ImmutableMap(values);
    };
    defaultValues = Sequence(defaultValues);
    RecordType.prototype = Object.create(Record.prototype);
    RecordType.prototype.constructor = RecordType;
    RecordType.prototype.$Record_name = name;
    RecordType.prototype.$Record_defaultValues = defaultValues;

    var keys = Object.keys(defaultValues);
    RecordType.prototype.length = keys.length;
    if (Object.defineProperty) {
      defaultValues.forEach(function(_, key)  {
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
      }.bind(this));
    }

    return RecordType;
  }

  Record.prototype.toString=function() {"use strict";
    return this.__toString((this.$Record_name || 'Record') + ' {', '}');
  };

  // @pragma Access

  Record.prototype.has=function(k) {"use strict";
    return this.$Record_defaultValues.has(k);
  };

  Record.prototype.get=function(k, undefinedValue) {"use strict";
    if (undefinedValue !== undefined && !this.has(k)) {
      return undefinedValue;
    }
    return this.$Record_map.get(k, this.$Record_defaultValues.get(k));
  };

  // @pragma Modification

  Record.prototype.clear=function() {"use strict";
    if (this.__ownerID) {
      this.$Record_map.clear();
      return this;
    }
    return this.$Record_empty();
  };

  Record.prototype.set=function(k, v) {"use strict";
    if (k == null || !this.has(k)) {
      return this;
    }
    var newMap = this.$Record_map.set(k, v);
    if (this.__ownerID || newMap === this.$Record_map) {
      return this;
    }
    return this.$Record_make(newMap);
  };

  Record.prototype.delete=function(k) {"use strict";
    if (k == null || !this.has(k)) {
      return this;
    }
    var newMap = this.$Record_map.delete(k);
    if (this.__ownerID || newMap === this.$Record_map) {
      return this;
    }
    return this.$Record_make(newMap);
  };

  // @pragma Mutability

  Record.prototype.__ensureOwner=function(ownerID) {"use strict";
    if (ownerID === this.__ownerID) {
      return this;
    }
    var newMap = this.$Record_map && this.$Record_map.__ensureOwner(ownerID);
    if (!ownerID) {
      this.__ownerID = ownerID;
      this.$Record_map = newMap;
      return this;
    }
    return this.$Record_make(newMap, ownerID);
  };

  // @pragma Iteration

  Record.prototype.__iterate=function(fn, reverse) {"use strict";
    var record = this;
    return this.$Record_defaultValues.map(function(_, k)  {return record.get(k);}).__iterate(fn, reverse);
  };

  Record.prototype.$Record_empty=function() {"use strict";
    var Record = Object.getPrototypeOf(this).constructor;
    return Record.$Record_empty || (Record.$Record_empty = this.$Record_make(ImmutableMap.empty()));
  };

  Record.prototype.$Record_make=function(map, ownerID) {"use strict";
    var record = Object.create(Object.getPrototypeOf(this));
    record.$Record_map = map;
    record.__ownerID = ownerID;
    return record;
  };


Record.prototype.__deepEqual = ImmutableMap.prototype.__deepEqual;
Record.prototype.merge = ImmutableMap.prototype.merge;
Record.prototype.mergeWith = ImmutableMap.prototype.mergeWith;
Record.prototype.mergeDeep = ImmutableMap.prototype.mergeDeep;
Record.prototype.mergeDeepWith = ImmutableMap.prototype.mergeDeepWith;
Record.prototype.withMutations = ImmutableMap.prototype.withMutations;
Record.prototype.updateIn = ImmutableMap.prototype.updateIn;


module.exports = Record;
