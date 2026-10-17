// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.
// `RangeImpl` is not exported from the public `immutable` entry point, so the
// assertions import the concrete class directly from the source.

import { Range } from 'immutable';
import { expect, test } from 'tstyche';
import type { RangeImpl } from '../../src/Range';

test('#constructor', () => {
  expect(Range(0, 0, 1)).type.toBe<RangeImpl>();

  expect(Range('a', 0, 0)).type.toRaiseError();

  expect(Range()).type.toRaiseError();

  expect(Range(1)).type.toRaiseError();
});

test('#slice', () => {
  expect(Range(0, 10).slice(1)).type.toBe<RangeImpl>();

  expect(Range(0, 10).slice(1, 3)).type.toBe<RangeImpl>();
});
