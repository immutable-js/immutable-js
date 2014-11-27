var React = require('react');
var Router = require('react-router');
var { Seq } = require('immutable');
var defs = require('../../../resources/immutable.d.json');
var { TypeDef, FunctionDef, functionParams } = require('./Defs');


var TypeDocumentation = React.createClass({
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

        {functions.count() > 0 &&
          <section>
            {functions.map((t, name) =>
              <FunctionDef key={name} name={name} def={t.call} module={typeName} />
            ).toArray()}
          </section>
        }

        {types.count() > 0 &&
          <section>
            <h2>Types</h2>
            {types.map((t, name) =>
              <div key={name}>
                <Router.Link to={'/' + (typeName?typeName+'.'+name:name)}>
                  {(typeName?typeName+'.'+name:name)}
                </Router.Link>
              </div>
            ).toArray()}
          </section>
        }

        {interfaceDef && <InterfaceDef def={interfaceDef} name={typeName} />}

      </div>
    );
  }
});

var NotFound = React.createClass({
  render: function() {
    return <div>{'Not found'}</div>;
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
              <MemberDef key={member.memberName} parentName={name} member={member} />
            )}
          </section>
        ).toArray()}

      </section>
    );
  }
});

var MemberDef = React.createClass({
  mixins: [ Router.State, Router.Navigation ],

  getInitialState: function() {
    var member = this.props.member;
    var name = member.memberName.substr(1);
    var pathMethodName = this.getParams().methodName;
    return { detail: pathMethodName === name };
  },

  toggleDetail: function() {
    if (!this.state.detail) {
      var member = this.props.member;
      var name = member.memberName.substr(1);
      this.replaceWith('/' + this.props.parentName + '/' + name );
    }
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
              <Router.Link to={'/' + member.inherited.name}>
                {member.inherited.name + '#' + name}
              </Router.Link>
            </section>
          }
          {member.overrides &&
            <section>
              {'Overrides: '}
              <Router.Link to={'/' + member.overrides.name}>
                {member.overrides.name + '#' + name}
              </Router.Link>
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

module.exports = TypeDocumentation;
