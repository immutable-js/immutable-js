'use client';

import { useTheme } from './ThemeContext';

/**
 * Returns whether the effective theme is dark. Backed by the 3-state
 * (light/dark/auto) preference in ThemeContext, resolved against the system
 * preference for "auto". Used e.g. to pick the CodeMirror editor theme.
 */
export default function useDarkMode(): boolean {
  const { resolved } = useTheme();
  return resolved === 'dark';
}
