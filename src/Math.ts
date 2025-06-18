// TODO remove in v6 as Math.imul is widely available now: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/imul
export const imul =
  typeof Math.imul === 'function' && Math.imul(0xffffffff, 2) === -2
    ? Math.imul
    : function imul(a: number, b: number): number {
        a |= 0; // int
        b |= 0; // int
        const c = a & 0xffff;
        const d = b & 0xffff;
        // Shift by 0 fixes the sign on the high part.
        return (c * d + ((((a >>> 16) * d + c * (b >>> 16)) << 16) >>> 0)) | 0; // int
      };

// v8 has an optimization for storing 31-bit signed numbers.
// Values which have either 00 or 11 as the high order bits qualify.
// This function drops the highest order bit in a signed number, maintaining
// the sign bit.
export function smi(i32: number): number {
  return ((i32 >>> 1) & 0x40000000) | (i32 & 0xbfffffff);
}
