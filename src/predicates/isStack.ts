import type { Stack } from '../../type-definitions/immutable';

export const IS_STACK_SYMBOL = '@@__IMMUTABLE_STACK__@@';

export function isStack(maybeStack: unknown): maybeStack is Stack<unknown> {
  return Boolean(
    maybeStack &&
      // @ts-expect-error: maybeStack is typed as `{}`, need to change in 6.0 to `maybeStack && typeof maybeStack === 'object' && MAYBE_STACK_SYMBOL in maybeStack`
      maybeStack[IS_STACK_SYMBOL]
  );
}
