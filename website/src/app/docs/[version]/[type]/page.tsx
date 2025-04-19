import { getSidebarLinks } from '../../../../getSidebarLinks';
import { getTypeDefs } from '../../../../static/getTypeDefs';
import { getVersions } from '../../../../static/getVersions';
import { TypeDocumentation } from '../../../../TypeDocumentation';
import { getVersionFromParams } from '../../../getVersionFromParams';

export async function generateStaticParams() {
  return getVersions()
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
