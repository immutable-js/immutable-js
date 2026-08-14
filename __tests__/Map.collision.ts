/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

///<reference path='../resources/jest.d.ts'/>
///<reference path='../dist/immutable.d.ts'/>

jest.autoMockOff();

import { Map, Set, is, fromJS } from 'immutable';

/**
 * Generates `2 ** rounds` distinct strings that all share the same
 * `Immutable.hash()`, by concatenating the classic "Aa"/"BB" collision blocks
 * (both equal `65 * 31 + 97 === 66 * 31 + 66 === 2112` under the JVM-style
 * `31 * h + c` string hash). Inserting these into a Map forces them all into a
 * single HashCollisionNode — the hash-flooding scenario this code guards.
 */
function collisionKeys(rounds: number): Array<string> {
  var keys: Array<string> = [''];
  for (var i = 0; i < rounds; i++) {
    var next: Array<string> = [];
    for (var j = 0; j < keys.length; j++) {
      next.push(keys[j] + 'Aa');
      next.push(keys[j] + 'BB');
    }
    keys = next;
  }
  return keys;
}

/**
 * v3 does not export hash(), but the hash of a one-entry Map is a pure,
 * deterministic function of the key's hash, so this is a faithful public proxy
 * for it.
 */
function keyHash(key: any): number {
  return Map().set(key, false).hashCode();
}

/**
 * Builds a `{ key: index }` object, to exercise the `Map(obj)` construction
 * path. Typed `any` because a mapped type such as `Record<string, number>`
 * needs TypeScript 2.1 and this branch pins 1.7.5.
 */
function objectOf(keys: Array<string>): any {
  var obj: any = {};
  for (var i = 0; i < keys.length; i++) {
    obj[keys[i]] = i;
  }
  return obj;
}

/**
 * Builds the Map through `withMutations`, so these tests cover the *transient*
 * insert path where `ownerID` matches and the node is edited in place. That is
 * the branch which appends to `_index` incrementally and discards it after a
 * swap-pop removal; persistent inserts return a fresh node and never reach it.
 * The cast is needed because `withMutations` is typed as returning the base
 * collection rather than `Map<K, V>`.
 */
function mapOf(keys: Array<string>): Map<string, number> {
  return Map<string, number>().withMutations(m => {
    for (var i = 0; i < keys.length; i++) {
      m.set(keys[i], i);
    }
  }) as Map<string, number>;
}

/**
 * Counts distinct strings. A native `Set` would be the obvious tool, but it is
 * unavailable here: it is absent from TypeScript 1.7's ES5
 * `lib.d.ts`, `globalThis` needs 3.4, and the bare name `Set` resolves to the
 * Immutable Set imported at the top of this file.
 */
function countDistinct(keys: Array<string>): number {
  var seen: any = {};
  var count = 0;
  for (var i = 0; i < keys.length; i++) {
    if (!seen[keys[i]]) {
      seen[keys[i]] = true;
      count++;
    }
  }
  return count;
}

describe('Map hash collisions', () => {

  it('the generated keys really do collide (test is meaningful)', () => {
    var keys = collisionKeys(8); // 256 keys
    var h = keyHash(keys[0]);
    expect(keys.every(k => keyHash(k) === h)).toBe(true);
    expect(countDistinct(keys)).toBe(keys.length); // all distinct
    // keyHash() is a v3 stand-in for the missing public
    // hash(), so show it actually discriminates.
    // Were it ever to return a constant, the assertion above would pass by chance.
    expect(keyHash('x0') === h).toBe(false);
  });

  it('does not change the public, deterministic hash() of strings', () => {
    // The secondary collision hash is internal and seeded; it must not leak
    // into the public hash().
    expect(keyHash('a')).toBe(720576476);
    expect(keyHash('immutable-js')).toBe(1044297618);
  });

  describe('correctness with thousands of colliding keys', () => {

    var keys = collisionKeys(11); // 2048 keys, well above the index threshold

    it('stores and retrieves every colliding key (built from an object)', () => {
      var map = Map<string, number>(objectOf(keys));
      expect(map.size).toBe(keys.length);
      expect(keys.every((k, i) => map.get(k) === i)).toBe(true);
      expect(map.get('not-a-colliding-key', -1)).toBe(-1);
      expect(map.has(keys[0])).toBe(true);
      expect(map.has('not-a-colliding-key')).toBe(false);
    });

    it('behaves the same whether built transiently or persistently', () => {
      var transient = mapOf(keys);
      var persistent = Map<string, number>();
      for (var i = 0; i < keys.length; i++) {
        persistent = persistent.set(keys[i], i);
      }
      expect(transient.size).toBe(keys.length);
      expect(persistent.size).toBe(keys.length);
      expect(is(transient, persistent)).toBe(true);
      expect(keys.every((k, i) => persistent.get(k) === i)).toBe(true);
    });

    it('overwrites an existing colliding key without changing size', () => {
      var map = mapOf(keys);
      var updated = map.set(keys[100], 9999);
      expect(updated.get(keys[100])).toBe(9999);
      expect(updated.size).toBe(map.size);
      // original is untouched (persistence)
      expect(map.get(keys[100])).toBe(100);
    });

    it('removes colliding keys and keeps the rest retrievable', () => {
      var map = mapOf(keys);
      var removed = map.remove(keys[50]).remove(keys[51]).remove(keys[52]);
      expect(removed.size).toBe(map.size - 3);
      expect(removed.get(keys[50], -1)).toBe(-1);
      expect(removed.get(keys[51], -1)).toBe(-1);
      // a previously-removed-around key is still correct (index stayed valid)
      expect(removed.get(keys[53])).toBe(53);
      expect(removed.get(keys[0])).toBe(0);
      expect(removed.get(keys[keys.length - 1])).toBe(keys.length - 1);
    });

    it('iterates over every colliding entry exactly once', () => {
      var map = mapOf(keys);
      var seen: any = {};
      var count = 0;
      map.forEach((v, k) => {
        if (k && !seen[k]) {
          seen[k] = true;
          count++;
        }
      });
      expect(count).toBe(keys.length);
      expect(keys.every(k => seen[k] === true)).toBe(true);
      expect(map.keySeq().toArray().sort()).toEqual(keys.slice().sort());
      expect(map.entrySeq().count()).toBe(keys.length);
    });

    it('keeps equals() and hashCode() consistent', () => {
      var a = mapOf(keys);
      var b = mapOf(keys);
      expect(is(a, b)).toBe(true);
      expect(a.hashCode()).toBe(b.hashCode());
      expect(is(a, a.set(keys[0], -1))).toBe(false);
    });
  });

  it('mixes colliding and normally-distributed keys', () => {
    var keys = collisionKeys(10); // 1024 colliding
    var map = mapOf(keys).set('alpha', -1).set('beta', -2);
    expect(map.get('alpha')).toBe(-1);
    expect(map.get('beta')).toBe(-2);
    expect(map.get(keys[7])).toBe(7);
    expect(map.size).toBe(keys.length + 2);
  });

  it('is correct just below and just above the index threshold', () => {
    // 8 keys, then 64 keys -- both must be correct whichever side of the
    // internal MIN_HASH_COLLISION_INDEX_SIZE they land on.
    [3, 6].forEach(rounds => {
      var keys = collisionKeys(rounds);
      var map = Map<string, number>();
      for (var i = 0; i < keys.length; i++) {
        map = map.set(keys[i], i);
      }
      expect(map.size).toBe(keys.length);
      expect(keys.every((k, i) => map.get(k) === i)).toBe(true);

      // remove half, the rest must remain correct
      var half = keys.length / 2;
      var trimmed = map;
      for (var j = 0; j < half; j++) {
        trimmed = trimmed.remove(keys[j]);
      }
      expect(trimmed.size).toBe(half);
      for (var k = half; k < keys.length; k++) {
        expect(trimmed.get(keys[k])).toBe(k);
      }
    });
  });

  it('merge() and mergeDeep() work with colliding keys', () => {
    var keys = collisionKeys(11);
    var userObj = objectOf(keys);

    var merged = Map<string, number>({ existing: -1 }).merge(userObj);
    expect(merged.get('existing')).toBe(-1);
    expect(merged.get(keys[123])).toBe(123);
    expect(merged.size).toBe(keys.length + 1);

    var deep = Map<string, number>({ existing: -1 }).mergeDeep(fromJS(userObj));
    expect(deep.get(keys[123])).toBe(123);
    expect(deep.size).toBe(keys.length + 1);
  });

  it('Set (backed by Map) handles colliding values', () => {
    var keys = collisionKeys(11);
    var set = Set(keys);
    expect(set.size).toBe(keys.length);
    for (var i = 0; i < keys.length; i++) {
      expect(set.has(keys[i])).toBe(true);
    }
    expect(set.has('not-in-set')).toBe(false);
    var without = set.remove(keys[10]);
    expect(without.has(keys[10])).toBe(false);
    expect(without.size).toBe(keys.length - 1);
  });

  it('handles value-object keys that all share one hashCode', () => {
    // Exercises the non-string fallback in hashCollisionKey: equality is still
    // decided by is()/equals(), never by the (here constant) secondary hash.
    var items: Array<Collider> = [];
    for (var i = 0; i < 50; i++) {
      items.push(new Collider(i));
    }
    var map = Map<Collider, number>();
    for (var j = 0; j < items.length; j++) {
      map = map.set(items[j], j);
    }
    expect(map.size).toBe(items.length);
    for (var k = 0; k < items.length; k++) {
      expect(map.get(new Collider(k))).toBe(k);
    }
    expect(map.get(new Collider(999), -1)).toBe(-1);

    var removed = map.remove(new Collider(25));
    expect(removed.size).toBe(items.length - 1);
    expect(removed.get(new Collider(25), -1)).toBe(-1);
    expect(removed.get(new Collider(26))).toBe(26);
  });

  it('does not degrade quadratically for a flood of colliding keys', () => {
    // Self-calibrating regression guard: compare 8192 colliding keys against
    // 8192 normally-distributed keys on the same machine, so no absolute
    // wall-clock budget is needed. jasmine 1.3 applies no timeout to
    // synchronous specs, so a bare slow test could not fail on its own.
    // Pre-change this ratio was ~209x at 8192 keys (and ~357x at 16384);
    // with the secondary index it is ~2x.
    // spot-check retrieval across the whole bucket
    var colliding = collisionKeys(13); // 8192
    var normal: Array<string> = [];
    for (var i = 0; i < colliding.length; i++) {
      normal.push('key-' + i);
    }

    function buildAndRead(keys: Array<string>): number {
      var obj = objectOf(keys);
      var start = Date.now();
      var map = Map<string, number>(obj);
      for (var j = 0; j < keys.length; j++) {
        map.get(keys[j]);
      }
      var elapsed = Date.now() - start;
      expect(map.size).toBe(keys.length);
      return elapsed;
    }

    buildAndRead(normal.slice(0, 256)); // warm up the JIT
    buildAndRead(colliding.slice(0, 256));
    var normalMs = Math.max(buildAndRead(normal), 1);
    var collidingMs = buildAndRead(colliding);

    expect(collidingMs / normalMs).toBeLessThan(50);

    var map = Map<string, number>(objectOf(colliding));
    expect(map.get(colliding[0])).toBe(0);
    expect(map.get(colliding[colliding.length - 1])).toBe(colliding.length - 1);
    expect(map.get(colliding[Math.floor(colliding.length / 2)]))
      .toBe(Math.floor(colliding.length / 2));
  });
});

class Collider {
  id: number;
  constructor(id: number) {
    this.id = id;
  }
  equals(other: any): boolean {
    return other instanceof Collider && other.id === this.id;
  }
  hashCode(): number {
    return 7;
  }
}
