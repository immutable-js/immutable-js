import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Seq } from '../../../../../';
import MarkDown from '../MarkDown';
import { CallSigDef, InterfaceDef } from '../Defs';
import MemberDoc from './MemberDoc';
import getGlobalData from '../global';
import TypeKind from '../../../../lib/TypeKind';
import Disclaimer from './Disclaimer';

export default class TypeDoc extends Component {
  static propTypes = {
    name: PropTypes.string.isRequired,
    def: PropTypes.object.isRequired,
    memberName: PropTypes.string,
    memberGroups: PropTypes.object.isRequired,
  };

  /**
   * Get a map from super type parameter to concrete type definition. This is
   * used when rendering inherited type definitions to ensure contextually
   * relevant information.
   *
   * Example:
   *
   *   type A<T> implements B<number, T>
   *   type B<K, V> implements C<K, V, V>
   *   type C<X, Y, Z>
   *
   * parse C:
   *   {}
   *
   * parse B:
   *   { C<X: K
   *     C<Y: V
   *     C<Z: V }
   *
   * parse A:
   *   { B<K: number
   *     B<V: T
   *     C<X: number
   *     C<Y: T
   *     C<Z: T }
   */
  getTypePropMap(def) {
    const map = {};
    if (!def || !def.extends) {
      return map;
    }

    def.extends.forEach((e) => {
      let superModule = getGlobalData().Immutable;
      e.name.split('.').forEach((part) => {
        superModule =
          superModule && superModule.module && superModule.module[part];
      });
      const superInterface = superModule && superModule.interface;
      if (superInterface) {
        const interfaceMap = Seq(superInterface.typeParams)
          .toKeyedSeq()
          .flip()
          .map((i) => e.args[i])
          .toObject();
        Seq(interfaceMap).forEach((v, k) => {
          map[e.name + '<' + k] = v;
        });
        const superMap = this.getTypePropMap(superInterface);
        Seq(superMap).forEach((v, k) => {
          map[k] = v.k === TypeKind.Param ? interfaceMap[v.param] : v;
        });
      }
    });
    return map;
  }

  render() {
    const name = this.props.name;
    const def = this.props.def;
    const memberName = this.props.memberName;
    const memberGroups = this.props.memberGroups;

    const doc = def.doc || {};
    const call = def.call;
    const functions = Seq(def.module).filter((t) => !t.interface && !t.module);
    const types = Seq(def.module).filter((t) => t.interface || t.module);
    const interfaceDef = def.interface;
    const typePropMap = this.getTypePropMap(interfaceDef);

    return (
      <div>
        <h1 className="typeHeader">{name}</h1>
        {doc.synopsis && (
          <MarkDown className="synopsis" contents={doc.synopsis} />
        )}
        {interfaceDef && (
          <code className="codeBlock memberSignature">
            <InterfaceDef name={name} def={interfaceDef} />
          </code>
        )}

        {doc.notes &&
          doc.notes.map((note, i) => (
            <section key={i}>
              <h4 className="infoHeader">{note.name}</h4>
              {note.name === 'alias' ? (
                <CallSigDef name={note.body} />
              ) : (
                note.body
              )}
            </section>
          ))}

        {doc.description && (
          <section>
            <h4 className="infoHeader">
              {doc.description.substr(0, 5) === '<code'
                ? 'Example'
                : 'Discussion'}
            </h4>
            <MarkDown className="discussion" contents={doc.description} />
          </section>
        )}

        {types.count() > 0 && (
          <section>
            <h4 className="groupTitle">Sub-types</h4>
            {types
              .map((t, typeName) => (
                <div key={typeName}>
                  <Link to={'/' + (name ? name + '.' + typeName : typeName)}>
                    {name ? name + '.' + typeName : typeName}
                  </Link>
                </div>
              ))
              .valueSeq()
              .toArray()}
          </section>
        )}

        {call && (
          <section>
            <h4 className="groupTitle">Construction</h4>
            <MemberDoc
              showDetail={name === memberName}
              parentName={name}
              member={{
                memberName: name,
                memberDef: call,
              }}
            />
          </section>
        )}

        {functions.count() > 0 && (
          <section>
            <h4 className="groupTitle">Static methods</h4>
            {functions
              .map((t, fnName) => (
                <MemberDoc
                  key={fnName}
                  showDetail={fnName === memberName}
                  parentName={name}
                  member={{
                    memberName: fnName,
                    memberDef: t.call,
                    isStatic: true,
                  }}
                />
              ))
              .valueSeq()
              .toArray()}
          </section>
        )}

        <section>
          {Seq(memberGroups)
            .map((members, title) =>
              members.length === 0
                ? null
                : Seq([
                    <h4 key={title || 'Members'} className="groupTitle">
                      {title || 'Members'}
                    </h4>,
                    Seq(members).map((member) => (
                      <MemberDoc
                        typePropMap={typePropMap}
                        key={member.memberName}
                        showDetail={member.memberName === memberName}
                        parentName={name}
                        member={member}
                      />
                    )),
                  ])
            )
            .flatten()
            .valueSeq()
            .toArray()}
        </section>

        <Disclaimer />
      </div>
    );
  }
}
