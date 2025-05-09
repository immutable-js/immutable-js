import {
  NOT_SET,
  IS_STACK_SYMBOL,
  IS_LIST_SYMBOL,
  IS_MAP_SYMBOL,
  IS_ORDERED_SYMBOL,
  IS_KEYED_SYMBOL,
  IS_COLLECTION_SYMBOL,
  IS_INDEXED_SYMBOL,
  IS_RECORD_SYMBOL,
  IS_SET_SYMBOL,
  IS_SEQ_SYMBOL,
  ITERATOR_SYMBOL_REAL,
  ITERATOR_SYMBOL_FAUX,
} from './const';

/**
 * True if `maybeOrderedMap` is an OrderedMap.
 */
const probeIsMapOrdered = (any) => {
  return Boolean(any && any[IS_MAP_SYMBOL] && any[IS_ORDERED_SYMBOL]);
};

/**
 * True if `maybeOrdered` is a Collection where iteration order is well
 * defined. True for Collection.Indexed as well as OrderedMap and OrderedSet.
 *
 * ```js
 * import { isOrdered, Map, OrderedMap, List, Set } from 'immutable';
 *
 * isOrdered([]); // false
 * isOrdered({}); // false
 * isOrdered(Map()); // false
 * isOrdered(OrderedMap()); // true
 * isOrdered(List()); // true
 * isOrdered(Set()); // false
 * ```
 */
const probeIsOrdered = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeOrdered is typed as `{}`, need to change in 6.0 to `maybeOrdered && typeof maybeOrdered === 'object' && IS_ORDERED_SYMBOL in maybeOrdered`
      any[IS_ORDERED_SYMBOL]
  );
};

/**
 * True if `maybeSeq` is a Seq.
 */
const probeIsSeq = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeSeq is typed as `{}`, need to change in 6.0 to `maybeSeq && typeof maybeSeq === 'object' && MAYBE_SEQ_SYMBOL in maybeSeq`
      any[IS_SEQ_SYMBOL]
  );
};

/**
 * True if `maybeCollection` is a Collection, or any of its subclasses.
 *
 * ```js
 * import { isCollection, Map, List, Stack } from 'immutable';
 *
 * isCollection([]); // false
 * isCollection({}); // false
 * isCollection(Map()); // true
 * isCollection(List()); // true
 * isCollection(Stack()); // true
 * ```
 */
const probeIsCollection = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeCollection is typed as `{}`, need to change in 6.0 to `maybeCollection && typeof maybeCollection === 'object' && IS_COLLECTION_SYMBOL in maybeCollection`
      any[IS_COLLECTION_SYMBOL]
  );
};

/**
 * True if `maybeOrderedSet` is an OrderedSet.
 */
const probeIsOrderedSet = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeOrdered is typed as `{}`, need to change in 6.0 to `maybeOrdered && typeof maybeOrdered === 'object' && IS_ORDERED_SYMBOL in maybeOrdered`
      any[IS_SET_SYMBOL] &&
      any[IS_ORDERED_SYMBOL]
  );
};

/**
 * True if `maybeSet` is a Set.
 *
 * Also true for OrderedSets.
 */
const probeIsSet = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeSet is typed as `{}`,  need to change in 6.0 to `maybeSeq && typeof maybeSet === 'object' && MAYBE_SET_SYMBOL in maybeSet`
      any[IS_SET_SYMBOL]
  );
};

/**
 * True if `maybeValue` is a JavaScript Object which has *both* `equals()`
 * and `hashCode()` methods.
 *
 * Any two instances of *value objects* can be compared for value equality with
 * `Immutable.is()` and can be used as keys in a `Map` or members in a `Set`.
 */
const probeIsValueObject = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeValue is typed as `{}`
      typeof any.equals === 'function' &&
      // @ts-expect-error: maybeValue is typed as `{}`
      typeof any.hashCode === 'function'
  );
};

/**
 * True if `maybeMap` is a Map.
 *
 * Also true for OrderedMaps.
 */
const probeIsMap = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeMap is typed as `{}`, need to change in 6.0 to `maybeMap && typeof maybeMap === 'object' && IS_MAP_SYMBOL in maybeMap`
      any[IS_MAP_SYMBOL]
  );
};

/**
 * True if `maybeStack` is a Stack.
 */
const probeIsStack = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeStack is typed as `{}`, need to change in 6.0 to `maybeStack && typeof maybeStack === 'object' && MAYBE_STACK_SYMBOL in maybeStack`
      any[IS_STACK_SYMBOL]
  );
};

/**
 * True if `maybeKeyed` is a Collection.Keyed, or any of its subclasses.
 *
 * ```js
 * import { isKeyed, Map, List, Stack } from 'immutable';
 *
 * isKeyed([]); // false
 * isKeyed({}); // false
 * isKeyed(Map()); // true
 * isKeyed(List()); // false
 * isKeyed(Stack()); // false
 * ```
 */
const probeIsKeyed = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeKeyed is typed as `{}`, need to change in 6.0 to `maybeKeyed && typeof maybeKeyed === 'object' && IS_KEYED_SYMBOL in maybeKeyed`
      any[IS_KEYED_SYMBOL]
  );
};

/**
 * True if `maybeIndexed` is a Collection.Indexed, or any of its subclasses.
 *
 * ```js
 * import { isIndexed, Map, List, Stack, Set } from 'immutable';
 *
 * isIndexed([]); // false
 * isIndexed({}); // false
 * isIndexed(Map()); // false
 * isIndexed(List()); // true
 * isIndexed(Stack()); // true
 * isIndexed(Set()); // false
 * ```
 */
const probeIsIndexed = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeIndexed is typed as `{}`, need to change in 6.0 to `maybeIndexed && typeof maybeIndexed === 'object' && IS_INDEXED_SYMBOL in maybeIndexed`
      any[IS_INDEXED_SYMBOL]
  );
};

/**
 * True if `maybeAssociative` is either a Keyed or Indexed Collection.
 *
 * ```js
 * import { isAssociative, Map, List, Stack, Set } from 'immutable';
 *
 * isAssociative([]); // false
 * isAssociative({}); // false
 * isAssociative(Map()); // true
 * isAssociative(List()); // true
 * isAssociative(Stack()); // true
 * isAssociative(Set()); // false
 * ```
 */
const probeIsAssociative = (any) => {
  return Boolean(any && (any[IS_KEYED_SYMBOL] || any[IS_INDEXED_SYMBOL]));
};

const probeIsRepeat = (any) => {
  return Boolean(any && any[IS_RECORD_SYMBOL]);
};

/**
 * True if `maybeRecord` is a Record.
 */
const probeIsRecord = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeRecord is typed as `{}`, need to change in 6.0 to `maybeRecord && typeof maybeRecord === 'object' && IS_RECORD_SYMBOL in maybeRecord`
      any[IS_RECORD_SYMBOL]
  );
};

/**
 * True if `maybeList` is a List.
 */
const probeIsList = (any) => {
  return Boolean(
    any &&
      // @ts-expect-error: maybeList is typed as `{}`, need to change in 6.0 to `maybeList && typeof maybeList === 'object' && IS_LIST_SYMBOL in maybeList`
      any[IS_LIST_SYMBOL]
  );
};

/**
 * True if `maybeImmutable` is an Immutable Collection or Record.
 *
 * Note: Still returns true even if the collections is within a `withMutations()`.
 *
 * ```js
 * import { isImmutable, Map, List, Stack } from 'immutable';
 * isImmutable([]); // false
 * isImmutable({}); // false
 * isImmutable(Map()); // true
 * isImmutable(List()); // true
 * isImmutable(Stack()); // true
 * isImmutable(Map().asMutable()); // true
 * ```
 */
const probeIsImmutable = (any) => {
  return Boolean(any && (any[IS_COLLECTION_SYMBOL] || any[IS_RECORD_SYMBOL]));
};

const probeIsPlainObject = ((toString) => (value) => {
  // The base prototype's toString deals with Argument objects and native namespaces like Math
  if (
    !value ||
    typeof value !== 'object' ||
    toString.call(value) !== '[object Object]'
  ) {
    return false;
  }

  const proto = Object.getPrototypeOf(value);
  if (proto === null) {
    return true;
  }

  // Iteratively going up the prototype chain is needed for cross-realm environments (differing contexts, iframes, etc)
  let parentProto = proto;
  let nextProto = Object.getPrototypeOf(proto);
  while (nextProto !== null) {
    parentProto = nextProto;
    nextProto = Object.getPrototypeOf(parentProto);
  }
  return parentProto === proto;
})(Object.prototype.toString);

/**
 * Returns true if the value is a potentially-persistent data structure, either
 * provided by Immutable.js or a plain Array or Object.
 */
const probeIsDataStructure = (any) => {
  return (
    typeof any === 'object' &&
    (probeIsImmutable(any) || Array.isArray(any) || probeIsPlainObject(any))
  );
};

const probeIsArrayLike = (value) => {
  if (Array.isArray(value) || typeof value === 'string') {
    return true;
  }

  // @ts-expect-error "Type 'unknown' is not assignable to type 'boolean'" : convert to Boolean
  return (
    value &&
    typeof value === 'object' &&
    // @ts-expect-error check that `'length' in value &&`
    Number.isInteger(value.length) &&
    // @ts-expect-error check that `'length' in value &&`
    value.length >= 0 &&
    // @ts-expect-error check that `'length' in value &&`
    (value.length === 0
      ? // Only {length: 0} is considered Array-like.
        Object.keys(value).length === 1
      : // An object is only Array-like if it has a property where the last value
        // in the array-like may be found (which could be undefined).
        // @ts-expect-error check that `'length' in value &&`
        value.hasOwnProperty(value.length - 1))
  );
};

const probeHasOwnProperty = Object.prototype.hasOwnProperty;

const probeIsIterator = (maybeIterator) => {
  return maybeIterator && typeof maybeIterator.next === 'function';
};

const probeHasIterator = (iterable) => {
  if (Array.isArray(iterable)) {
    // IE11 trick as it does not support `Symbol.iterator`
    return true;
  }

  const iteratorFn =
    iterable &&
    ((ITERATOR_SYMBOL_REAL && iterable[ITERATOR_SYMBOL_REAL]) ||
      iterable[ITERATOR_SYMBOL_FAUX]);

  return typeof iteratorFn === 'function';
};

/**
 * An extension of the "same-value" algorithm as [described for use by ES6 Map
 * and Set](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Map#Key_equality)
 *
 * NaN is considered the same as NaN, however -0 and 0 are considered the same
 * value, which is different from the algorithm described by
 * [`Object.is`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/is).
 *
 * This is extended further to allow Objects to describe the values they
 * represent, by way of `valueOf` or `equals` (and `hashCode`).
 *
 * Note: because of this extension, the key equality of Immutable.Map and the
 * value equality of Immutable.Set will differ from ES6 Map and Set.
 *
 * ### Defining custom values
 *
 * The easiest way to describe the value an object represents is by implementing
 * `valueOf`. For example, `Date` represents a value by returning a unix
 * timestamp for `valueOf`:
 *
 *     var date1 = new Date(1234567890000); // Fri Feb 13 2009 ...
 *     var date2 = new Date(1234567890000);
 *     date1.valueOf(); // 1234567890000
 *     assert( date1 !== date2 );
 *     assert( Immutable.is( date1, date2 ) );
 *
 * Note: overriding `valueOf` may have other implications if you use this object
 * where JavaScript expects a primitive, such as implicit string coercion.
 *
 * For more complex types, especially collections, implementing `valueOf` may
 * not be performant. An alternative is to implement `equals` and `hashCode`.
 *
 * `equals` takes another object, presumably of similar type, and returns true
 * if it is equal. Equality is symmetrical, so the same result should be
 * returned if this and the argument are flipped.
 *
 *     assert( a.equals(b) === b.equals(a) );
 *
 * `hashCode` returns a 32bit integer number representing the object which will
 * be used to determine how to store the value object in a Map or Set. You must
 * provide both or neither methods, one must not exist without the other.
 *
 * Also, an important relationship between these methods must be upheld: if two
 * values are equal, they *must* return the same hashCode. If the values are not
 * equal, they might have the same hashCode; this is called a hash collision,
 * and while undesirable for performance reasons, it is acceptable.
 *
 *     if (a.equals(b)) {
 *       assert( a.hashCode() === b.hashCode() );
 *     }
 *
 * All Immutable collections are Value Objects: they implement `equals()`
 * and `hashCode()`.
 */
const probeIsSame = (valueA, valueB) => {
  if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
    return true;
  }
  if (!valueA || !valueB) {
    return false;
  }
  if (
    typeof valueA.valueOf === 'function' &&
    typeof valueB.valueOf === 'function'
  ) {
    valueA = valueA.valueOf();
    valueB = valueB.valueOf();
    if (valueA === valueB || (valueA !== valueA && valueB !== valueB)) {
      return true;
    }
    if (!valueA || !valueB) {
      return false;
    }
  }

  return !!(
    probeIsValueObject(valueA) &&
    probeIsValueObject(valueB) &&
    valueA.equals(valueB)
  );
};

const probeIsKeyedLike = (any) => {
  return Boolean(
    any &&
      typeof any === 'object' &&
      !Array.isArray(any) &&
      (!probeIsImmutable(any) || any[IS_KEYED_SYMBOL] || any[IS_RECORD_SYMBOL])
  );
};

const probeIsIndexedLike = (any) => {
  return Boolean(any && (any[IS_INDEXED_SYMBOL] || Array.isArray(any)));
};

const probeIsMergeable = (a, b) => {
  // This logic assumes that a sequence can only fall into one of the three
  // categories mentioned above (since there's no `isSetLike()` method).
  return (
    probeIsIndexedLike(a) === probeIsIndexedLike(b) &&
    probeIsKeyedLike(a) === probeIsKeyedLike(b)
  );
};

const probeIsSameDeep = (a, b) => {
  if (a === b) {
    return true;
  }

  if (
    !probeIsCollection(b) ||
    // @ts-expect-error size should exists on Collection
    (a.size !== undefined && b.size !== undefined && a.size !== b.size) ||
    // @ts-expect-error __hash exists on Collection
    (a.__hash !== undefined &&
      // @ts-expect-error __hash exists on Collection
      b.__hash !== undefined &&
      // @ts-expect-error __hash exists on Collection
      a.__hash !== b.__hash) ||
    probeIsKeyed(a) !== probeIsKeyed(b) ||
    probeIsIndexed(a) !== probeIsIndexed(b) ||
    // @ts-expect-error Range extends Collection, which implements [Symbol.iterator], so it is valid
    probeIsOrdered(a) !== probeIsOrdered(b)
  ) {
    return false;
  }

  // @ts-expect-error size should exists on Collection
  if (a.size === 0 && b.size === 0) {
    return true;
  }

  const notAssociative = !probeIsAssociative(a);

  // @ts-expect-error Range extends Collection, which implements [Symbol.iterator], so it is valid
  if (probeIsOrdered(a)) {
    const entries = a.entries();
    // @ts-expect-error need to cast as boolean
    return (
      b.every((v, k) => {
        const entry = entries.next().value;
        return (
          entry &&
          probeIsSame(entry[1], v) &&
          (notAssociative || probeIsSame(entry[0], k))
        );
      }) && entries.next().done
    );
  }

  let flipped = false;

  if (a.size === undefined) {
    // @ts-expect-error size should exists on Collection
    if (b.size === undefined) {
      if (typeof a.cacheResult === 'function') {
        a.cacheResult();
      }
    } else {
      flipped = true;
      const _ = a;
      a = b;
      b = _;
    }
  }

  let allEqual = true;
  const bSize =
    // @ts-expect-error b is Range | Repeat | Collection<unknown, unknown> as it may have been flipped, and __iterate is valid
    b.__iterate((v, k) => {
      if (
        notAssociative
          ? // @ts-expect-error has exists on Collection
            !a.has(v)
          : flipped
            ? // @ts-expect-error type of `get` does not "catch" the version with `notSetValue`
              !probeIsSame(v, a.get(k, NOT_SET))
            : // @ts-expect-error type of `get` does not "catch" the version with `notSetValue`
              !probeIsSame(a.get(k, NOT_SET), v)
      ) {
        allEqual = false;
        return false;
      }
    });

  return (
    allEqual &&
    // @ts-expect-error size should exists on Collection
    a.size === bSize
  );
};

const probeCoerceKeyPath = (keyPath) => {
  if (probeIsArrayLike(keyPath) && typeof keyPath !== 'string') {
    return keyPath;
  }
  if (probeIsOrdered(keyPath)) {
    return keyPath.toArray();
  }
  throw new TypeError(
    'Invalid keyPath: expected Ordered Collection or Array: ' + keyPath
  );
};

export {
  probeIsImmutable,
  probeIsAssociative,
  probeIsValueObject,
  probeIsCollection,
  probeIsOrderedSet,
  probeIsOrdered,
  probeIsSeq,
  probeIsSet,
  probeIsMap,
  probeIsMapOrdered,
  probeIsMapOrdered as probeIsOrderedMap,
  probeIsList,
  probeIsRecord,
  probeIsRepeat,
  probeIsStack,
  probeIsKeyed,
  probeIsIndexed,
  probeIsPlainObject,
  probeIsDataStructure,
  probeIsArrayLike,
  probeIsSame,
  probeIsSameDeep,
  probeHasOwnProperty,
  probeHasIterator,
  probeIsIterator,
  probeIsMergeable,
  probeCoerceKeyPath,
};
