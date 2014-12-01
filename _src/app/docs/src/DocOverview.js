var React = require('react');
var Router = require('react-router');
var { Seq } = require('immutable');
var defs = require('../../../resources/immutable.d.json');
var MemberDoc = require('./MemberDoc');

var DocOverview = React.createClass({

  mixins: [ Router.State ],

  render: function() {
    var type = defs.Immutable;

    var doc = type.doc;
    var functions = Seq(type.module).filter(t => !t.interface && !t.module);
    var types = Seq(type.module).filter(t => t.interface || t.module);

    var memberName = this.props.memberName;

    return (
      <div>

        {doc && <section>
          <pre>{doc.synopsis}</pre>
          {doc.description && <pre>{doc.description}</pre>}
        </section>}

        {functions.count() > 0 &&
          <section>
            <h4 className="groupTitle">Functions</h4>
            {functions.map((t, name) =>
              <MemberDoc key={name} showDetail={name === memberName} member={{
                memberName: name,
                memberDef: t.call,
                isStatic: true
              }} />
            ).toArray()}
          </section>
        }

        {types.count() > 0 &&
          <section>
            <h4 className="groupTitle">Types</h4>
            <table className="typeTable">
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
          </section>
        }

      </div>
    );
  }
});

module.exports = DocOverview;
