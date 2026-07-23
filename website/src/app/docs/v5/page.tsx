import { Metadata } from 'next';
import Link from 'next/link';
import { DocsBreadcrumb } from '../../../DocsBreadcrumb';
import { Sidebar } from '../../../sidebar';
import { getVersions } from '../../../static/getVersions';
import { SIDEBAR_LINKS, VERSION } from '../currentVersion';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Documentation ${VERSION} — Immutable.js`,
  };
}

export default async function OverviewDocPage() {
  const { default: MdxContent } = await import(`@/docs/Intro.mdx`);
  const versions = getVersions();

  return (
    <div className="docs-grid">
      <Sidebar versions={versions} />

      <main className="docs-main">
        <article className="doc-article">
          <DocsBreadcrumb />
          <h1>Immutable.js</h1>

          <MdxContent />

          <div className="doc-cards">
            {SIDEBAR_LINKS.filter((link) => link.description).map((link) => (
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
