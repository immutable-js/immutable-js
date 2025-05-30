import { Metadata } from 'next';
import { DocSearch } from '../../DocSearch';
import { SideBar } from '../../Sidebar';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Devtools — Immutable.js`,
  };
}

export default async function BrowserExtensionPage() {
  const { default: MdxContent } = await import(`@/docs/BrowserExtension.mdx`);

  return (
    <>
      <SideBar />
      <div key="Overview" className="docContents">
        <DocSearch />

        <MdxContent />
      </div>
    </>
  );
}
