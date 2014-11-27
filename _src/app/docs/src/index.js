var React = require('react');
var Router = require('react-router');
var { Route, DefaultRoute, RouteHandler, Link } = Router;
var { Seq } = require('immutable');
var TypeKind = require('../../../src/TypeKind');
var defs = require('../../../resources/immutable.d.json');

var Type = React.createClass({
  mixins: [ Router.State ],

  render: function() {
    var type = defs.Immutable;
    var typeName = this.getParams().typeName;
    var typePath = typeName ? typeName.split('.') : [];
    type = typePath.reduce(
      (type, name) => type && type.module && type.module[name],
      type
    );
    if (!type) {
      return <NotFound />;
    }
    return <TypeDoc type={type} name={typeName} />
  }
});

var TypeDoc = React.createClass({
  render: function() {
    var type = this.props.type;
    var typeName = this.props.name;

    var doc = type.doc;
    var call = type.call;
    var functions = Seq(type.module).filter(t => !t.interface && !t.module);
    var types = Seq(type.module).filter(t => t.interface || t.module);
    var interfaceDef = type.interface;

    return (
      <div>

        {doc && <section>
          <pre>{doc.synopsis}</pre>
          {doc.description && <pre>{doc.description}</pre>}
          {doc.notes && <pre>{doc.notes}</pre>}
        </section>}

        {call && <FunctionDef name={typeName} def={call} />}

        {functions &&
          <section>
            {functions.map((t, name) =>
              <FunctionDef key={name} name={name} def={t.call} module={typeName} />
            ).toArray()}
          </section>
        }

        {types &&
          <section>
            <h2>Types</h2>
            {types.map((t, name) =>
              <div key={name}>
                <Link to={'/' + (typeName?typeName+'.'+name:name)}>
                  {(typeName?typeName+'.'+name:name)}
                </Link>
              </div>
            ).toArray()}
          </section>
        }

        {interfaceDef && <InterfaceDef def={interfaceDef} name={typeName} />}

      </div>
    );
  }
});

var InterfaceDef = React.createClass({
  getInitialState: function() {
    return {
      showInherited: true,
      showInGroups: true,
    };
  },

  toggleShowInGroups: function() {
    this.setState({ showInGroups: !this.state.showInGroups });
  },

  toggleShowInherited: function() {
    this.setState({ showInherited: !this.state.showInherited });
  },

  render: function() {
    var name = this.props.name;
    var def = this.props.def;

    var members = collectMembers(def);

    var groups = {};
    if (this.state.showInGroups) {
      Seq(members).forEach(member => {
        (groups[member.group] || (groups[member.group] = [])).push(member);
      });
    } else {
      groups[''] = Seq(members).sortBy(member => member.memberName).toArray();
    }

    if (!this.state.showInherited) {
      groups = Seq(groups).map(
        members => members.filter(member => !member.inherited)
      ).toObject();
    }

    return (
      <section>
        <h3>
          {name}
          {def.typeParams &&
            ['<', Seq(def.typeParams).map((t, k) =>
              <span key={k}>{t}</span>
            ).interpose(', ').toArray(), '>']
          }
          {def.extends &&
            [' extends ', Seq(def.extends).map((e, i) =>
              <TypeDef key={i} type={e} />
            ).interpose(', ').toArray()]
          }
          {def.implements &&
            [' implements ', Seq(def.implements).map((e, i) =>
              <TypeDef key={i} type={e} />
            ).interpose(', ').toArray()]
          }
        </h3>
        <div onClick={this.toggleShowInGroups}>Toggle Groups</div>
        <div onClick={this.toggleShowInherited}>Toggle Inherited</div>
        {Seq(groups).map((members, title) =>
          members.length === 0 ? null :
          <section>
            {title && <h4>{title}</h4>}
            {members.map(member =>
              <MemberDef key={member.memberName} member={member} />
            )}
          </section>
        ).toArray()}

      </section>
    );
  }
});

var MemberDef = React.createClass({
  getInitialState: function() {
    return { detail: false };
  },

  toggleDetail: function() {
    this.setState({ detail: !this.state.detail });
  },

  render: function() {
    var member = this.props.member;
    var name = member.memberName.substr(1);
    var def = member.memberDef;
    var doc = def.doc || {};
    var isProp = !def.signatures;

    return (
      <div>
        <div onClick={this.toggleDetail}>
          {isProp ?
            [name, def.type && [': ', <TypeDef type={def.type} />]] :
            name + '()'}
        </div>
        {this.state.detail && <div>
          {doc.synopsis && <pre>{doc.synopsis}</pre>}
          {isProp || def.signatures.map(callSig =>
            <div>
              {name}
              {callSig.typeParams &&
                ['<', Seq(callSig.typeParams).map(t =>
                  <span>{t}</span>
                ).interpose(', ').toArray(), '>']
              }
              {['(', functionParams(callSig.params), ')']}
              {callSig.type && [': ', <TypeDef type={callSig.type} />]}
            </div>
          )}
          {member.inherited &&
            <section>
              {'Inherited from: '}
              <Link to={'/' + member.inherited.name}>
                {member.inherited.name + '#' + name}
              </Link>
            </section>
          }
          {member.overrides &&
            <section>
              {'Overrides: '}
              <Link to={'/' + member.overrides.name}>
                {member.overrides.name + '#' + name}
              </Link>
            </section>
          }
          {doc.description && <pre>{doc.description}</pre>}
          {doc.notes && <pre>{doc.notes}</pre>}
        </div>}
      </div>
    );
  }
});

function collectMembers(interfaceDef) {
  var members = {};
  collectFromDef(interfaceDef);
  return members;

  function collectFromDef(def, name) {

    def.groups && def.groups.forEach(g => {
      Seq(g.properties).forEach((propDef, propName) => {
        collectMember(g.title || '', propName, propDef);
      });
      Seq(g.methods).forEach((methodDef, methodName) => {
        collectMember(g.title || '', methodName, methodDef);
      });
    });

    def.extends && def.extends.forEach(e => {
      var superModule = defs.Immutable.module[e.name];
      var superInterface = superModule && superModule.interface;
      if (superInterface) {
        collectFromDef(superInterface, e.name);
      }
    });

    function collectMember(group, memberName, memberDef) {
      var member = members[memberName];
      if (member) {
        if (!member.inherited) {
          member.overrides = { name, def, memberDef };
        }
        if (!member.group && group) {
          member.group = group;
        }
      } else {
        member = {
          group,
          memberName,
          memberDef
        };
        if (def !== interfaceDef) {
          member.inherited = { name, def };
        }
        members[memberName] = member;
      }
    }
  }
}

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
      case TypeKind.Array: return <span>
        <TypeDef type={type.type} />
        {'[]'}
      </span>;
      case TypeKind.Function: return <span>
        {['(', functionParams(type.params), ') => ', <TypeDef type={type.type} />]}
      </span>;
      case TypeKind.Param: return <span>{type.param}</span>;
      case TypeKind.Type: return <span>
        <Link to={'/' + (type.qualifier ? type.qualifier.join('.') + '.' : '') + type.name}>
          {type.qualifier && type.qualifier.join('.') + '.'}
          {type.name}
        </Link>
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
          {doc.description && <pre>{doc.description}</pre>}
          {doc.notes && <pre>{doc.notes}</pre>}
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
    <DefaultRoute handler={Type} />
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
