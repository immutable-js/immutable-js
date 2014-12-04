var React = require('react');
var assign = require('react/lib/Object.assign');
var Router = require('react-router');
var { Route, DefaultRoute, RouteHandler } = Router;
var DocHeader = require('./DocHeader');
var DocOverview = require('./DocOverview');
var TypeDocumentation = require('./TypeDocumentation');
var defs = require('../../../resources/immutable.d.json');
var isMobile = require('./isMobile');


var Documentation = React.createClass({
  render: function () {
    return (
      <div className={isMobile ? 'mobile' : null}>
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
    var { typeName, memberName } = determineDoc(this.getPath());
    if (typeName) {
      return <TypeDocumentation />;
    } else {
      return <DocOverview memberName={memberName} />;
    }
  }
});


function determineDoc(path) {
  var [, typeName, memberName] = path.split('/');

  var def = defs.Immutable;
  var typePath = typeName ? typeName.split('.') : [];
  def = typePath.reduce(
    (def, name) => def && def.module && def.module[name],
    def
  );

  if (typePath.length === 1 && !def || !(def.interface || def.module)) {
    memberName = typeName;
    typeName = null;
    def = defs.Immutable;
  }

  return { def, typeName, memberName };
}


module.exports = React.createClass({

  childContextTypes: {
    getPageData: React.PropTypes.func.isRequired,
  },

  getChildContext: function () {
    return {
      getPageData: this.getPageData,
    };
  },

  getPageData: function () {
    return this.pageData;
  },

  componentWillMount: function() {
    var location, scrollBehavior;

    if (window.document) {
      location = Router.HashLocation;
      location.addChangeListener(change => {
        this.pageData = assign({}, change, determineDoc(change.path));
      });

      this.pageData = !window.document ? {} : assign({
        path: location.getCurrentPath(),
        type: 'init',
      }, determineDoc(location.getCurrentPath()));

      scrollBehavior = {
        updateScrollPosition: (position, actionType) => {
          switch (actionType) {
            case 'push':
              return this.getPageData().memberName ?
                null :
                window.scrollTo(0, 0);
            case 'pop':
              return window.scrollTo(
                position ? position.x : 0,
                position ? position.y : 0
              );
          }
        }
      };
    }

    Router.create({
      routes:
        <Route handler={Documentation} path="/">
          <DefaultRoute handler={DocDeterminer} />
          <Route name="type" path="/:typeName" handler={DocDeterminer} />
          <Route name="method" path="/:typeName/:memberName" handler={DocDeterminer} />
        </Route>,
      location: location,
      scrollBehavior: scrollBehavior
    }).run(Handler => {
      this.setState({handler: Handler});
    });
  },

  // TODO: replace this. this is hacky and probably wrong

  componentDidMount: function() {
    setTimeout(() => { this.pageData.type = ''; }, 0);
  },

  componentDidUpdate: function() {
    setTimeout(() => { this.pageData.type = ''; }, 0);
  },

  render: function () {
    var Handler = this.state.handler;
    return <Handler />;
  }
});
