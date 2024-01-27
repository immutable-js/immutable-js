import { DocHeader } from '../../../../DocHeader';
import { ImmutableConsole } from '../../../../ImmutableConsole';
import { getSidebarLinks } from '../../../../getSidebarLinks';
import { getTypeDefs } from '../../../../static/getTypeDefs';
import { getVersions } from '../../../../static/getVersions';
import { TypeDocumentation } from '../../../../TypeDocumentation';
import { getVersionFromParams } from '../../../getVersionFromParams';

export async function generateStaticParams() {
  return getVersions()
    .map(version =>
      Object.values(getTypeDefs(version).types).map(def => ({
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
  params: Params;
};

export async function generateMetadata({ params }: Props) {
  const version = getVersionFromParams(params);
  const defs = getTypeDefs(version);
  const def = Object.values(defs.types).find(d => d.label === params.type);

  if (!def) {
    throw new Error('404');
  }

  return {
    title: `${def.qualifiedName} — Immutable.js`,
  };
}

export default function TypeDocPage({
  // versions,
  // version,
  // def,
  // sidebarLinks,
  params,
}: Props) {
  const versions = getVersions();
  const version = getVersionFromParams(params);
  const defs = getTypeDefs(version);

  const def = Object.values(defs.types).find(d => d.label === params.type);

  if (!def) {
    throw new Error('404');
  }

  const sidebarLinks = getSidebarLinks(defs);
  return (
    <div>
      <ImmutableConsole version={version} />
      <DocHeader versions={versions} currentVersion={version} />
      <div className="pageBody">
        <div className="contents">
          <TypeDocumentation def={def} sidebarLinks={sidebarLinks} />
        </div>
      </div>
    </div>
  );
}
