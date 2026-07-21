'use client';

import { DocSearch } from '@docsearch/react';
import '@docsearch/css';
import { type JSX } from 'react';

/**
 * The header search entry. Wires the design's search pill to the existing
 * Algolia DocSearch (⌘K opens the modal). The pill look is applied via CSS
 * overrides on `.DocSearch-Button` scoped to `.rd-search-wrap` (globals.css).
 */
export function HeaderSearch(): JSX.Element {
  return (
    <div className="rd-search-wrap">
      <DocSearch
        appId="QC5Y0IBCGJ"
        indexName="immutable-js"
        apiKey="aee666cc7a032d737abd42a85c83a32c"
        placeholder="Search docs…"
      />
    </div>
  );
}
