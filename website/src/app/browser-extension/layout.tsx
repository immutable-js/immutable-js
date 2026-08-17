import { DocHeader } from '../../DocHeader';
import { ImmutableConsole } from '../../ImmutableConsole';
import { getVersions } from '../../static/getVersions';

export default function BrowserExtensionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const versions = getVersions();

  return (
    <div className="ext-layout">
      <ImmutableConsole version={versions[0]} />
      <DocHeader />
      {children}
    </div>
  );
}
