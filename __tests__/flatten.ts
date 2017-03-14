///<reference path='../resources/jest.d.ts'/>

import * as jasmineCheck from 'jasmine-check';
jasmineCheck.install();

import { Collection, fromJS, List, Range, Seq } from '../';

describe('flatten', () => {

  it('flattens sequences one level deep', () => {
    let nested = fromJS([[1, 2], [3, 4], [5, 6]]);
    let flat = nested.flatten();
    expect(flat.toJS()).toEqual([1, 2, 3, 4, 5, 6]);
  });

  it('flattening a List returns a List', () => {
    let nested = fromJS([[1], 2, 3, [4, 5, 6]]);
    let flat = nested.flatten();
    expect(flat.toString()).toEqual("List [ 1, 2, 3, 4, 5, 6 ]");
  });

  it('gives the correct iteration count', () => {
    let nested = fromJS([[1, 2, 3], [4, 5, 6]]);
    let flat = nested.flatten();
    expect(flat.forEach(x => x < 4)).toEqual(4);
  });

  type SeqType = number | Array<number> | Collection<number, number>;

  it('flattens only Sequences (not sequenceables)', () => {
    let nested = Seq.of<SeqType>(Range(1, 3), [3, 4], List.of(5, 6, 7), 8);
    let flat = nested.flatten();
    expect(flat.toJS()).toEqual([1, 2, [3, 4], 5, 6, 7, 8]);
  });

  it('can be reversed', () => {
    let nested = Seq.of<SeqType>(Range(1, 3), [3, 4], List.of(5, 6, 7), 8);
    let flat = nested.flatten();
    let reversed = flat.reverse();
    expect(reversed.toJS()).toEqual([8, 7, 6, 5, [3, 4], 2, 1]);
  });

  it('can flatten at various levels of depth', () => {
    let deeplyNested = fromJS(
      [
        [
          [
            [ 'A', 'B' ],
            [ 'A', 'B' ],
          ],
          [
            [ 'A', 'B' ],
            [ 'A', 'B' ],
          ],
        ],
        [
          [
            [ 'A', 'B' ],
            [ 'A', 'B' ],
          ],
          [
            [ 'A', 'B' ],
            [ 'A', 'B' ],
          ],
        ],
      ],
    );

    // deeply flatten
    expect(deeplyNested.flatten().toJS()).toEqual(
      ['A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B', 'A', 'B'],
    );

    // shallow flatten
    expect(deeplyNested.flatten(true).toJS()).toEqual(
      [
        [
          [ 'A', 'B' ],
          [ 'A', 'B' ],
        ],
        [
          [ 'A', 'B' ],
          [ 'A', 'B' ],
        ],
        [
          [ 'A', 'B' ],
          [ 'A', 'B' ],
        ],
        [
          [ 'A', 'B' ],
          [ 'A', 'B' ],
        ],
      ],
    );

    // flatten two levels
    expect(deeplyNested.flatten(2).toJS()).toEqual(
      [
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ],
        [ 'A', 'B' ],
      ],
    );
  });

  describe('flatMap', () => {

    it('first maps, then shallow flattens', () => {
      let numbers = Range(97, 100);
      let letters = numbers.flatMap(v => fromJS([
        String.fromCharCode(v),
        String.fromCharCode(v).toUpperCase(),
      ]));
      expect(letters.toJS()).toEqual(
        ['a', 'A', 'b', 'B', 'c', 'C'],
      );
    });

    it('maps to sequenceables, not only Sequences.', () => {
      let numbers = Range(97, 100);
      // the map function returns an Array, rather than a Collection.
      // Array is iterable, so this works just fine.
      let letters = numbers.flatMap(v => [
        String.fromCharCode(v),
        String.fromCharCode(v).toUpperCase(),
      ]);
      expect(letters.toJS()).toEqual(
        ['a', 'A', 'b', 'B', 'c', 'C'],
      );
    });

  });

});
