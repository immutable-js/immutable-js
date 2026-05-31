// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.

import { Map as ImmutableMap, Set as ImmutableSet } from 'immutable';
import { expect, test } from 'tstyche';

test.skip('immutable.js collections', () => {
  const mapImmutable: ImmutableMap<string, number> = ImmutableMap<
    string,
    number
  >();
  const setImmutable: ImmutableSet<string> = ImmutableSet<string>();

  expect(mapImmutable.delete('foo')).type.toBe<ImmutableMap<string, number>>();
  expect(setImmutable.delete('bar')).type.toBe<ImmutableSet<string>>();
});

test.skip('ES6 collections', () => {
  const mapES6: Map<string, number> = new Map<string, number>();
  const setES6: Set<string> = new Set<string>();

  expect(mapES6.delete('foo')).type.toBe<boolean>();
  expect(setES6.delete('bar')).type.toBe<boolean>();
});
