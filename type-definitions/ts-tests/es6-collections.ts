import { expect, test } from 'tstyche';
import { Map as ImmutableMap, Set as ImmutableSet } from 'immutable';

test('immutable.js collections', () => {
  const mapImmutable: ImmutableMap<string, number> = ImmutableMap<
    string,
    number
  >();
  const setImmutable: ImmutableSet<string> = ImmutableSet<string>();

  expect(mapImmutable.delete('foo')).type.toEqual<
    ImmutableMap<string, number>
  >();
  expect(setImmutable.delete('bar')).type.toEqual<ImmutableSet<string>>();
});

test('ES6 collections', () => {
  const mapES6: Map<string, number> = new Map<string, number>();
  const setES6: Set<string> = new Set<string>();

  expect(mapES6.delete('foo')).type.toEqual<boolean>();
  expect(setES6.delete('bar')).type.toEqual<boolean>();
});
