'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Fragment, useEffect, useState, type JSX } from 'react';
import { Logo } from '../Logo';
import { SVGSet } from '../SVGSet';
import { SIDEBAR_LINKS, VERSION } from '../app/docs/currentVersion';
import type { FocusType } from './Focus';

export type SidebarLinks = Array<{ label: string; url: string }>;

// Range()/Repeat() end with "()" but are collection constructors, not the
// top-level helper functions listed under "Functions".
const CONSTRUCTOR_LABELS = new Set(['Range()', 'Repeat()']);

function isFunctionLabel(label: string): boolean {
  return label.endsWith('()') && !CONSTRUCTOR_LABELS.has(label);
}

const SearchIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="var(--muted)"
    strokeWidth="2"
  >
    <circle cx="11" cy="11" r="7" />
    <line x1="21" y1="21" x2="16.5" y2="16.5" />
  </svg>
);

const Chevron = ({ open }: { open: boolean }) => (
  <svg
    className={`sb-chevron ${open ? 'sb-chevron--open' : ''}`}
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.6"
  >
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

export default function SideBar({
  focus,
  activeType,
  versions,
}: {
  focus?: FocusType;
  activeType?: string;
  versions: Array<string>;
}): JSX.Element {
  const pathname = usePathname() || '';
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [collapsed, setCollapsed] = useState(false);
  const [navOpen, setNavOpen] = useState(false);
  const [hash, setHash] = useState('');

  // The active version comes from the URL (/docs/<version>/…).
  const currentVersion = pathname.split('/').filter(Boolean)[1] ?? VERSION;

  // Track the URL hash so the member matching it can be highlighted.
  useEffect(() => {
    const update = () => setHash(decodeURIComponent(window.location.hash));
    update();
    window.addEventListener('hashchange', update);
    return () => window.removeEventListener('hashchange', update);
  }, []);

  const q = query.trim().toLowerCase();
  const match = (label: string) => !q || label.toLowerCase().includes(q);

  const collections = SIDEBAR_LINKS.filter(
    (l) => !isFunctionLabel(l.label) && match(l.label)
  );
  const functions = SIDEBAR_LINKS.filter(
    (l) => isFunctionLabel(l.label) && match(l.label)
  );

  const renderCollection = (link: { label: string; url: string }) => {
    const isActive = activeType === link.label;
    const isCurrent =
      pathname === link.url || pathname === link.url.replace(/\/$/, '');
    const expanded = isActive && !collapsed && !q && Boolean(focus?.length);

    return (
      <div key={link.url}>
        <Link
          href={link.url}
          className={`sb-item ${isActive ? 'sb-item--active' : ''}`}
          onClick={(e) => {
            if (isCurrent) {
              e.preventDefault();
              setCollapsed((prev) => !prev);
            } else {
              setNavOpen(false);
            }
          }}
        >
          {link.label}
          {isActive && Boolean(focus?.length) && <Chevron open={expanded} />}
        </Link>

        {expanded && (
          <div className="sb-members">
            {focus?.map((group, i) => (
              <Fragment key={`${group.label}-${i}`}>
                {group.label && (
                  <div className="sb-group-title">{group.label}</div>
                )}
                {Object.values(group.functions).map((member) => (
                  <a
                    key={member.label}
                    href={member.url}
                    className={`sb-member ${
                      hash === member.url ? 'sb-member--active' : ''
                    }`}
                    onClick={() => setNavOpen(false)}
                  >
                    {member.label}
                  </a>
                ))}
              </Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className="docs-sidebar">
      <button
        type="button"
        className="docs-sidebar__toggle"
        aria-expanded={navOpen}
        onClick={() => setNavOpen((open) => !open)}
      >
        <svg
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="4" y1="7" x2="20" y2="7" />
          <line x1="4" y1="12" x2="20" y2="12" />
          <line x1="4" y1="17" x2="20" y2="17" />
        </svg>
        <span>{activeType ? `Reference · ${activeType}` : 'Reference'}</span>
        <Chevron open={navOpen} />
      </button>

      <div
        className={`docs-sidebar__body ${navOpen ? 'docs-sidebar__body--open' : ''}`}
      >
        <div className="sb-brand">
          <Link
            href="/"
            aria-label="Immutable.js home"
            className="sb-brand__link"
          >
            <SVGSet>
              <Logo color="#FC4349" />
              <Logo color="#2C3E50" inline />
            </SVGSet>
          </Link>
          {versions.length > 1 ? (
            <div className="sb-version">
              <select
                aria-label="Documentation version"
                value={currentVersion}
                onChange={(e) => router.push(`/docs/${e.target.value}/`)}
              >
                {versions.map((v) => (
                  <option key={v} value={v}>
                    {v}
                  </option>
                ))}
              </select>
              <svg
                className="sb-version__chevron"
                width="10"
                height="10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="3"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          ) : (
            <span className="sb-badge">{currentVersion}</span>
          )}
        </div>

        <div className="sb-filter">
          <SearchIcon />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter reference…"
            aria-label="Filter reference"
          />
        </div>

        {collections.length > 0 && (
          <>
            <div className="sb-eyebrow">Collections</div>
            {collections.map(renderCollection)}
          </>
        )}

        {functions.length > 0 && (
          <>
            <div className="sb-eyebrow sb-eyebrow--functions">Functions</div>
            {functions.map((link) => (
              <Link
                key={link.url}
                href={link.url}
                className="sb-fn"
                onClick={() => setNavOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
