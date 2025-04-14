import { SideBar } from '@/Sidebar';
import { DocSearch } from '@/DocSearch';
import { DocHeader } from '../../../DocHeader';
import { ImmutableConsole } from '../../../ImmutableConsole';
import { getVersions } from '../../../static/getVersions';

export default async function VersionLayout(props: {
  children: React.ReactNode;
  params: Promise<{ version: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  const versions = getVersions();

  const version = 'v5';

  // TODO get the real links from the file list
  const sidebarLinks = [
    { label: 'List', url: `/docs/${version}/List` },
    { label: 'Map', url: `/docs/${version}/Map` },
    { label: 'OrderedMap', url: `/docs/${version}/OrdererMap` },
    { label: 'Set', url: `/docs/${version}/Set` },
    { label: 'mergeDeep()', url: `/docs/${version}/mergeDeep()` },
    { label: 'mergeDeepWith()', url: `/docs/${version}/mergeDeepWith()` },
  ];

  return (
    <div>
      <ImmutableConsole version={version} />
      <DocHeader versions={versions} currentVersion={version} />
      <div className="pageBody">
        <div className="contents">
          <SideBar links={sidebarLinks} />

          <div className="docContents">
            <DocSearch />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
