
  function Sequence(value) {"use strict";
    if (arguments.length === 1) {
      if (value instanceof Sequence) {
        return value;
      }
      if (Array.isArray(value)) {
        return new ArraySequence(value);
      }
      if (value && typeof value === 'object') {
        return new ObjectSequence(value);
      }
    }
    return new ArraySequence(Array.prototype.slice.call(arguments));
  }

  Sequence.prototype.toString=function() {"use strict";
    return this.__toString('Seq {', '}');
  };

  Sequence.prototype.inspect=function() {"use strict";
    return '' + this;
  };

  Sequence.prototype.__toString=function(head, tail) {"use strict";
    if (this.length === 0) {
      return head + tail;
    }
    return head + ' ' + this.map(this.__toStringMapper).join(', ') + ' ' + tail;
  };

  Sequence.prototype.__toStringMapper=function(v, k) {"use strict";
    return quoteString(k) + ': ' + quoteString(v);
  };

  Sequence.prototype.toArray=function() {"use strict";
    var array = new Array(this.length || 0);
    this.values().forEach(function(v, i)  { array[i] = v; });
    return array;
  };

  Sequence.prototype.toObject=function() {"use strict";
    var object = {};
    this.forEach(function(v, k)  { object[k] = v; });
    return object;
  };

  Sequence.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this.values());
  };

  Sequence.prototype.toMap=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Map').empty().merge(this);
  };

  Sequence.prototype.toOrderedMap=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./OrderedMap').empty().merge(this);
  };

  Sequence.prototype.toSet=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Set').empty().union(this);
  };

  Sequence.prototype.equals=function(other) {"use strict";
    if (this === other) {
      return true;
    }
    if (this.length != null && other.length != null && this.length !== other.length) {
      return false;
    }
    return this.__deepEquals(other);
  };

  Sequence.prototype.__deepEquals=function(other) {"use strict";
    var is = require('./Immutable').is;
    var entries = this.entries().toArray();
    var iterations = 0;
    return other.every(function(v, k)  {
      var entry = entries[iterations++];
      return is(k, entry[0]) && is(v, entry[1]);
    });
  };

  Sequence.prototype.join=function(separator) {"use strict";
    separator = separator || ',';
    var string = '';
    var isFirst = true;
    this.forEach(function(v, k)  {
      if (isFirst) {
        isFirst = false;
        string += v;
      } else {
        string += separator + v;
      }
    });
    return string;
  };

  Sequence.prototype.concat=function() {"use strict";var values=Array.prototype.slice.call(arguments,0);
    var sequences = [this].concat(values.map(function(value)  {return Sequence(value);}));
    var concatSequence = this.__makeSequence();
    concatSequence.__iterate = function(fn, reverse)  {
      var shouldBreak;
      var iterations = 0;
      var lastIndex = sequences.length - 1;
      for (var ii = 0; ii <= lastIndex; ii++) {
        var seq = sequences[reverse ? lastIndex - ii : ii];
        iterations += seq.__iterate(function(v, k, c)  {
          if (fn(v, k, c) === false) {
            shouldBreak = true;
            return false;
          }
        }, reverse);
        if (shouldBreak) {
          break;
        }
      }
      return iterations;
    };
    concatSequence.length = sequences.reduce(
      function(sum, seq)  {return sum != null && seq.length != null ? sum + seq.length : undefined;}, 0
    );
    return concatSequence;
  };

  Sequence.prototype.reverse=function(maintainIndices) {"use strict";
    var sequence = this;
    var reversedSequence = this.__makeSequence();
    reversedSequence.length = this.length;
    reversedSequence.__iterate = function(fn, reverse)  {sequence.__iterate(fn, !reverse)};
    reversedSequence.reverse = function()  {return sequence;};
    return reversedSequence;
  };

  Sequence.prototype.keys=function() {"use strict";
    return this.map(keyMapper).values();
  };

  Sequence.prototype.values=function() {"use strict";
    return new ValuesSequence(this, this.length);
  };

  Sequence.prototype.entries=function() {"use strict";
    var sequence = this;
    var newSequence = sequence.map(entryMapper).values();
    newSequence.fromEntries = function()  {return sequence;};
    return newSequence;
  };

  Sequence.prototype.forEach=function(sideEffect, thisArg) {"use strict";
    return this.__iterate(thisArg ? sideEffect.bind(thisArg) : sideEffect);
  };

  Sequence.prototype.first=function(predicate, thisArg) {"use strict";
    var firstValue;
    (predicate ? this.filter(predicate, thisArg) : this).take(1).forEach(function(v)  { firstValue = v; });
    return firstValue;
  };

  Sequence.prototype.last=function(predicate, thisArg) {"use strict";
    return this.reverse(true).first(predicate, thisArg);
  };

  Sequence.prototype.reduce=function(reducer, initialReduction, thisArg) {"use strict";
    var reduction = initialReduction;
    this.forEach(function(v, k, c)  {
      reduction = reducer.call(thisArg, reduction, v, k, c);
    });
    return reduction;
  };

  Sequence.prototype.reduceRight=function(reducer, initialReduction, thisArg) {"use strict";
    return this.reverse(true).reduce(reducer, initialReduction, thisArg);
  };

  Sequence.prototype.every=function(predicate, thisArg) {"use strict";
    var returnValue = true;
    this.forEach(function(v, k, c)  {
      if (!predicate.call(thisArg, v, k, c)) {
        returnValue = false;
        return false;
      }
    });
    return returnValue;
  };

  Sequence.prototype.some=function(predicate, thisArg) {"use strict";
    return !this.every(not(predicate), thisArg);
  };

  Sequence.prototype.has=function(searchKey) {"use strict";
    return this.get(searchKey, __SENTINEL) !== __SENTINEL;
  };

  Sequence.prototype.get=function(searchKey, notFoundValue) {"use strict";
    return this.find(function(_, key)  {return key === searchKey;}, null, notFoundValue);
  };

  Sequence.prototype.getIn=function(searchKeyPath, notFoundValue) {"use strict";
    return getInDeepSequence(this, searchKeyPath, notFoundValue, 0);
  };

  Sequence.prototype.contains=function(searchValue) {"use strict";
    return this.find(function(value)  {return value === searchValue;}, null, __SENTINEL) !== __SENTINEL;
  };

  Sequence.prototype.find=function(predicate, thisArg, notFoundValue) {"use strict";
    var foundValue = notFoundValue;
    this.forEach(function(v, k, c)  {
      if (predicate.call(thisArg, v, k, c)) {
        foundValue = v;
        return false;
      }
    });
    return foundValue;
  };

  Sequence.prototype.findKey=function(predicate, thisArg) {"use strict";
    var foundKey;
    this.forEach(function(v, k, c)  {
      if (predicate.call(thisArg, v, k, c)) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  };

  Sequence.prototype.findLast=function(predicate, thisArg, notFoundValue) {"use strict";
    return this.reverse(true).find(predicate, thisArg, notFoundValue);
  };

  Sequence.prototype.findLastKey=function(predicate, thisArg) {"use strict";
    return this.reverse(true).findKey(predicate, thisArg);
  };

  Sequence.prototype.flip=function() {"use strict";
    // flip() always returns a regular Sequence, even in subclasses.
    var flipSequence = Sequence.prototype.__makeSequence.call(this);
    flipSequence.length = this.length;
    var sequence = this;
    flipSequence.flip = function()  {return sequence;};
    flipSequence.__iterateUncached = function(fn, reverse) 
      {return sequence.__iterate(function(v, k, c)  {return fn(k, v, c) !== false;}, reverse);};
    return flipSequence;
  };

  Sequence.prototype.map=function(mapper, thisArg) {"use strict";
    var sequence = this;
    var mappedSequence = this.__makeSequence();
    mappedSequence.length = this.length;
    mappedSequence.__iterateUncached = function(fn, reverse) 
      {return sequence.__iterate(function(v, k, c)  {return fn(mapper.call(thisArg, v, k, c), k, c) !== false;}, reverse);};
    return mappedSequence;
  };

  Sequence.prototype.filter=function(predicate, thisArg) {"use strict";
    return filterFactory(this, predicate, thisArg, true, false);
  };

  Sequence.prototype.slice=function(begin, end) {"use strict";
    if (wholeSlice(begin, end, this.length)) {
      return this;
    }
    var resolvedBegin = resolveBegin(begin, this.length);
    var resolvedEnd = resolveEnd(end, this.length);
    // begin or end will be NaN if they were provided as negative numbers and
    // this sequence's length is unknown. In that case, convert it to an
    // IndexedSequence by getting entries() and convert back to a sequence with
    // fromEntries(). IndexedSequence.prototype.slice will appropriately handle
    // this case.
    if (resolvedBegin !== resolvedBegin || resolvedEnd !== resolvedEnd) {
      return this.entries().slice(begin, end).fromEntries();
    }
    var skipped = this.skip(resolvedBegin);
    return resolvedEnd == null ? skipped : skipped.take(resolvedEnd - resolvedBegin);
  };

  Sequence.prototype.splice=function(index, removeNum)  {"use strict";var values=Array.prototype.slice.call(arguments,2);
    if (removeNum === 0 && values.length === 0) {
      return this;
    }
    return this.slice(0, index).concat(values, this.slice(index + removeNum));
  };

  Sequence.prototype.take=function(amount) {"use strict";
    var iterations = 0;
    var sequence = this.takeWhile(function()  {return iterations++ < amount;});
    sequence.length = this.length && Math.min(this.length, amount);
    return sequence;
  };

  Sequence.prototype.takeLast=function(amount, maintainIndices) {"use strict";
    return this.reverse(maintainIndices).take(amount).reverse(maintainIndices);
  };

  Sequence.prototype.takeWhile=function(predicate, thisArg, maintainIndices) {"use strict";
    var sequence = this;
    var takeSequence = this.__makeSequence();
    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      sequence.__iterate(function(v, k, c)  {
        if (predicate.call(thisArg, v, k, c) && fn(v, k, c) !== false) {
          iterations++;
        } else {
          return false;
        }
      }, reverse, flipIndices);
      return iterations;
    };
    return takeSequence;
  };

  Sequence.prototype.takeUntil=function(predicate, thisArg, maintainIndices) {"use strict";
    return this.takeWhile(not(predicate), thisArg, maintainIndices);
  };

  Sequence.prototype.skip=function(amount, maintainIndices) {"use strict";
    if (amount === 0) {
      return this;
    }
    var iterations = 0;
    var sequence = this.skipWhile(function()  {return iterations++ < amount;}, null, maintainIndices);
    sequence.length = this.length && Math.max(0, this.length - amount);
    return sequence;
  };

  Sequence.prototype.skipLast=function(amount, maintainIndices) {"use strict";
    return this.reverse(maintainIndices).skip(amount).reverse(maintainIndices);
  };

  Sequence.prototype.skipWhile=function(predicate, thisArg, maintainIndices) {"use strict";
    var sequence = this;
    var skipSequence = this.__makeSequence();
    skipSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var isSkipping = true;
      var iterations = 0;
      sequence.__iterate(function(v, k, c)  {
        if (!(isSkipping && (isSkipping = predicate.call(thisArg, v, k, c)))) {
          if (fn(v, k, c) !== false) {
            iterations++;
          } else {
            return false;
          }
        }
      }, reverse, flipIndices);
      return iterations;
    };
    return skipSequence;
  };

  Sequence.prototype.skipUntil=function(predicate, thisArg, maintainIndices) {"use strict";
    return this.skipWhile(not(predicate), thisArg, maintainIndices);
  };

  Sequence.prototype.groupBy=function(mapper, context) {"use strict";
    var seq = this;
    var groups = require('./OrderedMap').empty().withMutations(function(map)  {
      seq.forEach(function(value, key, collection)  {
        var groupKey = mapper(value, key, collection);
        var group = map.get(groupKey, __SENTINEL);
        if (group === __SENTINEL) {
          group = [];
          map.set(groupKey, group);
        }
        group.push([key, value]);
      });
    })
    return groups.map(function(group)  {return Sequence(group).fromEntries();});
  };

  Sequence.prototype.cacheResult=function() {"use strict";
    if (!this.$Sequence_cache) {
      var cache = [];
      var collection;
      var length = this.forEach(function(v, k, c)  {
        collection || (collection = c);
        cache.push([k, v]);
      });
      if (this.length == null) {
        this.length = length;
      }
      this.$Sequence_collection = collection;
      this.$Sequence_cache = cache;
    }
    return this;
  };

  // abstract __iterateUncached(fn, reverse)

  Sequence.prototype.__iterate=function(fn, reverse, flipIndices) {"use strict";
    if (!this.$Sequence_cache) {
      return this.__iterateUncached(fn, reverse, flipIndices);
    }
    var maxIndex = this.length - 1;
    var cache = this.$Sequence_cache;
    var c = this.$Sequence_collection;
    if (reverse) {
      for (var ii = cache.length - 1; ii >= 0; ii--) {
        var revEntry = cache[ii];
        if (fn(revEntry[1], flipIndices ? revEntry[0] : maxIndex - revEntry[0], c) === false) {
          break;
        }
      }
    } else {
      cache.every(flipIndices ?
        function(entry)  {return fn(entry[1], maxIndex - entry[0], c) !== false;} :
        function(entry)  {return fn(entry[1], entry[0], c) !== false;}
      );
    }
    return this.length;
  };

  Sequence.prototype.__makeSequence=function() {"use strict";
    return Object.create(Sequence.prototype);
  };


Sequence.prototype.toJS = Sequence.prototype.toObject;


for(var Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){IndexedSequence[Sequence____Key]=Sequence[Sequence____Key];}}var ____SuperProtoOfSequence=Sequence===null?null:Sequence.prototype;IndexedSequence.prototype=Object.create(____SuperProtoOfSequence);IndexedSequence.prototype.constructor=IndexedSequence;IndexedSequence.__superConstructor__=Sequence;function IndexedSequence(){"use strict";if(Sequence!==null){Sequence.apply(this,arguments);}}

  IndexedSequence.prototype.toString=function() {"use strict";
    return this.__toString('Seq [', ']');
  };

  IndexedSequence.prototype.toArray=function() {"use strict";
    var array = new Array(this.length || 0);
    array.length = this.forEach(function(v, i)  { array[i] = v; });
    return array;
  };

  IndexedSequence.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this);
  };

  IndexedSequence.prototype.join=function(separator) {"use strict";
    separator = separator || ',';
    var string = '';
    var prevIndex = 0;
    this.forEach(function(v, i)  {
      var numSeparators = i - prevIndex;
      prevIndex = i;
      string += (numSeparators === 1 ? separator : repeatString(separator, numSeparators)) + v;
    });
    if (this.length && prevIndex < this.length - 1) {
      string += repeatString(separator, this.length - 1 - prevIndex);
    }
    return string;
  };

  IndexedSequence.prototype.concat=function() {"use strict";var values=Array.prototype.slice.call(arguments,0);
    return new ConcatIndexedSequence(this, values);
  };

  IndexedSequence.prototype.reverse=function(maintainIndices) {"use strict";
    return new ReversedIndexedSequence(this, maintainIndices);
  };

  IndexedSequence.prototype.fromEntries=function() {"use strict";
    var newSequence = this.__makeSequence();
    newSequence.length = this.length;
    var sequence = this;
    newSequence.entries = function()  {return sequence;};
    newSequence.__iterateUncached = function(fn, reverse, flipIndices) 
      {return sequence.__iterate(function(entry, _, c)  {return fn(entry[1], entry[0], c);}, reverse, flipIndices);};
    return newSequence;
  };

  // Overridden to supply undefined length
  IndexedSequence.prototype.values=function() {"use strict";
    return new ValuesSequence(this);
  };

  IndexedSequence.prototype.filter=function(predicate, thisArg, maintainIndices) {"use strict";
    var filterSequence = filterFactory(this, predicate, thisArg, maintainIndices, maintainIndices);
    if (maintainIndices) {
      filterSequence.length = this.length;
    }
    return filterSequence;
  };

  IndexedSequence.prototype.indexOf=function(searchValue) {"use strict";
    return this.findIndex(function(value)  {return value === searchValue;});
  };

  IndexedSequence.prototype.findIndex=function(predicate, thisArg) {"use strict";
    var key = this.findKey(predicate, thisArg);
    return key == null ? -1 : key;
  };

  IndexedSequence.prototype.lastIndexOf=function(searchValue) {"use strict";
    return this.reverse(true).indexOf(searchValue);
  };

  IndexedSequence.prototype.findLastIndex=function(predicate, thisArg) {"use strict";
    return this.reverse(true).findIndex(predicate, thisArg);
  };

  IndexedSequence.prototype.slice=function(begin, end, maintainIndices) {"use strict";
    if (wholeSlice(begin, end, this.length)) {
      return this;
    }
    return new SliceIndexedSequence(this, begin, end, maintainIndices);
  };

  // Overrides to get length correct.
  IndexedSequence.prototype.takeWhile=function(predicate, thisArg, maintainIndices) {"use strict";
    var sequence = this;
    var takeSequence = this.__makeSequence();
    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      // TODO: ensure didFinish is necessary here
      var didFinish = true;
      var length = sequence.__iterate(function(v, ii, c)  {
        if (predicate.call(thisArg, v, ii, c) && fn(v, ii, c) !== false) {
          iterations = ii;
        } else {
          didFinish = false;
          return false;
        }
      }, reverse, flipIndices);
      return maintainIndices ? takeSequence.length : didFinish ? length : iterations + 1;
    };
    if (maintainIndices) {
      takeSequence.length = this.length;
    }
    return takeSequence;
  };

  IndexedSequence.prototype.skipWhile=function(predicate, thisArg, maintainIndices) {"use strict";
    var newSequence = this.__makeSequence();
    var sequence = this;
    newSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        return this.cacheResult().__iterate(fn, reverse, flipIndices)
      }
      var reversedIndices = sequence.__reversedIndices ^ flipIndices;
      var isSkipping = true;
      var indexOffset = 0;
      var length = sequence.__iterate(function(v, ii, c)  {
        if (isSkipping) {
          isSkipping = predicate.call(thisArg, v, ii, c);
          if (!isSkipping) {
            indexOffset = ii;
          }
        }
        return isSkipping || fn(v, flipIndices || maintainIndices ? ii : ii - indexOffset, c) !== false;
      }, reverse, flipIndices);
      return maintainIndices ? length : reversedIndices ? indexOffset + 1 : length - indexOffset;
    };
    if (maintainIndices) {
      newSequence.length = this.length;
    }
    return newSequence;
  };

  IndexedSequence.prototype.groupBy=function(mapper, context, maintainIndices) {"use strict";
    var seq = this;
    var groups = require('./OrderedMap').empty().withMutations(function(map)  {
      seq.forEach(function(value, index, collection)  {
        var groupKey = mapper(value, index, collection);
        var group = map.get(groupKey, __SENTINEL);
        if (group === __SENTINEL) {
          group = new Array(maintainIndices ? seq.length : 0);
          map.set(groupKey, group);
        }
        maintainIndices ? (group[index] = value) : group.push(value);
      });
    });
    return groups.map(function(group)  {return Sequence(group);});
  };

  // abstract __iterateUncached(fn, reverse, flipIndices)

  IndexedSequence.prototype.__makeSequence=function() {"use strict";
    var newSequence = Object.create(IndexedSequence.prototype);
    newSequence.__reversedIndices = this.__reversedIndices;
    return newSequence;
  };


IndexedSequence.prototype.toJS = IndexedSequence.prototype.toArray;
IndexedSequence.prototype.__toStringMapper = quoteString;


/**
 * ValuesSequence re-indexes a sequence based on the iteration of values.
 */
for(var IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ValuesSequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}var ____SuperProtoOfIndexedSequence=IndexedSequence===null?null:IndexedSequence.prototype;ValuesSequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ValuesSequence.prototype.constructor=ValuesSequence;ValuesSequence.__superConstructor__=IndexedSequence;
  function ValuesSequence(sequence, length) {"use strict";
    this.$ValuesSequence_sequence = sequence;
    this.length = length;
  }

  ValuesSequence.prototype.values=function() {"use strict";
    return this;
  };

  ValuesSequence.prototype.__iterateUncached=function(fn, reverse, flipIndices) {"use strict";
    if (flipIndices && this.length == null) {
      this.cacheResult();
    }
    var iterations = 0;
    var predicate;
    if (flipIndices) {
      var maxIndex = this.length - 1;
      predicate = function(v, k, c)  {return fn(v, maxIndex - iterations++, c) !== false;};
    } else {
      predicate = function(v, k, c)  {return fn(v, iterations++, c) !== false;};
    }
    this.$ValuesSequence_sequence.__iterate(predicate, reverse); // intentionally do not pass flipIndices
    return iterations;
  };



for(IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){SliceIndexedSequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}SliceIndexedSequence.prototype=Object.create(____SuperProtoOfIndexedSequence);SliceIndexedSequence.prototype.constructor=SliceIndexedSequence;SliceIndexedSequence.__superConstructor__=IndexedSequence;
  function SliceIndexedSequence(sequence, begin, end, maintainIndices) {"use strict";
    this.__reversedIndices = sequence.__reversedIndices;
    this.$SliceIndexedSequence_sequence = sequence;
    this.$SliceIndexedSequence_begin = begin;
    this.$SliceIndexedSequence_end = end;
    this.$SliceIndexedSequence_maintainIndices = maintainIndices;
    this.length = sequence.length && (maintainIndices ? sequence.length : resolveEnd(end, sequence.length) - resolveBegin(begin, sequence.length));
  }

  SliceIndexedSequence.prototype.__iterateUncached=function(fn, reverse, flipIndices) {"use strict";
    if (reverse) {
      // TODO: reverse should be possible here.
      return this.cacheResult().__iterate(fn, reverse, flipIndices);
    }
    var reversedIndices = this.__reversedIndices ^ flipIndices;
    var sequence = this.$SliceIndexedSequence_sequence;
    var begin = resolveBegin(this.$SliceIndexedSequence_begin, sequence.length);
    var end = resolveEnd(this.$SliceIndexedSequence_end, sequence.length);
    var maintainIndices = this.$SliceIndexedSequence_maintainIndices;
    if (sequence.length == null && (isNaN(begin) || isNaN(end) || reversedIndices)) {
      sequence.cacheResult();
      begin = resolveBegin(this.$SliceIndexedSequence_begin, sequence.length);
      end = resolveEnd(this.$SliceIndexedSequence_end, sequence.length);
    }
    if (reversedIndices) {
      var newStart = sequence.length - end;
      end = sequence.length - begin;
      begin = newStart;
    }
    var length = sequence.__iterate(function(v, ii, c) 
      {return !(ii >= begin && (end == null || ii < end)) || fn(v, maintainIndices ? ii : ii - begin, c) !== false;},
      reverse, flipIndices
    );
    return this.length || (maintainIndices ? length : Math.max(0, length - begin));
  };



for(IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ConcatIndexedSequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}ConcatIndexedSequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ConcatIndexedSequence.prototype.constructor=ConcatIndexedSequence;ConcatIndexedSequence.__superConstructor__=IndexedSequence;
  function ConcatIndexedSequence(sequence, values) {"use strict";
    this.$ConcatIndexedSequence_sequences = [sequence].concat(values).map(function(value)  {return Sequence(value);});
    this.length = this.$ConcatIndexedSequence_sequences.reduce(
      function(sum, seq)  {return sum != null && seq.length != null ? sum + seq.length : undefined;}, 0
    );
  }

  ConcatIndexedSequence.prototype.__iterateUncached=function(fn, reverse, flipIndices) {"use strict";
    if (flipIndices && !this.length) {
      // In order to reverse indices, first we must create a cached
      // representation. This ensures we will have the correct total length
      // so index reversal works as expected.
      this.cacheResult();
    }
    var shouldBreak;
    var iterations = 0;
    var maxIndex = flipIndices && this.length - 1;
    var maxSequencesIndex = this.$ConcatIndexedSequence_sequences.length - 1;
    for (var ii = 0; ii <= maxSequencesIndex; ii++) {
      var sequence = this.$ConcatIndexedSequence_sequences[reverse ? maxSequencesIndex - ii : ii];
      if (!(sequence instanceof IndexedSequence)) {
        sequence = sequence.values();
      }
      iterations += sequence.__iterate(function(v, index, c)  {
        index += iterations;
        if (fn(v, flipIndices ? maxIndex - index : index, c) === false) {
          shouldBreak = true;
          return false;
        }
      }, reverse); // intentionally do not pass flipIndices
      if (shouldBreak) {
        break;
      }
    }
    return iterations;
  };



for(IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ReversedIndexedSequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}ReversedIndexedSequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ReversedIndexedSequence.prototype.constructor=ReversedIndexedSequence;ReversedIndexedSequence.__superConstructor__=IndexedSequence;
  function ReversedIndexedSequence(sequence, maintainIndices) {"use strict";
    if (sequence.length) {
      this.length = sequence.length;
    }
    this.__reversedIndices = !!(maintainIndices ^ sequence.__reversedIndices);
    this.$ReversedIndexedSequence_sequence = sequence;
    this.$ReversedIndexedSequence_maintainIndices = maintainIndices;
  }

  ReversedIndexedSequence.prototype.reverse=function(maintainIndices) {"use strict";
    if (maintainIndices === this.$ReversedIndexedSequence_maintainIndices) {
      return this.$ReversedIndexedSequence_sequence;
    }
    return ____SuperProtoOfIndexedSequence.reverse.call(this,maintainIndices);
  };

  ReversedIndexedSequence.prototype.__iterateUncached=function(fn, reverse, flipIndices) {"use strict";
    return this.$ReversedIndexedSequence_sequence.__iterate(fn, !reverse, flipIndices ^ this.$ReversedIndexedSequence_maintainIndices);
  };



for(IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ArraySequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}ArraySequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ArraySequence.prototype.constructor=ArraySequence;ArraySequence.__superConstructor__=IndexedSequence;
  function ArraySequence(array) {"use strict";
    this.length = array.length;
    this.$ArraySequence_array = array;
  }

  ArraySequence.prototype.toArray=function() {"use strict";
    return this.$ArraySequence_array;
  };

  ArraySequence.prototype.cacheResult=function() {"use strict";
    return this;
  };

  ArraySequence.prototype.__iterate=function(fn, reverse, flipIndices) {"use strict";
    var array = this.$ArraySequence_array;
    var maxIndex = array.length - 1;
    var lastIndex = -1;
    if (reverse) {
      for (var ii = maxIndex; ii >= 0; ii--) {
        if (array.hasOwnProperty(ii) &&
            fn(array[ii], flipIndices ? ii : maxIndex - ii, array) === false) {
          return lastIndex + 1;
        }
        lastIndex = ii;
      }
      return array.length;
    } else {
      var didFinish = this.$ArraySequence_array.every(function(value, index)  {
        if (fn(value, flipIndices ? maxIndex - index : index, array) === false) {
          return false;
        } else {
          lastIndex = index;
          return true;
        }
      });
      return didFinish ? array.length : lastIndex + 1;
    }
  };



for(Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){ObjectSequence[Sequence____Key]=Sequence[Sequence____Key];}}ObjectSequence.prototype=Object.create(____SuperProtoOfSequence);ObjectSequence.prototype.constructor=ObjectSequence;ObjectSequence.__superConstructor__=Sequence;
  function ObjectSequence(object) {"use strict";
    this.$ObjectSequence_object = object;
  }

  ObjectSequence.prototype.toObject=function() {"use strict";
    return this.$ObjectSequence_object;
  };

  ObjectSequence.prototype.cacheResult=function() {"use strict";
    this.length = Object.keys(this.$ObjectSequence_object).length;
    return this;
  };

  ObjectSequence.prototype.__iterate=function(fn, reverse) {"use strict";
    var object = this.$ObjectSequence_object;
    if (reverse) {
      var keys = Object.keys(object);
      for (var ii = keys.length - 1; ii >= 0; ii--) {
        if (fn(object[keys[ii]], keys[ii], object) === false) {
          return keys.length - ii + 1;
        }
      }
      return keys.length;
    } else {
      var iterations = 0;
      for (var key in object) if (object.hasOwnProperty(key)) {
        if (fn(object[key], key, object) === false) {
          break;
        }
        iterations++;
      }
      return iterations;
    }
  };



function getInDeepSequence(seq, keyPath, notFoundValue, pathOffset) {
  var nested = seq.get ? seq.get(keyPath[pathOffset], __SENTINEL) : __SENTINEL;
  if (nested === __SENTINEL) {
    return notFoundValue;
  }
  if (pathOffset === keyPath.length - 1) {
    return nested;
  }
  return getInDeepSequence(nested, keyPath, notFoundValue, pathOffset + 1);
}

function wholeSlice(begin, end, length) {
  return (begin === 0 || (length != null && begin <= -length)) &&
    (end == null || (length != null && end >= length));
}

function resolveBegin(begin, length) {
  return begin < 0 ? Math.max(0, length + begin) : length ? Math.min(length, begin) : begin;
}

function resolveEnd(end, length) {
  return end == null ? length : end < 0 ? Math.max(0, length + end) : length ? Math.min(length, end) : end;
}

function keyMapper(v, k) {
  return k;
}

function entryMapper(v, k) {
  return [k, v];
}

/**
 * Sequence.prototype.filter and IndexedSequence.prototype.filter are so close
 * in behavior that it makes sense to build a factory with the few differences
 * encoded as booleans.
 */
function filterFactory(sequence, predicate, thisArg, useKeys, maintainIndices) {
  var filterSequence = sequence.__makeSequence();
  filterSequence.__iterate = function(fn, reverse, flipIndices)  {
    var iterations = 0;
    var length = sequence.__iterate(function(v, k, c)  {
      if (predicate.call(thisArg, v, k, c)) {
        if (fn(v, useKeys ? k : iterations, c) !== false) {
          iterations++;
        } else {
          return false;
        }
      }
    }, reverse, flipIndices);
    return maintainIndices ? length : iterations;
  };
  return filterSequence;
}

function not(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  }
}

function quoteString(value) {
  return typeof value === 'string' ? JSON.stringify(value) : value;
}

function repeatString(string, times) {
  var repeated = '';
  while (times) {
    if (times & 1) {
      repeated += string;
    }
    if ((times >>= 1)) {
      string += string;
    }
  }
  return repeated;
}


var __SENTINEL = {};

exports.Sequence = Sequence;
exports.IndexedSequence = IndexedSequence;
