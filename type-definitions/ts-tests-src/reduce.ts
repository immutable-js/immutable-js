// AUTO/SOURCE-PASS DUPLICATE of ../ts-tests/<same name>.
// Resolves `immutable` against the TS SOURCE (src/Immutable.js), to validate the
// types emitted by the migration. Tests are `.skip` until the underlying
// collection/method is migrated to TS; un-skip them as migration progresses.
// Some d.ts-only types (MapOf, RecordOf, DeepCopy) are omitted from imports
// until they exist in the source. See .agents/commands/migrate-to-ts.md.

/* eslint-disable @typescript-eslint/no-unused-expressions */
import { Collection, List, Map, Set } from 'immutable';
import { expect, test } from 'tstyche';

test.skip('reduce', () => {
  // With an initial value, the result type is the accumulator type `R`.
  (l: List<number>) => {
    expect(
      l.reduce((acc: string, value) => acc + value, 'seed')
    ).type.toBe<string>();
  };

  // With an initial value (overload 1), the reduction is typed `R`.
  (l: List<number>) => {
    l.reduce((acc, value, key, iter) => {
      expect(acc).type.toBe<string>();
      expect(value).type.toBe<number>();
      expect(key).type.toBe<number>();
      expect(iter).type.toBe<List<number>>();
      return `${acc}${value}`;
    }, 'seed');
  };

  // Without an initial value and a reducer that returns a value (`R = V`),
  // the result type `V` is inferred from the values — no annotation needed.
  (l: List<number>) => {
    expect(l.reduce((acc, value) => acc + value)).type.toBe<number>();
  };

  // Without an initial value but a reducer that returns a different type `R`,
  // the reduction is typed `V | R`, since the first value (a `V`) seeds it.
  (l: List<number>) => {
    expect(
      l.reduce((acc: string | number, value) => {
        expect(value).type.toBe<number>();
        return `${acc}${value}`;
      })
    ).type.toBe<string>();
  };

  // Keyed collection: key is `K`.
  (m: Map<string, number>) => {
    m.reduce((acc, value, key, iter) => {
      expect(value).type.toBe<number>();
      expect(key).type.toBe<string>();
      expect(iter).type.toBe<Map<string, number>>();
      return acc + value;
    }, 0);
  };

  // Set collection: value and key are both `T`.
  (s: Set<number>) => {
    s.reduce((acc, value, key) => {
      expect(value).type.toBe<number>();
      expect(key).type.toBe<number>();
      return acc + value;
    }, 0);
  };

  // Base Collection.
  (c: Collection<string, number>) => {
    expect(
      c.reduce((acc: boolean, value) => acc && value > 0, true)
    ).type.toBe<boolean>();
  };
});

test.skip('reduceRight', () => {
  (l: List<number>) => {
    expect(
      l.reduceRight((acc: string, value) => acc + value, 'seed')
    ).type.toBe<string>();
  };

  (l: List<number>) => {
    l.reduceRight((acc, value, key, iter) => {
      expect(value).type.toBe<number>();
      expect(key).type.toBe<number>();
      expect(iter).type.toBe<List<number>>();
      return acc + value;
    }, 0);
  };
});
