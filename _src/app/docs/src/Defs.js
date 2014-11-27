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
          {(module ? module + '.' + name : name) + '()'}
        </div>
        {this.state.detail && <div>
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


var CallSigDef = React.createClass({
  render: function() {
    var module = this.props.module;
    var name = this.props.name;
    var callSig = this.props.callSig;

    return (
      <span>
        {module ? module + '.' + name : name}
        {callSig.typeParams &&
          ['<', Seq(callSig.typeParams).map(t =>
            <span className="t typeParam">{t}</span>
          ).interpose(', ').toArray(), '>']
        }
        {['(', functionParams(callSig.params), ')']}
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
        {['{', objMembers(type.members) ,'}']}
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
          {type.qualifier && type.qualifier.join('.') + '.'}
          {type.name}
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


function functionParams(params) {
  return Seq(params).map(t => [
    t.varArgs ? '...' : null,
    <span className="t param">{t.name}</span>,
    t.optional ? '?: ' : ': ',
    <TypeDef type={t.type} />
  ]).interpose(', ').toArray();
}

function objMembers(members) {
  return Seq(members).map(t => [
    t.index ?
      ['[', functionParams(t.params) , ']: '] :
      [<span className="t member">{t.name}</span>, ': '],
    <TypeDef type={t.type} />
  ]).interpose(', ').toArray();
}
