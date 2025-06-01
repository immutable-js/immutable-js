import { DocHeader } from '../../../DocHeader';
import { ImmutableConsole } from '../../../ImmutableConsole';
import { getVersions } from '../../../static/getVersions';
import { VERSION } from '../currentVersion';

export default async function VersionLayout(props: {
  children: React.ReactNode;
  params: Promise<{ version: string }>;
}) {
  const { children } = props;

  const versions = getVersions();

  return (
    <div>
      <ImmutableConsole version={VERSION} />
      <DocHeader versions={versions} currentVersion={VERSION} />
      <div className="pageBody">
        <div className="contents">{children}</div>
      </div>
    </div>
  );
}
