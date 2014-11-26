var React = require('react');
var Immutable = require('immutable');
var Seq = Immutable.Seq;

var defs = require('../../../resources/immutable.d.json');

var Docs = React.createClass({
  render: function () {
    return <div><Overview /></div>;
  }
});

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
              {name}
            </li>
          ).toArray()}
        </ul>
      </div>
    );
  }
});

module.exports = Docs;
