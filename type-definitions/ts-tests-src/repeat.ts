// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.

import { Repeat, Seq } from 'immutable';
import { expect, test } from 'tstyche';

test.skip('#constructor', () => {
  expect(Repeat(0, 0)).type.toBe<Seq.Indexed<number>>();

  expect(Repeat('a', 0)).type.toBe<Seq.Indexed<string>>();

  expect(Repeat('a', 'b')).type.toRaiseError();
});
