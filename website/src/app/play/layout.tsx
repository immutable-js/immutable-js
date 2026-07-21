import { ImmutableConsole } from '../../ImmutableConsole';
import { getVersions } from '../../static/getVersions';

export default function PlayLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const versions = getVersions();

  return (
    <>
      <ImmutableConsole version={versions[0]} />
      {children}
    </>
  );
}
