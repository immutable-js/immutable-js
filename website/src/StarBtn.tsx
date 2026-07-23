'use client';

import { type JSX, useEffect, useState } from 'react';
import { GITHUB_API_URL, GITHUB_REPO_URL } from './constants';

function formatStars(count: number): string {
  if (count >= 1000) {
    return (count / 1000).toFixed(1).replace(/\.0$/, '') + 'k';
  }
  return String(count);
}

export function StarBtn(): JSX.Element {
  const [stars, setStars] = useState<number | null>(null);

  useEffect(() => {
    loadJSON(GITHUB_API_URL, (value) => {
      if (
        typeof value === 'object' &&
        value !== null &&
        'stargazers_count' in value &&
        typeof value.stargazers_count === 'number'
      ) {
        setStars(value.stargazers_count);
      }
    });
  }, []);

  return (
    <a
      className="rd-star"
      href={GITHUB_REPO_URL}
      target="_blank"
      rel="noopener"
      aria-label="Star Immutable.js on GitHub"
    >
      <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.53-1.34-1.29-1.7-1.29-1.7-1.05-.72.08-.71.08-.71 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.68 0-1.25.45-2.28 1.19-3.08-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 2.9-.39c.98 0 1.97.13 2.9.39 2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.8 1.19 1.83 1.19 3.08 0 4.41-2.69 5.38-5.25 5.67.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.21.68.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
      </svg>
      Star
      {stars !== null && (
        <span className="rd-star__count">{formatStars(stars)}</span>
      )}
    </a>
  );
}

function loadJSON(url: string, then: (value: unknown) => void) {
  const oReq = new XMLHttpRequest();
  oReq.onload = (event) => {
    if (
      !event.target ||
      !('responseText' in event.target) ||
      typeof event.target.responseText !== 'string'
    ) {
      return null;
    }

    let json;
    try {
      json = JSON.parse(event.target.responseText);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars -- TODO enable eslint here
    } catch (e) {
      // ignore error
    }
    then(json);
  };
  oReq.open('get', url, true);
  oReq.send();
}
