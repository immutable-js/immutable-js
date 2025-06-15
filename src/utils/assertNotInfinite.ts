import invariant from './invariant';

export default function assertNotInfinite(size: number): void {
  invariant(
    size !== Infinity,
    'Cannot perform this action with an infinite size.'
  );
}
