import { Metadata } from 'next';
import Link from 'next/link';
import { SIDEBAR_LINKS, VERSION } from '../currentVersion';
import { Sidebar } from '../../../sidebar';
import { DocSearch } from '../../../DocSearch';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Documentation v5 — Immutable.js`,
  };
}

export default async function OverviewDocPage() {
  const { default: MdxContent } = await import(`@/docs/Intro.mdx`);

  return (
    <>
      <Sidebar />

      <div className="docContents">
        <DocSearch />
        <div key="Overview" className="docContents">
          <h1 className="mainTitle">Immutable.js ({VERSION})</h1>
          <MdxContent />

          {SIDEBAR_LINKS.map((link) => (
            <section key={link.url} className="interfaceMember">
              <h3 className="memberLabel">
                <Link href={link.url}>{link.label}</Link>
              </h3>
              <div className="markdown detail">
                <p>{link.description}</p>
              </div>
            </section>
          ))}
        </div>
      </div>
    </>
  );
}
