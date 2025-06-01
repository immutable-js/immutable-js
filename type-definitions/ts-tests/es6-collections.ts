import { Map as ImmutableMap, Set as ImmutableSet } from 'immutable';
import { expect, test } from 'tstyche';

test('immutable.js collections', () => {
  const mapImmutable: ImmutableMap<string, number> = ImmutableMap<
    string,
    number
  >();
  const setImmutable: ImmutableSet<string> = ImmutableSet<string>();

  expect(mapImmutable.delete('foo')).type.toBe<ImmutableMap<string, number>>();
  expect(setImmutable.delete('bar')).type.toBe<ImmutableSet<string>>();
});

test('ES6 collections', () => {
  const mapES6: Map<string, number> = new Map<string, number>();
  const setES6: Set<string> = new Set<string>();

  expect(mapES6.delete('foo')).type.toBe<boolean>();
  expect(setES6.delete('bar')).type.toBe<boolean>();
});
