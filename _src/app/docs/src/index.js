var React = require('react');
var Router = require('react-router');
var { Route, DefaultRoute, RouteHandler, Link } = Router;
var { Seq } = require('immutable');
var TypeKind = require('../../../src/TypeKind');
var defs = require('../../../resources/immutable.d.json');

console.log(defs);

var Overview = React.createClass({
  render: function() {
    var d = defs.Immutable;

    return (
      <div>
        <h1>Immutable</h1>
        <section>
          <pre>
            {d.doc.join()}
          </pre>
        </section>
        <h2>Functions</h2>
        <ul>
          {Seq(d.module).filter(t => !t.interface && !t.module).map((t, name) =>
            <li key={name}>
              <FunctionDef name={name} def={t.call} />
            </li>
          ).toArray()}
        </ul>
        <h2>Types</h2>
        <ul>
          {Seq(d.module).filter(t => t.interface || t.module).map((t, name) =>
            <li key={name}>
              <Link to={'/' + name}>{name}</Link>
            </li>
          ).toArray()}
        </ul>
      </div>
    );
  }
});

var Type = React.createClass({
  mixins: [ Router.State ],

  render: function() {
    var typeName = this.getParams().typeName;
    // var methodName = this.getParams().methodName;
    var type = defs.Immutable.module[typeName];
    if (!type) {
      return <NotFound />;
    }

    console.log(type);

    return (
      <div>
        <h1>{typeName}</h1>
        {type.doc && <section>
          <pre>
            {type.doc.join()}
          </pre>
        </section>}
        {(type.call || type.module) && [
          <h2>Functions</h2>,
          <ul>
            {type.call && <li>
              <FunctionDef name={typeName} def={type.call} />
            </li>}
            {type.module && Seq(type.module.types).map((t, name) =>
              <li key={name}>
                <FunctionDef name={name} def={t.call} module={typeName} />
              </li>
            ).toArray()}
          </ul>
        ]}
        {type.interface && <section>
          <h3>
            {typeName}
            {type.interface.typeParams &&
              ['<', Seq(type.interface.typeParams).map((t, k) =>
                <span key={k}>{t}</span>).interpose(', ').toArray(), '>']
            }
            {type.interface.extends &&
              [' extends ', Seq(type.interface.extends).map(e =>
                <TypeDef type={e} />
              ).interpose(', ').toArray()]
            }
          </h3>
          {type.interface.groups && type.interface.groups.map(g => [
            g.title && <h4>{g.title}</h4>,
            <ul>
              {Seq(g.properties).map((p, propName) =>
                <li key={propName}>{propName}</li>
              ).toArray()}
              {Seq(g.methods).map((m, methodName) =>
                <li key={methodName}>{methodName + '()'}</li>
              ).toArray()}
            </ul>
          ])}
        </section>}
      </div>
    );
  }
});

var TypeDef = React.createClass({
  render: function() {
    var type = this.props.type;
    switch (type.k) {
      case TypeKind.Any: return <span>any</span>;
      case TypeKind.Boolean: return <span>boolean</span>;
      case TypeKind.Number: return <span>number</span>;
      case TypeKind.String: return <span>string</span>;
      case TypeKind.Object: return <span>
        {['{', objMembers(type.members) ,'}']}
      </span>
      // case TypeKind.Array:
      case TypeKind.Function: return <span>
        {['(', functionParams(type.params), ') => ', <TypeDef type={type.type} />]}
      </span>;
      case TypeKind.Param: return <span>{type.param}</span>;
      case TypeKind.Type: return <span>
        {type.name}
        {type.args && ['<', Seq(type.args).map(a =>
          <TypeDef type={a} />
        ).interpose(', ').toArray(), '>']}
      </span>;
    }
    throw new Error('Unknown kind ' + type.k);
  }
});

function functionParams(params) {
  return Seq(params).map(t => [
    t.varArgs ? '...' : null,
    <span>{t.name}</span>,
    t.optional ? '?: ' : ': ',
    <TypeDef type={t.type} />
  ]).interpose(', ').toArray();
}

function objMembers(members) {
  return Seq(members).map(t => [
    t.index ? ['[', functionParams(t.params) , ']: '] : [t.name, ': '],
    <TypeDef type={t.type} />
  ]).interpose(', ').toArray();
}

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
    console.log(name, def);

    return (
      <div>
        <div onClick={this.toggleDetail}>
          {(module ? module + '.' + name : name) + '()'}
        </div>
        {this.state.detail && <div>
          {def.doc && <pre>
            {def.doc.join('')}
          </pre>}
          {def.signatures.map(callSig =>
            <div>
              {module ? module + '.' + name : name}
              {callSig.typeParams &&
                ['<', Seq(callSig.typeParams).map(t =>
                  <span>{t}</span>
                ).interpose(', ').toArray(), '>']
              }
              {['(', functionParams(callSig.params), ')']}
              {callSig.type && [': ', <TypeDef type={callSig.type} />]}
            </div>
          )}
        </div>}
      </div>
    );
  }
});



var Docs = React.createClass({
  render: function () {
    return <div>{'Docs:'}<RouteHandler /></div>;
  }
});

var NotFound = React.createClass({
  render: function() {
    return <div>{'Not found'}</div>;
  }
});


var routes =
  <Route handler={Docs} path="/">
    <DefaultRoute handler={Overview} />
    <Route name="type" path="/:typeName" handler={Type} />
    <Route name="method" path="/:typeName/:methodName" handler={Type} />
  </Route>;


var App = React.createClass({
  componentWillMount: function() {
    Router.run(routes, Handler => {
      this.setState({handler: Handler});
    });
  },
  render: function () {
    var Handler = this.state.handler;
    return <Handler />;
  }
});


module.exports = App;
