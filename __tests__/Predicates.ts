import { describe, expect, it } from '@jest/globals';
import {
  List,
  Map,
  Set,
  Stack,
  is,
  isImmutable,
  isValueObject,
} from 'immutable';

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
