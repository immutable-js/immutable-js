/**
 * The interface to fulfill to qualify as a Value Object.
 */
export default interface ValueObject {
  /**
   * True if this and the other Collection have value equality, as defined
   * by `Immutable.is()`.
   *
   * Note: This is equivalent to `Immutable.is(this, other)`, but provided to
   * allow for chained expressions.
   */
  equals(other: unknown): boolean;

  /**
   * Computes and returns the hashed identity for this Collection.
   *
   * The `hashCode` of a Collection is used to determine potential equality,
   * and is used when adding this to a `Set` or as a key in a `Map`, enabling
   * lookup via a different instance.
   *
   * Note: hashCode() MUST return a Uint32 number. The easiest way to
   * guarantee this is to return `myHash | 0` from a custom implementation.
   *
   * If two values have the same `hashCode`, they are [not guaranteed
   * to be equal][Hash Collision]. If two values have different `hashCode`s,
   * they must not be equal.
   *
   * Note: `hashCode()` is not guaranteed to always be called before
   * `equals()`. Most but not all Immutable.js collections use hash codes to
   * organize their internal data structures, while all Immutable.js
   * collections use equality during lookups.
   *
   * [Hash Collision]: https://en.wikipedia.org/wiki/Collision_(computer_science)
   */
  hashCode(): number;
}
