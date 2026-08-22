import { describe, expect, it } from '@jest/globals';
import {
  List,
  Map,
  Record,
  Seq,
  Set,
  Stack,
  is,
  isCollection,
  isImmutable,
  isIndexed,
  isKeyed,
  isList,
  isMap,
  isOrdered,
  isRecord,
  isSeq,
  isSet,
  isStack,
  isValueObject,
} from 'immutable';

const brandPredicates: Array<
  [string, (value: unknown) => boolean, string, unknown]
> = [
  ['isCollection', isCollection, '@@__IMMUTABLE_ITERABLE__@@', Map()],
  ['isRecord', isRecord, '@@__IMMUTABLE_RECORD__@@', Record({})()],
  ['isKeyed', isKeyed, '@@__IMMUTABLE_KEYED__@@', Map()],
  ['isIndexed', isIndexed, '@@__IMMUTABLE_INDEXED__@@', List()],
  ['isOrdered', isOrdered, '@@__IMMUTABLE_ORDERED__@@', List()],
  ['isSeq', isSeq, '@@__IMMUTABLE_SEQ__@@', Seq()],
  ['isMap', isMap, '@@__IMMUTABLE_MAP__@@', Map()],
  ['isList', isList, '@@__IMMUTABLE_LIST__@@', List()],
  ['isSet', isSet, '@@__IMMUTABLE_SET__@@', Set()],
  ['isStack', isStack, '@@__IMMUTABLE_STACK__@@', Stack()],
];

function createTruthyGetProxy(): object {
  return new Proxy(
    {},
    {
      get(target, property, receiver) {
        return typeof property === 'symbol' || Reflect.has(target, property)
          ? Reflect.get(target, property, receiver)
          : () => undefined;
      },
    }
  );
}

describe('brand predicates', () => {
  it.each(brandPredicates)(
    '%s only accepts a literal true brand',
    (_name, predicate, brand, collection) => {
      expect(predicate(collection)).toBe(true);
      expect(predicate({ [brand]: true })).toBe(true);

      for (const value of [false, 1, {}, () => true]) {
        expect(predicate({ [brand]: value })).toBe(false);
      }
    }
  );

  it('rejects proxies which return a truthy fallback for unknown properties', () => {
    const value = createTruthyGetProxy();

    for (const [, predicate] of brandPredicates) {
      expect(predicate(value)).toBe(false);
    }
  });
});

describe('isImmutable', () => {
  it('behaves as advertised', () => {
    expect(isImmutable([])).toBe(false);
    expect(isImmutable({})).toBe(false);
    expect(isImmutable(Map())).toBe(true);
    expect(isImmutable(List())).toBe(true);
    expect(isImmutable(Set())).toBe(true);
    expect(isImmutable(Stack())).toBe(true);
    expect(isImmutable(Map().asMutable())).toBe(true);
  });
});

describe('isValueObject', () => {
  it('behaves as advertised', () => {
    expect(isValueObject(null)).toBe(false);
    expect(isValueObject(123)).toBe(false);
    expect(isValueObject('abc')).toBe(false);
    expect(isValueObject([])).toBe(false);
    expect(isValueObject({})).toBe(false);
    expect(isValueObject(Map())).toBe(true);
    expect(isValueObject(List())).toBe(true);
    expect(isValueObject(Set())).toBe(true);
    expect(isValueObject(Stack())).toBe(true);
    expect(isValueObject(Map().asMutable())).toBe(true);
  });

  it('works on custom types', () => {
    class MyValueType {
      v: number;

      constructor(val: number) {
        this.v = val;
      }

      equals(other: MyValueType) {
        return Boolean(other && this.v === other.v);
      }

      hashCode() {
        return this.v;
      }
    }

    expect(isValueObject(new MyValueType(123))).toBe(true);
    expect(is(new MyValueType(123), new MyValueType(123))).toBe(true);
    expect(Set().add(new MyValueType(123)).add(new MyValueType(123)).size).toBe(
      1
    );
  });
});
