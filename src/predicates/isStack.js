export const IS_STACK_SYMBOL = '@@__IMMUTABLE_STACK__@@';

export function isStack(maybeStack) {
  return Boolean(maybeStack && maybeStack[IS_STACK_SYMBOL]);
}
