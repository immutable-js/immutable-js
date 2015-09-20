var React = require('react');
var FunctionDoc = require('./FunctionDoc');
var TypeDoc = require('./TypeDoc');
var isMobile = require('./isMobile');
var SideBar = require('./SideBar');
var DocOverview = require('./DocOverview');
var collectMemberGroups = require('../../../src/collectMemberGroups');


var TypeDocumentation = React.createClass({
  getInitialState() {
    return {
      showInherited: true,
      showInGroups: true,
    };
  },

  toggleShowInGroups() {
    this.setState({ showInGroups: !this.state.showInGroups });
  },

  toggleShowInherited() {
    this.setState({ showInherited: !this.state.showInherited });
  },

  render() {
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

        {/*

          Bring this back when there's a nicer design

          <div className="toolBar">
            <input className="searchBar" />
            <span onClick={this.toggleShowInGroups}>
              {this.state.showInGroups ? 'Alphabetize' : 'Groups'}
            </span>
            {' • '}
            <span onClick={this.toggleShowInherited}>
              {this.state.showInherited ? 'Hide Inherited Members' : 'Show Inherited Members'}
            </span>
          </div>
        */}

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
  render() {
    return <div>{'Not found'}</div>;
  }
});

module.exports = TypeDocumentation;
