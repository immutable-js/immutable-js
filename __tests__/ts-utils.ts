import { expect } from '@jest/globals';

export function expectToBeDefined<T>(
  arg: T
): asserts arg is Exclude<T, undefined> {
  expect(arg).toBeDefined();
}
