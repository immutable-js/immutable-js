/**
 * Describes which item in a pair should be placed first when sorting
 */
export enum PairSorting {
  LeftThenRight = -1,
  RightThenLeft = +1,
}

/**
 * Function comparing two items of the same type. It can return:
 *
 * * a PairSorting value, to indicate whether the left-hand item or the right-hand item should be placed before the other
 *
 * * the traditional numeric return value - especially -1, 0, or 1
 */
export type Comparator<T> = (left: T, right: T) => PairSorting | number;
