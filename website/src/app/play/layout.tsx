import { DocHeader } from '../../DocHeader';
import { ImmutableConsole } from '../../ImmutableConsole';
import { getVersions } from '../../static/getVersions';
import { getVersionFromParams } from '../getVersionFromParams';

export default function VersionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { version: string };
}) {
  const versions = getVersions();

  return (
    <div>
      <ImmutableConsole version={versions[0]} />
      <DocHeader versions={versions} currentVersion={versions[0]} />
      <div className="pageBody">
        <div className="contents">{children}</div>
      </div>
    </div>
  );
}
