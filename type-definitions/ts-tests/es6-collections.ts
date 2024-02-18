import { expectType } from 'tsd';
import { Map as ImmutableMap, Set as ImmutableSet } from 'immutable';

// Immutable.js collections
const mapImmutable: ImmutableMap<string, number> = ImmutableMap<
  string,
  number
>();
const setImmutable: ImmutableSet<string> = ImmutableSet<string>();

expectType<ImmutableMap<string, number>>(mapImmutable.delete('foo'));
expectType<ImmutableSet<string>>(setImmutable.delete('foo'));

// ES6 collections
const mapES6: Map<string, number> = new Map<string, number>();
const setES6: Set<string> = new Set<string>();

expectType<boolean>(mapES6.delete('foo'));
expectType<boolean>(setES6.delete('foo'));
