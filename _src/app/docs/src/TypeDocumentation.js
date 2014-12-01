var React = require('react');
var { classSet, TransitionGroup } = React.addons;
var Router = require('react-router');
var { Seq } = require('immutable');
var defs = require('../../../resources/immutable.d.json');
var { InterfaceDef, CallSigDef, MemberDef } = require('./Defs');


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

        <h1>{typeName}</h1>

        {doc && <section>
          <pre>{doc.synopsis}</pre>
          {doc.description && <pre>{doc.description}</pre>}
          {doc.notes && <pre>{doc.notes}</pre>}
        </section>}

        {call &&
          <MemberDoc parentName={typeName} member={{
            memberName: '.'+typeName,
            memberDef: call
          }} />}

        {functions.count() > 0 &&
          <section>
            {functions.map((t, name) =>
              <MemberDoc key={name} parentName={typeName} member={{
                memberName: '.'+name,
                memberDef: t.call,
                isStatic: true
              }} />
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

        {interfaceDef && <InterfaceDoc def={interfaceDef} name={typeName} />}

      </div>
    );
  }
});

var NotFound = React.createClass({
  render: function() {
    return <div>{'Not found'}</div>;
  }
});

var InterfaceDoc = React.createClass({
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

    var groups = {'':[]};
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
      <section key={name}>
        <h3>
          <InterfaceDef name={name} def={def} />
        </h3>
        <div onClick={this.toggleShowInGroups}>Toggle Groups</div>
        <div onClick={this.toggleShowInherited}>Toggle Inherited</div>
        {Seq(groups).map((members, title) =>
          members.length === 0 ? null :
          <section>
            {title && <h4 className="groupTitle">{title}</h4>}
            {members.map(member =>
              <MemberDoc key={member.memberName} parentName={name} member={member} />
            )}
          </section>
        ).toArray()}

      </section>
    );
  }
});

var MemberDoc = React.createClass({
  mixins: [ Router.State, Router.Navigation ],

  getInitialState: function() {
    var member = this.props.member;
    var name = member.memberName.substr(1);
    var pathMethodName = this.getParams().methodName;
    return { detail: pathMethodName === name };
  },

  toggleDetail: function() {
    var isOpening = !this.state.detail;
    var member = this.props.member;
    var name = member.memberName.substr(1);
    var pathMethodName = this.getParams().methodName;
    if (isOpening) {
      this.replaceWith('/' + this.props.parentName + '/' + name );
    } else if (!isOpening && pathMethodName === name) {
      this.replaceWith('/' + this.props.parentName );
    }
    this.setState({ detail: isOpening });
  },

  render: function() {
    var member = this.props.member;
    var module = member.isStatic ? this.props.parentName : null;
    var name = member.memberName.substr(1);
    var def = member.memberDef;
    var doc = def.doc || {};
    var isProp = !def.signatures;

    var className = classSet({
      memberLabel: true,
      open: this.state.detail,
    });

    return (
      <div className="interfaceMember">
        <div onClick={this.toggleDetail} className={className}>
          {isProp ?
            <MemberDef module={module} member={{name}} /> :
            <CallSigDef module={module} name={name} />}
          {member.inherited && <span className="inherited">inherited</span>}
          {member.overrides && <span className="override">override</span>}
        </div>
        <TransitionGroup childFactory={makeSlideDown}>
          {this.state.detail &&
            <div key="detail" className="detail">
              {doc.synopsis && <pre>{doc.synopsis}</pre>}
              <h4 className="infoHeader">
                {'Definition' + (def.signatures && def.signatures.length !== 1 ? 's' : '')}
              </h4>
              {isProp ?
                <div className="codeBlock memberSignature">
                  <MemberDef module={module} member={{name, type: def.type}} />
                </div> :
                def.signatures.map(callSig =>
                  <div className="codeBlock memberSignature">
                    <CallSigDef module={module} name={name} callSig={callSig} />
                  </div>
                )
              }
              {member.inherited &&
                <section>
                  <h4 className="infoHeader">
                    Inherited from
                  </h4>
                  <Router.Link to={'/' + member.inherited.name}>
                    {member.inherited.name + '#' + name}
                  </Router.Link>
                </section>
              }
              {member.overrides &&
                <section>
                  <h4 className="infoHeader">
                    Overrides
                  </h4>
                  <Router.Link to={'/' + member.overrides.name}>
                    {member.overrides.name + '#' + name}
                  </Router.Link>
                </section>
              }
              {doc.notes && doc.notes.map(note =>
                <section>
                  <h4 className="infoHeader">
                    {note.name}
                  </h4>
                  {
                    note.name === 'alias' ?
                      <CallSigDef name={note.body} /> :
                    note.body
                  }
                </section>
              )}
              {doc.description &&
                <section>
                  <h4 className="infoHeader">
                    Discussion
                  </h4>
                  <pre>{doc.description}</pre>
                </section>
              }
            </div>
          }
        </TransitionGroup>
      </div>
    );
  }
});

var ReactTransitionEvents = require('react/lib/ReactTransitionEvents');

function makeSlideDown(child) {
  return <SlideDown>{child}</SlideDown>
}

var SlideDown = React.createClass({
  componentWillEnter: function(done) {
    this.slide(false, done);
  },

  componentWillLeave: function(done) {
    this.slide(true, done);
  },

  slide: function(slidingUp, done) {
    var node = this.getDOMNode();
    node.style.height = 'auto';
    var height = getComputedStyle(node).height;
    var start = slidingUp ? height : 0;
    var end = slidingUp ? 0 : height;
    node.style.transition = '';
    node.style.height = start;
    node.style.transition = 'height 0.5s ease-in-out';
    var endListener = event => {
      ReactTransitionEvents.removeEndEventListener(node, endListener);
      done();
    };
    ReactTransitionEvents.addEndEventListener(node, endListener);
    this.timeout = setTimeout(() => {
      node.style.height = end;
    }, 17);
  },

  render: function() {
    return this.props.children;
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
