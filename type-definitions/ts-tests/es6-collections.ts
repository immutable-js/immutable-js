import { Map as ImmutableMap, Set as ImmutableSet } from 'immutable';

// Immutable.js collections
const mapImmutable: ImmutableMap<string, number> = ImmutableMap<
  string,
  number
>();
const setImmutable: ImmutableSet<string> = ImmutableSet<string>();

// $ExpectType Map<string, number>
mapImmutable.delete('foo');

// ES6 collections
const mapES6: Map<string, number> = new Map<string, number>();
const setES6: Set<string> = new Set<string>();

// $ExpectType boolean
mapES6.delete('foo');
