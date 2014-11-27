var React = require('react');
var Router = require('react-router');
var { Route, DefaultRoute, RouteHandler } = Router;
var TypeDocumentation = require('./TypeDocumentation');
var DocHeader = require('./DocHeader');


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


module.exports = React.createClass({
  componentWillMount: function() {
    Router.create({
      routes:
        <Route handler={Documentation} path="/">
          <DefaultRoute handler={TypeDocumentation} />
          <Route name="type" path="/:typeName" handler={TypeDocumentation} />
          <Route name="method" path="/:typeName/:methodName" handler={TypeDocumentation} />
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
