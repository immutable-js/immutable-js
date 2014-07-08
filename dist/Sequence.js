
  function Sequence(value) {"use strict";
    if (arguments.length === 1) {
      if (value instanceof Sequence) {
        return value;
      }
      if (Array.isArray(value)) {
        return new ArraySequence(value);
      }
      if (typeof value === 'object') {
        return new ObjectSequence(value);
      }
    }
    return new ArraySequence(Array.prototype.slice.call(arguments), true);
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

  Sequence.prototype.isTransient=function() {"use strict";
    return this.__parentSequence.isTransient();
  };

  Sequence.prototype.asPersistent=function() {"use strict";
    // This works because asPersistent() is mutative.
    this.__parentSequence.asPersistent();
    return this;
  };

  Sequence.prototype.toArray=function() {"use strict";
    var array = [];
    this.__iterate(function(v)  { array.push(v); });
    return array;
  };

  Sequence.prototype.toObject=function() {"use strict";
    var object = {};
    this.__iterate(function(v, k)  { object[k] = v; });
    return object;
  };

  Sequence.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    var vect = require('./Vector').empty().asTransient();
    this.__iterate(function(v)  {
      vect = vect.push(v);
    });
    return vect.asPersistent();
  };

  Sequence.prototype.toMap=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Map').empty().merge(this);
  };

  Sequence.prototype.toSet=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Set').empty().merge(this);
  };

  Sequence.prototype.equals=function(other) {"use strict";
    if (this === other) {
      return true;
    }
    if (this.length != null && other.length != null && this.length !== other.length) {
      return false;
    }
    // if either side is transient, and they are not from the same parent
    // sequence, then they must not be equal.
    if (((!this.isTransient || this.isTransient()) ||
         (!other.isTransient || other.isTransient())) &&
        (this.__parentSequence || this) !== (other.__parentSequence || other)) {
      return false;
    }
    return this.__deepEquals(other);
  };

  Sequence.prototype.__deepEquals=function(other) {"use strict";
    var is = require('./Persistent').is;
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
    this.__iterate(function(v, k)  {
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
    var sequences = [this].concat(values).map(function(value)  {return Sequence(value);});
    var concatSequence = this.__makeUberSequence(function(sequence, fn, reverse)  {
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
    });
    concatSequence.length = sequences.reduce(
      function(sum, seq)  {return sum != null && seq.length != null ? sum + seq.length : undefined;}, 0
    );
    return concatSequence;
  };

  Sequence.prototype.reverse=function(maintainIndices) {"use strict";
    var reversedSequence = this.__makeUberSequence(
      function(sequence, fn, reverse)  {return sequence.__iterate(fn, !reverse);}
    );
    reversedSequence.length = this.length;
    reversedSequence.reverse = function()  {return this;}.bind(this);
    return reversedSequence;
  };

  Sequence.prototype.keys=function() {"use strict";
    return this.map(keyMapper).values();
  };

  Sequence.prototype.values=function() {"use strict";
    return new ValuesSequence(this, this.length);
  };

  Sequence.prototype.entries=function() {"use strict";
    return this.map(entryMapper).values();
  };

  Sequence.prototype.forEach=function(sideEffect, context) {"use strict";
    this.__iterate(function(v, k, c)  { sideEffect.call(context, v, k, c); });
  };

  Sequence.prototype.first=function(predicate, context) {"use strict";
    var firstValue;
    (predicate ? this.filter(predicate, context) : this).take(1).forEach(function(v)  { firstValue = v; });
    return firstValue;
  };

  Sequence.prototype.last=function(predicate, context) {"use strict";
    return this.reverse(true).first(predicate, context);
  };

  Sequence.prototype.reduce=function(reducer, initialReduction, context) {"use strict";
    var reduction = initialReduction;
    this.__iterate(function(v, k, c)  {
      reduction = reducer.call(context, reduction, v, k, c);
    });
    return reduction;
  };

  Sequence.prototype.reduceRight=function(reducer, initialReduction, context) {"use strict";
    return this.reverse(true).reduce(reducer, initialReduction, context);
  };

  Sequence.prototype.every=function(predicate, context) {"use strict";
    var returnValue = true;
    this.__iterate(function(v, k, c)  {
      if (!predicate.call(context, v, k, c)) {
        returnValue = false;
        return false;
      }
    });
    return returnValue;
  };

  Sequence.prototype.some=function(predicate, context) {"use strict";
    return !this.every(not(predicate), context);
  };

  Sequence.prototype.get=function(searchKey, notFoundValue) {"use strict";
    return this.findKey(function(_, key)  {return key === searchKey;}, null, notFoundValue);
  };

  Sequence.prototype.find=function(predicate, context, notFoundValue) {"use strict";
    var foundValue = notFoundValue;
    this.__iterate(function(v, k, c)  {
      if (predicate.call(context, v, k, c)) {
        foundValue = v;
        return false;
      }
    });
    return foundValue;
  };

  Sequence.prototype.findKey=function(predicate, context) {"use strict";
    var foundKey;
    this.__iterate(function(v, k, c)  {
      if (predicate.call(context, v, k, c)) {
        foundKey = k;
        return false;
      }
    });
    return foundKey;
  };

  Sequence.prototype.findLast=function(predicate, context, notFoundValue) {"use strict";
    return this.reverse(true).find(predicate, context, notFoundValue);
  };

  Sequence.prototype.findLastKey=function(predicate, context) {"use strict";
    return this.reverse(true).findKey(predicate, context);
  };

  Sequence.prototype.flip=function() {"use strict";
    // flip() always returns a regular Sequence, even in subclasses.
    var flippedSequence = Sequence.prototype.__makeSequence.call(this, flipFactory);
    flippedSequence.length = this.length;
    flippedSequence.flip = function()  {return this;}.bind(this);
    return flippedSequence;
  };

  Sequence.prototype.map=function(mapper, context) {"use strict";
    var mappedSequence = this.__makeSequence(
      function(fn)  {return function(v, k, c)  {return fn(mapper.call(context, v, k, c), k, c) !== false;};}
    );
    mappedSequence.length = this.length;
    return mappedSequence;
  };

  Sequence.prototype.filter=function(predicate, context) {"use strict";
    return this.__makeUberSequence(function(sequence, fn, reverse)  {
      var iterations = 0;
      sequence.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          if (fn(v, k, c) !== false) {
            iterations++;
          } else {
            return false;
          }
        }
      }, reverse);
      return iterations;
    });
  };

  Sequence.prototype.slice=function(start, end) {"use strict";
    start = resolveStart(start, this.length);
    end = resolveEnd(end, this.length);
    // start or end will be NaN if they were provided as negative numbers and
    // this sequence's length is unknown. In that case, convert it to an
    // IndexedSequence by getting entries() and convert back to a sequence with
    // fromEntries(). IndexedSequence.prototype.slice will appropriately handle
    // this case.
    if (isNaN(start) || isNaN(end)) {
      return this.entries().slice(start, end).fromEntries();
    }
    return this.skip(start).take(end - start);
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

  Sequence.prototype.takeWhile=function(predicate, context, maintainIndices) {"use strict";
    var sequence = this;
    var takeSequence = this.__makeRawSequence('takeWhile');
    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      sequence.__iterate(function(v, k, c)  {
        if (predicate.call(context, v, k, c) && fn(v, k, c) !== false) {
          iterations++;
        } else {
          return false;
        }
      }, reverse, flipIndices);
      return iterations;
    };
    return takeSequence;
  };

  Sequence.prototype.takeUntil=function(predicate, context, maintainIndices) {"use strict";
    return this.takeWhile(not(predicate), context, maintainIndices);
  };

  Sequence.prototype.skip=function(amount, maintainIndices) {"use strict";
    var iterations = 0;
    var sequence = this.skipWhile(function()  {return iterations++ < amount;}, null, maintainIndices);
    sequence.length = this.length && Math.max(0, this.length - amount);
    return sequence;
  };

  Sequence.prototype.skipLast=function(amount, maintainIndices) {"use strict";
    return this.reverse(maintainIndices).skip(amount).reverse(maintainIndices);
  };

  Sequence.prototype.skipWhile=function(predicate, context, maintainIndices) {"use strict";
    var sequence = this;
    var skipSequence = this.__makeRawSequence('skipWhile');
    skipSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var isSkipping = true;
      var iterations = 0;
      sequence.__iterate(function(v, k, c)  {
        if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
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

  Sequence.prototype.skipUntil=function(predicate, context, maintainIndices) {"use strict";
    return this.skipWhile(not(predicate), context, maintainIndices);
  };

  Sequence.prototype.cacheResult=function() {"use strict";
    if (!this.$Sequence_cache) {
      var cache = [];
      var collection;
      var length = this.__iterate(function(v, k, c)  {
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

  Sequence.prototype.__makeRawSequence=function() {"use strict";
    var newSequence = Object.create(Sequence.prototype);
    newSequence.__parentSequence = this.$Sequence_parentSequence || this;
    return newSequence;
  };

  Sequence.prototype.__makeUberSequence=function(factory) {"use strict";
    var sequence = this;
    var newSequence = this.__makeRawSequence();
    newSequence.__iterateUncached = function(fn, reverse)  {return factory(sequence, fn, reverse);};
    return newSequence;
  };

  Sequence.prototype.__makeSequence=function(factory) {"use strict";
    var sequence = this;
    var newSequence = this.__makeRawSequence();
    newSequence.__iterateUncached = function(fn, reverse)  {return sequence.__iterate(factory(fn), reverse);};
    return newSequence;
  };


Sequence.prototype.toJS = Sequence.prototype.toObject;


// class ConcatSequence extends Sequence {
//   constructor(sequence, values) {
//     this.__parentSequence = sequence._parentSequence || sequence;
//     this._sequences = [sequence].concat(values);
//   }

//   __iterate(fn) {
//     var shouldBreak;
//     var iterations = 0;
//     for (var ii = 0; ii < this._sequences.length; ii++) {
//       iterations += Sequence(this._sequences[ii]).__iterate((v, k, c) => {
//         if (fn(v, k, c) === false) {
//           shouldBreak = true;
//           return false;
//         }
//       });
//       if (shouldBreak) {
//         break;
//       }
//     }
//     return iterations;
//   }

//   __reverseIterate(fn) {
//     var shouldBreak;
//     var iterations = 0;
//     for (var ii = this._sequences.length - 1; ii >= 0; ii--) {
//       iterations += Sequence(this._sequences[ii]).__reverseIterate((v, k, c) => {
//         if (fn(v, k, c) === false) {
//           shouldBreak = true;
//           return false;
//         }
//       });
//       if (shouldBreak) {
//         break;
//       }
//     }
//     return iterations;
//   }
// }


// class ReversedSequence extends Sequence {
//   constructor(sequence) {
//     this.__parentSequence = sequence._parentSequence || sequence;
//     this._sequence = sequence;
//   }

//   reverse() {
//     return this._sequence;
//   }

//   __iterate(fn) {
//     return this._sequence.__reverseIterate(fn);
//   }

//   __reverseIterate(fn) {
//     return this._sequence.__iterate(fn);
//   }
// }


for(var Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){IndexedSequence[Sequence____Key]=Sequence[Sequence____Key];}}var ____SuperProtoOfSequence=Sequence===null?null:Sequence.prototype;IndexedSequence.prototype=Object.create(____SuperProtoOfSequence);IndexedSequence.prototype.constructor=IndexedSequence;IndexedSequence.__superConstructor__=Sequence;function IndexedSequence(){"use strict";if(Sequence!==null){Sequence.apply(this,arguments);}}

  IndexedSequence.prototype.toString=function() {"use strict";
    return this.__toString('Seq [', ']');
  };

  IndexedSequence.prototype.toArray=function() {"use strict";
    var array = [];
    array.length = this.__iterate(function(v, i)  { array[i] = v; });
    return array;
  };

  IndexedSequence.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    var vect = require('./Vector').empty().asTransient();
    var length = this.__iterate(function(v, i)  { vect = vect.set(i, v); });
    return vect.setLength(length).asPersistent();
  };

  IndexedSequence.prototype.join=function(separator) {"use strict";
    separator = separator || ',';
    var string = '';
    var prevIndex = 0;
    this.__iterate(function(v, i)  {
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
    // This should work right? It doesnt...
    // var reversedSequence = this.__makeUberSequence(true, (sequence, fn, reverse, alterIndices) => {
    //   var iterate = reverse ? sequence.__iterate : sequence.__reverseIterate;
    //   return iterate.call(sequence, fn, alterIndices !== maintainIndices);
    // });
    // reversedSequence.length = this.length;
    // var sequence = this;
    // reversedSequence.reverse = (maintainReversedIndices) => {
    //   if (maintainReversedIndices === maintainIndices) {
    //     return sequence;
    //   }
    //   return IndexedSequence.prototype.reverse.call(this, maintainReversedIndices);
    // };
    // return reversedSequence;

    return new ReversedIndexedSequence(this, maintainIndices);
  };

  IndexedSequence.prototype.fromEntries=function() {"use strict";
    var sequence = this.__makeSequence(
      function(fn)  {return function(e, _, c)  {return fn(e[1], e[0], c) !== false;};}
    );
    sequence.length = this.length;
    return sequence;
  };

  // Overridden to supply undefined length
  IndexedSequence.prototype.values=function() {"use strict";
    return new ValuesSequence(this);
  };

  IndexedSequence.prototype.filter=function(predicate, context, maintainIndices) {"use strict";
    //var seq = super.filter(predicate, context);
    // TODO: override to get correct length.
    //return maintainIndices ? seq : seq.values();


    var seq = this.__makeUberSequence(function(sequence, fn, reverse, flipIndices)  {
      var iterations = 0;
      var length = sequence.__iterate(function(v, ii, c)  {
        if (predicate.call(context, v, ii, c)) {
          if (fn(v, maintainIndices ? ii : iterations, c) !== false) {
            iterations++;
          } else {
            return false;
          }
        }
      }, reverse, flipIndices);
      return maintainIndices ? length : iterations;
    });
    if (maintainIndices) {
      seq.length = this.length;
    }
    return seq;
  };

  IndexedSequence.prototype.indexOf=function(searchValue) {"use strict";
    return this.findIndex(function(value)  {return value === searchValue;});
  };

  IndexedSequence.prototype.findIndex=function(predicate, context) {"use strict";
    var key = this.findKey(predicate, context);
    return key == null ? -1 : key;
  };

  IndexedSequence.prototype.lastIndexOf=function(searchValue) {"use strict";
    return this.reverse(true).indexOf(searchValue);
  };

  IndexedSequence.prototype.findLastIndex=function(predicate, context) {"use strict";
    return this.reverse(true).findIndex(predicate, context);
  };

  IndexedSequence.prototype.slice=function(start, end, maintainIndices) {"use strict";
    return new SliceIndexedSequence(this, start, end, maintainIndices);
  };

  //take(amount) {
  //  var seq = this.takeWhile((v, ii) => ii < amount);
  //  seq.length = this.length && Math.max(this.length, amount);
  //  return seq;
  //}

  // Overrides to get length correct.
  IndexedSequence.prototype.takeWhile=function(predicate, context, maintainIndices) {"use strict";
    var sequence = this;
    var takeSequence = this.__makeRawSequence('takeWhile');
    takeSequence.__iterateUncached = function(fn, reverse, flipIndices) {
      if (reverse) {
        // TODO: can we do a better job of this?
        return this.cacheResult().__iterate(fn, reverse, flipIndices);
      }
      var iterations = 0;
      // TODO: ensure didFinish is necessary here
      var didFinish = true;
      var length = sequence.__iterate(function(v, ii, c)  {
        if (predicate.call(context, v, ii, c) && fn(v, ii, c) !== false) {
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

    // return this.__makeUberSequence(false, (sequence, fn, reverse, alterIndices) => {
    //   var iterations = 0;
    //   var didFinish = true;
    //   var iterate = (reverse ? sequence.__reverseIterate : sequence.__iterate);
    //   var length = iterate.call(sequence, (v, ii, c) => {
    //     if (predicate.call(context, v, ii, c) && fn(v, ii, c) !== false) {
    //       iterations = ii;
    //     } else {
    //       didFinish = false;
    //       return false;
    //     }
    //   }, alterIndices);
    //   return didFinish ? length : iterations + 1;
    // });
  };

  //skipLast(amount, maintainIndices) {
  //  return this.reverse().skip(amount, maintainIndices).reverse();
  //}

  //skip(amount, maintainIndices) {
  //  var iterations = 0;
  //  return this.skipWhile(() => iterations++ < amount, maintainIndices);
  //  /*
//
  //  TODO: when both reverseIndices and sequence.__reverseIndices are true, then
  //  this is actually a "skipLast" which we haven't implementated yet and
  //  therefore does the wrong thing. We might emulate it with a takeUntil.
//
  //  We can probably do something similar with a "filter" based implementation. But
  //  I'm not sure if this will work or not if maintainIndices is false.
//
  //  */
  //  //var maxLength = this.length;
  //  //var newSequence = this.__makeRawSequence('skip');
  //  //var sequence = this;
  //  //newSequence.__iterate = (fn, reverseIndices) => {
  //  //  var reversedIndices = newSequence.__reversedIndices ^ reverseIndices;
  //  //  var predicate;
  //  //  if (reversedIndices) {
  //  //    if (maxLength == null) {
  //  //      var iterations = amount;
  //  //      predicate = (v, ii) => iterations-- > 0;
  //  //    } else {
  //  //      predicate = (v, ii) => ii >= maxLength - amount;
  //  //    }
  //  //  } else {
  //  //    predicate = (v, ii) => ii < amount;
  //  //  }
  //  //  var isSkipping = true;
  //  //  var indexOffset = 0;
  //  //  var length = sequence.__iterate((v, ii, c) => {
  //  //    if (isSkipping) {
  //  //      isSkipping = predicate(v, ii, c);
  //  //      if (isSkipping && !(isSkipping = predicate(v, ii, c))) {
  //  //       indexOffset = ii;
  //  //      }
  //  //    }
  //  //    return isSkipping || fn(v, reverseIndices || maintainIndices ? ii : ii - amount, c) !== false;
  //  //  }, reverseIndices);
  //  //  return newSequence.length || (maintainIndices ? length : reversedIndices ? indexOffset + 1 : length - amount);
  //  //};
  //  //newSequence.length = maintainIndices ? maxLength : maxLength && maxLength - amount;
  //  //return newSequence;
  //}

  IndexedSequence.prototype.skipWhile=function(predicate, context, maintainIndices) {"use strict";
    var newSequence = this.__makeRawSequence('skipWhile');
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
          isSkipping = predicate.call(context, v, ii, c);
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

  //skipUntil(predicate, context, maintainIndices) {
  //  return this.skipWhile(not(predicate), context, maintainIndices);
  //}

  // abstract __iterate(fn, reverse, flipIndices)

  IndexedSequence.prototype.__makeRawSequence=function() {"use strict";
    var newSequence = Object.create(IndexedSequence.prototype);
    newSequence.__reversedIndices = !!this.__reversedIndices;
    newSequence.__parentSequence = this.$IndexedSequence_parentSequence || this;
    return newSequence;
  };

  IndexedSequence.prototype.__makeUberSequence=function(factory) {"use strict";
    var sequence = this;
    var newSequence = this.__makeRawSequence();
    newSequence.__iterateUncached = function(fn, reverse, flipIndices)  {return factory(sequence, fn, reverse, flipIndices);};
    return newSequence;
  };

  IndexedSequence.prototype.__makeSequence=function(factory) {"use strict";
    var sequence = this;
    var newSequence = this.__makeRawSequence();
    newSequence.__iterateUncached = function(fn, reverse, flipIndices)  {return sequence.__iterate(factory(fn), reverse, flipIndices);};
    return newSequence;
  };


IndexedSequence.prototype.toJS = IndexedSequence.prototype.toArray;

IndexedSequence.prototype.__toStringMapper = quoteString;


/**
 * ValuesSequence re-indexes a sequence based on the iteration of values.
 */
for(var IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ValuesSequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}var ____SuperProtoOfIndexedSequence=IndexedSequence===null?null:IndexedSequence.prototype;ValuesSequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ValuesSequence.prototype.constructor=ValuesSequence;ValuesSequence.__superConstructor__=IndexedSequence;
  function ValuesSequence(sequence, length) {"use strict";
    this.__parentSequence = sequence.$ValuesSequence_parentSequence || sequence;
    this.$ValuesSequence_sequence = sequence;
    this.length = length;
  }

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
  function SliceIndexedSequence(sequence, start, end, maintainIndices) {"use strict";
    this.__parentSequence = sequence.$SliceIndexedSequence_parentSequence || sequence;
    this.__reversedIndices = sequence.__reversedIndices;
    this.$SliceIndexedSequence_sequence = sequence;
    this.$SliceIndexedSequence_start = start;
    this.$SliceIndexedSequence_end = end;
    this.$SliceIndexedSequence_maintainIndices = maintainIndices;
    this.length = sequence.length && (maintainIndices ? sequence.length : resolveEnd(end, sequence.length) - resolveStart(start, sequence.length));
  }

  SliceIndexedSequence.prototype.__iterateUncached=function(fn, reverse, flipIndices) {"use strict";
    if (reverse) {
      // TODO: reverse should be possible here.
      return this.cacheResult().__iterate(fn, reverse, flipIndices);
    }
    var reversedIndices = this.__reversedIndices ^ flipIndices;
    var sequence = this.$SliceIndexedSequence_sequence;
    if ((start < 0 || end < 0 || reversedIndices) && sequence.length == null) {
      sequence.cacheResult();
    }
    var start = resolveStart(this.$SliceIndexedSequence_start, sequence.length);
    var end = resolveEnd(this.$SliceIndexedSequence_end, sequence.length);
    var maintainIndices = this.$SliceIndexedSequence_maintainIndices;
    if (reversedIndices) {
      var newStart = sequence.length - end;
      end = sequence.length - start;
      start = newStart;
    }
    var length = sequence.__iterate(function(v, ii, c) 
      {return !(ii >= start && ii < end) || fn(v, maintainIndices ? ii : ii - start, c) !== false;},
      reverse, flipIndices
    );
    return this.length || (maintainIndices ? length : Math.max(0, length - start));
  };



for(IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ConcatIndexedSequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}ConcatIndexedSequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ConcatIndexedSequence.prototype.constructor=ConcatIndexedSequence;ConcatIndexedSequence.__superConstructor__=IndexedSequence;
  function ConcatIndexedSequence(sequence, values) {"use strict";
    this.$ConcatIndexedSequence_sequences = [sequence].concat(values).map(function(value)  {return Sequence(value);});
    this.length = this.$ConcatIndexedSequence_sequences.reduce(
      function(sum, seq)  {return sum != null && seq.length != null ? sum + seq.length : undefined;}, 0
    );
    this.$ConcatIndexedSequence_immutable = this.$ConcatIndexedSequence_sequences.every(function(seq)  {return !seq.isTransient();});
  }

  ConcatIndexedSequence.prototype.isTransient=function() {"use strict";
    return !this.$ConcatIndexedSequence_immutable;
  };

  ConcatIndexedSequence.prototype.asPersistent=function() {"use strict";
    this.$ConcatIndexedSequence_sequences.map(function(seq)  {return seq.asPersistent();});
    return this;
  };

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
  function ArraySequence(array, isImmutable) {"use strict";
    this.length = array.length;
    this.$ArraySequence_array = array;
    this.$ArraySequence_immutable = !!isImmutable;
  }

  ArraySequence.prototype.isTransient=function() {"use strict";
    return !this.$ArraySequence_immutable;
  };

  ArraySequence.prototype.asPersistent=function() {"use strict";
    this.$ArraySequence_array = this.$ArraySequence_array.slice();
    this.$ArraySequence_immutable = true;
    return this;
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
  function ObjectSequence(object, isImmutable) {"use strict";
    this.$ObjectSequence_object = object;
    this.$ObjectSequence_immutable = !!isImmutable;
  }

  ObjectSequence.prototype.isTransient=function() {"use strict";
    return !this.$ObjectSequence_immutable;
  };

  ObjectSequence.prototype.asPersistent=function() {"use strict";
    var prevObject = this.$ObjectSequence_object;
    this.$ObjectSequence_object = {};
    this.length = 0;
    this.$ObjectSequence_immutable = true;
    for (var key in prevObject) if (prevObject.hasOwnProperty(key)) {
      this.$ObjectSequence_object[key] = prevObject[key];
      this.length++;
    }
    return this;
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


function resolveStart(start, length) {
  return start < 0 ? Math.max(0, length + start) : length ? Math.min(length, start) : start;
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

function flipFactory(fn) {
  return function(v, k, c)  {return fn(k, v, c) !== false;};
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


exports.Sequence = Sequence;
exports.IndexedSequence = IndexedSequence;
