import { DocHeader } from '../../../DocHeader';
import { ImmutableConsole } from '../../../ImmutableConsole';
import { VERSION } from '../currentVersion';

export default async function VersionLayout(props: {
  children: React.ReactNode;
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  params: Promise<{}>;
}) {
  const { children } = props;

  return (
    <>
      <ImmutableConsole version={VERSION} />
      <DocHeader />
      {children}
    </>
  );
}
