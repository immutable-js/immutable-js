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
            <h2>Functions</h2>
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
            <h2>Types</h2>
            {types.map((t, name) =>
              <div key={name}>
                <Router.Link to={'/' + name}>
                  {name}
                </Router.Link>
                {t.doc && <div>
                  {t.doc.synopsis}
                </div>}
              </div>
            ).toArray()}
          </section>
        }

      </div>
    );
  }
});

module.exports = DocOverview;
