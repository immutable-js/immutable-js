var React = require('react');
var Router = require('react-router');
var { Seq } = require('../../../../');
var defs = require('../../../resources/immutable.d.json');


var SideBar = React.createClass({
  render() {
    var type = defs.Immutable;

    return (
      <div className="sideBar">
        <div className="scrollContent">
          <h4 className="groupTitle">API</h4>
          {Seq(type.module).map((t, name) =>
            this.renderSideBarType(name, t)
          ).toArray()}
        </div>
      </div>
    );
  },

  renderSideBarType(typeName, type) {
    var isFocus = this.props.focus === typeName;
    var isFunction = !type.interface && !type.module;
    var call = type.call;
    var functions = Seq(type.module).filter(t => !t.interface && !t.module);
    var types = Seq(type.module).filter(t => t.interface || t.module);

    var label = typeName + (isFunction ? '()' : '');

    if (!isFocus) {
      label = <Router.Link to={'/' + typeName}>{label}</Router.Link>;
    }

    var memberGroups = this.props.memberGroups;

    var members = !isFocus || isFunction ? null :
      <div className="members">

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

        {functions.count() > 0 &&
          <section>
            <h4 className="groupTitle">Static Methods</h4>
            {functions.map((t, name) =>
              <div key={name}>
                <Router.Link to={'/' + typeName + '/' + name}>
                  {typeName + '.' + name + '()'}
                </Router.Link>
              </div>
            ).toArray()}
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
      </div>;

    return (
      <div key={typeName}>
        <h2>{label}</h2>
        {members}
      </div>
    );
  }
});


module.exports = SideBar;
