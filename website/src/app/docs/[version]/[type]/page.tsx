import { getVersionFromGitTag } from '../../../../static/getVersions';
import { VERSION } from '../../currentVersion';
import { getSidebarLinks } from '../getSidebarLinks';
import { getTypeDefs } from '../getTypeDefs';
import { getVersionFromParams } from '../getVersionFromParams';
import { TypeDocumentation } from './TypeDocumentation';

export async function generateStaticParams() {
  return getVersionFromGitTag()
    .map((version) =>
      Object.values(getTypeDefs(version).types).map((def) => ({
        version,
        type: def.label,
      }))
    )
    .flat();
}

type Params = {
  version: string;
  type: string;
};

type Props = {
  params: Promise<Params>;
};

export async function generateMetadata(props: Props) {
  const params = await props.params;
  const version = getVersionFromParams(params);
  const defs = getTypeDefs(version);
  const def = Object.values(defs.types).find((d) => d.label === params.type);

  if (!def) {
    throw new Error('404');
  }

  return {
    title: `${def.qualifiedName} — Immutable.js`,
    robots: {
      index: false,
      follow: true,
    },
    alternates: {
      canonical: `/docs/${VERSION}/${params.type}/`,
    },
  };
}

export default async function TypeDocPage(props: Props) {
  const params = await props.params;
  const version = getVersionFromParams(params);
  const defs = getTypeDefs(version);

  const def = Object.values(defs.types).find((d) => d.label === params.type);

  if (!def) {
    throw new Error('404');
  }

  const sidebarLinks = getSidebarLinks(defs);
  return <TypeDocumentation def={def} sidebarLinks={sidebarLinks} />;
}
