import { List, OrderedSet, Seq, Comparator, PairSorting } from 'immutable';

const sourceNumbers: readonly number[] = [3, 4, 5, 6, 7, 9, 10, 12, 90, 92, 95];

const expectedSortedNumbers: readonly number[] = [
  7, 95, 90, 92, 3, 5, 9, 4, 6, 10, 12,
];

const testComparator: Comparator<number> = (left, right) => {
  //The number 7 always goes first...
  if (left == 7) {
    return PairSorting.LeftThenRight;
  } else if (right == 7) {
    return PairSorting.RightThenLeft;
  }

  //...followed by numbers >= 90, then by all the others.
  if (left >= 90 && right < 90) {
    return PairSorting.LeftThenRight;
  } else if (left < 90 && right >= 90) {
    return PairSorting.RightThenLeft;
  }

  //Within each group, even numbers go first...
  if (left % 2 && !(right % 2)) {
    return PairSorting.LeftThenRight;
  } else if (!(left % 2) && right % 2) {
    return PairSorting.RightThenLeft;
  }

  //...and, finally, sort the numbers of each subgroup in ascending order.
  return left - right;
};

describe.each([
  ['List', List],
  ['OrderedSet', OrderedSet],
  ['Seq.Indexed', Seq.Indexed],
])('Comparator applied to %s', (_collectionName, testCollectionConstructor) => {
  const sourceCollection = testCollectionConstructor(sourceNumbers);

  const expectedSortedCollection = testCollectionConstructor(
    expectedSortedNumbers
  );

  describe('when sorting', () => {
    it('should support the enum as well as numeric return values', () => {
      const actualCollection = sourceCollection.sort(testComparator);
      expect(actualCollection).toEqual(expectedSortedCollection);
    });
  });

  describe('when retrieving the max value', () => {
    it('should support the enum as well as numeric return values', () => {
      const actualMax = sourceCollection.max(testComparator);
      expect(actualMax).toBe(12);
    });
  });

  describe('when retrieving the min value', () => {
    it('should support the enum as well as numeric return values', () => {
      const actualMin = sourceCollection.min(testComparator);
      expect(actualMin).toBe(7);
    });
  });
});
