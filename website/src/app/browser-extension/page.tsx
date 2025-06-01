import { Metadata } from 'next';
import { DocSearch } from '../../DocSearch';
import { Sidebar } from '../../sidebar';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Devtools — Immutable.js`,
  };
}

export default async function BrowserExtensionPage() {
  const { default: MdxContent } = await import(`@/docs/BrowserExtension.mdx`);

  return (
    <>
      <Sidebar />
      <div key="Overview" className="docContents">
        <DocSearch />

        <MdxContent />
      </div>
    </>
  );
}
