import { Range, Seq } from '../';

describe('count', () => {
  it('counts sequences with known lengths', () => {
    expect(Seq.of(1, 2, 3, 4, 5).size).toBe(5);
    expect(Seq.of(1, 2, 3, 4, 5).count()).toBe(5);
  });

  it('counts sequences with unknown lengths, resulting in a cached size', () => {
    let seq = Seq.of(1, 2, 3, 4, 5, 6).filter(x => x % 2 === 0);
    expect(seq.size).toBe(undefined);
    expect(seq.count()).toBe(3);
    expect(seq.size).toBe(3);
  });

  it('counts sequences with a specific predicate', () => {
    let seq = Seq.of(1, 2, 3, 4, 5, 6);
    expect(seq.size).toBe(6);
    expect(seq.count(x => x > 3)).toBe(3);
  });

  describe('countBy', () => {
    it('counts by keyed sequence', () => {
      let grouped = Seq({ a: 1, b: 2, c: 3, d: 4 }).countBy(x => x % 2);
      expect(grouped.toJS()).toEqual({ 1: 2, 0: 2 });
      expect(grouped.get(1)).toEqual(2);
    });

    it('counts by indexed sequence', () => {
      expect(Seq.of(1, 2, 3, 4, 5, 6).countBy(x => x % 2).toJS()).toEqual({
        1: 3,
        0: 3,
      });
    });

    it('counts by specific keys', () => {
      expect(
        Seq.of(1, 2, 3, 4, 5, 6).countBy(x => x % 2 ? 'odd' : 'even').toJS(),
      ).toEqual({ odd: 3, even: 3 });
    });
  });

  describe('isEmpty', () => {
    it('is O(1) on sequences with known lengths', () => {
      expect(Seq.of(1, 2, 3, 4, 5).size).toBe(5);
      expect(Seq.of(1, 2, 3, 4, 5).isEmpty()).toBe(false);
      expect(Seq().size).toBe(0);
      expect(Seq().isEmpty()).toBe(true);
    });

    it('lazily evaluates Seq with unknown length', () => {
      let s1 = Seq.of(1, 2, 3, 4, 5, 6).filter(x => x % 2 === 0);
      expect(s1.size).toBe(undefined);
      expect(s1.isEmpty()).toBe(false);
      expect(s1.size).toBe(undefined);

      let s2 = Seq.of(1, 2, 3, 4, 5, 6).filter(x => x > 10);
      expect(s2.size).toBe(undefined);
      expect(s2.isEmpty()).toBe(true);
      expect(s2.size).toBe(undefined);
    });

    it('with infinitely long sequences of known length', () => {
      let seq = Range();
      expect(seq.size).toBe(Infinity);
      expect(seq.isEmpty()).toBe(false);
    });

    it('with infinitely long sequences of unknown length', () => {
      let seq = Range().filter(x => x % 2 === 0);
      expect(seq.size).toBe(undefined);
      expect(seq.isEmpty()).toBe(false);
      expect(seq.size).toBe(undefined);
    });
  });
});
