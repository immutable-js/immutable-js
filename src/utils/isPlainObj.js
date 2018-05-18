export default function isPlainObj(value) {
  // Basic check for Type object that's not null
  if (typeof value === 'object' && value !== null) {
    // If Object.getPrototypeOf supported, use it
    if (typeof Object.getPrototypeOf === 'function') {
      const proto = Object.getPrototypeOf(value);
      return proto === Object.prototype || proto === null;
    }

    // Otherwise, use internal class
    // This should be reliable as if getPrototypeOf not supported, is pre-ES5
    return Object.prototype.toString.call(value) === '[object Object]';
  }

  // Not an object
  return false;
}
