import { Metadata } from 'next';
import { DocSearch } from '../../DocSearch';
import { Sidebar } from '../../sidebar';
import { VERSION } from '../docs/currentVersion';
import Playground from './Playground';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Playground — Immutable.js`,
  };
}

export default function OverviewDocPage() {
  return (
    <>
      <Sidebar />
      <div key="Overview" className="docContents">
        <DocSearch />
        <h1>Playgroud ({VERSION})</h1>
        You can share or bookmark the url to get access to this playground.
        <Playground />
      </div>
    </>
  );
}
