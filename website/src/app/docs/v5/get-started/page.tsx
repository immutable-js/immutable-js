import type { Metadata } from 'next';
import Link from 'next/link';
import { DocsBreadcrumb } from '../../../../DocsBreadcrumb';
import { Sidebar } from '../../../../sidebar';
import { getVersions } from '../../../../static/getVersions';
import { GET_STARTED_LINKS, VERSION } from '../../currentVersion';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Get started ${VERSION} — Immutable.js`,
    description:
      'Install Immutable.js and learn the ideas behind persistent collections, one page at a time.',
  };
}

export default async function GetStartedOverviewPage() {
  const versions = getVersions();

  return (
    <div className="docs-grid">
      <Sidebar versions={versions} />

      <main className="docs-main">
        <article className="doc-article">
          <DocsBreadcrumb />
          <h1>Get started</h1>

          <p>
            A guided tour of Immutable.js, meant to be read in order. Each page
            is short and stands on its own, so you can also jump to whichever
            one answers the question you have right now.
          </p>

          <div className="doc-cards">
            {GET_STARTED_LINKS.map((link) => (
              <Link key={link.url} href={link.url} className="doc-card">
                <div className="doc-card__name doc-card__name--prose">
                  {link.label}
                </div>
                <div className="doc-card__desc">{link.description}</div>
              </Link>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
