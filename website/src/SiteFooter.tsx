import Link from 'next/link';
import { type JSX } from 'react';
import { Logo } from './Logo';
import { SVGSet } from './SVGSet';
import { VERSION } from './app/docs/currentVersion';
import { GITHUB_REPO_URL } from './constants';

export function SiteFooter(): JSX.Element {
  return (
    <footer className="site-footer">
      <div className="site-footer__inner">
        <SVGSet>
          <Logo color="#FC4349" />
          <Logo color="#2C3E50" inline />
        </SVGSet>
        <span className="site-footer__license">MIT licensed</span>
        <Link href={`/docs/${VERSION}`}>Docs</Link>
        <Link href="/play">Playground</Link>
        <a href={GITHUB_REPO_URL} target="_blank" rel="noopener">
          GitHub
        </a>
        <span className="site-footer__meta">{VERSION} · zero dependencies</span>
      </div>
    </footer>
  );
}
