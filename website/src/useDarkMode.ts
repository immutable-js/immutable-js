import { useEffect, useState } from 'react';

export default function useDarkMode(): boolean {
  const darkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
  const [darkMode, setDarkMode] = useState(darkModeMediaQuery.matches);

  useEffect(() => {
    const handleChange = (e: MediaQueryListEvent) => {
      setDarkMode(e.matches);
    };
    darkModeMediaQuery.addEventListener('change', handleChange);
    return () => {
      darkModeMediaQuery.removeEventListener('change', handleChange);
    };
  }, [darkModeMediaQuery]);

  return darkMode;
}
