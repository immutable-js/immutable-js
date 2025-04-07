import { Metadata } from 'next';
import { getVersions } from '../../../static/getVersions';
import { getTypeDefs } from '../../../static/getTypeDefs';
import { DocOverview, getOverviewData } from '../../../DocOverview';
import { DocSearch } from '../../../DocSearch';
import { SideBar } from '../../../Sidebar';
import { getSidebarLinks } from '../../../getSidebarLinks';
import { getVersionFromParams } from '../../getVersionFromParams';

export async function generateStaticParams() {
  return [...getVersions().map((version) => ({ version }))];
}

type Params = {
  version: string;
};

type Props = {
  params: Promise<Params>;
};

export async function generateMetadata(props: Props): Promise<Metadata> {
  const params = await props.params;
  const version = getVersionFromParams(params);

  return {
    title: `Documentation ${version} — Immutable.js`,
  };
}

export default async function OverviewDocPage(props: Props) {
  const params = await props.params;
  const version = getVersionFromParams(params);
  const defs = getTypeDefs(version);
  const overviewData = getOverviewData(defs);
  const sidebarLinks = getSidebarLinks(defs);

  return (
    <>
      <SideBar links={sidebarLinks} />
      <div key="Overview" className="docContents">
        <DocSearch />
        <h1>Immutable.js ({version})</h1>
        <DocOverview data={overviewData} />
      </div>
    </>
  );
}
