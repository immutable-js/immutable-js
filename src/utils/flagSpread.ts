type F = ((...args: unknown[]) => unknown) & { unspread?: boolean };

const flagSpread = (fn: F) => ((fn.unspread = true), fn);

export default flagSpread;
