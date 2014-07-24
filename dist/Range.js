var IndexedSequence = require('./Sequence').IndexedSequence;
var Vector = require('./Vector');


/**
 * Returns a lazy seq of nums from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When step is equal to 0, returns an infinite sequence of
 * start. When start is equal to end, returns empty list.
 */
for(var IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){Range[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}var ____SuperProtoOfIndexedSequence=IndexedSequence===null?null:IndexedSequence.prototype;Range.prototype=Object.create(____SuperProtoOfIndexedSequence);Range.prototype.constructor=Range;Range.__superConstructor__=IndexedSequence;

  function Range(start, end, step) {"use strict";
    if (!(this instanceof Range)) {
      return new Range(start, end, step);
    }
    this.$Range_start = start || 0;
    this.$Range_end = end == null ? Infinity : end;
    step = step == null ? 1 : Math.abs(step);
    this.$Range_step = this.$Range_end < this.$Range_start ? -step : step;
    this.length = this.$Range_step === 0 ? Infinity : Math.max(0, Math.ceil((this.$Range_end - this.$Range_start) / this.$Range_step - 1) + 1);
  }

  Range.prototype.toString=function() {"use strict";
    if (this.length === 0) {
      return 'Range []';
    }
    return 'Range [ ' +
      this.$Range_start +
      (this.$Range_step === 0 ? ' repeated' :
        '...' + this.$Range_end +
        (this.$Range_step > 1 ? ' by ' + this.$Range_step : '')) +
    ' ]';
  };

  Range.prototype.has=function(index) {"use strict";
    invariant(index >= 0, 'Index out of bounds');
    return index < this.length;
  };

  Range.prototype.get=function(index, undefinedValue) {"use strict";
    invariant(index >= 0, 'Index out of bounds');
    return this.length === Infinity || index < this.length ?
      this.$Range_step === 0 ? this.$Range_start : this.$Range_start + index * this.$Range_step :
      undefinedValue;
  };

  Range.prototype.contains=function(searchValue) {"use strict";
    if (this.$Range_step === 0) {
      return searchValue === this.$Range_start;
    }
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

  Range.prototype.toArray=function() {"use strict";
    assertNotInfinite(this.length);
    return ____SuperProtoOfIndexedSequence.toArray.call(this);
  };

  Range.prototype.toObject=function() {"use strict";
    assertNotInfinite(this.length);
    return ____SuperProtoOfIndexedSequence.toObject.call(this);
  };

  Range.prototype.toVector=function() {"use strict";
    assertNotInfinite(this.length);
    return ____SuperProtoOfIndexedSequence.toVector.call(this);
  };

  Range.prototype.toMap=function() {"use strict";
    assertNotInfinite(this.length);
    return ____SuperProtoOfIndexedSequence.toMap.call(this);
  };

  Range.prototype.toOrderedMap=function() {"use strict";
    assertNotInfinite(this.length);
    return ____SuperProtoOfIndexedSequence.toOrderedMap.call(this);
  };

  Range.prototype.toSet=function() {"use strict";
    assertNotInfinite(this.length);
    return ____SuperProtoOfIndexedSequence.toSet.call(this);
  };

  Range.prototype.indexOf=function(searchValue) {"use strict";
    if (this.$Range_step === 0) {
      return searchValue === this.$Range_start ? 0 : -1;
    }
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
    reversedIndices && assertNotInfinite(this.length);
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

function assertNotInfinite(length) {
  invariant(length < Infinity, 'Cannot access end of infinite range.');
}


module.exports = Range;
