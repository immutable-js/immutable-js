// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.
// The source does not emit the public type names (`Seq.Indexed<T>`, …) yet, so
// the assertion references the internal `IndexedSeqImpl` class imported
// straight from the source; switch back to the public name once it exists.

import { Range } from 'immutable';
import { expect, test } from 'tstyche';
import type { RangeImpl } from '../../src/Range';

test('#constructor', () => {
  expect(Range(0, 0, 1)).type.toBe<RangeImpl>();

  expect(Range('a', 0, 0)).type.toRaiseError();

  expect(Range()).type.toRaiseError();

  expect(Range(1)).type.toRaiseError();
});
