import { Map, Set, fromJS, hash, is } from 'immutable';
import { describe, expect, it } from '@jest/globals';

/**
 * Generates `2 ** rounds` distinct strings that all share the same
 * `Immutable.hash()`, by concatenating the classic "Aa"/"BB" collision blocks
 * (both equal `65 * 31 + 97 === 66 * 31 + 66 === 2112` under the JVM-style
 * `31 * h + c` string hash). Inserting these into a Map forces them all into a
 * single HashCollisionNode — the hash-flooding scenario this code guards.
 */
function collisionKeys(rounds: number): Array<string> {
  let keys = [''];
  for (let i = 0; i < rounds; i++) {
    const next: Array<string> = [];
    for (const k of keys) {
      next.push(k + 'Aa');
      next.push(k + 'BB');
    }
    keys = next;
  }
  return keys;
}

describe('Map hash collisions', () => {
  it('the generated keys really do collide (test is meaningful)', () => {
    const keys = collisionKeys(8); // 256 keys
    const h = hash(keys[0]!);
    expect(keys.every((k) => hash(k) === h)).toBe(true);
    expect(new globalThis.Set(keys).size).toBe(keys.length); // all distinct
  });

  it('does not change the public, deterministic hash() of strings', () => {
    // The secondary collision hash is internal and seeded; it must not leak
    // into the public hash().
    expect(hash('a')).toBe(97);
    expect(hash('immutable-js')).toBe(510203252);
  });

  describe('correctness with thousands of colliding keys', () => {
    const keys = collisionKeys(11); // 2048 keys, well above the index threshold

    it('stores and retrieves every colliding key (built from an object)', () => {
      const obj: Record<string, number> = {};
      keys.forEach((k, i) => (obj[k] = i));
      const map = Map(obj);

      expect(map.size).toBe(keys.length);
      expect(keys.every((k, i) => map.get(k) === i)).toBe(true);
      expect(map.get('not-a-colliding-key', 'default')).toBe('default');
      expect(map.has(keys[0]!)).toBe(true);
      expect(map.has('not-a-colliding-key')).toBe(false);
    });

    it('behaves the same whether built transiently or persistently', () => {
      const transient = Map<string, number>().withMutations((m) => {
        keys.forEach((k, i) => m.set(k, i));
      });
      let persistent = Map<string, number>();
      keys.forEach((k, i) => (persistent = persistent.set(k, i)));

      expect(transient.size).toBe(keys.length);
      expect(persistent.size).toBe(keys.length);
      expect(is(transient, persistent)).toBe(true);
      expect(keys.every((k, i) => persistent.get(k) === i)).toBe(true);
    });

    it('overwrites an existing colliding key without changing size', () => {
      const map = Map(keys.map((k, i) => [k, i]));
      const updated = map.set(keys[100]!, 9999);

      expect(updated.get(keys[100]!)).toBe(9999);
      expect(updated.size).toBe(map.size);
      // original is untouched (persistence)
      expect(map.get(keys[100]!)).toBe(100);
    });

    it('removes colliding keys and keeps the rest retrievable', () => {
      const map = Map(keys.map((k, i) => [k, i]));
      const removed = map.remove(keys[50]!).remove(keys[51]!).remove(keys[52]!);

      expect(removed.size).toBe(map.size - 3);
      expect(removed.get(keys[50]!, 'gone')).toBe('gone');
      expect(removed.get(keys[51]!, 'gone')).toBe('gone');
      // a previously-removed-around key is still correct (index stayed valid)
      expect(removed.get(keys[53]!)).toBe(53);
      expect(removed.get(keys[0]!)).toBe(0);
      expect(removed.get(keys[keys.length - 1]!)).toBe(keys.length - 1);
    });

    it('iterates over every colliding entry exactly once', () => {
      const map = Map(keys.map((k, i) => [k, i]));

      const seen = new globalThis.Set<string>();
      map.forEach((_v, k) => seen.add(k));
      expect(seen.size).toBe(keys.length);
      expect(keys.every((k) => seen.has(k))).toBe(true);

      expect(map.keySeq().toArray().sort()).toEqual([...keys].sort());
      expect(map.entrySeq().count()).toBe(keys.length);
    });

    it('keeps equals() and hashCode() consistent', () => {
      const a = Map(keys.map((k, i) => [k, i]));
      const b = Map(keys.map((k, i) => [k, i]));
      expect(is(a, b)).toBe(true);
      expect(a.hashCode()).toBe(b.hashCode());

      const c = a.set(keys[0]!, -1);
      expect(is(a, c)).toBe(false);
    });
  });

  it('mixes colliding and normally-distributed keys', () => {
    const keys = collisionKeys(10); // 1024 colliding
    const map = Map<string, number | string>(keys.map((k, i) => [k, i]))
      .set('alpha', 'a')
      .set('beta', 'b');

    expect(map.get('alpha')).toBe('a');
    expect(map.get('beta')).toBe('b');
    expect(map.get(keys[7]!)).toBe(7);
    expect(map.size).toBe(keys.length + 2);
  });

  it('is correct just below and just above the index threshold', () => {
    // 8 keys (below threshold 16) then 64 keys (above) — both must be correct.
    for (const rounds of [3, 6]) {
      const keys = collisionKeys(rounds);
      let map = Map<string, number>();
      keys.forEach((k, i) => (map = map.set(k, i)));
      expect(map.size).toBe(keys.length);
      expect(keys.every((k, i) => map.get(k) === i)).toBe(true);

      // remove half, the rest must remain correct
      let trimmed = map;
      keys
        .slice(0, keys.length / 2)
        .forEach((k) => (trimmed = trimmed.remove(k)));
      expect(trimmed.size).toBe(keys.length / 2);
      expect(
        keys
          .slice(keys.length / 2)
          .every((k, i) => trimmed.get(k) === i + keys.length / 2)
      ).toBe(true);
    }
  });

  it('merge() and mergeDeep() work with colliding keys', () => {
    const keys = collisionKeys(11); // 2048 colliding
    const userObj: Record<string, number> = {};
    keys.forEach((k, i) => (userObj[k] = i));

    const merged = Map({ existing: -1 }).merge(userObj);
    expect(merged.get('existing')).toBe(-1);
    expect(merged.get(keys[123]!)).toBe(123);
    expect(merged.size).toBe(keys.length + 1);

    const deep = Map({ existing: -1 }).mergeDeep(fromJS(userObj));
    expect(deep.get(keys[123]!)).toBe(123);
    expect(deep.size).toBe(keys.length + 1);
  });

  it('Set (backed by Map) handles colliding values', () => {
    const keys = collisionKeys(11); // 2048 colliding
    const set = Set(keys);

    expect(set.size).toBe(keys.length);
    expect(keys.every((k) => set.has(k))).toBe(true);
    expect(set.has('not-in-set')).toBe(false);

    const without = set.remove(keys[10]!);
    expect(without.has(keys[10]!)).toBe(false);
    expect(without.size).toBe(keys.length - 1);
  });

  it('handles value-object keys that all share one hashCode', () => {
    // Exercises the non-string fallback in hashCollisionKey: equality is still
    // decided by is()/equals(), never by the (constant) secondary hash.
    class Collider {
      constructor(readonly id: number) {}
      equals(other: unknown): boolean {
        return other instanceof Collider && other.id === this.id;
      }
      hashCode(): number {
        return 7; // force every instance into the same collision node
      }
    }
    const items = Array.from({ length: 50 }, (_, i) => new Collider(i));

    let map = Map<Collider, number>();
    items.forEach((c, i) => (map = map.set(c, i)));

    expect(map.size).toBe(items.length);
    expect(items.every((c, i) => map.get(new Collider(i)) === i)).toBe(true);
    expect(map.get(new Collider(999), 'absent')).toBe('absent');

    const removed = map.remove(new Collider(25));
    expect(removed.size).toBe(items.length - 1);
    expect(removed.get(new Collider(25), 'gone')).toBe('gone');
    expect(removed.get(new Collider(26))).toBe(26);
  });

  it('does not degrade for a large flood of colliding keys', () => {
    // A regression guard: with the linear scan this is ~O(n²) and takes seconds
    // for 16384 keys; with the seeded index it is ~linear and near-instant.
    const keys = collisionKeys(14); // 16384 colliding keys
    const obj: Record<string, number> = {};
    keys.forEach((k, i) => (obj[k] = i));

    const map = Map(obj);
    expect(map.size).toBe(keys.length);
    // spot-check retrieval across the whole bucket
    expect(map.get(keys[0]!)).toBe(0);
    expect(map.get(keys[keys.length - 1]!)).toBe(keys.length - 1);
    expect(map.get(keys[keys.length >> 1]!)).toBe(keys.length >> 1);
  });
});
