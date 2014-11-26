var React = require('react');
var Router = require('react-router');
var { Route, DefaultRoute, RouteHandler, Link } = Router;
var Immutable = require('immutable');
var Seq = Immutable.Seq;


var defs = require('../../../resources/immutable.d.json');


var Overview = React.createClass({
  render: function() {
    var d = defs.module;

    return (
      <div>
        <h1>Immutable</h1>
        <section>
          <pre>
            {d.doc.join()}
          </pre>
        </section>
        <h2>Functions</h2>
        <ul>
          {Seq(d.types).filter(t => !t.interface && !t.module).map((t, name) =>
            <li>
              {name}
            </li>
          ).toArray()}
        </ul>
        <h2>Types</h2>
        <ul>
          {Seq(d.types).filter(t => t.interface || t.module).map((t, name) =>
            <li>
              <Link to={'/' + name}>{name}</Link>
            </li>
          ).toArray()}
        </ul>
      </div>
    );
  }
});

var Type = React.createClass({
  mixins: [ Router.State ],

  render: function() {
    var typeName = this.getParams().typeName;
    // var methodName = this.getParams().methodName;
    var d = defs.module;
    var type = d.types[typeName];
    if (!type) {
      return <NotFound />;
    }

    return (
      <div>
        <h1>{typeName}</h1>
        {type.doc && <section>
          <pre>
            {type.doc.join()}
          </pre>
        </section>}
        {(type.call || type.module) && [
          <h2>Functions</h2>,
          <ul>
            {type.call && <li>{typeName + '()'}</li>}
            {type.module && Seq(type.module.types).map((t, name) =>
              <li>
                {typeName + '.' + name + '()'}
              </li>
            ).toArray()}
          </ul>
        ]}
        {type.interface && <section>
          <h3>
            {typeName}
            {type.interface.typeParams &&
              ['<', Seq(type.interface.typeParams).map(t => <span>{t}</span>).interpose(', ').toArray(), '>']
            }
          </h3>
          {type.interface.groups && type.interface.groups.map(g => [
            g.title && <h4>{g.title}</h4>,
            <ul>
              {Seq(g.properties).map((p, propName) =>
                <li>{propName}</li>
              ).toArray()}
              {Seq(g.methods).map((m, methodName) =>
                <li>{methodName + '()'}</li>
              ).toArray()}
            </ul>
          ])}
        </section>}
      </div>
    );
  }
});



var Docs = React.createClass({
  render: function () {
    return <div>{'Docs:'}<RouteHandler /></div>;
  }
});

var NotFound = React.createClass({
  render: function() {
    return <div>{'Not found'}</div>;
  }
});


var routes =
  <Route handler={Docs} path="/">
    <DefaultRoute handler={Overview} />
    <Route name="type" path="/:typeName" handler={Type} />
    <Route name="method" path="/:typeName/:methodName" handler={Type} />
  </Route>;


var App = React.createClass({
  componentWillMount: function() {
    Router.run(routes, Handler => {
      this.setState({handler: Handler});
    });
  },
  render: function () {
    var Handler = this.state.handler;
    return <Handler />;
  }
});


module.exports = App;
