import Link from 'next/link';
import { Fragment } from 'react';
import { CallSigDef, MemberDef } from './Defs';
import { MarkdownContent } from './MarkdownContent';
import type { MemberDefinition } from './TypeDefs';

export function MemberDoc({ member }: { member: MemberDefinition }) {
  return (
    <div className="interfaceMember" id={member.id}>
      <h4 className="memberLabel">
        <Link href={member.url}>{member.label}</Link>
      </h4>
      <div key="detail" className="detail">
        {member.doc && (
          <MarkdownContent
            className="docSynopsis"
            contents={member.doc.synopsis}
          />
        )}
        {!member.signatures ? (
          <code className="codeBlock memberSignature">
            <MemberDef member={{ name: member.name, type: member.type }} />
          </code>
        ) : (
          <code className="codeBlock memberSignature">
            {member.signatures.map((callSig, i) => (
              <Fragment key={i}>
                <CallSigDef key={i} name={member.name} callSig={callSig} />
                {'\n'}
              </Fragment>
            ))}
          </code>
        )}
        {member.inherited && (
          <section>
            <h4 className="infoHeader">Inherited from</h4>
            <code>
              <Link href={member.inherited.url}>
                {member.inherited.interface}#{member.inherited.label}
              </Link>
            </code>
          </section>
        )}
        {member.overrides && (
          <section>
            <h4 className="infoHeader">Overrides</h4>
            <code>
              <Link href={member.overrides.url}>
                {member.overrides.interface}#{member.overrides.label}
              </Link>
            </code>
          </section>
        )}
        {member.doc?.notes.map((note, i) => (
          <section key={i}>
            <h4 className="infoHeader">{note.name}</h4>
            {note.name === 'alias' ? (
              <code>
                <CallSigDef name={note.body} />
              </code>
            ) : (
              <MarkdownContent className="discussion" contents={note.body} />
            )}
          </section>
        ))}
        {member.doc?.description && (
          <section>
            <h4 className="infoHeader">
              {member.doc.description.slice(0, 5) === '<code'
                ? 'Example'
                : 'Discussion'}
            </h4>
            <MarkdownContent
              className="discussion"
              contents={member.doc.description}
            />
          </section>
        )}
      </div>
    </div>
  );
}

// export type ParamTypeMap = { [param: string]: Type };

// function getParamTypeMap(
//   interfaceDef: InterfaceDefinition | undefined,
//   member: MemberDefinition
// ): ParamTypeMap | undefined {
//   if (!member.inherited || !interfaceDef?.typeParamsMap) return;
//   const defining = member.inherited.split('#')[0] + '>';
//   const paramTypeMap: ParamTypeMap = {};
//   // Filter typeParamsMap down to only those relevant to the defining interface.
//   for (const [path, type] of Object.entries(interfaceDef.typeParamsMap)) {
//     if (path.startsWith(defining)) {
//       paramTypeMap[path.slice(defining.length)] = type;
//     }
//   }
//   return paramTypeMap;
// }
