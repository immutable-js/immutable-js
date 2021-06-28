const isMobileMatch =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(max-device-width: 680px)');

// @ts-ignore
export const isMobile = false && !!(isMobileMatch && isMobileMatch.matches);
