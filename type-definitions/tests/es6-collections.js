/*
 * @flow
 */

import {
  Map as ImmutableMap,
  Set as ImmutableSet,
} from '../../'

// Immutable.js collections
var mapImmutable: ImmutableMap<string, number> = ImmutableMap()
var setImmutable: ImmutableSet<string> = ImmutableSet()
var deleteResultImmutable: ImmutableMap<string, number> = mapImmutable.delete('foo');

// ES6 collections
var mapES6: Map<string, number> = new Map()
var setES6: Set<string> = new Set()
var deleteResultES6: boolean = mapES6.delete('foo');
