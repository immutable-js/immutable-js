export const imul = Math.imul;

// v8 has an optimization for storing 31-bit signed numbers.
// Values which have either 00 or 11 as the high order bits qualify.
// This function drops the highest order bit in a signed number, maintaining
// the sign bit.
export function smi(i32: number): number {
  return ((i32 >>> 1) & 0x40000000) | (i32 & 0xbfffffff);
}
