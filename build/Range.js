var LazyIndexedSequence = require('./LazyIndexedSequence');

function invariant(condition, error) {
  if (!condition) throw new Error(error);
}

/**
 * Returns a lazy seq of nums from start (inclusive) to end
 * (exclusive), by step, where start defaults to 0, step to 1, and end to
 * infinity. When step is equal to 0, returns an infinite sequence of
 * start. When start is equal to end, returns empty list.
 */
for(var LazyIndexedSequence____Key in LazyIndexedSequence){if(LazyIndexedSequence.hasOwnProperty(LazyIndexedSequence____Key)){Range[LazyIndexedSequence____Key]=LazyIndexedSequence[LazyIndexedSequence____Key];}}var ____SuperProtoOfLazyIndexedSequence=LazyIndexedSequence===null?null:LazyIndexedSequence.prototype;Range.prototype=Object.create(____SuperProtoOfLazyIndexedSequence);Range.prototype.constructor=Range;Range.__superConstructor__=LazyIndexedSequence;

  function Range(start, end, step) {"use strict";
    if (!(this instanceof Range)) {
      return new Range(start, end, step);
    }
    this.start = start || 0;
    this.end = end == null ? Infinity : end;
    step = step == null ? 1 : Math.abs(step);
    this.step = this.end < this.start ? -step : step;
    this.length = this.step == 0 ? Infinity : Math.max(0, Math.ceil((this.end - this.start) / this.step - 1) + 1);
  }

  Range.prototype.has=function(index) {"use strict";
    invariant(index >= 0, 'Index out of bounds');
    return index < this.length;
  };

  Range.prototype.get=function(index) {"use strict";
    invariant(index >= 0, 'Index out of bounds');
    if (this.length === Infinity || index < this.length) {
      return this.step == 0 ? this.start : this.start + index * this.step;
    }
  };

  Range.prototype.slice=function(begin, end) {"use strict";
    begin = begin < 0 ? Math.max(0, this.length + begin) : Math.min(this.length, begin);
    end = end == null ? this.length : end > 0 ? Math.min(this.length, end) : Math.max(0, this.length + end);
    return new Range(this.get(begin), end == this.length ? this.end : this.get(end), this.step);
  };

  Range.prototype.first=function(predicate, context) {"use strict";
    return predicate ? ____SuperProtoOfLazyIndexedSequence.first.call(this,predicate, context) : this.get(0);
  };

  Range.prototype.last=function(predicate, context) {"use strict";
    return predicate ? ____SuperProtoOfLazyIndexedSequence.last.call(this,predicate, context) : this.get(this.length ? this.length - 1 : 0);
  };

  Range.prototype.toArray=function() {"use strict";
    assertNotInfinite(this.length);
    return ____SuperProtoOfLazyIndexedSequence.toArray.call(this);
  };

  Range.prototype.toObject=function() {"use strict";
    assertNotInfinite(this.length);
    return ____SuperProtoOfLazyIndexedSequence.toObject.call(this);
  };

  Range.prototype.toVector=function() {"use strict";
    assertNotInfinite(this.length);
    return ____SuperProtoOfLazyIndexedSequence.toVector.call(this);
  };

  Range.prototype.toMap=function() {"use strict";
    assertNotInfinite(this.length);
    return ____SuperProtoOfLazyIndexedSequence.toMap.call(this);
  };

  Range.prototype.indexOf=function(searchValue) {"use strict";
    if (this.step === 0) {
      return searchValue === this.start ? 0 : -1;
    }
    var offsetValue = searchValue - this.start;
    if (offsetValue % this.step === 0) {
      var index = offsetValue / this.step;
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
    return maintainIndices ? ____SuperProtoOfLazyIndexedSequence.skip.call(this,amount) : this.slice(amount);
  };

  Range.prototype.__iterate=function(fn, reverseIndices) {"use strict";
    reverseIndices && assertNotInfinite(this.length);
    var value = this.start;
    for (var ii = 0; ii < this.length; ii++) {
      if (fn(value, reverseIndices ? this.length - 1 - ii : ii, this) === false) {
        return false;
      }
      value += this.step;
    }
    return true;
  };

  Range.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    assertNotInfinite(this.length);
    var value = this.start + (this.length - 1) * this.step;
    for (var ii = this.length - 1; ii >= 0; ii--) {
      if (fn(value, maintainIndices ? ii : this.length - 1 - ii, this) === false) {
        return false;
      }
      value -= this.step;
    }
    return true;
  };


function assertNotInfinite(length) {
  invariant(length < Infinity, 'Cannot access end of infinite range.');
}

module.exports = Range;
