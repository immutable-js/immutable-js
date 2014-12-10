var React = require('react');
var Router = require('react-router');
var { Seq } = require('immutable');
var { InterfaceDef, CallSigDef } = require('./Defs');
var MemberDoc = require('./MemberDoc');
var collectMemberGroups = require('./collectMemberGroups');
var isMobile = require('./isMobile');
var SideBar = require('./SideBar');
var MarkDown = require('./MarkDown');
var DocOverview = require('./DocOverview');


var TypeDocumentation = React.createClass({
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
    var memberName = this.props.memberName;
    var def = this.props.def;

    var memberGroups = collectMemberGroups(def && def.interface, {
      showInGroups: this.state.showInGroups,
      showInherited: this.state.showInherited,
    });

    return (
      <div>
        {isMobile || <SideBar focus={name} memberGroups={memberGroups} />}
        <div key={name} className="docContents">

          <div onClick={this.toggleShowInGroups}>Toggle Groups</div>
          <div onClick={this.toggleShowInherited}>Toggle Inherited</div>

          {!def ?
            <NotFound /> :
          !name ?
            <DocOverview def={def} /> :
          !def.interface && !def.module ?
            <FunctionDoc
              name={name}
              def={def.call}
            /> :
            <TypeDoc
              name={name}
              def={def}
              memberName={memberName}
              memberGroups={memberGroups}
            />
          }

        </div>
      </div>
    );
  }
});

var NotFound = React.createClass({
  render: function() {
    return <div>{'Not found'}</div>;
  }
});

var FunctionDoc = React.createClass({
  render: function() {
    var name = this.props.name;
    var def = this.props.def;
    var doc = def.doc || {};

    return (
      <div>
        <h1 className="typeHeader">
          {name + '()'}
        </h1>
        {doc.synopsis && <MarkDown className="synopsis" contents={doc.synopsis} />}
        <code className="codeBlock memberSignature">
          {def.signatures.map((callSig, i) =>
            [<CallSigDef name={name} callSig={callSig} />, '\n']
          )}
        </code>
        {doc.notes && doc.notes.map((note, i) =>
          <section key={i}>
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
              {doc.description.substr(0, 5) === '<code' ?
                'Example' :
                'Discussion'}
            </h4>
            <MarkDown className="discussion" contents={doc.description} />
          </section>
        }
      </div>
    );
  }
});

var TypeDoc = React.createClass({
  render: function() {
    var name = this.props.name;
    var def = this.props.def;
    var memberName = this.props.memberName;
    var memberGroups = this.props.memberGroups;

    var doc = def.doc;
    var call = def.call;
    var functions = Seq(def.module).filter(t => !t.interface && !t.module);
    var types = Seq(def.module).filter(t => t.interface || t.module);
    var interfaceDef = def.interface;

    return (
      <div>
        <h1 className="typeHeader">
          {interfaceDef ?
            <code>
            <InterfaceDef name={name} def={interfaceDef} /></code> :
            name
          }
        </h1>

        {doc && <section className="doc">
          <MarkDown contents={doc.synopsis} />
          {doc.description && <MarkDown contents={doc.description} />}
          {doc.notes && <p>{doc.notes}</p>}
        </section>}

        {call &&
          <section>
            <h4 className="groupTitle">Construction</h4>
            <MemberDoc
              showDetail={name === memberName}
              parentName={name}
              member={{
                memberName: name,
                memberDef: call
              }}
            />
          </section>
        }

        {functions.count() > 0 &&
          <section>
            <h4 className="groupTitle">Static Methods</h4>
            {functions.map((t, fnName) =>
              <MemberDoc
                key={fnName}
                showDetail={fnName === memberName}
                parentName={name}
                member={{
                  memberName: fnName,
                  memberDef: t.call,
                  isStatic: true
                }}
              />
            ).toArray()}
          </section>
        }

        {types.count() > 0 &&
          <section>
            <h4 className="groupTitle">Types</h4>
            {types.map((t, typeName) =>
              <div key={name}>
                <Router.Link to={'/' + (name?name+'.'+typeName:typeName)}>
                  {(name?name+'.'+typeName:typeName)}
                </Router.Link>
              </div>
            ).toArray()}
          </section>
        }

        <section>
          {Seq(memberGroups).map((members, title) =>
            members.length === 0 ? null :
            Seq([
              <h4 key={title || 'Members'} className="groupTitle">
                {title || 'Members'}
              </h4>,
              Seq(members).map(member =>
                <MemberDoc
                  key={member.memberName}
                  showDetail={member.memberName === memberName}
                  parentName={name}
                  member={member}
                />
              )
            ])
          ).flatten().toArray()}
        </section>
      </div>
    );
  }
})


module.exports = TypeDocumentation;
