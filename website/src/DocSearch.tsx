'use client';

import { DocSearch as AlgoliaDocSearch } from '@docsearch/react';
import '@docsearch/css';

export function DocSearch() {
  return (
    <AlgoliaDocSearch
      appId="QC5Y0IBCGJ"
      indexName="immutable-js"
      apiKey="aee666cc7a032d737abd42a85c83a32c"
      placeholder="Search Immutable.js Documentation"
    />
  );
}
