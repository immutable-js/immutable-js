var React = require('react');
var CSSCore = require('react/lib/CSSCore');
var Router = require('react-router');
var { Seq } = require('immutable');
var TypeKind = require('../../../src/TypeKind');
var defs = require('../../../resources/immutable.d.json');


var InterfaceDef = React.createClass({
  render() {
    var name = this.props.name;
    var def = this.props.def;
    return (
      <span className="t interfaceDef">
        <span className="t keyword">{'class '}</span>
        <span className="t typeName">{name}</span>
        {def.typeParams &&
          ['<', Seq(def.typeParams).map((t, k) =>
            <span className="t typeParam" key={k}>{t}</span>
          ).interpose(', ').toArray(), '>']
        }
        {def.extends && [
          <span className="t keyword">{' extends '}</span>,
          Seq(def.extends).map((e, i) =>
            <TypeDef key={i} type={e} />
          ).interpose(', ').toArray()
        ]}
        {def.implements && [
          <span className="t keyword">{' implements '}</span>,
          Seq(def.implements).map((e, i) =>
            <TypeDef key={i} type={e} />
          ).interpose(', ').toArray()
        ]}
      </span>
    );
  }
});

exports.InterfaceDef = InterfaceDef;


var CallSigDef = React.createClass({
  render() {
    var info = this.props.info;
    var module = this.props.module;
    var name = this.props.name;
    var callSig = this.props.callSig || {};

    var shouldWrap = callSigLength(info, module, name, callSig) > 80;

    return (
      <span className="t callSig">
        {module && [<span className="t fnQualifier">{module}</span>, '.']}
        <span className="t fnName">{name}</span>
        {callSig.typeParams &&
          ['<', Seq(callSig.typeParams).map(t =>
            <span className="t typeParam">{t}</span>
          ).interpose(', ').toArray(), '>']
        }
        {'('}
        {callSig && functionParams(info, callSig.params, shouldWrap)}
        {')'}
        {callSig.type && [': ', <TypeDef info={info} type={callSig.type} />]}
      </span>
    );
  }
});

exports.CallSigDef = CallSigDef;


var TypeDef = React.createClass({
  render() {
    var info = this.props.info;
    var type = this.props.type;
    var prefix = this.props.prefix;
    switch (type.k) {
      case TypeKind.Any: return this.wrap('primitive', 'any');
      case TypeKind.Boolean: return this.wrap('primitive', 'boolean');
      case TypeKind.Number: return this.wrap('primitive', 'number');
      case TypeKind.String: return this.wrap('primitive', 'string');
      case TypeKind.Object: return this.wrap('object', [
        '{',
        Seq(type.members).map(t =>
          <MemberDef member={t} />
        ).interpose(', ').toArray(),
        '}'
      ]);
      case TypeKind.Array: return this.wrap('array', [
        <TypeDef info={info} type={type.type} />, '[]'
      ]);
      case TypeKind.Function:
        var shouldWrap = (prefix || 0) + 6 + paramLength(info, type.params) + typeLength(info, type.type) > 78;
        return this.wrap('function', [
          '(', functionParams(info, type.params, shouldWrap), ') => ',
          <TypeDef info={info} type={type.type} />
        ]);
      case TypeKind.Param: return (
        info && info.propMap[info.defining + '<' + type.param] ?
          <TypeDef type={info.propMap[info.defining + '<' + type.param]} /> :
          this.wrap('typeParam', type.param)
      );
      case TypeKind.Type:
        var qualifiedType = (type.qualifier || []).concat([type.name]);
        var qualifiedTypeName = qualifiedType.join('.');
        var def = qualifiedType.reduce(
          (def, name) => def && def.module && def.module[name],
          defs.Immutable
        );
        var typeNameElement = [
          type.qualifier && [Seq(type.qualifier).map(q =>
            <span className="t typeQualifier">{q}</span>
          ).interpose('.').toArray(), '.'],
          <span className="t typeName">{type.name}</span>
        ];
        if (def) {
          typeNameElement =
            <Router.Link to={'/' + qualifiedTypeName}>
              {typeNameElement}
            </Router.Link>
        }
        return this.wrap('type', [
          typeNameElement,
          type.args && ['<', Seq(type.args).map(a =>
            <TypeDef info={info} type={a} />
          ).interpose(', ').toArray(), '>']
        ]);
    }
    throw new Error('Unknown kind ' + type.k);
  },

  mouseOver(event) {
    CSSCore.addClass(this.getDOMNode(), 'over');
    event.stopPropagation();
  },

  mouseOut() {
    CSSCore.removeClass(this.getDOMNode(), 'over');
  },

  wrap(className, child) {
    return (
      <span
        className={'t ' + className}
        onMouseOver={this.mouseOver}
        onMouseOut={this.mouseOut}>
        {child}
      </span>
    );
  }
});

exports.TypeDef = TypeDef;


var MemberDef = React.createClass({
  render() {
    var module = this.props.module;
    var member = this.props.member;
    return (
      <span className="t member">
        {module && [<span className="t fnQualifier">{module}</span>, '.']}
        {member.index ?
          ['[', functionParams(null, member.params), ']'] :
          <span className="t memberName">{member.name}</span>}
        {member.type && [': ', <TypeDef type={member.type} />]}
      </span>
    );
  }
});

exports.MemberDef = MemberDef;


function functionParams(info, params, shouldWrap) {
  var elements = Seq(params).map(t => [
    t.varArgs ? '...' : null,
    <span className="t param">{t.name}</span>,
    t.optional ? '?: ' : ': ',
    <TypeDef
      prefix={t.name.length + (t.varArgs ? 3 : 0) + (t.optional ? 3 : 2)}
      info={info}
      type={t.type}
    />
  ]).interpose(shouldWrap ? [',', <br />] : ', ').toArray();
  return shouldWrap ?
    <div className="t blockParams">{elements}</div> :
    elements;
}

function callSigLength(info, module, name, sig) {
  return (
    (module ? module.length + 1 : 0) +
    name.length +
    (sig.typeParams ? 2 + sig.typeParams.join(', ').length : 0) +
    2 + (sig.params ? paramLength(info, sig.params) : 0) +
    (sig.type ? 2 + typeLength(info, sig.type) : 0)
  );
}

function paramLength(info, params) {
  return params.reduce((s, p) =>
    s +
    (p.varArgs ? 3 : 0) +
    p.name.length +
    (p.optional ? 3 : 2) +
    typeLength(info, p.type),
    (params.length - 1) * 2
  );
}

function memberLength(info, members) {
  return members.reduce((s, m) =>
    s + (m.index ? paramLength(info, m.params) + 4 : m.name + 2) +
    typeLength(info, m.type),
    (members.length - 1) * 2
  );
}

function typeLength(info, type) {
  switch (type.k) {
    case TypeKind.Any: return 3;
    case TypeKind.Boolean: return 7;
    case TypeKind.Number: return 6;
    case TypeKind.String: return 6;
    case TypeKind.Object: return 2 + memberLength(info, type.members);
    case TypeKind.Array: return typeLength(info, type.type) + 2;
    case TypeKind.Function:
      return paramLength(info, type.params) + 6 + typeLength(info, type.type);
    case TypeKind.Param: return (
      info && info.propMap[info.defining + '<' + type.param] ?
        typeLength(null, info.propMap[info.defining + '<' + type.param]) :
        type.param.length
    );
    case TypeKind.Type: return (
      (type.qualifier ? 1 + type.qualifier.join('.').length : 0) +
      type.name.length +
      (!type.args ? 0 :
        type.args.reduce((s, a) => s + typeLength(info, a), type.args.length * 2))
    );
  }
  throw new Error('Unknown kind ' + type.k);
}
