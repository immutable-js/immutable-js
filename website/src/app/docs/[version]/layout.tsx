import { DocHeader } from '../../../DocHeader';
import { ImmutableConsole } from '../../../ImmutableConsole';
import { getVersionFromParams } from './getVersionFromParams';

export default async function VersionLayout(props: {
  children: React.ReactNode;
  params: Promise<{ version: string }>;
}) {
  const params = await props.params;

  const { children } = props;

  const version = getVersionFromParams(params);

  return (
    <div>
      <ImmutableConsole version={version} />
      <DocHeader />
      <div className="pageBody">
        <div className="contents">{children}</div>
      </div>
    </div>
  );
}
