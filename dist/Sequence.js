
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
    if (this.length && other.length && this.length !== other.length) {
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

  Sequence.prototype.reverse=function() {"use strict";
    return new ReversedSequence(this);
  };

  Sequence.prototype.keys=function() {"use strict";
    return this.map(keyMapper).values();
  };

  Sequence.prototype.values=function() {"use strict";
    // values() always returns an Indexed sequence.
    return IndexedSequence.prototype.__makeSequence.call(this, true, valuesFactory);
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

  Sequence.prototype.find=function(predicate, context) {"use strict";
    var foundValue;
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

  Sequence.prototype.findLast=function(predicate, context) {"use strict";
    return this.reverse(true).find(predicate, context);
  };

  Sequence.prototype.findLastKey=function(predicate, context) {"use strict";
    return this.reverse(true).findKey(predicate, context);
  };

  Sequence.prototype.flip=function() {"use strict";
    return this.__makeSequence(true, flipFactory);
  };

  Sequence.prototype.map=function(mapper, context) {"use strict";
    return this.__makeSequence(true, function(fn)  {return function(v, k, c) 
      {return fn(mapper.call(context, v, k, c), k, c) !== false;};}
    );
  };

  Sequence.prototype.filter=function(predicate, context) {"use strict";
    return this.__makeSequence(true, function(fn)  {return function(v, k, c) 
      {return !predicate.call(context, v, k, c) || fn(v, k, c) !== false;};}
    );
  };

  Sequence.prototype.take=function(amount) {"use strict";
    var iterations = 0;
    return this.takeWhile(function()  {return iterations++ < amount;});
  };

  Sequence.prototype.takeWhile=function(predicate, context) {"use strict";
    return this.__makeSequence(false, function(fn)  {return function(v, k, c) 
      {return predicate.call(context, v, k, c) && fn(v, k, c) !== false;};}
    );
  };

  Sequence.prototype.takeUntil=function(predicate, context) {"use strict";
    return this.takeWhile(not(predicate), context);
  };

  Sequence.prototype.skip=function(amount) {"use strict";
    var iterations = 0;
    return this.skipWhile(function()  {return iterations++ < amount;});
  };

  Sequence.prototype.skipWhile=function(predicate, context) {"use strict";
    return this.__makeSequence(false, function(fn)  {
      var isSkipping = true;
      return function(v, k, c) 
        {return (isSkipping = isSkipping && predicate.call(context, v, k, c)) ||
        fn(v, k, c) !== false;}
    });
  };

  Sequence.prototype.skipUntil=function(predicate, context) {"use strict";
    return this.skipWhile(not(predicate), context);
  };

  // abstract __iterate(fn)

  /**
   * Note: the default implementation of this needs to make an intermediate
   * representation which may be inefficent or at worse infinite.
   * Subclasses should do better if possible.
   */
  Sequence.prototype.__reverseIterate=function(fn) {"use strict";
    var temp = [];
    var collection;
    this.__iterate(function(v, k, c)  {
      collection || (collection = c);
      temp.push([k, v]);
    });
    for (var ii = temp.length - 1; ii >= 0; ii--) {
      var entry = temp[ii];
      if (fn(entry[1], entry[0], collection) === false) {
        return false;
      }
    }
    return true;
  };

  Sequence.prototype.__makeSequence=function(withCommutativeReverse, factory) {"use strict";
    var sequence = this;
    var newSequence = Object.create(Sequence.prototype);
    newSequence.__parentSequence = sequence.$Sequence_parentSequence || sequence;
    newSequence.__iterate = function(fn)  {return sequence.__iterate(factory(fn));};
    if (withCommutativeReverse) {
      newSequence.__reverseIterate = function(fn)  {return sequence.__reverseIterate(factory(fn));};
    }
    return newSequence;
  };


Sequence.prototype.toJS = Sequence.prototype.toObject;


for(var Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){ReversedSequence[Sequence____Key]=Sequence[Sequence____Key];}}var ____SuperProtoOfSequence=Sequence===null?null:Sequence.prototype;ReversedSequence.prototype=Object.create(____SuperProtoOfSequence);ReversedSequence.prototype.constructor=ReversedSequence;ReversedSequence.__superConstructor__=Sequence;
  function ReversedSequence(iterator) {"use strict";
    this.__parentSequence = iterator.$ReversedSequence_parentSequence || iterator;
    this.$ReversedSequence_iterator = iterator;
  }

  ReversedSequence.prototype.reverse=function() {"use strict";
    return this.$ReversedSequence_iterator;
  };

  ReversedSequence.prototype.__iterate=function(fn) {"use strict";
    return this.$ReversedSequence_iterator.__reverseIterate(fn);
  };

  ReversedSequence.prototype.__reverseIterate=function(fn) {"use strict";
    return this.$ReversedSequence_iterator.__iterate(fn);
  };



for(Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){IndexedSequence[Sequence____Key]=Sequence[Sequence____Key];}}IndexedSequence.prototype=Object.create(____SuperProtoOfSequence);IndexedSequence.prototype.constructor=IndexedSequence;IndexedSequence.__superConstructor__=Sequence;function IndexedSequence(){"use strict";if(Sequence!==null){Sequence.apply(this,arguments);}}

  IndexedSequence.prototype.toString=function() {"use strict";
    return this.__toString('Seq [', ']');
  };

  IndexedSequence.prototype.toArray=function() {"use strict";
    var array = [];
    this.__iterate(function(v, k)  { array[k] = v; });
    if (this.length) {
      array.length = this.length;
    }
    return array;
  };

  IndexedSequence.prototype.toVector=function() {"use strict";
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').transientWithSize(this.length).merge(this).asPersistent();
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

  IndexedSequence.prototype.reverse=function(maintainIndices) {"use strict";
    return new ReversedIndexedSequence(this, maintainIndices);
  };

  IndexedSequence.prototype.map=function(mapper, context) {"use strict";
    var seq = ____SuperProtoOfSequence.map.call(this,mapper, context);
    // Length is preserved when mapping.
    if (this.length) {
      seq.length = this.length;
    }
    return seq;
  };

  IndexedSequence.prototype.filter=function(predicate, context, maintainIndices) {"use strict";
    var seq = ____SuperProtoOfSequence.filter.call(this,predicate, context);
    return maintainIndices ? seq : seq.values();
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

  IndexedSequence.prototype.skip=function(amount, maintainIndices) {"use strict";
    var iterations = 0;
    return this.skipWhile(function()  {return iterations++ < amount;}, null, maintainIndices);
  };

  IndexedSequence.prototype.skipWhile=function(predicate, context, maintainIndices) {"use strict";
    return this.__makeSequence(false, function(fn)  {
      var isSkipping = true;
      var indexOffset = 0;
      return function(v, i, c)  {
        if (isSkipping) {
          isSkipping = predicate.call(context, v, i, c);
          if (!maintainIndices && !isSkipping) {
            indexOffset = i;
          }
        }
        return isSkipping || fn(v, i - indexOffset, c) !== false;
      };
    });
  };

  IndexedSequence.prototype.skipUntil=function(predicate, context, maintainIndices) {"use strict";
    return this.skipWhile(not(predicate), context, maintainIndices);
  };

  // __iterate(fn, reverseIndices) is abstract

  /**
   * Note: the default implementation of this needs to make an intermediate
   * representation which may be inefficent or at worse infinite.
   * Subclasses should do better if possible.
   */
  IndexedSequence.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    var temp = [];
    var collection;
    this.__iterate(function(v, i, c)  {
      collection || (collection = c);
      temp[i] = v;
    });
    var maxIndex = temp.length - 1;
    for (var ii = maxIndex; ii >= 0; ii--) {
      if (temp.hasOwnProperty(ii) &&
          fn(temp[ii], maintainIndices ? ii : maxIndex - ii, collection) === false) {
        return false;
      }
    }
    return true;
  };

  IndexedSequence.prototype.__makeSequence=function(withCommutativeReverse, factory) {"use strict";
    var sequence = this;
    var newSequence = Object.create(IndexedSequence.prototype);
    newSequence.__parentSequence = sequence.$IndexedSequence_parentSequence || sequence;
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


for(var IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ReversedIndexedSequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}var ____SuperProtoOfIndexedSequence=IndexedSequence===null?null:IndexedSequence.prototype;ReversedIndexedSequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ReversedIndexedSequence.prototype.constructor=ReversedIndexedSequence;ReversedIndexedSequence.__superConstructor__=IndexedSequence;
  function ReversedIndexedSequence(iterator, maintainIndices) {"use strict";
    if (iterator.length) {
      this.length = iterator.length;
    }
    this.$ReversedIndexedSequence_iterator = iterator;
    this.$ReversedIndexedSequence_maintainIndices = maintainIndices;
  }

  ReversedIndexedSequence.prototype.reverse=function(maintainIndices) {"use strict";
    if (maintainIndices === this.$ReversedIndexedSequence_maintainIndices) {
      return this.$ReversedIndexedSequence_iterator;
    }
    return ____SuperProtoOfIndexedSequence.reverse.call(this,maintainIndices);
  };

  ReversedIndexedSequence.prototype.__iterate=function(fn, reverseIndices) {"use strict";
    return this.$ReversedIndexedSequence_iterator.__reverseIterate(fn, reverseIndices !== this.$ReversedIndexedSequence_maintainIndices);
  };

  ReversedIndexedSequence.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    return this.$ReversedIndexedSequence_iterator.__iterate(fn, maintainIndices !== this.$ReversedIndexedSequence_maintainIndices);
  };



for(IndexedSequence____Key in IndexedSequence){if(IndexedSequence.hasOwnProperty(IndexedSequence____Key)){ArraySequence[IndexedSequence____Key]=IndexedSequence[IndexedSequence____Key];}}ArraySequence.prototype=Object.create(____SuperProtoOfIndexedSequence);ArraySequence.prototype.constructor=ArraySequence;ArraySequence.__superConstructor__=IndexedSequence;
  function ArraySequence(array, isImmutable) {"use strict";
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
    return this.$ArraySequence_array.every(function(value, index) 
      {return fn(value, reverseIndices ? maxIndex - index : index, array) !== false;}
    );
  };

  ArraySequence.prototype.__reverseIterate=function(fn, maintainIndices) {"use strict";
    var array = this.$ArraySequence_array;
    var maxIndex = array.length - 1;
    for (var ii = maxIndex; ii >= 0; ii--) {
      if (array.hasOwnProperty(ii) &&
          fn(array[ii], maintainIndices ? ii : maxIndex - ii, array) === false) {
        return false;
      }
    }
    return true;
  };



for(Sequence____Key in Sequence){if(Sequence.hasOwnProperty(Sequence____Key)){ObjectSequence[Sequence____Key]=Sequence[Sequence____Key];}}ObjectSequence.prototype=Object.create(____SuperProtoOfSequence);ObjectSequence.prototype.constructor=ObjectSequence;ObjectSequence.__superConstructor__=Sequence;
  function ObjectSequence(object) {"use strict";
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
    for (var key in object) {
      if (object.hasOwnProperty(key) && fn(object[key], key, object) === false) {
        return false;
      }
    }
    return true;
  };

  ObjectSequence.prototype.__reverseIterate=function(fn) {"use strict";
    var object = this.$ObjectSequence_object;
    var keys = Object.keys(object);
    for (var ii = keys.length - 1; ii >= 0; ii--) {
      if (fn(object[keys[ii]], keys[ii], object) === false) {
        return false;
      }
    }
    return true;
  };



function keyMapper(v, k) {
  return k;
}

function entryMapper(v, k) {
  return [k, v];
}

function valuesFactory(fn) {
  var iterations = 0;
  return function(v, k, c)  {return fn(v, iterations++, c) !== false;};
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
