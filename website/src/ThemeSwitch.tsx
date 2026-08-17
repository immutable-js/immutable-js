'use client';

import { type JSX } from 'react';
import { type ThemePreference, useTheme } from './ThemeContext';

const MODES: Array<{ id: ThemePreference; label: string }> = [
  { id: 'light', label: 'Light' },
  { id: 'dark', label: 'Dark' },
  { id: 'auto', label: 'Auto' },
];

export function ThemeSwitch(): JSX.Element {
  const { theme, setTheme } = useTheme();

  return (
    <div className="rd-theme" role="group" aria-label="Theme">
      {MODES.map(({ id, label }) => (
        <button
          key={id}
          type="button"
          title={label}
          aria-pressed={theme === id}
          onClick={() => setTheme(id)}
          className={`rd-theme__seg ${
            theme === id ? 'rd-theme__seg--active' : ''
          }`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
