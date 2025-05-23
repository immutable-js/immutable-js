export const VERSION = 'v5';

export const SIDEBAR_LINKS = [
  {
    label: 'List',
    description:
      'Lists are ordered indexed dense collections, much like a JavaScript Array.',
    url: `/docs/${VERSION}/List`,
  },
  {
    label: 'Map',
    description:
      'Immutable Map is an unordered Collection.Keyed of (key, value) pairs with O(log32 N) gets and O(log32 N) persistent sets.',
    url: `/docs/${VERSION}/Map`,
  },
  {
    label: 'OrderedMap',
    description:
      'A type of Map that has the additional guarantee that the iteration order of entries will be the order in which they were set().',
    url: `/docs/${VERSION}/OrdererMap`,
  },
  {
    label: 'Set',
    description: 'A Collection of unique values with O(log32 N) adds and has.',
    url: `/docs/${VERSION}/Set`,
  },
  {
    label: 'OrderedSet',
    description:
      'A type of Set that has the additional guarantee that the iteration order of values will be the order in which they were added.',
    url: `/docs/${VERSION}/OrderedSet`,
  },
  {
    label: 'Stack',
    description:
      'Stacks are indexed collections which support very efficient O(1) addition and removal from the front using unshift(v) and shift().',
    url: `/docs/${VERSION}/Stack`,
  },
  {
    label: 'Range()',
    description:
      'Returns a Seq.Indexed of numbers from start (inclusive) to end (exclusive), by step, where start defaults to 0, step to 1, and end to infinity. When start is equal to end, returns empty range.',
    url: `/docs/${VERSION}/Range()`,
  },
  {
    label: 'Repeat()',
    description:
      'Returns a Seq.Indexed of value repeated times times. When times is not defined, returns an infinite Seq of value.',
    url: `/docs/${VERSION}/Repeat()`,
  },
  {
    label: 'Record',
    description:
      'A record is similar to a JS object, but enforces a specific set of allowed string keys, and has default values.',
    url: `/docs/${VERSION}/Record`,
  },
  {
    label: 'Record.Factory',
    description:
      'A Record.Factory is created by the Record() function. Record instances are created by passing it some of the accepted values for that Record type:',
    url: `/docs/${VERSION}/Record.Factory`,
  },
  {
    label: 'Seq',
    description:
      'Seq describes a lazy operation, allowing them to efficiently chain use of all the higher-order collection methods (such as map and filter) by not creating intermediate collections.',
    url: `/docs/${VERSION}/Seq`,
  },
  {
    label: 'Seq.Keyed',
    description: 'Seq which represents key-value pairs.',
    url: `/docs/${VERSION}/Seq.Keyed`,
  },
  {
    label: 'Seq.Indexed',
    description: 'Seq which represents an ordered indexed list of values.',
    url: `/docs/${VERSION}/Seq.Indexed`,
  },
  {
    label: 'Seq.Set',
    description: 'Seq which represents a set of values.',
    url: `/docs/${VERSION}/Seq.Set`,
  },
  {
    label: 'Collection',
    description:
      'The Collection is a set of (key, value) entries which can be iterated, and is the base class for all collections in immutable, allowing them to make use of all the Collection methods (such as map and filter).',
    url: `/docs/${VERSION}/Collection`,
  },
  {
    label: 'Collection.Keyed',
    description: 'Keyed Collections have discrete keys tied to each value.',
    url: `/docs/${VERSION}/Collection.Keyed`,
  },
  {
    label: 'Collection.Indexed',
    description:
      "Indexed Collections have incrementing numeric keys. They exhibit slightly different behavior than Collection.Keyed for some methods in order to better mirror the behavior of JavaScript's Array, and add methods which do not make sense on non-indexed Collections such as indexOf.",
    url: `/docs/${VERSION}/Collection.Indexed`,
  },
  {
    label: 'Collection.Set',
    description:
      'Set Collections only represent values. They have no associated keys or indices. Duplicate values are possible in the lazy Seq.Sets, however the concrete Set Collection does not allow duplicate values.',
    url: `/docs/${VERSION}/Collection.Set`,
  },
  {
    label: 'ValueObject',
    description: '',
    url: `/docs/${VERSION}/ValueObject`,
  },
  {
    label: 'OrderedCollection',
    description: '',
    url: `/docs/${VERSION}/OrderedCollection`,
  },

  // functions
  { label: 'fromJS()', description: '', url: `/docs/${VERSION}/fromJS()` },
  {
    label: 'is()',
    description:
      'Value equality check with semantics similar to Object.is, but treats Immutable Collections as values, equal if the second Collection includes equivalent values.',
    url: `/docs/${VERSION}/is()`,
  },
  {
    label: 'hash()',
    description:
      'The hash() function is an important part of how Immutable determines if two values are equivalent and is used to determine how to store those values. Provided with any value, hash() will return a 31-bit integer.',
    url: `/docs/${VERSION}/hash()`,
  },
  {
    label: 'isImmutable()',
    description: 'True if maybeImmutable is an Immutable Collection or Record.',
    url: `/docs/${VERSION}/isImmutable()`,
  },
  {
    label: 'isCollection()',
    description:
      'True if maybeCollection is a Collection, or any of its subclasses.',
    url: `/docs/${VERSION}/isCollection()`,
  },
  {
    label: 'isKeyed()',
    description:
      'True if maybeKeyed is a Collection.Keyed, or any of its subclasses.',
    url: `/docs/${VERSION}/isKeyed()`,
  },
  {
    label: 'isIndexed()',
    description:
      'True if maybeIndexed is a Collection.Indexed, or any of its subclasses.',
    url: `/docs/${VERSION}/isIndexed()`,
  },
  {
    label: 'isAssociative()',
    description:
      'True if maybeAssociative is either a Keyed or Indexed Collection.',
    url: `/docs/${VERSION}/isAssociative()`,
  },
  {
    label: 'isOrdered()',
    description: '',
    url: `/docs/${VERSION}/isOrdered()`,
  },
  {
    label: 'isValueObject()',
    description:
      'True if maybeValue is a JavaScript Object which has both equals() and hashCode() methods.',
    url: `/docs/${VERSION}/isValueObject()`,
  },
  {
    label: 'isSeq()',
    description: 'True if maybeSeq is a Seq.',
    url: `/docs/${VERSION}/isSeq()`,
  },
  {
    label: 'isList()',
    description: 'True if maybeList is a List.',
    url: `/docs/${VERSION}/isList()`,
  },
  {
    label: 'isMap()',
    description: 'True if maybeMap is a Map.',
    url: `/docs/${VERSION}/isMap()`,
  },
  {
    label: 'isOrderedMap()',
    description: 'True if maybeOrderedMap is an OrderedMap.',
    url: `/docs/${VERSION}/isOrderedMap()`,
  },
  {
    label: 'isStack()',
    description: 'True if maybeStack is a Stack.',
    url: `/docs/${VERSION}/isStack()`,
  },
  {
    label: 'isSet()',
    description: 'True if maybeSet is a Set.',
    url: `/docs/${VERSION}/isSet()`,
  },
  {
    label: 'isOrderedSet()',
    description: 'True if maybeOrderedSet is an OrderedSet.',
    url: `/docs/${VERSION}/isOrderedSet()`,
  },
  {
    label: 'isRecord()',
    description: 'True if maybeRecord is a Record.',
    url: `/docs/${VERSION}/isRecord()`,
  },
  {
    label: 'get()',
    description:
      'Returns true if the key is defined in the provided collection.',
    url: `/docs/${VERSION}/get()`,
  },
  { label: 'has()', description: '', url: `/docs/${VERSION}/has()` },
  { label: 'remove()', description: '', url: `/docs/${VERSION}/remove()` },
  { label: 'set()', description: '', url: `/docs/${VERSION}/set()` },
  { label: 'update()', description: '', url: `/docs/${VERSION}/update()` },
  { label: 'getIn()', description: '', url: `/docs/${VERSION}/getIn()` },
  { label: 'hasIn()', description: '', url: `/docs/${VERSION}/hasIn()` },
  {
    label: 'removeIn()',
    description:
      'Returns a copy of the collection with the value at the key path removed.',
    url: `/docs/${VERSION}/removeIn()`,
  },
  {
    label: 'setIn()',
    description:
      'Returns a copy of the collection with the value at the key path set to the provided value.',
    url: `/docs/${VERSION}/setIn()`,
  },
  { label: 'updateIn()', description: '', url: `/docs/${VERSION}/updateIn()` },
  {
    label: 'merge()',
    description:
      'Returns a copy of the collection with the remaining collections merged in.',
    url: `/docs/${VERSION}/merge()`,
  },
  {
    label: 'mergeWith()',
    description:
      'Returns a copy of the collection with the remaining collections merged in, calling the merger function whenever an existing value is encountered.',
    url: `/docs/${VERSION}/mergeWith()`,
  },
  {
    label: 'mergeDeep()',
    description:
      'Like merge(), but when two compatible collections are encountered with the same key, it merges them as well, recursing deeply through the nested data. Two collections are considered to be compatible (and thus will be merged together) if they both fall into one of three categories: keyed (e.g., Maps, Records, and objects), indexed (e.g., Lists and arrays), or set-like (e.g., Sets). If they fall into separate categories, mergeDeep will replace the existing collection with the collection being merged in. This behavior can be customized by using mergeDeepWith().',
    url: `/docs/${VERSION}/mergeDeep()`,
  },
  {
    label: 'mergeDeepWith()',
    description:
      'Like mergeDeep(), but when two non-collections or incompatible collections are encountered at the same key, it uses the merger function to determine the resulting value. Collections are considered incompatible if they fall into separate categories between keyed, indexed, and set-like.',
    url: `/docs/${VERSION}/mergeDeepWith()`,
  },
];
