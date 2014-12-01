var React = require('react');
var Router = require('react-router');
var { Seq } = require('immutable');
var defs = require('../../../resources/immutable.d.json');
var { InterfaceDef } = require('./Defs');
var MemberDoc = require('./MemberDoc');


var TypeDocumentation = React.createClass({
  mixins: [ Router.State ],

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

    var memberGroups = collectMemberGroups(interfaceDef, {
      showInGroups: this.state.showInGroups,
      showInherited: this.state.showInherited,
    });

    return (
      <div key={typeName}>

        <div onClick={this.toggleShowInGroups}>Toggle Groups</div>
        <div onClick={this.toggleShowInherited}>Toggle Inherited</div>
        <h1 className="typeHeader">
          {interfaceDef ?
            <InterfaceDef name={typeName} def={interfaceDef} /> :
            typeName
          }
        </h1>

        {doc && <section className="doc">
          <pre>{doc.synopsis}</pre>
          {doc.description && <pre>{doc.description}</pre>}
          {doc.notes && <pre>{doc.notes}</pre>}
        </section>}

        {functions.count() > 0 &&
          <section>
            {functions.map((t, name) =>
              <MemberDoc
                key={name}
                showDetail={name === this.getParams().memberName}
                parentName={typeName}
                member={{
                  memberName: name,
                  memberDef: t.call,
                  isStatic: true
                }}
              />
            ).toArray()}
          </section>
        }

        {call &&
          <section>
            <h4 className="groupTitle">Construction</h4>
            <MemberDoc
              showDetail={typeName === this.getParams().memberName}
              parentName={typeName}
              member={{
                memberName: typeName,
                memberDef: call
              }}
            />
          </section>
        }

        {types.count() > 0 &&
          <section>
            <h4 className="groupTitle">Types</h4>
            {types.map((t, name) =>
              <div key={name}>
                <Router.Link to={'/' + (typeName?typeName+'.'+name:name)}>
                  {(typeName?typeName+'.'+name:name)}
                </Router.Link>
              </div>
            ).toArray()}
          </section>
        }

        {Seq(memberGroups).map((members, title) =>
          members.length === 0 ? null :
          <section>
            <h4 className="groupTitle">{title || 'Members'}</h4>
            {members.map(member =>
              <MemberDoc
                key={member.memberName}
                showDetail={member.memberName === this.getParams().memberName}
                parentName={typeName}
                member={member}
              />
            )}
          </section>
        ).toArray()}

      </div>
    );
  }
});

var NotFound = React.createClass({
  render: function() {
    return <div>{'Not found'}</div>;
  }
});


function collectMemberGroups(interfaceDef, options) {
  var members = {};

  if (interfaceDef) {
    collectFromDef(interfaceDef);
  }

  var groups = {'':[]};

  if (options.showInGroups) {
    Seq(members).forEach(member => {
      (groups[member.group] || (groups[member.group] = [])).push(member);
    });
  } else {
    groups[''] = Seq(members).sortBy(member => member.memberName).toArray();
  }

  if (!options.showInherited) {
    groups = Seq(groups).map(
      members => members.filter(member => !member.inherited)
    ).toObject();
  }

  return groups;

  function collectFromDef(def, name) {

    def.groups && def.groups.forEach(g => {
      Seq(g.properties).forEach((propDef, propName) => {
        collectMember(g.title || '', propName, propDef);
      });
      Seq(g.methods).forEach((methodDef, memberName) => {
        collectMember(g.title || '', memberName, methodDef);
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
          memberName: memberName.substr(1),
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
