import type { FocusEvent, JSX, MouseEvent, ReactNode } from 'react';
import { Fragment, useCallback, useState } from 'react';
import Link from 'next/link';
import {
  TypeKind,
  Type,
  InterfaceDefinition,
  ObjectMember,
  CallSignature,
  CallParam,
} from './TypeDefs';

export function InterfaceDef({
  name,
  def,
}: {
  name: string;
  def: InterfaceDefinition;
}) {
  return (
    <span className="t interfaceDef">
      <span className="t keyword">type </span>
      <span className="t typeName">{name}</span>
      {def.typeParams && (
        <>
          {'<'}
          {interpose(
            ', ',
            def.typeParams.map((t, i) => (
              <span key={i} className="t typeParam">
                {t}
              </span>
            ))
          )}
          {'>'}
        </>
      )}
      {def.extends && (
        <>
          <span className="t keyword"> extends </span>
          {interpose(
            ', ',
            def.extends.map((e, i) => <TypeDef key={i} type={e} />)
          )}
        </>
      )}
      {def.implements && (
        <>
          <span className="t keyword"> implements </span>
          {interpose(
            ', ',
            def.implements.map((e, i) => <TypeDef key={i} type={e} />)
          )}
        </>
      )}
    </span>
  );
}

export function CallSigDef({
  name,
  callSig,
}: {
  name: string;
  callSig?: CallSignature;
}) {
  const shouldWrap = callSigLength(name, callSig) > 80;

  return (
    <span className="t callSig">
      <span className="t fnName">{name}</span>
      {callSig?.typeParams && (
        <>
          {'<'}
          {interpose(
            ', ',
            callSig.typeParams.map((t, i) => (
              <span key={i} className="t typeParam">
                {t}
              </span>
            ))
          )}
          {'>'}
        </>
      )}
      {'('}
      {callSig && functionParams(callSig.params, shouldWrap)}
      {')'}
      {callSig?.type && (
        <>
          {': '}
          <TypeDef key="type" type={callSig.type} />
        </>
      )}
    </span>
  );
}

export function TypeDef({ type, prefix }: { type: Type; prefix?: number }) {
  switch (type.k) {
    case TypeKind.Never:
      return wrap('primitive', 'never');
    case TypeKind.Any:
      return wrap('primitive', 'any');
    case TypeKind.Unknown:
      return wrap('primitive', 'unknown');
    case TypeKind.This:
      return wrap('primitive', 'this');
    case TypeKind.Undefined:
      return wrap('primitive', 'undefined');
    case TypeKind.Boolean:
      return wrap('primitive', 'boolean');
    case TypeKind.Number:
      return wrap('primitive', 'number');
    case TypeKind.String:
      return wrap('primitive', 'string');
    case TypeKind.Union:
      return wrap(
        'union',
        interpose(
          ' | ',
          type.types.map((t, i) => <TypeDef key={i} type={t} />)
        )
      );
    case TypeKind.Intersection:
      return wrap(
        'intersection',
        interpose(
          ' & ',
          type.types.map((t, i) => <TypeDef key={i} type={t} />)
        )
      );
    case TypeKind.Tuple:
      return wrap(
        'tuple',
        <>
          {'['}
          {interpose(
            ', ',
            type.types.map((t, i) => <TypeDef key={i} type={t} />)
          )}
          {']'}
        </>
      );
    case TypeKind.Object:
      if (!type.members) {
        return wrap('primitive', 'object');
      }
      return wrap(
        'object',
        <>
          {'{'}
          {interpose(
            ', ',
            type.members.map((t, i) => <MemberDef key={i} member={t} />)
          )}
          {'}'}
        </>
      );
    case TypeKind.Indexed:
      return wrap(
        'indexed',
        <>
          <TypeDef type={type.type} />,{'['}
          <TypeDef type={type.index} />
          {']'}
        </>
      );
    case TypeKind.Operator:
      return wrap(
        'operator',
        <>
          {wrap('primitive', type.operator)} <TypeDef type={type.type} />
        </>
      );
    case TypeKind.Array:
      return wrap(
        'array',
        <>
          <TypeDef type={type.type} />
          {'[]'}
        </>
      );
    case TypeKind.Function: {
      const shouldWrap = (prefix || 0) + funcLength(type) > 78;
      return wrap(
        'function',
        <>
          {type.typeParams && (
            <>
              {'<'}
              {interpose(
                ', ',
                type.typeParams.map((t, i) => (
                  <span key={i} className="t typeParam">
                    {t}
                  </span>
                ))
              )}
              {'>'}
            </>
          )}
          {'('}
          {functionParams(type.params, shouldWrap)}
          {') => '}
          <TypeDef type={type.type} />
        </>
      );
    }
    case TypeKind.Param:
      return wrap('typeParam', type.param);
    case TypeKind.Type: {
      return wrap(
        'type',
        <>
          {type.url ? (
            <Link href={type.url} className="t typeName">
              {type.name}
            </Link>
          ) : (
            <span className="t typeName">{type.name}</span>
          )}
          {type.args && (
            <>
              {'<'}
              {interpose(
                ', ',
                type.args.map((a, i) => <TypeDef key={i} type={a} />)
              )}
              {'>'}
            </>
          )}
        </>
      );
    }
  }
  throw new Error('Type with unknown kind ' + JSON.stringify(type));
}

function wrap(className: string, child: ReactNode) {
  return <Hover className={className}>{child}</Hover>;
}

function Hover({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  const [isOver, setIsOver] = useState(false);
  const mouseOver = useCallback(
    (event: MouseEvent | FocusEvent) => {
      event.stopPropagation();
      setIsOver(true);
    },
    [setIsOver]
  );
  const mouseOut = useCallback(() => {
    setIsOver(false);
  }, [setIsOver]);
  return (
    <span
      className={'t ' + (isOver ? 'over ' : '') + className}
      onMouseOver={mouseOver}
      onFocus={mouseOver}
      onMouseOut={mouseOut}
      onBlur={mouseOut}
    >
      {children}
    </span>
  );
}

export function MemberDef({ member }: { member: ObjectMember }) {
  return (
    <span className="t member">
      {member.index ? (
        <>[{functionParams(member.params, false)}]</>
      ) : (
        <span className="t memberName">{member.name}</span>
      )}
      {member.type && (
        <>
          : <TypeDef type={member.type} />
        </>
      )}
    </span>
  );
}

function functionParams(
  params: Array<CallParam> | undefined,
  shouldWrap: boolean
) {
  const elements = interpose(
    shouldWrap ? (
      <>
        {','}
        <br />
      </>
    ) : (
      ', '
    ),
    (params ?? []).map((t, i) => (
      <Fragment key={i}>
        {t.varArgs ? '...' : null}
        <span className="t param">{t.name}</span>
        {t.optional ? '?: ' : ': '}
        <TypeDef
          prefix={t.name.length + (t.varArgs ? 3 : 0) + (t.optional ? 3 : 2)}
          type={t.type}
        />
      </Fragment>
    ))
  );

  return shouldWrap ? (
    <div className="t blockParams">{elements}</div>
  ) : (
    elements
  );
}

function callSigLength(name: string, sig?: CallSignature): number {
  return name.length + (sig ? funcLength(sig) : 2);
}

function funcLength(sig: CallSignature): number {
  return (
    (sig.typeParams ? 2 + sig.typeParams.join(', ').length : 0) +
    2 +
    (sig.params ? paramLength(sig.params) : 0) +
    (sig.type ? 2 + typeLength(sig.type) : 0)
  );
}

function paramLength(params: Array<CallParam>): number {
  return params.reduce(
    (s, p) =>
      s +
      (p.varArgs ? 3 : 0) +
      p.name.length +
      (p.optional ? 3 : 2) +
      typeLength(p.type),
    (params.length - 1) * 2
  );
}

function memberLength(members: Array<ObjectMember>): number {
  return members.reduce(
    (s, m) =>
      s +
      (m.index ? paramLength(m.params || []) + 2 : m.name!.length) +
      (m.type ? typeLength(m.type) + 2 : 0),
    (members.length - 1) * 2
  );
}

function typeLength(type: Type): number {
  if (!type) {
    throw new Error('Expected type');
  }
  switch (type.k) {
    case TypeKind.Never:
      return 5;
    case TypeKind.Any:
      return 3;
    case TypeKind.Unknown:
      return 7;
    case TypeKind.This:
      return 4;
    case TypeKind.Undefined:
      return 9;
    case TypeKind.Boolean:
      return 7;
    case TypeKind.Number:
      return 6;
    case TypeKind.String:
      return 6;
    case TypeKind.Union:
    case TypeKind.Intersection:
      return (
        type.types.reduce((s, t) => s + typeLength(t), 0) +
        (type.types.length - 1) * 3
      );
    case TypeKind.Tuple:
      return (
        2 +
        type.types.reduce((s, t) => s + typeLength(t), 0) +
        (type.types.length - 1) * 2
      );
    case TypeKind.Object:
      return type.members ? 2 + memberLength(type.members) : 6;
    case TypeKind.Indexed:
      return 2 + typeLength(type.type) + typeLength(type.index);
    case TypeKind.Operator:
      return 1 + type.operator.length + typeLength(type.type);
    case TypeKind.Array:
      return typeLength(type.type) + 2;
    case TypeKind.Function:
      return 2 + funcLength(type);
    case TypeKind.Param:
      return type.param.length;
    case TypeKind.Type:
      return (
        type.name.length +
        (!type.args
          ? 0
          : type.args.reduce((s, a) => s + typeLength(a), type.args.length * 2))
      );
  }
  throw new Error('Type with unknown kind ' + JSON.stringify(type));
}

function interpose<T extends JSX.Element>(
  between: ReactNode,
  array: Array<T>
): Array<JSX.Element> {
  const result: Array<JSX.Element> = [];
  let i = 0;
  for (const value of array) {
    result.push(value, <Fragment key={`b:${i++}`}>{between}</Fragment>);
  }
  result.pop();

  return result;
}
