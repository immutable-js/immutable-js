'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { type JSX } from 'react';

/**
 * Docs breadcrumb (`Docs / <version> / <type>`), derived entirely from the URL
 * so it works for any version (v5, a future v6, …) without hardcoding.
 */
export function DocsBreadcrumb(): JSX.Element {
  const pathname = usePathname() || '';
  // "/docs/v5/List/" -> ["docs", "v5", "List"]
  const [, version, type] = pathname.split('/').filter(Boolean);

  return (
    <div className="doc-breadcrumb">
      <Link href={`/docs/${version}`}>Docs</Link>
      <span>/</span>
      {type ? (
        <>
          <Link href={`/docs/${version}`}>{version}</Link>
          <span>/</span>
          <span className="current">{decodeURIComponent(type)}</span>
        </>
      ) : (
        <span className="current">{version}</span>
      )}
    </div>
  );
}
