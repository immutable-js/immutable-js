import { Metadata } from 'next';
import { DocSearch } from '../../../DocSearch';
import { getVersionFromGitTag } from '../../../static/getVersions';
import { VERSION } from '../currentVersion';
import { DocOverview, getOverviewData } from './DocOverview';
import { SideBarV4 } from './SidebarV4';
import { getSidebarLinks } from './getSidebarLinks';
import { getTypeDefs } from './getTypeDefs';
import { getVersionFromParams } from './getVersionFromParams';

export async function generateStaticParams() {
  const versions = getVersionFromGitTag();

  // Without git tags (e.g. Vercel's shallow clone), fall back to the version
  // read from the local type definitions so `output: export` still has at
  // least one path to generate for this dynamic route.
  if (versions.length === 0) {
    return [{ version: 'latest@main' }];
  }

  return versions.map((version) => ({ version }));
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
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `/docs/${VERSION}/`,
    },
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
      <SideBarV4 links={sidebarLinks} />
      <div key="Overview" className="docContents">
        <DocSearch />
        <h1 className="mainTitle">Immutable.js ({version})</h1>
        <DocOverview data={overviewData} />
      </div>
    </>
  );
}
