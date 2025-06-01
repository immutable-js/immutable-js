import { Metadata } from 'next';
import { DocHeader } from '../../DocHeader';
import { ImmutableConsole } from '../../ImmutableConsole';
import { getVersions } from '../../static/getVersions';
import RedirectExistingDocs from './redirect-client';

export const metadata: Metadata = {
  title: 'Documentation — Immutable.js',
};

export default function Page() {
  const versions = getVersions();

  const latestVersion = versions[0];

  if (!latestVersion) {
    throw new Error('No versions');
  }

  return (
    <div>
      <ImmutableConsole version={latestVersion} />
      <DocHeader versions={versions} currentVersion={latestVersion} />
      <div className="pageBody">
        <div className="contents">
          <RedirectExistingDocs version={latestVersion} />
        </div>
      </div>
    </div>
  );
}
