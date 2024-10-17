import { hash } from 'immutable';
import * as jasmineCheck from 'jasmine-check';

jasmineCheck.install();

describe('hash', () => {
  it('stable hash of well known values', () => {
    expect(hash(true)).toBe(0x42108421);
    expect(hash(false)).toBe(0x42108420);
    expect(hash(0)).toBe(0);
    expect(hash(null)).toBe(0x42108422);
    expect(hash(undefined)).toBe(0x42108423);
    expect(hash('a')).toBe(97);
    expect(hash('immutable-js')).toBe(510203252);
    expect(hash(123)).toBe(123);
  });

  it('generates different hashes for decimal values', () => {
    expect(hash(123.456)).toBe(884763256);
    expect(hash(123.4567)).toBe(887769707);
  });

  it('generates different hashes for different objects', () => {
    const objA = {};
    const objB = {};
    expect(hash(objA)).toBe(hash(objA));
    expect(hash(objA)).not.toBe(hash(objB));
  });

  it('generates different hashes for different symbols', () => {
    // eslint-disable-next-line symbol-description
    const symA = Symbol();
    // eslint-disable-next-line symbol-description
    const symB = Symbol();
    expect(hash(symA)).toBe(hash(symA));
    expect(hash(symA)).not.toBe(hash(symB));
  });

  it('generates different hashes for different functions', () => {
    const funA = () => {};
    const funB = () => {};
    expect(hash(funA)).toBe(hash(funA));
    expect(hash(funA)).not.toBe(hash(funB));
  });

  const genValue = gen.oneOf([gen.string, gen.int]);

  check.it('generates unsigned 31-bit integers', [genValue], value => {
    const hashVal = hash(value);
    expect(Number.isInteger(hashVal)).toBe(true);
    expect(hashVal).toBeGreaterThan(-(2 ** 31));
    expect(hashVal).toBeLessThan(2 ** 31);
  });
});
