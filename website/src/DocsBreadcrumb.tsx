'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Fragment, type JSX } from 'react';

/**
 * Docs breadcrumb (`Docs / <version> / <segment>…`), derived entirely from the
 * URL so it works for any version (v5, a future v6, …) and for any depth
 * (`/docs/v5/get-started/installation/`) without hardcoding.
 */
export function DocsBreadcrumb(): JSX.Element {
  const pathname = usePathname() || '';
  // "/docs/v5/get-started/installation/" -> ["v5", "get-started", "installation"]
  const [, ...segments] = pathname.split('/').filter(Boolean);

  return (
    <div className="doc-breadcrumb">
      <Link href="/docs">Docs</Link>
      {segments.map((segment, index) => {
        const isLast = index === segments.length - 1;
        const href = `/docs/${segments.slice(0, index + 1).join('/')}`;
        const label = decodeURIComponent(segment);

        return (
          <Fragment key={href}>
            <span>/</span>
            {isLast ? (
              <span className="current">{label}</span>
            ) : (
              <Link href={href}>{label}</Link>
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
