import * as jasmineCheck from 'jasmine-check';
import { Range, Seq } from '../';
jasmineCheck.install();

describe('KeyedSeq', () => {
  check.it('it iterates equivalently', [gen.array(gen.int)], ints => {
    let seq = Seq(ints);
    let keyed = seq.toKeyedSeq();

    let seqEntries = seq.entries();
    let keyedEntries = keyed.entries();

    let seqStep, keyedStep;

    do {
      seqStep = seqEntries.next();
      keyedStep = keyedEntries.next();
      expect(keyedStep).toEqual(seqStep);
    } while (!seqStep.done);
  });

  it('maintains keys', () => {
    let isEven = x => x % 2 === 0;
    let seq = Range(0, 100);

    // This is what we expect for IndexedSequences
    let operated = seq.filter(isEven).skip(10).take(5);
    expect(operated.entrySeq().toArray()).toEqual([
      [0, 20],
      [1, 22],
      [2, 24],
      [3, 26],
      [4, 28],
    ]);

    // Where Keyed Sequences maintain keys.
    let keyed = seq.toKeyedSeq();
    let keyedOperated = keyed.filter(isEven).skip(10).take(5);
    expect(keyedOperated.entrySeq().toArray()).toEqual([
      [20, 20],
      [22, 22],
      [24, 24],
      [26, 26],
      [28, 28],
    ]);
  });

  it('works with reverse', () => {
    let seq = Range(0, 100);

    // This is what we expect for IndexedSequences
    expect(seq.reverse().take(5).entrySeq().toArray()).toEqual([
      [0, 99],
      [1, 98],
      [2, 97],
      [3, 96],
      [4, 95],
    ]);

    // Where Keyed Sequences maintain keys.
    expect(seq.toKeyedSeq().reverse().take(5).entrySeq().toArray()).toEqual([
      [99, 99],
      [98, 98],
      [97, 97],
      [96, 96],
      [95, 95],
    ]);
  });

  it('works with double reverse', () => {
    let seq = Range(0, 100);

    // This is what we expect for IndexedSequences
    expect(seq.reverse().skip(10).take(5).reverse().entrySeq().toArray()).toEqual([
      [0, 85],
      [1, 86],
      [2, 87],
      [3, 88],
      [4, 89],
    ]);

    // Where Keyed Sequences maintain keys.
    expect(seq.reverse().toKeyedSeq().skip(10).take(5).reverse().entrySeq().toArray()).toEqual([
      [14, 85],
      [13, 86],
      [12, 87],
      [11, 88],
      [10, 89],
    ]);
  });
});
