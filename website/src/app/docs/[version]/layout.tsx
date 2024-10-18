import { DocHeader } from '../../../DocHeader';
import { ImmutableConsole } from '../../../ImmutableConsole';
import { getVersions } from '../../../static/getVersions';
import { getVersionFromParams } from '../../getVersionFromParams';

export default function VersionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { version: string };
}) {
  const versions = getVersions();

  const version = getVersionFromParams(params);

  return (
    <div>
      <ImmutableConsole version={version} />
      <DocHeader versions={versions} currentVersion={version} />
      <div className="pageBody">
        <div className="contents">{children}</div>
      </div>
    </div>
  );
}
