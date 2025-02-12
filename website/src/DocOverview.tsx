import Link from 'next/link';
import { MarkdownContent } from './MarkdownContent';
import type { TypeDefs, TypeDoc } from './TypeDefs';

export type OverviewData = {
  doc: TypeDoc | null;
  api: Array<APIMember>;
};

type APIMember = {
  label: string;
  url: string;
  synopsis?: string;
};

// Static use only
export function getOverviewData(defs: TypeDefs): OverviewData {
  return {
    doc: defs.doc || null,
    api: Object.values(defs.types).map((def) => {
      const member: APIMember = { label: def.label, url: def.url };
      const doc = def.doc || def.call?.doc;
      if (doc?.synopsis) {
        member.synopsis = doc?.synopsis;
      }
      return member;
    }),
  };
}

export function DocOverview({ data }: { data: OverviewData }) {
  return (
    <div>
      {data.doc && (
        <section>
          <MarkdownContent contents={data.doc.synopsis} />
          {data.doc.description && (
            <MarkdownContent contents={data.doc.description} />
          )}
        </section>
      )}

      <h4 className="groupTitle">API</h4>

      {data.api.map((member) => (
        <section key={member.url} className="interfaceMember">
          <h3 className="memberLabel">
            <Link href={member.url}>{member.label}</Link>
          </h3>
          {member.synopsis && (
            <MarkdownContent className="detail" contents={member.synopsis} />
          )}
        </section>
      ))}
    </div>
  );
}
