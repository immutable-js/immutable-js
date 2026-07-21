import { Metadata } from 'next';
import { ImmutableConsole } from '../ImmutableConsole';
import { getVersions } from '../static/getVersions';
import Home from './Home';

export async function generateMetadata(): Promise<Metadata> {
  return {
    verification: {
      google: 'PdYYQG_2wv0zUJjqBIeuYliPcrOiAuTES4Q21OLy5uQ',
    },
  };
}

export default async function Page() {
  const versions = await getVersions();

  return (
    <>
      <ImmutableConsole version={versions[0]} />
      <Home />
    </>
  );
}
