var React = require('react');
var Router = require('react-router');
var { Seq } = require('immutable');

var DocOverview = React.createClass({

  render: function() {
    var def = this.props.def;

    var doc = def.doc;
    var functions = Seq(def.module).filter(t => !t.interface && !t.module);
    var types = Seq(def.module).filter(t => t.interface || t.module);

    return (
      <div>

        {doc && <section>
          <pre>{doc.synopsis}</pre>
          {doc.description && <pre>{doc.description}</pre>}
        </section>}

        <table className="typeTable">

            {functions.map((t, name) =>
              <tr key={name}>
                <th>
                  <Router.Link to={'/' + name}>
                    {name + '()'}
                  </Router.Link>
                </th>
                <td>
                  {t.call.doc && t.call.doc.synopsis}
                </td>
              </tr>
            ).toArray()}


            {types.map((t, name) =>
              <tr key={name}>
                <th>
                  <Router.Link to={'/' + name}>
                    {name}
                  </Router.Link>
                </th>
                <td>
                  {t.doc && t.doc.synopsis}
                </td>
              </tr>
            ).toArray()}

        </table>

      </div>
    );
  }
});

module.exports = DocOverview;
