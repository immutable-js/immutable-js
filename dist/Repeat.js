/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

var IndexedSequence = require('./Sequence').IndexedSequence;
var Range = require('./Range');


/**
 * Returns a lazy seq of `value` repeated `times` times. When `times` is
 * undefined, returns an infinite sequence of `value`.
 */
for(var IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){Repeat[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}var ____SuperProtoOfIndexedSequence=IndexedSequence===null?null:IndexedSequence.prototype;Repeat.prototype=Object.create(____SuperProtoOfIndexedSequence);Repeat.prototype.constructor=Repeat;Repeat.__superConstructor__=IndexedSequence;

  function Repeat(value, times) {"use strict";
    if (times === 0 && __EMPTY_REPEAT) {
      return __EMPTY_REPEAT;
    }
    if (!(this instanceof Repeat)) {
      return new Repeat(value, times);
    }
    this.$Repeat_value = value;
    this.length = times == null ? Infinity : Math.max(0, times);
  }

  Repeat.prototype.toString=function() {"use strict";
    if (this.length === 0) {
      return 'Repeat []';
    }
    return 'Repeat [ ' + this.$Repeat_value + ' ' + this.length + ' times ]';
  };

  Repeat.prototype.get=function(index, undefinedValue) {"use strict";
    invariant(index >= 0, 'Index out of bounds');
    return this.length === Infinity || index < this.length ?
      this.$Repeat_value :
      undefinedValue;
  };

  Repeat.prototype.first=function() {"use strict";
    return this.$Repeat_value;
  };

  Repeat.prototype.contains=function(searchValue) {"use strict";
    var is = require('./Immutable').is;
    return is(this.$Repeat_value, searchValue);
  };

  Repeat.prototype.__deepEquals=function(other) {"use strict";
    var is = require('./Immutable').is;
    return is(this.$Repeat_value, other.$Repeat_value);
  };

  Repeat.prototype.slice=function(begin, end, maintainIndices) {"use strict";
    if (maintainIndices) {
      return ____SuperProtoOfIndexedSequence.slice.call(this,begin, end, maintainIndices);
    }
    var length = this.length;
    begin = begin < 0 ? Math.max(0, length + begin) : Math.min(length, begin);
    end = end == null ? length : end > 0 ? Math.min(length, end) : Math.max(0, length + end);
    return end > begin ? new Repeat(this.$Repeat_value, end - begin) : __EMPTY_REPEAT;
  };

  Repeat.prototype.reverse=function(maintainIndices) {"use strict";
    return maintainIndices ? ____SuperProtoOfIndexedSequence.reverse.call(this,maintainIndices) : this;
  };

  Repeat.prototype.indexOf=function(searchValue) {"use strict";
    var is = require('./Immutable').is;
    if (is(this.$Repeat_value, searchValue)) {
      return 0;
    }
    return -1;
  };

  Repeat.prototype.lastIndexOf=function(searchValue) {"use strict";
    var is = require('./Immutable').is;
    if (is(this.$Repeat_value, searchValue)) {
      return this.length;
    }
    return -1;
  };

  Repeat.prototype.__iterate=function(fn, reverse, flipIndices) {"use strict";
    var reversedIndices = reverse ^ flipIndices;
    invariant(!reversedIndices || this.length < Infinity, 'Cannot access end of infinite range.');
    var maxIndex = this.length - 1;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(this.$Repeat_value, reversedIndices ? maxIndex - ii : ii, this) === false) {
        break;
      }
    }
    return reversedIndices ? this.length : ii;
  };


Repeat.prototype.has = Range.prototype.has;
Repeat.prototype.toArray = Range.prototype.toArray;
Repeat.prototype.toObject = Range.prototype.toObject;
Repeat.prototype.toVector = Range.prototype.toVector;
Repeat.prototype.toMap = Range.prototype.toMap;
Repeat.prototype.toOrderedMap = Range.prototype.toOrderedMap;
Repeat.prototype.toSet = Range.prototype.toSet;
Repeat.prototype.take = Range.prototype.take;
Repeat.prototype.skip = Range.prototype.skip;
Repeat.prototype.last = Repeat.prototype.first;
Repeat.prototype.__toJS = Range.prototype.__toJS;


function invariant(condition, error) {
  if (!condition) throw new Error(error);
}


var __EMPTY_REPEAT = new Repeat(undefined, 0);

module.exports = Repeat;
