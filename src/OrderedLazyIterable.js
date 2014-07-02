var LazyIterable = require('./LazyIterable');

class OrderedLazyIterable extends LazyIterable {
  // abstract iterate(fn)

  reverseIterate(fn) {
    /**
     * Note: the default implementation of this needs to make an intermediate
     * representation which may be inefficent or at worse infinite.
     * Subclasses should do better if possible.
     */
    var temp = [];
    var collection;
    this.iterate((v, i, c) => {
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
  }

  // This and toVector should go away, or be replaced by the "LazyIterable" version
  toArray() {
    var array = [];
    this.iterate((v, k) => { array[k] = v; });
    return array;
  }

  toVector() {
    // Use Late Binding here to solve the circular dependency.
    return require('./Vector').empty().merge(this);
  }

  reverse() {
    return new ReverseIterator(this);
  }

  // This is identical to LazyIterable
  keys() {
    return this.map((v, k) => k).values();
  }

  values() {
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    var valuesIterator = (fn, alterIndicies) => {
      var iterations = 0;
      return iterator.iterate(
        (v, k, c) => fn(v, iterations++, c) !== false,
        alterIndicies
      );
    }
    // Late static binding, to avoid circular dependency issues.
    // values() always returns an Indexed sequence.
    var IndexedLazyIterable = require('./IndexedLazyIterable');
    return IndexedLazyIterable.prototype.__makeIterator.call(this, valuesIterator, valuesIterator);
  }

  entries() {
    return this.map((v, k) => [k, v]).values();
  }

  first(predicate, context) {
    var firstValue;
    (fn ? this.filter(predicate, context) : this).take(1).forEach(v => { firstValue = v; });
    return firstValue;
  }

  last(predicate, context) {
    return this.reverse(true).first(predicate, context);
  }

  reduceRight(reducer, initialReduction, context) {
    return this.reverse(true).reduce(reducer, initialReduction, context);
  }

  map(mapper, context) {
    var mapIterator = (fn, alterIndices) => iterator.iterate(
      (v, k, c) => fn(mapper.call(context, v, k, c), k, c) !== false,
      alterIndices
    );
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    return this.__makeIterator(mapIterator, mapIterator);
  }

  // remove "maintainIndicies"
  filter(predicate, context) {
    var iterator = this;
    var filterIterator = (fn, alterIndices) => iterator.iterate(
      (v, k, c) => !predicate.call(context, v, k, c) || fn(v, k, c) !== false,
      alterIndices
    );
    return this.__makeIterator(filterIterator, filterIterator);
  }

  findLast(predicate, context) {
    return this.reverse(true).find(predicate, context);
  }

  findLastKey(predicate, context) {
    return this.reverse(true).findKey(predicate, context);
  }

  take(amount) {
    var iterations = 0;
    return this.takeWhile(() => iterations++ < amount);
  }

  takeWhile(predicate, context) {
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    return this.__makeIterator(
      (fn, reverseIndices) => iterator.iterate(
        (v, k, c) => predicate.call(context, v, k, c) && fn(v, k, c) !== false,
        reverseIndices
      )
      // reverse(take(x)) and take(reverse(x)) are not commutative.
    );
  }

  takeUntil(predicate, context) {
    return this.takeWhile(not(predicate), context);
  }

  skip(amount) {
    var iterations = 0;
    return this.skipWhile(() => iterations++ < amount, null);
  }

  skipWhile(predicate, context) {
    // TODO: can __makeIterator reduce boilerplate?
    var iterator = this;
    return this.__makeIterator(
      (fn, reverseIndices) => {
        var isSkipping = true;
        return iterator.iterate(
          (v, k, c) =>
            (isSkipping = isSkipping && predicate.call(context, v, k, c)) ||
            fn(v, k, c) !== false,
          reverseIndices
        );
      }
      // reverse(skip(x)) and skip(reverse(x)) are not commutative.
    );
  }

  skipUntil(predicate, context) {
    return this.skipWhile(not(predicate), context);
  }

  __makeIterator(iterate, reverseIterate) {
    var iterator = Object.create(OrderedLazyIterable.prototype);
    iterator.iterate = iterate;
    reverseIterate && (iterator.reverseIterate = reverseIterate);
    return iterator;
  }
}

function not(predicate) {
  return function() {
    return !predicate.apply(this, arguments);
  }
}

class ReverseIterator extends OrderedLazyIterable {
  constructor(iterator) {
    this.iterator = iterator;
  }

  iterate(fn) {
    return this.iterator.reverseIterate(fn);
  }

  reverseIterate(fn) {
    return this.iterator.iterate(fn);
  }

  reverse() {
    return this.iterator;
  }
}

// // TODO: this needs to be lazily done.
// class ValueIterator extends IndexedLazyIterable {
//   constructor(iterator) {
//     this.iterator = iterator;
//   }

//   iterate(fn, reverseIndices) {
//     var iterations = 0;
//     return this.iterator.iterate(
//       (v, k, c) => fn(v, iterations++, c) !== false,
//       null,
//       reverseIndices
//     );
//   }

//   // This is equivalent to values(reverse(x)) and takes advantage of the fact that
//   // these two functions are commutative.
//   reverseIterate(fn, maintainIndices) {
//     var iterations = 0;
//     return this.iterator.reverseIterate(
//       (v, k, c) => fn(v, iterations++, c) !== false,
//       null,
//       maintainIndices
//     );
//   }
// }

// class MapIterator extends OrderedLazyIterable {
//   constructor(iterator, mapper, mapThisArg) {
//     this.iterator = iterator;
//     this.mapper = mapper;
//     this.mapThisArg = mapThisArg;
//   }

//   iterate(fn, reverseIndices) {
//     var map = this.mapper;
//     var mapThisArg = this.mapThisArg;
//     return this.iterator.iterate(
//       (v, k, c) => fn(map.call(mapThisArg, v, k, c), k, c) !== false,
//       null,
//       reverseIndices
//     );
//   }

//   // This is equivalent to map(reverse(x)) and takes advantage of the fact that
//   // these two functions are commutative.
//   reverseIterate(fn, maintainIndices) {
//     var map = this.mapper;
//     var mapThisArg = this.mapThisArg;
//     return this.iterator.reverseIterate(
//       (v, k, c) => fn(map.call(mapThisArg, v, k, c), k, c) !== false,
//       null,
//       maintainIndices
//     );
//   }
// }

// class FilterIterator extends OrderedLazyIterable {
//   constructor(iterator, predicate, predicateThisArg) {
//     this.iterator = iterator;
//     this.predicate = predicate;
//     this.predicateThisArg = predicateThisArg;
//   }

//   iterate(fn, reverseIndices) {
//     var predicate = this.predicate;
//     var predicateThisArg = this.predicateThisArg;
//     return this.iterator.iterate(
//       (v, k, c) =>
//         !predicate.call(predicateThisArg, v, k, c) ||
//         fn(v, k, c) !== false,
//       null,
//       reverseIndices
//     );
//   }

//   // This is equivalent to filter(reverse(x)) and takes advantage of the fact that
//   // these two functions are commutative.
//   reverseIterate(fn, maintainIndices) {
//     var predicate = this.predicate;
//     var predicateThisArg = this.predicateThisArg;
//     return this.iterator.reverseIterate(
//       (v, k, c) =>
//         !predicate.call(predicateThisArg, v, k, c) ||
//         fn(v, k, c) !== false,
//       null,
//       maintainIndices
//     );
//   }
// }

// class TakeIterator extends OrderedLazyIterable {
//   constructor(iterator, predicate, predicateThisArg) {
//     this.iterator = iterator;
//     this.predicate = predicate;
//     this.predicateThisArg = predicateThisArg;
//   }

//   iterate(fn, reverseIndices) {
//     var predicate = this.predicate;
//     var predicateThisArg = this.predicateThisArg;
//     return this.iterator.iterate(
//       (v, k, c) =>
//         predicate.call(predicateThisArg, v, k, c) &&
//         fn(v, k, c) !== false,
//       null,
//       reverseIndices
//     );
//   }

//   // Use default impl for reverseIterate because reverse(take(x)) and
//   // take(reverse(x)) are not commutative.
// }

// class SkipIterator extends OrderedLazyIterable {
//   constructor(iterator, predicate, predicateThisArg) {
//     this.iterator = iterator;
//     this.predicate = predicate;
//     this.predicateThisArg = predicateThisArg;
//   }

//   iterate(fn, reverseIndices) {
//     var predicate = this.predicate;
//     var predicateThisArg = this.predicateThisArg;
//     var isSkipping = true;
//     return this.iterator.iterate(
//       (v, k, c) =>
//         (isSkipping = isSkipping && predicate.call(predicateThisArg, v, k, c)) ||
//         fn(v, k, c) !== false,
//       null,
//       reverseIndices
//     );
//   }

//   // Use default impl for reverseIterate because reverse(skip(x)) and
//   // skip(reverse(x)) are not commutative.
// }

module.exports = OrderedLazyIterable;
