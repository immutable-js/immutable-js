import type { Stack } from '../Stack';

export const IS_STACK_SYMBOL = '@@__IMMUTABLE_STACK__@@';

export function isStack(maybeStack: unknown): maybeStack is Stack<unknown> {
  return Boolean(
    maybeStack &&
      // @ts-expect-error: maybeStack is typed as `{}`
      maybeStack[IS_STACK_SYMBOL]
  );
}
