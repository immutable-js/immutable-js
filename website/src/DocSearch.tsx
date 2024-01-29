'use client';

import { useEffect, useState } from 'react';

export function DocSearch() {
  const [enabled, setEnabled] = useState<boolean | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    const firstScript = document.getElementsByTagName('script')[0];
    script.src =
      'https://cdn.jsdelivr.net/npm/docsearch.js@2.5.2/dist/cdn/docsearch.min.js';
    script.addEventListener(
      'load',
      () => {
        // Initialize Algolia search.
        // @ts-expect-error -- algolia is set on windows, need proper type
        if (window.docsearch) {
          // @ts-expect-error -- algolia is set on windows, need proper type
          window.docsearch({
            apiKey: '83f61f865ef4cb682e0432410c2f7809',
            indexName: 'immutable_js',
            inputSelector: '#algolia-docsearch',
          });
          setEnabled(true);
        } else {
          setEnabled(false);
        }
      },
      false
    );
    firstScript?.parentNode?.insertBefore(script, firstScript);

    const link = document.createElement('link');
    const firstLink = document.getElementsByTagName('link')[0];
    link.rel = 'stylesheet';
    link.href =
      'https://cdn.jsdelivr.net/npm/docsearch.js@2.5.2/dist/cdn/docsearch.min.css';
    firstLink?.parentNode?.insertBefore(link, firstLink);
  }, []);

  if (enabled === false) return null;

  return (
    <input
      id="algolia-docsearch"
      className="docSearch"
      type="search"
      placeholder="Search Immutable.js Documentation"
      disabled={!enabled}
    />
  );
}
