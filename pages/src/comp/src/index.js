/**
 * Copyright (c) 2014-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

var React = require('react');
var assign = require('react/lib/Object.assign');
var SVGSet = require('../../src/SVGSet');
var Logo = require('../../src/Logo');
var packageJson = require('../../../../package.json');
var Router = require('react-router');

var { Route, DefaultRoute } = Router;

var LibraryList = React.createClass({
  render() {
    return (
      <div>
        <div className="header">
          <div className="miniHeader">
            <div className="miniHeaderContents">
              <a href="../" target="_self" className="miniLogo">
                <SVGSet>
                  <Logo color="#FC4349" />
                  <Logo color="#2C3E50" inline />
                </SVGSet>
              </a>
              <a href="../docs/" target="_self">
                Docs (v
                {packageJson.version})
              </a>
              <a href="https://stackoverflow.com/questions/tagged/immutable.js?sort=votes">
                Questions
              </a>
              <a href="./" target="_self">
                Complementary Tools
              </a>
              <a href="https://github.com/facebook/immutable-js/">Github</a>
            </div>
          </div>
        </div>
        <div className="pageBody">
          <div className="contents">
            <a href="https://github.com/redbadger/immutable-cursor">
              <h1>Immutable-cursor</h1>
            </a>
            <p>
              Immutable cursors incorporating the Immutable.js interface over
              Clojure-inspired atom
            </p>

            <a href="https://github.com/jameshopkins/atom-store/">
              <h1>Atom-store</h1>
            </a>
            <p>
              A Clojure-inspired atom implementation in Javascript with
              configurability for external persistance
            </p>

            <a href="https://github.com/lukasbuenger/immutable-treeutils">
              <h1>Immutable-Treeutils</h1>
            </a>
            <p>
              Functional tree traversal helpers for ImmutableJS data structures
            </p>

            <a href="https://github.com/gajus/redux-immutable">
              <h1>Immutable-Redux</h1>
            </a>
            <p>
              redux-immutable is used to create an equivalent Function of Redux
              combineReducers that works with Immutable.js state.
            </p>

            <a href="https://github.com/ericelliott/irecord">
              <h1>Irecord</h1>
            </a>
            <p>
              An immutable store that exposes an RxJS observable. Great for
              React.
            </p>

            <a href="https://github.com/yamalight/rxstate">
              <h1>Rxstate</h1>
            </a>
            <p>
              Simple opinionated state management library based on RxJS and
              Immutable.js
            </p>

            <a href="https://github.com/brianneisler/mudash">
              <h1>Mudash</h1>
            </a>
            <p>Lodash wrapper providing Immutable.JS support</p>

            <a href="https://github.com/madeinfree/immutable-js-tools">
              <h1>Immutable-js-tools</h1>
            </a>
            <p>util tools for immutable.js</p>

            <a href="https://github.com/indexiatech/redux-immutablejs">
              <h1>Redux-Immutablejs</h1>
            </a>
            <p>Redux Immutable facilities.</p>

            <a href="https://github.com/HurricaneJames/react-immutable-proptypes">
              <h1>React-Immutable-PropTypes</h1>
            </a>
            <p>PropType validators that work with Immutable.js.</p>

            <a href="https://github.com/fantasyland/fantasy-land">
              <h1>Fantasy-land</h1>
            </a>
            <p>
              Specification for interoperability of common algebraic structures
              in JavaScript
            </p>

            <a href="https://github.com/DrBoolean/immutable-ext">
              <h1>Immutable-ext</h1>
            </a>
            <p>fantasyland extensions for immutablejs</p>

            <a href="https://github.com/cognitect/transit-js">
              <h1>Transit-js</h1>
            </a>
            <p>Transit for JavaScript</p>

            <a href="https://github.com/glenjamin/transit-immutable-js">
              <h1>Transit-Immutable-js</h1>
            </a>
            <p>Transit serialisation for Immutable.js</p>

            <a href="https://github.com/pelotom/immutagen">
              <h1>Immutagen</h1>
            </a>
            <p>A library for simulating immutable generators in JavaScript</p>
          </div>
        </div>
      </div>
    );
  },
});
function determineDoc(path) {
  var [name, memberName] = path.split('/');

  return { name, memberName };
}
module.exports = React.createClass({
  childContextTypes: {
    getPageData: React.PropTypes.func.isRequired,
  },

  getChildContext() {
    return {
      getPageData: this.getPageData,
    };
  },

  getPageData() {
    return this.pageData;
  },

  componentWillMount() {
    var location;
    if (window.document) {
      location = Router.HashLocation;
      this.pageData = !window.document
        ? {}
        : assign(
            {
              path: location.getCurrentPath(),
              type: 'init',
            },
            determineDoc(location.getCurrentPath())
          );
    }

    Router.create({
      routes: (
        <Route handler={LibraryList} path="/">
          <DefaultRoute handler={LibraryList} />
        </Route>
      ),
      location: location,
    }).run(Handler => {
      this.setState({ handler: Handler });
      if (window.document) {
        window.document.title = `${this.pageData.name} — Immutable.js`;
      }
    });
  },

  // TODO: replace this. this is hacky and probably wrong

  componentDidMount() {
    setTimeout(() => {
      this.pageData.type = '';
    }, 0);
  },

  componentDidUpdate() {
    setTimeout(() => {
      this.pageData.type = '';
    }, 0);
  },

  render() {
    var Handler = this.state.handler;
    return <Handler />;
  },
});
