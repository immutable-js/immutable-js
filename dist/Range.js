/**
 *  Copyright (c) 2014, Facebook, Inc.
 *  All rights reserved.
 *
 *  This source code is licensed under the BSD-style license found in the
 *  LICENSE file in the root directory of this source tree. An additional grant
 *  of patent rights can be found in the PATENTS file in the same directory.
 */

var IndexedSequence = require('./Sequence').IndexedSequence;
var Vector = require('./Vector');


/**
 * Returns a lazy seq of nums from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When start is equal to end, returns empty list.
 */
for(var IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){Range[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}var ____SuperProtoOfIndexedSequence=IndexedSequence===null?null:IndexedSequence.prototype;Range.prototype=Object.create(____SuperProtoOfIndexedSequence);Range.prototype.constructor=Range;Range.__superConstructor__=IndexedSequence;

  function Range(start, end, step) {"use strict";
    if (!(this instanceof Range)) {
      return new Range(start, end, step);
    }
    invariant(step !== 0, 'Cannot step a Range by 0');
    start = start || 0;
    if (end == null) {
      end = Infinity;
    }
    step = step == null ? 1 : Math.abs(step);
    if (end < start) {
      step = -step;
    }
    this.$Range_start = start;
    this.$Range_end = end;
    this.$Range_step = step;
    this.length = Math.max(0, Math.ceil((end - start) / step - 1) + 1);
  }

  Range.prototype.toString=function() {"use strict";
    if (this.length === 0) {
      return 'Range []';
    }
    return 'Range [ ' +
      this.$Range_start + '...' + this.$Range_end +
      (this.$Range_step > 1 ? ' by ' + this.$Range_step : '') +
    ' ]';
  };

  Range.prototype.has=function(index) {"use strict";
    invariant(index >= 0, 'Index out of bounds');
    return index < this.length;
  };

  Range.prototype.get=function(index, undefinedValue) {"use strict";
    invariant(index >= 0, 'Index out of bounds');
    return this.length === Infinity || index < this.length ?
      this.$Range_start + index * this.$Range_step : undefinedValue;
  };

  Range.prototype.contains=function(searchValue) {"use strict";
    var possibleIndex = (searchValue - this.$Range_start) / this.$Range_step;
    return possibleIndex >= 0 &&
      possibleIndex < this.length &&
      possibleIndex === Math.floor(possibleIndex);
  };

  Range.prototype.slice=function(begin, end, maintainIndices) {"use strict";
    if (maintainIndices) {
      return ____SuperProtoOfIndexedSequence.slice.call(this,begin, end, maintainIndices);
    }
    begin = begin < 0 ? Math.max(0, this.length + begin) : Math.min(this.length, begin);
    end = end == null ? this.length : end > 0 ? Math.min(this.length, end) : Math.max(0, this.length + end);
    return new Range(this.get(begin), end === this.length ? this.$Range_end : this.get(end), this.$Range_step);
  };

  Range.prototype.__deepEquals=function(other) {"use strict";
    return this.$Range_start === other.$Range_start && this.$Range_end === other.$Range_end && this.$Range_step === other.$Range_step;
  };

  Range.prototype.indexOf=function(searchValue) {"use strict";
    var offsetValue = searchValue - this.$Range_start;
    if (offsetValue % this.$Range_step === 0) {
      var index = offsetValue / this.$Range_step;
      if (index >= 0 && index < this.length) {
        return index
      }
    }
    return -1;
  };

  Range.prototype.lastIndexOf=function(searchValue) {"use strict";
    return this.indexOf(searchValue);
  };

  Range.prototype.take=function(amount) {"use strict";
    return this.slice(0, amount);
  };

  Range.prototype.skip=function(amount, maintainIndices) {"use strict";
    return maintainIndices ? ____SuperProtoOfIndexedSequence.skip.call(this,amount) : this.slice(amount);
  };

  Range.prototype.__iterate=function(fn, reverse, flipIndices) {"use strict";
    var reversedIndices = reverse ^ flipIndices;
    var maxIndex = this.length - 1;
    var step = this.$Range_step;
    var value = reverse ? this.$Range_start + maxIndex * step : this.$Range_start;
    for (var ii = 0; ii <= maxIndex; ii++) {
      if (fn(value, reversedIndices ? maxIndex - ii : ii, this) === false) {
        break;
      }
      value += reverse ? -step : step;
    }
    return reversedIndices ? this.length : ii;
  };


Range.prototype.__toJS = Range.prototype.toArray;
Range.prototype.first = Vector.prototype.first;
Range.prototype.last = Vector.prototype.last;


function invariant(condition, error) {
  if (!condition) throw new Error(error);
}


module.exports = Range;
