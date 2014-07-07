
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

  Sequence.prototype.concat=function() {"use strict";
    var values = [this].concat(arguments).map(Sequence);
    var concatSequence = this.__makeUberSequence('concat',true, function(reverse, sequence, fn)  {
      var shouldBreak;
      var iterations = 0;
      var lastIndex = values.length - 1;
      for (var ii = 0; ii !== lastIndex; ii++) {
        var seq = values[reverse ? lastIndex - ii : ii];
        var iterate = reverse ? seq.__reverseIterate : seq.__iterate;
        iterations += iterate.call(sequence, function(v, k, c)  {
          if (fn(v, k, c) === false) {
            shouldBreak = true;
            return false;
          }
        });
        if (shouldBreak) {
          break;
        }
      }
      return iterations;
    });
    concatSequence.length = values.reduce(function(sum, seq)  {
      if (sum != null && seq.length != null) {
        return sum + seq.length;
      }
    }, 0);
    return concatSequence;
  };

  Sequence.prototype.reverse=function() {"use strict";
    var reversedSequence = this.__makeUberSequence('reverse',true, function(reverse, sequence, fn)  {
      var iterate = reverse ? sequence.__iterate : sequence.__reverseIterate;
      return iterate.call(sequence, fn);
    });
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
    // flip() always returns a regular Sequence.
    var flippedSequence = Sequence.prototype.__makeSequence.call(this, 'flip',true, flipFactory);
    flippedSequence.length = this.length;
    var sequence = this;
    flippedSequence.flip = function()  {return sequence;};
    return flippedSequence;
  };

  Sequence.prototype.map=function(mapper, context) {"use strict";
    var mappedSequence = this.__makeSequence('map',true, function(fn)  {return function(v, k, c) 
      {return fn(mapper.call(context, v, k, c), k, c) !== false;};}
    );
    mappedSequence.length = this.length;
    return mappedSequence;
  };

  Sequence.prototype.filter=function(predicate, context) {"use strict";
    return this.__makeUberSequence('filter',true, function(reverse, sequence, fn)  {
      var iterations = 0;
      var iterate = (reverse ? sequence.__reverseIterate : sequence.__iterate);
      iterate.call(sequence, function(v, k, c)  {
        if (predicate.call(context, v, k, c)) {
          if (fn(v, k, c) !== false) {
            iterations++;
          } else {
            return false;
          }
        }
      });
      return iterations;
    });
  };

  Sequence.prototype.take=function(amount) {"use strict";
    var iterations = 0;
    return this.takeWhile(function()  {return iterations++ < amount;});
  };

  Sequence.prototype.takeWhile=function(predicate, context) {"use strict";

    return this.__makeUberSequence('takeWhile',false, function(reverse, sequence, fn, alterIndices)  {
      var iterations = 0;
      var iterate = (reverse ? sequence.__reverseIterate : sequence.__iterate);
      iterate.call(sequence, function(v, k, c)  {
        if (predicate.call(context, v, k, c) && fn(v, k, c) !== false) {
          iterations++;
        } else {
          return false;
        }
      }, alterIndices);
      return iterations;
    });

    // TODO: update to uber
    // return this.__makeSequence(false, fn => (v, k, c) =>
    //   predicate.call(context, v, k, c) && fn(v, k, c) !== false
    // );
  };

  Sequence.prototype.takeUntil=function(predicate, context) {"use strict";
    return this.takeWhile(not(predicate), context);
  };

  Sequence.prototype.skip=function(amount) {"use strict";
    var iterations = 0;
    return this.skipWhile(function()  {return iterations++ < amount;});
  };

  Sequence.prototype.skipWhile=function(predicate, context) {"use strict";
    return this.__makeUberSequence('skipWhile',false, function(reverse, sequence, fn)  {
      var isSkipping = true;
      var iterations = 0;
      var iterate = (reverse ? sequence.__reverseIterate : sequence.__iterate);
      iterate.call(sequence, function(v, k, c)  {
        if (!(isSkipping && (isSkipping = predicate.call(context, v, k, c)))) {
          if (fn(v, k, c) !== false) {
            iterations++;
          } else {
            return false;
          }
        }
      });
      return iterations;
    });


    // TODO: update to uber
    // return this.__makeSequence(false, fn => {
    //   var isSkipping = true;
    //   return (v, k, c) =>
    //     (isSkipping = isSkipping && predicate.call(context, v, k, c)) ||
    //     fn(v, k, c) !== false
    // });
  };

  Sequence.prototype.skipUntil=function(predicate, context) {"use strict";
    return this.skipWhile(not(predicate), context);
  };

  // abstract __iterate(fn)

  /**
   * The default implementation of this needs to make an intermediate
   * representation which may be inefficent or at worse infinite.
   * Subclasses should do better if possible.
   * Note: maintainIndices is only ever true for IndexedSequences.
   */
  Sequence.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    var temp = [];
    var collection;
    var length = this.__iterate(function(v, k, c)  {
      collection || (collection = c);
      temp.push([k, v]);
    });
    var maxIndex = length - 1;
    for (var ii = temp.length - 1; ii >= 0; ii--) {
      var entry = temp[ii];
      if (fn(entry[1], maintainIndices ? entry[0] : maxIndex - entry[0], collection) === false) {
        break;
      }
    }
    return maxIndex - ii;
  };

  Sequence.prototype.__makeRawSequence=function(name) {"use strict";
    var newSequence = Object.create(Sequence.prototype);
    newSequence.name = name;
    newSequence.__parentSequence = this.$Sequence_parentSequence || this;
    return newSequence;
  };

  Sequence.prototype.__makeUberSequence=function(name, withCommutativeReverse, factory) {"use strict";
    var sequence = this;
    var newSequence = this.__makeRawSequence(name);
    newSequence.__iterate = function(fn)  {return factory(false, sequence, fn);};
    if (withCommutativeReverse) {
      newSequence.__reverseIterate = function(fn)  {return factory(true, sequence, fn);};
    }
    return newSequence;
  };

  Sequence.prototype.__makeSequence=function(name, withCommutativeReverse, factory) {"use strict";
    var sequence = this;
    var newSequence = this.__makeRawSequence(name);
    newSequence.__iterate = function(fn)  {return sequence.__iterate(factory(fn));};
    if (withCommutativeReverse) {
      newSequence.__reverseIterate = function(fn)  {return sequence.__reverseIterate(factory(fn));};
    }
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
    array.length = this.__iterate(function(v, k)  { array[k] = v; });
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

  IndexedSequence.prototype.concat=function() {"use strict";
    return new ConcatIndexedSequence(this, arguments);
  };

  IndexedSequence.prototype.reverse=function(maintainIndices) {"use strict";
    // This should work right? It doesnt...
    // var reversedSequence = this.__makeUberSequence(true, (reverse, sequence, fn, alterIndices) => {
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

  // Overridden to supply undefined length
  IndexedSequence.prototype.values=function() {"use strict";
    return new ValuesSequence(this);
  };

  IndexedSequence.prototype.filter=function(predicate, context, maintainIndices) {"use strict";
    //var seq = super.filter(predicate, context);
    // TODO: override to get correct length.
    //return maintainIndices ? seq : seq.values();


    var seq = this.__makeUberSequence('filter', true, function(reverse, sequence, fn, alterIndices)  {
      var iterations = 0;
      var iterate = (reverse ? sequence.__reverseIterate : sequence.__iterate);
      var length = iterate.call(sequence, function(v, ii, c)  {
        if (predicate.call(context, v, ii, c)) {
          if (fn(v, maintainIndices ? ii : iterations, c) !== false) {
            iterations++;
          } else {
            return false;
          }
        }
      }, alterIndices);
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

  IndexedSequence.prototype.take=function(amount) {"use strict";
    var seq = this.takeWhile(function(v, ii)  {return ii < amount;});
    seq.length = this.length && Math.max(this.length, amount);
    return seq;
  };

  // Overrides to get length correct.
  IndexedSequence.prototype.takeWhile=function(predicate, context) {"use strict";
    var sequence = this;
    var takeSequence = this.__makeRawSequence('takeWhile');
    takeSequence.__iterate = function(fn, reverseIndices)  {
      var iterations = 0;
      var didFinish = true;
      var length = sequence.__iterate(function(v, ii, c)  {
        if (predicate.call(context, v, ii, c) && fn(v, ii, c) !== false) {
          iterations = ii;
        } else {
          didFinish = false;
          return false;
        }
      }, reverseIndices);
      return didFinish ? length : iterations + 1;
    };
    return takeSequence;

    // return this.__makeUberSequence(false, (reverse, sequence, fn, alterIndices) => {
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

  IndexedSequence.prototype.skip=function(amount, maintainIndices) {"use strict";
    /*

    TODO: when both reverseIndices and sequence.__reverseIndices are true, then
    this is actually a "skipLast" which we haven't implementated yet and
    therefore does the wrong thing. We might emulate it with a takeUntil.

    We can probably do something similar with a "filter" based implementation. But
    I'm not sure if this will work or not if maintainIndices is false.

    */
    var maxLength = this.length;
    var newSequence = this.__makeRawSequence('skip');
    var sequence = this;
    newSequence.__iterate = function(fn, reverseIndices)  {
      var reversedIndices = newSequence.__reversedIndices ^ reverseIndices;
      var predicate;
      if (reversedIndices) {
        if (maxLength == null) {
          var iterations = amount;
          predicate = function(v, ii)  {return iterations-- > 0;};
        } else {
          predicate = function(v, ii)  {return ii >= maxLength - amount;};
        }
      } else {
        predicate = function(v, ii)  {return ii < amount;};
      }
      var isSkipping = true;
      var indexOffset = 0;
      var length = sequence.__iterate(function(v, ii, c)  {
        if (isSkipping) {
          isSkipping = predicate(v, ii, c);
          if (isSkipping && !(isSkipping = predicate(v, ii, c))) {
           indexOffset = ii;
          }
        }
        return isSkipping || fn(v, reverseIndices || maintainIndices ? ii : ii - amount, c) !== false;
      }, reverseIndices);
      return newSequence.length || (maintainIndices ? length : reversedIndices ? indexOffset + 1 : length - amount);
    };
    newSequence.length = maintainIndices ? maxLength : maxLength && maxLength - amount;
    return newSequence;
  };

  IndexedSequence.prototype.skipWhile=function(predicate, context, maintainIndices) {"use strict";
    var newSequence = this.__makeRawSequence('skipWhile');
    var sequence = this;
    newSequence.__iterate = function(fn, reverseIndices)  {
      var reversedIndices = sequence.__reversedIndices ^ reverseIndices;
      var isSkipping = true;
      var indexOffset = 0;
      var length = sequence.__iterate(function(v, ii, c)  {
        if (isSkipping) {
          isSkipping = predicate.call(context, v, ii, c);
          if (!isSkipping) {
            indexOffset = ii;
          }
        }
        return isSkipping || fn(v, reverseIndices || maintainIndices ? ii : ii - indexOffset, c) !== false;
      }, reverseIndices);
      return maintainIndices ? length : reversedIndices ? indexOffset + 1 : length - indexOffset;
    };
    if (maintainIndices) {
      newSequence.length = this.length;
    }
    return newSequence;
  };

  IndexedSequence.prototype.skipUntil=function(predicate, context, maintainIndices) {"use strict";
    return this.skipWhile(not(predicate), context, maintainIndices);
  };

  // abstract __iterate(fn, reverseIndices)
  // abstract __reverseIterate(fn, maintainIndices)

  IndexedSequence.prototype.__makeRawSequence=function(name) {"use strict";
    if (!name) throw new Error('noname');
    var newSequence = Object.create(IndexedSequence.prototype);
    newSequence.name = 'indexed ' + name;
    newSequence.__reversedIndices = !!this.__reversedIndices;
    newSequence.__parentSequence = this.$IndexedSequence_parentSequence || this;
    return newSequence;
  };

  IndexedSequence.prototype.__makeUberSequence=function(name, withCommutativeReverse, factory) {"use strict";
    var sequence = this;
    var newSequence = this.__makeRawSequence(name);
    newSequence.__iterate = function(fn, reverseIndices)  {return factory(false, sequence, fn, reverseIndices);};
    if (withCommutativeReverse) {
      newSequence.__reverseIterate = function(fn, maintainIndices)  {return factory(true, sequence, fn, maintainIndices);};
    }
    return newSequence;
  };

  IndexedSequence.prototype.__makeSequence=function(name, withCommutativeReverse, factory) {"use strict";
    var sequence = this;
    var newSequence = this.__makeRawSequence(name);
    newSequence.__iterate = function(fn, reverseIndices) 
      {return sequence.__iterate(factory(fn), reverseIndices);};
    if (withCommutativeReverse) {
      newSequence.__reverseIterate = function(fn, maintainIndices) 
        {return sequence.__reverseIterate(factory(fn), maintainIndices);};
    }
    return newSequence;
  };


IndexedSequence.prototype.toJS = IndexedSequence.prototype.toArray;

IndexedSequence.prototype.__toStringMapper = quoteString;


/**
 * ValuesSequence re-indexes a sequence based on the iteration of values.
 */
for(var IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ValuesSequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}var ____SuperProtoOfIndexedSequence=IndexedSequence===null?null:IndexedSequence.prototype;ValuesSequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ValuesSequence.prototype.constructor=ValuesSequence;ValuesSequence.__superConstructor__=IndexedSequence;
  function ValuesSequence(sequence, length) {"use strict";
    this.name = 'indexed concat';
    this.__parentSequence = sequence.$ValuesSequence_parentSequence || sequence;
    this.$ValuesSequence_sequence = sequence;
    this.length = length;
  }

  ValuesSequence.prototype.__iterate=function(fn, reverseIndices) {"use strict";
    return this.$ValuesSequence_iterate(false, fn, reverseIndices);
  };

  ValuesSequence.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    return this.$ValuesSequence_iterate(true, fn, maintainIndices);
  };

  ValuesSequence.prototype.$ValuesSequence_iterate=function(reverse, fn, flipIndices) {"use strict";
    if (flipIndices && this.length == null) {
      var arraySeq = new ArraySequence(this.toArray(), true);
      return reverse ? arraySeq.__reverseIterate(fn, flipIndices) : arraySeq.__iterate(fn, flipIndices);
    }
    var iterations = 0;
    var predicate;
    if (flipIndices) {
      var maxIndex = this.length - 1;
      predicate = function(v, k, c)  {return fn(v, maxIndex - iterations++, c) !== false;};
    } else {
      predicate = function(v, k, c)  {return fn(v, iterations++, c) !== false;};
    }
    var sequence = this.$ValuesSequence_sequence;
    reverse ? sequence.__reverseIterate(predicate) : sequence.__iterate(predicate);
    return iterations;
  };



for(IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ConcatIndexedSequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}ConcatIndexedSequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ConcatIndexedSequence.prototype.constructor=ConcatIndexedSequence;ConcatIndexedSequence.__superConstructor__=IndexedSequence;
  function ConcatIndexedSequence(sequence, values) {"use strict";
    this.name = 'indexed concat';
    this.__parentSequence = sequence.$ConcatIndexedSequence_parentSequence || sequence;
    this.$ConcatIndexedSequence_sequences = [sequence].concat(values).map(Sequence);
    this.length = this.$ConcatIndexedSequence_sequences.reduce(function(sum, seq)  {
      if (sum != null && seq.length != null) {
        return sum + seq.length;
      }
    }, 0);
  }

  ConcatIndexedSequence.prototype.__iterate=function(fn, reverseIndices) {"use strict";
    if (reverseIndices && !this.length) {
      // In order to reverse indices, first we must create a cached
      // representation. This ensures we will have the correct total length
      // so index reversal works as expected.
      return new ArraySequence(this.toArray(), true).__iterate(fn, true);
    }
    var shouldBreak;
    var iterations = 0;
    var maxIndex = reverseIndices && this.length - 1;
    for (var ii = 0; ii < this.$ConcatIndexedSequence_sequences.length; ii++) {
      var sequence = this.$ConcatIndexedSequence_sequences[ii];
      if (!(sequence instanceof IndexedSequence)) {
        sequence = sequence.values();
      }
      iterations += sequence.__iterate(function(v, index, c)  {
        index += iterations;
        if (fn(v, reverseIndices ? maxIndex - index : index, c) === false) {
          shouldBreak = true;
          return false;
        }
      });
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
    this.name = 'indexed reverse';
    this.__reversedIndices = (!maintainIndices) !== (!sequence.__reversedIndices); // jshint ignore:line
    this.$ReversedIndexedSequence_sequence = sequence;
    this.$ReversedIndexedSequence_maintainIndices = maintainIndices;
  }

  ReversedIndexedSequence.prototype.reverse=function(maintainIndices) {"use strict";
    if (maintainIndices === this.$ReversedIndexedSequence_maintainIndices) {
      return this.$ReversedIndexedSequence_sequence;
    }
    return ____SuperProtoOfIndexedSequence.reverse.call(this,maintainIndices);
  };

  ReversedIndexedSequence.prototype.__iterate=function(fn, reverseIndices) {"use strict";
    return this.$ReversedIndexedSequence_sequence.__reverseIterate(fn, reverseIndices ^ this.$ReversedIndexedSequence_maintainIndices);
  };

  ReversedIndexedSequence.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    return this.$ReversedIndexedSequence_sequence.__iterate(fn, maintainIndices ^ this.$ReversedIndexedSequence_maintainIndices);
  };



for(IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ArraySequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}ArraySequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ArraySequence.prototype.constructor=ArraySequence;ArraySequence.__superConstructor__=IndexedSequence;
  function ArraySequence(array, isImmutable) {"use strict";
    this.name = 'array';
    this.length = array.length;
    this.$ArraySequence_array = array;
    if (isImmutable) {
      this.$ArraySequence_immutable = true;
    }
  }

  ArraySequence.prototype.isTransient=function() {"use strict";
    return !this.$ArraySequence_immutable;
  };

  ArraySequence.prototype.asPersistent=function() {"use strict";
    this.$ArraySequence_array = this.$ArraySequence_array.slice();
    this.$ArraySequence_immutable = true;
    return this;
  };

  ArraySequence.prototype.__iterate=function(fn, reverseIndices) {"use strict";
    var array = this.$ArraySequence_array;
    var maxIndex = array.length - 1;
    var lastIndex = -1;
    var didFinish = this.$ArraySequence_array.every(function(value, ii)  {
      if (fn(value, reverseIndices ? maxIndex - ii : ii, array) === false) {
        return false;
      } else {
        lastIndex = ii;
        return true;
      }
    });
    return didFinish ? array.length : lastIndex + 1;
  };

  ArraySequence.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    var array = this.$ArraySequence_array;
    var maxIndex = array.length - 1;
    var lastIndex = -1;
    for (var ii = maxIndex; ii >= 0; ii--) {
      if (array.hasOwnProperty(ii) &&
          fn(array[ii], maintainIndices ? ii : maxIndex - ii, array) === false) {
        return lastIndex + 1;
      }
      lastIndex = ii;
    }
    return array.length;
  };



for(Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){ObjectSequence[Sequence____Key]=Sequence[Sequence____Key];}}ObjectSequence.prototype=Object.create(____SuperProtoOfSequence);ObjectSequence.prototype.constructor=ObjectSequence;ObjectSequence.__superConstructor__=Sequence;
  function ObjectSequence(object) {"use strict";
    this.name = 'object';
    this.$ObjectSequence_object = object;
  }

  ObjectSequence.prototype.isTransient=function() {"use strict";
    return !this.$ObjectSequence_immutable;
  };

  ObjectSequence.prototype.asPersistent=function() {"use strict";
    var copy = {};
    for (var key in this.$ObjectSequence_object) if (this.$ObjectSequence_object.hasOwnProperty(key)) {
      copy[key] = this.$ObjectSequence_object[key];
    }
    this.$ObjectSequence_object = copy;
    this.$ObjectSequence_immutable = true;
    return this;
  };

  ObjectSequence.prototype.__iterate=function(fn) {"use strict";
    var object = this.$ObjectSequence_object;
    var iterations = 0;
    for (var key in object) if (object.hasOwnProperty(key)) {
      if (fn(object[key], key, object) === false) {
        break;
      }
      iterations++;
    }
    return iterations;
  };

  ObjectSequence.prototype.__reverseIterate=function(fn) {"use strict";
    var object = this.$ObjectSequence_object;
    var keys = Object.keys(object);
    for (var ii = keys.length - 1; ii >= 0; ii--) {
      if (fn(object[keys[ii]], keys[ii], object) === false) {
        return keys.length - ii + 1;
      }
    }
    return keys.length;
  };



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
