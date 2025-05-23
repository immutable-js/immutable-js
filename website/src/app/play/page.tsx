import { Metadata } from 'next';
import { DocSearch } from '../../DocSearch';
import { SideBar } from '../../Sidebar';
import Playground from './Playground';
import { VERSION } from '../docs/currentVersion';

export async function generateStaticParams() {
  // return [...getVersions().map((version) => ({ version }))];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Playground — Immutable.js`,
  };
}

export default function OverviewDocPage() {
  return (
    <>
      <SideBar />
      <div key="Overview" className="docContents">
        <DocSearch />
        <h1>Playgroud (${VERSION})</h1>
        You can share or bookmark the url to get access to this playground.
        <Playground />
      </div>
    </>
  );
}
