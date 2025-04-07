import { Metadata } from 'next';
import { getVersions } from '../../static/getVersions';
import { getTypeDefs } from '../../static/getTypeDefs';
import { DocSearch } from '../../DocSearch';
import { SideBar } from '../../Sidebar';
import { getSidebarLinks } from '../../getSidebarLinks';
import Repl from '../../repl/Repl';

export async function generateStaticParams() {
  return [...getVersions().map((version) => ({ version }))];
}

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Playground — Immutable.js`,
  };
}

export default function OverviewDocPage() {
  const versions = getVersions();
  const version = versions[0];
  const defs = getTypeDefs(version);

  const sidebarLinks = getSidebarLinks(defs);

  return (
    <>
      <SideBar links={sidebarLinks} />
      <div key="Overview" className="docContents">
        <DocSearch />
        <h1>Playgroud ({version})</h1>

        {/*
Debug with:

List([
  'apple',
  'banana',
  'coconut',
  123,
  null,
  undefined,
  new Date()
])
  .push('dragonfruit')
  .map((fruit) => upperFirst(fruit))

*/}

        <Repl
          defaultValue={`const upperFirst = (str) => typeof str === 'string'
  ? str.charAt(0).toUpperCase() + str.slice(1)
  : str;
            
List([
  'apple',
  'banana',
  'coconut',
])
  .push('dragonfruit')
  .map((fruit) => upperFirst(fruit))
`}
        />
      </div>
    </>
  );
}
