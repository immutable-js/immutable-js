import {
  Map as ImmutableMap,
  Set as ImmutableSet,
} from '../../../';

// Immutable.js collections
var mapImmutable: ImmutableMap<string, number> = ImmutableMap<string, number>();
var setImmutable: ImmutableSet<string> = ImmutableSet<string>();

// $ExpectType Map<string, number>
mapImmutable.delete('foo');

// ES6 collections
var mapES6: Map<string, number> = new Map<string, number>();
var setES6: Set<string> = new Set<string>();

// $ExpectType boolean
mapES6.delete('foo');
