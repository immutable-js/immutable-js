import { Metadata } from 'next';
import Link from 'next/link';
import { DocsBreadcrumb } from '../../../DocsBreadcrumb';
import { Sidebar } from '../../../sidebar';
import { getVersions } from '../../../static/getVersions';
import {
  GET_STARTED_LINKS,
  SIDEBAR_LINKS,
  SidebarLinkType,
  VERSION,
} from '../currentVersion';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Documentation ${VERSION} — Immutable.js`,
  };
}

export default async function OverviewDocPage() {
  const { default: MdxContent } = await import(`@/docs/Intro.mdx`);
  const versions = getVersions();

  const collections = SIDEBAR_LINKS.filter(
    (link) => link.type === SidebarLinkType.Collection && link.description
  );
  const functions = SIDEBAR_LINKS.filter(
    (link) => link.type === SidebarLinkType.Function && link.description
  );

  return (
    <div className="docs-grid">
      <Sidebar versions={versions} />

      <main className="docs-main">
        <article className="doc-article">
          <DocsBreadcrumb />
          <h1>Immutable.js</h1>

          <MdxContent />

          <p>
            New here? The{' '}
            <Link href={GET_STARTED_LINKS[0].url}>Get started</Link> guide walks
            through installing the library and the ideas behind it, in reading
            order. Otherwise, head straight to the API reference below.
          </p>

          <h2 id="get-started">Get started</h2>
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

          <h2 id="collections">Collections</h2>
          <div className="doc-cards">
            {collections.map((link) => (
              <Link key={link.url} href={link.url} className="doc-card">
                <div className="doc-card__name">{link.label}</div>
                <div className="doc-card__desc">{link.description}</div>
              </Link>
            ))}
          </div>

          <h2 id="functions">Functions</h2>
          <div className="doc-cards">
            {functions.map((link) => (
              <Link key={link.url} href={link.url} className="doc-card">
                <div className="doc-card__name">{link.label}</div>
                <div className="doc-card__desc">{link.description}</div>
              </Link>
            ))}
          </div>
        </article>
      </main>
    </div>
  );
}
