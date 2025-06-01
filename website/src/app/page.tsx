import fs from 'fs';
import { Metadata } from 'next';
import { Header } from '../Header';
import { ImmutableConsole } from '../ImmutableConsole';
import { MarkdownContent } from '../MarkdownContent';
import { genMarkdownDoc } from '../static/genMarkdownDoc';
import { getVersions } from '../static/getVersions';

export async function generateMetadata(): Promise<Metadata> {
  return {
    verification: {
      google: 'PdYYQG_2wv0zUJjqBIeuYliPcrOiAuTES4Q21OLy5uQ',
    },
  };
}

export default async function Page() {
  const versions = await getVersions();
  const readme = genMarkdownDoc(
    versions[0],
    fs.readFileSync(`../README.md`, 'utf8')
  );

  return (
    <>
      <ImmutableConsole version={versions[0]} />
      <Header versions={versions} />

      <div className="pageBody">
        <div className="contents">
          <MarkdownContent contents={readme} />
        </div>
      </div>
    </>
  );
}
