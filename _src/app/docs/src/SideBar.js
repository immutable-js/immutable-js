var React = require('react');
var Router = require('react-router');
var { Seq } = require('immutable');
var defs = require('../../../resources/immutable.d.json');


var SideBar = React.createClass({
  render: function () {

    var type = defs.Immutable;
    var functions = Seq(type.module).filter(t => !t.interface && !t.module);
    var types = Seq(type.module).filter(t => t.interface || t.module);

    return (
      <div className="sideBar">
        <div className="scrollContent">
          {functions.map((t, name) =>
            <div>
              <Router.Link key={name} to={'/' + name}>
                {(name) + '()'}
              </Router.Link>
            </div>
          ).toArray()}

          {types.map((t, name) =>
            sideBarType.call(this, name, t)
          ).toArray()}
        </div>
      </div>
    );

  }
});

function sideBarType(typeName, type) {
  var call = type.call;
  var functions = Seq(type.module).filter(t => !t.interface && !t.module);
  var types = Seq(type.module).filter(t => t.interface || t.module);

  if (this.props.focus !== typeName) {
    return <div key={typeName}>
      <h2>
        <Router.Link to={'/' + typeName}>
          {typeName}
        </Router.Link>
      </h2>
    </div>
  }

  var memberGroups = this.props.memberGroups;

  return (
    <div key={typeName}>
      <h2>
        {typeName}
      </h2>

      <div className="members">

        {functions.map((t, name) =>
          <div key={name}>
            <Router.Link to={'/' + typeName + '/' + name}>
              {typeName + '.' + name + '()'}
            </Router.Link>
          </div>
        ).toArray()}

        {call &&
          <section>
            <h4 className="groupTitle">Construction</h4>
            <div>
              <Router.Link to={'/' + typeName + '/' + typeName}>
                {typeName + '()'}
              </Router.Link>
            </div>
          </section>
        }

        {types.count() > 0 &&
          <section>
            <h4 className="groupTitle">Types</h4>
            {types.map((t, name) =>
              <div key={name}>
                <Router.Link to={'/' + typeName + '.' + name}>
                  {typeName + '.' + name}
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
                <div key={member.memberName}>
                  <Router.Link to={'/' + typeName + '/' + member.memberName}>
                    {member.memberName + (member.memberDef.signatures ? '()' : '')}
                  </Router.Link>
                </div>
              )
            ])
          ).flatten().toArray()}
        </section>
      </div>
    </div>
  );
}

module.exports = SideBar;
