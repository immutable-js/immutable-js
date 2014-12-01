var React = require('react');
var Router = require('react-router');
var { Seq } = require('immutable');
var TypeKind = require('../../../src/TypeKind');


var FunctionDef = React.createClass({
  getInitialState: function() {
    return { detail: false };
  },

  toggleDetail: function() {
    this.setState({ detail: !this.state.detail });
  },

  render: function() {
    var module = this.props.module;
    var name = this.props.name;
    var def = this.props.def;
    var doc = def.doc || {};

    return (
      <div>
        <div onClick={this.toggleDetail}>
          <CallSigDef module={module} name={name} />
        </div>
        {this.state.detail &&
          <div className="detail">
            {doc.synopsis && <pre>{doc.synopsis}</pre>}
            {def.signatures.map(callSig =>
              <div>
                <CallSigDef module={module} name={name} callSig={callSig} />
              </div>
            )}
            {doc.description && <pre>{doc.description}</pre>}
            {doc.notes && <pre>{doc.notes}</pre>}
          </div>}
      </div>
    );
  }
});

exports.FunctionDef = FunctionDef;


var InterfaceDef = React.createClass({
  render: function() {
    var name = this.props.name;
    var def = this.props.def;
    return (
      <span className="t interfaceDef">
        <span className="t keyword">{'type '}</span>
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
  render: function() {
    var module = this.props.module;
    var name = this.props.name;
    var callSig = this.props.callSig || {};

    var shouldWrap = callSigLength(module, name, callSig) > 80;

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
        {callSig && functionParams(callSig.params, shouldWrap)}
        {')'}
        {callSig.type && [': ', <TypeDef type={callSig.type} />]}
      </span>
    );
  }
});

exports.CallSigDef = CallSigDef;


var TypeDef = React.createClass({
  render: function() {
    var type = this.props.type;
    switch (type.k) {
      case TypeKind.Any: return <span className="t primitive">any</span>;
      case TypeKind.Boolean: return <span className="t primitive">boolean</span>;
      case TypeKind.Number: return <span className="t primitive">number</span>;
      case TypeKind.String: return <span className="t primitive">string</span>;
      case TypeKind.Object: return <span>
        {['{', Seq(type.members).map(t =>
          <MemberDef member={t} />
        ).interpose(', ').toArray(), '}']}
      </span>
      case TypeKind.Array: return <span>
        <TypeDef type={type.type} />
        {'[]'}
      </span>;
      case TypeKind.Function: return <span>
        {['(', functionParams(type.params), ') => ', <TypeDef type={type.type} />]}
      </span>;
      case TypeKind.Param: return <span className="t typeParam">{type.param}</span>;
      case TypeKind.Type: return <span className="t type">
        <Router.Link to={'/' + (type.qualifier ? type.qualifier.join('.') + '.' : '') + type.name}>
          {type.qualifier && [Seq(type.qualifier).map(q =>
            <span className="t typeQualifier">{q}</span>
          ).interpose('.').toArray(), '.']}
          <span className="t typeName">{type.name}</span>
        </Router.Link>
        {type.args && ['<', Seq(type.args).map(a =>
          <TypeDef type={a} />
        ).interpose(', ').toArray(), '>']}
      </span>;
    }
    throw new Error('Unknown kind ' + type.k);
  }
});

exports.TypeDef = TypeDef;


var MemberDef = React.createClass({
  render: function() {
    var member = this.props.member;
    return (
      <span className="t member">
        {member.index ?
          ['[', functionParams(member.params), ']'] :
          <span className="t memberName">{member.name}</span>}
        {member.type && [': ', <TypeDef type={member.type} />]}
      </span>
    );
  }
});

exports.MemberDef = MemberDef;


function functionParams(params, shouldWrap) {
  var elements = Seq(params).map(t => [
    t.varArgs ? '...' : null,
    <span className="t param">{t.name}</span>,
    t.optional ? '?: ' : ': ',
    <TypeDef type={t.type} />
  ]).interpose(shouldWrap ? [',', <br />] : ', ').toArray();
  return shouldWrap ?
    <div className="t blockParams">{elements}</div> :
    elements;
}

function callSigLength(module, name, sig) {
  return (
    (module ? module.length + 1 : 0) +
    name.length +
    (sig.typeParams ? 2 + sig.typeParams.join(', ').length : 0) +
    2 + (sig.params ? paramLength(sig.params) : 0) +
    (sig.type ? 2 + typeLength(sig.type) : 0)
  );
}

function paramLength(params) {
  return params.reduce((s, p) =>
    s +
    (p.varArgs ? 3 : 0) +
    p.name.length +
    (p.optional ? 3 : 2) +
    typeLength(p.type),
    (params.length - 1) * 2
  );
}

function memberLength(members) {
  return members.reduce((s, m) =>
    s + (m.index ? paramLength(m.params) + 4 : m.name + 2) +
    typeLength(m.type),
    (members.length - 1) * 2
  );
}

function typeLength(type) {
  switch (type.k) {
    case TypeKind.Any: return 3;
    case TypeKind.Boolean: return 7;
    case TypeKind.Number: return 6;
    case TypeKind.String: return 6;
    case TypeKind.Object: return 2 + memberLength(type.members);
    case TypeKind.Array: return typeLength(type.type) + 2;
    case TypeKind.Function:
      return paramLength(type.params) + 6 + typeLength(type.type);
    case TypeKind.Param: return type.param.length;
    case TypeKind.Type: return (
      (type.qualifier ? 1 + type.qualifier.join('.').length : 0) +
      type.name.length +
      (!type.args ? 0 :
        type.args.reduce((s, a) => s + typeLength(a), type.args.length * 2))
    );
  }
  throw new Error('Unknown kind ' + type.k);
}
