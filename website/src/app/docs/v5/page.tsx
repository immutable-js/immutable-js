import { Metadata } from 'next';
import Link from 'next/link';
import { SIDEBAR_LINKS } from '../currentVersion';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Documentation v5 — Immutable.js`,
  };
}

export default async function OverviewDocPage() {
  const version = 'v5';
  const { default: MdxContent } = await import(`@/docs/Intro.mdx`);

  console.log('MdxContent', MdxContent);

  return (
    <>
      <div key="Overview" className="docContents">
        <h1 className="mainTitle">Immutable.js ({version})</h1>
        {/* <DocOverview data={overviewData} /> */}
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
    </>
  );
}
