import { smi } from './Math';

export function hash(o: unknown): number {
  // eslint-disable-next-line eqeqeq
  if (o == null) {
    return hashNullish(o);
  }

  // @ts-expect-error don't care about object beeing typed as `{}` here
  if (typeof o.hashCode === 'function') {
    // Drop any high bits from accidentally long hash codes.
    // @ts-expect-error don't care about object beeing typed as `{}` here
    return smi(o.hashCode(o));
  }

  const v = valueOf(o);

  // eslint-disable-next-line eqeqeq
  if (v == null) {
    return hashNullish(v);
  }

  switch (typeof v) {
    case 'boolean':
      // The hash values for built-in constants are a 1 value for each 5-byte
      // shift region expect for the first, which encodes the value. This
      // reduces the odds of a hash collision for these common values.
      return v ? 0x42108421 : 0x42108420;
    case 'number':
      return hashNumber(v);
    case 'string':
      return v.length > STRING_HASH_CACHE_MIN_STRLEN
        ? cachedHashString(v)
        : hashString(v);
    case 'object':
    case 'function':
      return hashJSObj(v);
    case 'symbol':
      return hashSymbol(v);
    default:
      if (typeof v.toString === 'function') {
        return hashString(v.toString());
      }
      throw new Error('Value type ' + typeof v + ' cannot be hashed.');
  }
}

function hashNullish(nullish: null | undefined): number {
  return nullish === null ? 0x42108422 : /* undefined */ 0x42108423;
}

// Compress arbitrarily large numbers into smi hashes.
function hashNumber(n: number): number {
  if (n !== n || n === Infinity) {
    return 0;
  }
  let hash = n | 0;
  if (hash !== n) {
    hash ^= n * 0xffffffff;
  }
  while (n > 0xffffffff) {
    n /= 0xffffffff;
    hash ^= n;
  }
  return smi(hash);
}

function cachedHashString(string: string): number {
  let hashed = stringHashCache[string];
  if (hashed === undefined) {
    hashed = hashString(string);
    if (STRING_HASH_CACHE_SIZE === STRING_HASH_CACHE_MAX_SIZE) {
      STRING_HASH_CACHE_SIZE = 0;
      stringHashCache = {};
    }
    STRING_HASH_CACHE_SIZE++;
    stringHashCache[string] = hashed;
  }
  return hashed;
}

// http://jsperf.com/hashing-strings
function hashString(string: string): number {
  // This is the hash from JVM
  // The hash code for a string is computed as
  // s[0] * 31 ^ (n - 1) + s[1] * 31 ^ (n - 2) + ... + s[n - 1],
  // where s[i] is the ith character of the string and n is the length of
  // the string. We "mod" the result to make it between 0 (inclusive) and 2^31
  // (exclusive) by dropping high bits.
  let hashed = 0;
  for (let ii = 0; ii < string.length; ii++) {
    hashed = (31 * hashed + string.charCodeAt(ii)) | 0;
  }
  return smi(hashed);
}

function hashSymbol(sym: symbol): number {
  let hashed = symbolMap[sym];
  if (hashed !== undefined) {
    return hashed;
  }

  hashed = nextHash();

  symbolMap[sym] = hashed;

  return hashed;
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
function hashJSObj(obj: object | Function): number {
  let hashed: number | undefined;
  hashed = weakMap.get(obj);
  if (hashed !== undefined) {
    return hashed;
  }

  // @ts-expect-error used for old code, will be removed
  hashed = obj[UID_HASH_KEY];
  if (hashed !== undefined) {
    return hashed;
  }

  hashed = nextHash();

  weakMap.set(obj, hashed);

  return hashed;
}

function valueOf(obj: object): unknown {
  return obj.valueOf !== Object.prototype.valueOf &&
    typeof obj.valueOf === 'function'
    ? // @ts-expect-error weird the "obj" parameter as `valueOf` should not have a parameter
      obj.valueOf(obj)
    : obj;
}

function nextHash(): number {
  const nextHash = ++_objHashUID;
  if (_objHashUID & 0x40000000) {
    _objHashUID = 0;
  }
  return nextHash;
}

const weakMap: WeakMap<object, number> = new WeakMap();

const symbolMap = Object.create(null);

let _objHashUID = 0;

const UID_HASH_KEY: symbol = Symbol('__immutablehash__');

const STRING_HASH_CACHE_MIN_STRLEN = 16;
const STRING_HASH_CACHE_MAX_SIZE = 255;
let STRING_HASH_CACHE_SIZE = 0;
let stringHashCache: { [key: string]: number } = {};
