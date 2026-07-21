'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type JSX, useEffect, useState } from 'react';
import { HeaderSearch } from './HeaderSearch';
import { Logo } from './Logo';
import { SVGSet } from './SVGSet';
import { StarBtn } from './StarBtn';
import { ThemeSwitch } from './ThemeSwitch';

type NavItem = {
  label: string;
  href: string;
  isActive: (pathname: string) => boolean;
};

const NAV: Array<NavItem> = [
  {
    label: 'Docs',
    href: '/docs/v5',
    isActive: (p) => p.startsWith('/docs'),
  },
  {
    label: 'Playground',
    href: '/play',
    isActive: (p) => p.startsWith('/play'),
  },
  {
    label: 'Extension',
    href: '/browser-extension',
    isActive: (p) => p.startsWith('/browser-extension'),
  },
];

/**
 * The global sticky header, shared by every page (Home, Docs, Playground,
 * Extension). Replaces the old miniHeader + animated cover.
 */
export function Header({
  flush = false,
}: {
  /** Use fixed 26px horizontal padding (docs/playground) instead of the
   * content-centered padding used on the home page. */
  flush?: boolean;
}): JSX.Element {
  const pathname = usePathname() || '/';
  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  return (
    <header className={`rd-header ${flush ? 'rd-header--flush' : ''}`}>
      <Link href="/" aria-label="Immutable.js home" className="rd-header__logo">
        <SVGSet>
          <Logo color="#FC4349" />
          <Logo color="#2C3E50" inline />
        </SVGSet>
      </Link>

      <div
        className={`rd-header__menu ${menuOpen ? 'rd-header__menu--open' : ''}`}
      >
        <nav className="rd-header__nav">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              onClick={() => setMenuOpen(false)}
              className={`rd-navlink ${
                item.isActive(pathname) ? 'rd-navlink--active' : ''
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="rd-header__actions">
          <HeaderSearch />
          <ThemeSwitch />
          <StarBtn />
        </div>
      </div>

      <button
        type="button"
        className="rd-burger"
        aria-label="Toggle navigation menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        {menuOpen ? (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="6" y1="6" x2="18" y2="18" />
            <line x1="18" y1="6" x2="6" y2="18" />
          </svg>
        ) : (
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <line x1="4" y1="8" x2="20" y2="8" />
            <line x1="4" y1="16" x2="20" y2="16" />
          </svg>
        )}
      </button>
    </header>
  );
}
