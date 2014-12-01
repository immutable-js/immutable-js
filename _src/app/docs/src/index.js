var React = require('react');
var Router = require('react-router');
var { Route, DefaultRoute, RouteHandler } = Router;
var DocHeader = require('./DocHeader');
var DocOverview = require('./DocOverview');
var TypeDocumentation = require('./TypeDocumentation');
var defs = require('../../../resources/immutable.d.json');


var Documentation = React.createClass({
  render: function () {
    return (
      <div>
        <DocHeader />
        <div className="pageBody" id="body">
          <div className="contents">
            <RouteHandler />
          </div>
        </div>
      </div>
    );
  }
});

var DocDeterminer = React.createClass({
  mixins: [ Router.State ],

  render: function () {
    var typeName = this.getParams().typeName;
    var memberName = this.getParams().memberName;

    var type = defs.Immutable;
    var typePath = typeName ? typeName.split('.') : [];
    type = typePath.reduce(
      (type, name) => type && type.module && type.module[name],
      type
    );
    if (typePath.length === 1 && !type.interface && !type.module) {
      memberName = typeName;
      typeName = null;
      type = defs.Immutable;
    }
    if (typeName) {
      return <TypeDocumentation />;
    } else {
      return <DocOverview memberName={memberName} />;
    }
  }
});


module.exports = React.createClass({
  componentWillMount: function() {
    Router.create({
      routes:
        <Route handler={Documentation} path="/">
          <DefaultRoute handler={DocDeterminer} />
          <Route name="type" path="/:typeName" handler={DocDeterminer} />
          <Route name="method" path="/:typeName/:memberName" handler={DocDeterminer} />
        </Route>,

      scrollBehavior: window.document && {
        updateScrollPosition: function (position, actionType) {
          switch (actionType) {
            case 'push': return window.scrollTo(0, 0);
            case 'pop': return window.scrollTo(
              position ? position.x : 0,
              position ? position.y : 0
            );
          }
        }
      }
    }).run(Handler => {
      this.setState({handler: Handler});
    });
  },
  render: function () {
    var Handler = this.state.handler;
    return <Handler />;
  }
});
